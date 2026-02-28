import { useEffect, useState } from "react";
import { Users, AlertCircle, Activity, TrendingUp } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getStats, listDonors, listReceivers, listCamps, createCamp, listBloodBanks, createBloodBank } from "../api";

export function AdminDashboard() {
const { user } = useAuth();

  const [stats, setStats] = useState({
    totalDonors: 0,
    activeRequests: 0,
    uniqueBloodGroups: 0,
    emergencyAlerts: 0,
  });
  const [donorRecords, setDonorRecords] = useState<any[]>([]);
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);
  const [camps, setCamps] = useState<any[]>([]);
  const [bloodBanks, setBloodBanks] = useState<any[]>([]);
  const [newCamp, setNewCamp] = useState({ name: "", city: "", address: "", date: "" });
  const [newBank, setNewBank] = useState({ name: "", city: "", address: "", phone: "" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    Promise.all([
      getStats().catch((e) => {
        console.error(e);
        return stats;
      }),
      listDonors().catch(() => []),
      listReceivers().catch(() => []),
      listCamps().catch(() => []),
      listBloodBanks().catch(() => []),
    ])
      .then(([statsData, donors, receivers, campList, bankList]) => {
        if (mounted) {
          setStats(statsData || stats);
          setDonorRecords((donors || []).slice(0, 10)); // Show first 10
          setBloodRequests((receivers || []).slice(0, 10)); // Show first 10
          setCamps(campList || []);
          setBloodBanks(bankList || []);
        }
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor and manage blood bank operations</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-gray-600">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-blue-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.totalDonors.toLocaleString()}
                </h3>
                <p className="text-sm text-gray-600">Total Donors</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-red-600" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-green-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.activeRequests}</h3>
                <p className="text-sm text-gray-600">Active Requests</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">
                  {stats.uniqueBloodGroups}
                </h3>
                <p className="text-sm text-gray-600">Blood Groups</p>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-orange-600" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stats.emergencyAlerts}</h3>
                <p className="text-sm text-gray-600">Emergency Alerts</p>
              </div>
            </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Donor Records */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Donor Records ({donorRecords.length})</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                        Blood
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                        City
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {donorRecords.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                          No donors registered yet
                        </td>
                      </tr>
                    ) : (
                      donorRecords.map((donor: any) => (
                        <tr key={donor.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{donor.fullName}</td>
                          <td className="px-4 py-3">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                              {donor.bloodGroup}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{donor.city}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                                donor.availabilityStatus === "available"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-yellow-100 text-yellow-700"
                              }`}
                            >
                              {donor.availabilityStatus === "available" ? "Available" : "Unavailable"}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <button className="mt-4 w-full text-center text-red-600 hover:text-red-700 font-medium text-sm py-2 border border-red-200 rounded-lg hover:bg-red-50 transition">
                View All Donors →
              </button>
            </div>

            {/* Blood banks management panel */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Manage Blood Banks ({bloodBanks.length})
              </h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newBank.name || !newBank.city || !newBank.address || !newBank.phone) {
                    alert("Please fill all bank fields");
                    return;
                  }
                  try {
                    const created = await createBloodBank({ ...newBank, userId: user?.id } as any);
                    setBloodBanks([...bloodBanks, created]);
                    setNewBank({ name: "", city: "", address: "", phone: "" });
                  } catch (err) {
                    console.error(err);
                    alert("Failed to create blood bank");
                  }
                }}
                className="space-y-4 mb-6"
              >
                <input
                  type="text"
                  placeholder="Bank name"
                  value={newBank.name}
                  onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newBank.city}
                  onChange={(e) => setNewBank({ ...newBank, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={newBank.address}
                  onChange={(e) => setNewBank({ ...newBank, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Phone"
                  value={newBank.phone}
                  onChange={(e) => setNewBank({ ...newBank, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Add Bank
                </button>
              </form>

              <ul className="space-y-2 text-sm text-gray-700">
                {bloodBanks.map((b) => (
                  <li key={b.id}>
                    <strong>{b.name}</strong> – {b.address} ({b.city}) {b.phone && `• ${b.phone}`}
                  </li>
                ))}
              </ul>
            </div>

            {/* Camps management panel */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Manage Camps ({camps.length})</h2>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!newCamp.name || !newCamp.city || !newCamp.address || !newCamp.date) {
                    alert("Please fill all camp fields");
                    return;
                  }
                  try {
                    // include user id in request to satisfy admin check
                    const created = await createCamp({ ...newCamp, userId: user?.id } as any);
                    setCamps([...camps, created]);
                    setNewCamp({ name: "", city: "", address: "", date: "" });
                  } catch (err) {
                    console.error(err);
                    alert("Failed to create camp");
                  }
                }}
                className="space-y-4 mb-6"
              >
                <input
                  type="text"
                  placeholder="Camp name"
                  value={newCamp.name}
                  onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="City"
                  value={newCamp.city}
                  onChange={(e) => setNewCamp({ ...newCamp, city: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={newCamp.address}
                  onChange={(e) => setNewCamp({ ...newCamp, address: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <input
                  type="date"
                  placeholder="Date"
                  value={newCamp.date}
                  onChange={(e) => setNewCamp({ ...newCamp, date: e.target.value })}
                  className="w-full px-3 py-2 border rounded"
                />
                <button
                  type="submit"
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  Add Camp
                </button>
              </form>

              <ul className="space-y-2 text-sm text-gray-700">
                {camps.map((c) => (
                  <li key={c.id}>
                    <strong>{c.name}</strong> – {c.address} ({c.city}) on {c.date}
                  </li>
                ))}
              </ul>
            </div>

            {/* Blood requests panel (right column wrap) */}
            <div>
              {bloodRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No blood requests yet
                </div>
              ) : (
                <>
                  {bloodRequests.map((request: any) => (
                    <div
                      key={request.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-gray-900">{request.name}</h3>
                          <p className="text-sm text-gray-600">{request.contact}</p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700`}
                        >
                          Pending
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                        <span className="font-semibold">
                          Blood: <span className="text-red-600">{request.bloodGroup}</span>
                        </span>
                        <span>•</span>
                        <span>{request.units} units</span>
                        <span>•</span>
                        <span>{request.city}</span>
                      </div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                        Pending
                      </span>
                    </div>
                  ))}
                  <button className="mt-4 w-full text-center text-red-600 hover:text-red-700 font-medium text-sm py-2 border border-red-200 rounded-lg hover:bg-red-50 transition">
                    View All Requests →
                  </button>
                </>
              )}
            </div>
          </div>

            {/* Status Monitoring */}
            <div className="mt-8 bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">System Status Monitoring</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">System Health</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">All systems operational</span>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Database Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Connected</span>
                  </div>
                </div>
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Notification Service
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-900">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
