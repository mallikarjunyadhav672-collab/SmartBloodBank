import { useEffect, useState } from "react";
import { Users, AlertCircle, Activity, TrendingUp, Trash2, Plus, Eye, Edit2, X } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getStats, listDonors, listReceivers, listCamps, createCamp, listBloodBanks, createBloodBank, deleteBloodBank, deleteCamp, updateBloodBank } from "../api";

export function AdminDashboard() {
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState("overview");
  const [stats, setStats] = useState({
    totalDonors: 0,
    activeRequests: 0,
    uniqueBloodGroups: 0,
    emergencyAlerts: 0,
  });
  const [donorRecords, setDonorRecords] = useState<any[]>([]);
  const [bloodRequests, setBloodRequests] = useState<any[]>([]);
  const [allBloodRequests, setAllBloodRequests] = useState<any[]>([]);
  const [allDonors, setAllDonors] = useState<any[]>([]);
  const [camps, setCamps] = useState<any[]>([]);
  const [bloodBanks, setBloodBanks] = useState<any[]>([]);
  const [showAllRequests, setShowAllRequests] = useState(false);
  const [showAllDonors, setShowAllDonors] = useState(false);
  const [newCamp, setNewCamp] = useState({ name: "", city: "", address: "", date: "" });
  const [newBank, setNewBank] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    inventory: {
      "A+": 0,
      "A-": 0,
      "B+": 0,
      "B-": 0,
      "AB+": 0,
      "AB-": 0,
      "O+": 0,
      "O-": 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [editingBank, setEditingBank] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    city: "",
    address: "",
    phone: "",
    inventory: {
      "A+": 0,
      "A-": 0,
      "B+": 0,
      "B-": 0,
      "AB+": 0,
      "AB-": 0,
      "O+": 0,
      "O-": 0,
    },
  });

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
          setAllDonors(donors || []);
          setDonorRecords((donors || []).slice(0, 10));
          setAllBloodRequests(receivers || []);
          setBloodRequests((receivers || []).slice(0, 10));
          setCamps(campList || []);
          setBloodBanks(bankList || []);
        }
      })
      .finally(() => setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const handleDeleteBank = async (bankId: number) => {
    if (window.confirm("Are you sure you want to delete this blood bank?")) {
      try {
        if (!user?.id) {
          alert("Error: User not authenticated");
          return;
        }
        await deleteBloodBank(bankId, user.id);
        setBloodBanks(bloodBanks.filter((b) => b.id !== bankId));
        alert("Blood bank deleted successfully");
      } catch (err) {
        console.error("Delete error:", err);
        const errorMsg = err instanceof Error ? err.message : "Failed to delete blood bank";
        alert("Error: " + errorMsg);
      }
    }
  };

  const handleDeleteCamp = async (campId: number) => {
    if (window.confirm("Are you sure you want to delete this camp?")) {
      try {
        await deleteCamp(campId);
        setCamps(camps.filter((c) => c.id !== campId));
        alert("Camp deleted successfully");
      } catch (err) {
        console.error("Delete error:", err);
        const errorMsg = err instanceof Error ? err.message : "Failed to delete camp";
        alert("Error: " + errorMsg);
      }
    }
  };

  const openEditBank = (bank: any) => {
    setEditingBank(bank);
    setEditFormData({
      name: bank.name,
      city: bank.city,
      address: bank.address,
      phone: bank.phone,
      inventory: bank.inventory || {
        "A+": 0,
        "A-": 0,
        "B+": 0,
        "B-": 0,
        "AB+": 0,
        "AB-": 0,
        "O+": 0,
        "O-": 0,
      },
    });
  };

  const closeEditBank = () => {
    setEditingBank(null);
    setEditFormData({
      name: "",
      city: "",
      address: "",
      phone: "",
      inventory: {
        "A+": 0,
        "A-": 0,
        "B+": 0,
        "B-": 0,
        "AB+": 0,
        "AB-": 0,
        "O+": 0,
        "O-": 0,
      },
    });
  };

  const handleSaveEdit = async () => {
    if (!user?.id || !editingBank) return;

    if (!editFormData.name || !editFormData.city || !editFormData.address || !editFormData.phone) {
      alert("Please fill all required fields");
      return;
    }

    try {
      await updateBloodBank(editingBank.id, { ...editFormData, userId: user.id } as any);
      setBloodBanks(
        bloodBanks.map((b) =>
          b.id === editingBank.id ? { ...b, ...editFormData } : b
        )
      );
      closeEditBank();
      alert("Blood bank updated successfully!");
    } catch (err) {
      console.error("Update error:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to update blood bank";
      alert("Error: " + errorMsg);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-surface">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage blood bank operations and monitor system activity</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-96">
            <p className="text-muted-foreground">Loading dashboard data...</p>
          </div>
        ) : (
          <>
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg border border-border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary-700" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-success-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {stats.totalDonors.toLocaleString()}
                </h3>
                <p className="text-sm text-muted-foreground">Total Donors</p>
              </div>

              <div className="bg-white rounded-lg border border-border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center">
                    <Activity className="w-6 h-6 text-primary-700" />
                  </div>
                  <TrendingUp className="w-5 h-5 text-success-500" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{stats.activeRequests}</h3>
                <p className="text-sm text-muted-foreground">Active Requests</p>
              </div>

              <div className="bg-white rounded-lg border border-border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-success-50 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-success-700" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">
                  {stats.uniqueBloodGroups}
                </h3>
                <p className="text-sm text-muted-foreground">Blood Groups</p>
              </div>

              <div className="bg-white rounded-lg border border-border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-warning-50 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-6 h-6 text-warning-700" />
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-1">{stats.emergencyAlerts}</h3>
                <p className="text-sm text-muted-foreground">Emergency Alerts</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Donor Records */}
              <div className="bg-white rounded-lg border border-border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Recent Donors</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700">
                    {donorRecords.length} shown
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-surface">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">
                          Blood
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">
                          City
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {donorRecords.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                            No donors registered yet
                          </td>
                        </tr>
                      ) : (
                        donorRecords.map((donor: any) => (
                          <tr key={donor.id} className="hover:bg-surface">
                            <td className="px-4 py-3 text-sm text-foreground">{donor.fullName}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-primary-50 text-primary-700">
                                {donor.bloodGroup}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{donor.city}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                                  donor.availabilityStatus === "available"
                                    ? "bg-success-50 text-success-700"
                                    : "bg-warning-50 text-warning-700"
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
                <button
                  onClick={() => setShowAllDonors(true)}
                  className="mt-4 w-full text-center text-primary hover:text-primary-700 font-medium text-sm py-2 border border-primary-200 rounded-md hover:bg-primary-50 transition">
                  View All Donors →
                </button>
              </div>

              {/* Blood banks management panel */}
              <div className="bg-white rounded-lg border border-border shadow-sm p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">
                    Blood Banks
                  </h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-success-50 text-success-700">
                    {bloodBanks.length} total
                  </span>
                </div>

                {/* Add Blood Bank Form */}
                <div className="mb-6 p-4 bg-gradient-to-r from-primary-50 to-primary-25 rounded-lg border border-primary-200">
                  <h3 className="font-semibold text-sm text-foreground mb-4">Add New Blood Bank</h3>
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!user?.id) {
                        alert("Error: User not authenticated");
                        return;
                      }
                      if (!newBank.name || !newBank.city || !newBank.address || !newBank.phone) {
                        alert("Please fill all required fields");
                        return;
                      }
                      try {
                        const created = await createBloodBank({ ...newBank, userId: user.id } as any);
                        setBloodBanks([...bloodBanks, created]);
                        setNewBank({
                          name: "",
                          city: "",
                          address: "",
                          phone: "",
                          inventory: {
                            "A+": 0,
                            "A-": 0,
                            "B+": 0,
                            "B-": 0,
                            "AB+": 0,
                            "AB-": 0,
                            "O+": 0,
                            "O-": 0,
                          },
                        });
                        alert("Blood bank created successfully!");
                      } catch (err) {
                        console.error(err);
                        const errorMessage = err instanceof Error ? err.message : "Failed to create blood bank. Please check your input and try again.";
                        alert(errorMessage);
                      }
                    }}
                    className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Bank Name *</label>
                        <input
                          type="text"
                          placeholder="e.g., Central Blood Bank"
                          value={newBank.name}
                          onChange={(e) => setNewBank({ ...newBank, name: e.target.value })}
                          className="w-full px-3 py-2 border border-border bg-white rounded-md focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">City *</label>
                        <input
                          type="text"
                          placeholder="e.g., Hyderabad"
                          value={newBank.city}
                          onChange={(e) => setNewBank({ ...newBank, city: e.target.value })}
                          className="w-full px-3 py-2 border border-border bg-white rounded-md focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Address *</label>
                        <input
                          type="text"
                          placeholder="Street address"
                          value={newBank.address}
                          onChange={(e) => setNewBank({ ...newBank, address: e.target.value })}
                          className="w-full px-3 py-2 border border-border bg-white rounded-md focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Phone *</label>
                        <input
                          type="text"
                          placeholder="Contact number"
                          value={newBank.phone}
                          onChange={(e) => setNewBank({ ...newBank, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-border bg-white rounded-md focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                    </div>

                    {/* Blood Inventory Fields */}
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-2">Blood Inventory (units)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg: any) => (
                          <div key={bg}>
                            <label className="text-xs text-muted-foreground block mb-1 text-center font-semibold">{bg}</label>
                            <input
                              type="number"
                              min="0"
                              value={newBank.inventory[bg as keyof typeof newBank.inventory] || 0}
                              onChange={(e) =>
                                setNewBank({
                                  ...newBank,
                                  inventory: { ...newBank.inventory, [bg]: parseInt(e.target.value) || 0 },
                                })
                              }
                              className="w-full px-2 py-2 border border-border bg-white rounded-md focus:ring-2 focus:ring-primary text-xs text-center"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-success hover:bg-success-700 text-success-foreground px-4 py-2 rounded-md font-medium w-full text-sm flex items-center justify-center gap-2 transition">
                      <Plus className="w-4 h-4" />
                      Add Blood Bank
                    </button>
                  </form>
                </div>

                {/* Blood Banks List */}
                <div>
                  <h3 className="font-semibold text-sm text-foreground mb-3">Registered Banks</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {bloodBanks.length === 0 ? (
                      <div className="text-center py-12 text-muted-foreground border border-dashed border-border rounded-lg">
                        <p className="text-sm">No blood banks created yet</p>
                      </div>
                    ) : (
                      bloodBanks.map((b) => (
                        <div key={b.id} className="border border-border rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition bg-gradient-to-br from-white to-surface">
                          <div className="flex justify-between items-start mb-3">
                            <div className="flex-1">
                              <h3 className="font-bold text-foreground text-base">{b.name}</h3>
                              <div className="mt-1 space-y-1">
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <span className="font-semibold">📍</span> {b.address}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <span className="font-semibold">🌆</span> {b.city}
                                </p>
                                <p className="text-xs text-muted-foreground flex items-center gap-1">
                                  <span className="font-semibold">📞</span> {b.phone}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => openEditBank(b)}
                                className="text-primary hover:text-primary-700 hover:bg-primary-50 p-2 rounded-md transition flex items-center gap-1"
                                title="Edit blood bank"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteBank(b.id)}
                                className="text-destructive hover:text-destructive-700 hover:bg-destructive-50 p-2 rounded-md transition flex items-center gap-1"
                                title="Delete blood bank"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {/* Inventory Display */}
                          {b.inventory && (
                            <div className="mt-3 pt-3 border-t border-border">
                              <p className="text-xs font-semibold text-muted-foreground mb-2">Stock Levels:</p>
                              <div className="grid grid-cols-4 gap-2">
                                {Object.entries(b.inventory).map(([bg, units]: any) => (
                                  <div key={bg} className="bg-primary-50 rounded-md p-2 text-center border border-primary-200">
                                    <span className="font-bold text-primary text-xs block">{bg}</span>
                                    <p className="text-foreground text-sm font-semibold">{units}</p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Camps management panel */}
              <div className="bg-white rounded-lg border border-border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Donation Camps</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700">
                    {camps.length} camps
                  </span>
                </div>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    if (!newCamp.name || !newCamp.city || !newCamp.address || !newCamp.date) {
                      alert("Please fill all camp fields");
                      return;
                    }
                    try {
                      const created = await createCamp({ ...newCamp, userId: user?.id } as any);
                      setCamps([...camps, created]);
                      setNewCamp({ name: "", city: "", address: "", date: "" });
                      alert("Camp created successfully!");
                    } catch (err) {
                      console.error(err);
                      const errorMessage = err instanceof Error ? err.message : "Failed to create camp";
                      alert(errorMessage);
                    }
                  }}
                  className="space-y-3 mb-6 bg-surface p-4 rounded-lg border border-border">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Camp name *"
                      value={newCamp.name}
                      onChange={(e) => setNewCamp({ ...newCamp, name: e.target.value })}
                      className="px-3 py-2 border border-border bg-white rounded-md focus:ring-2 focus:ring-primary text-sm"
                    />
                    <input
                      type="date"
                      placeholder="Date *"
                      value={newCamp.date}
                      onChange={(e) => setNewCamp({ ...newCamp, date: e.target.value })}
                      className="px-3 py-2 border border-border bg-white rounded-md focus:ring-2 focus:ring-primary text-sm"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="City *"
                    value={newCamp.city}
                    onChange={(e) => setNewCamp({ ...newCamp, city: e.target.value })}
                    className="w-full px-3 py-2 border border-border bg-white rounded-md focus:ring-2 focus:ring-primary text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Address *"
                    value={newCamp.address}
                    onChange={(e) => setNewCamp({ ...newCamp, address: e.target.value })}
                    className="w-full px-3 py-2 border border-border bg-white rounded-md focus:ring-2 focus:ring-primary text-sm"
                  />
                  <button
                    type="submit"
                    className="bg-success hover:bg-success-700 text-success-foreground px-4 py-2 rounded-md font-medium w-full text-sm flex items-center justify-center gap-2 transition">
                    <Plus className="w-4 h-4" />
                    Add Camp
                  </button>
                </form>

                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {camps.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6 text-sm">No camps scheduled</p>
                  ) : (
                    camps.map((c) => (
                      <div key={c.id} className="border border-border rounded-lg p-3 hover:border-primary-300 hover:shadow-sm transition">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h3 className="font-semibold text-sm text-foreground">{c.name}</h3>
                            <p className="text-xs text-muted-foreground">
                              {c.address} • {c.city}
                            </p>
                            <p className="text-xs text-primary font-medium mt-1">{c.date}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteCamp(c.id)}
                            className="text-destructive hover:text-destructive-700 flex items-center gap-1 ml-2">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Blood requests panel */}
              <div className="bg-white rounded-lg border border-border shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-foreground">Recent Blood Requests</h2>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-warning-50 text-warning-700">
                    {bloodRequests.length} pending
                  </span>
                </div>
                {bloodRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No blood requests yet</p>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 max-h-80 overflow-y-auto">
                      {bloodRequests.map((request: any) => (
                        <div
                          key={request.id}
                          className="border border-border rounded-lg p-4 hover:border-primary-300 hover:shadow-sm transition">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h3 className="font-bold text-foreground text-sm">{request.name}</h3>
                              <p className="text-xs text-muted-foreground">{request.contact}</p>
                            </div>
                            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-warning-50 text-warning-700">
                              {request.status || "Pending"}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="font-semibold">
                              Blood: <span className="text-primary font-bold">{request.bloodGroup}</span>
                            </span>
                            <span>•</span>
                            <span>{request.units} units</span>
                            <span>•</span>
                            <span>{request.city}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => setShowAllRequests(true)}
                      className="mt-4 w-full text-center text-primary hover:text-primary-700 font-medium text-sm py-2 border border-primary-200 rounded-md hover:bg-primary-50 transition flex items-center justify-center gap-2">
                      <Eye className="w-4 h-4" />
                      View All Requests
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Status Monitoring */}
            <div className="mt-8 bg-white rounded-lg border border-border shadow-sm p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">System Status Monitoring</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">System Health</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                    <span className="text-sm text-foreground">All systems operational</span>
                  </div>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Database Status</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                    <span className="text-sm text-foreground">Connected</span>
                  </div>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold text-foreground mb-2">
                    Notification Service
                  </h3>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success-500 rounded-full"></div>
                    <span className="text-sm text-foreground">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* All Donors Modal */}
            {showAllDonors && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 flex flex-col">
                  <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-2xl font-bold text-foreground">All Donors ({allDonors.length})</h2>
                    <button
                      onClick={() => setShowAllDonors(false)}
                      className="text-muted-foreground hover:text-foreground text-2xl">
                      ×
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-1 p-6">
                    <table className="w-full">
                      <thead className="bg-surface sticky top-0">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Name</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Blood</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">City</th>
                          <th className="px-4 py-3 text-left text-xs font-semibold text-foreground">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {allDonors.map((donor: any) => (
                          <tr key={donor.id} className="hover:bg-surface">
                            <td className="px-4 py-3 text-sm text-foreground">{donor.fullName}</td>
                            <td className="px-4 py-3">
                              <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-primary-50 text-primary-700">
                                {donor.bloodGroup}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-muted-foreground">{donor.city}</td>
                            <td className="px-4 py-3">
                              <span
                                className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold ${
                                  donor.availabilityStatus === "available"
                                    ? "bg-success-50 text-success-700"
                                    : "bg-warning-50 text-warning-700"
                                }`}>
                                {donor.availabilityStatus === "available" ? "Available" : "Unavailable"}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* All Blood Requests Modal */}
            {showAllRequests && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-4xl w-full max-h-96 flex flex-col">
                  <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-2xl font-bold text-foreground">All Blood Requests ({allBloodRequests.length})</h2>
                    <button
                      onClick={() => setShowAllRequests(false)}
                      className="text-muted-foreground hover:text-foreground text-2xl">
                      ×
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-1 p-6 space-y-3">
                    {allBloodRequests.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No blood requests</p>
                    ) : (
                      allBloodRequests.map((request: any) => (
                        <div
                          key={request.id}
                          className="border border-border rounded-lg p-4 hover:border-primary-300 transition">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h3 className="font-bold text-foreground">{request.name}</h3>
                              <p className="text-sm text-muted-foreground">{request.contact}</p>
                            </div>
                            <span className="px-2 py-1 rounded-md text-xs font-semibold bg-warning-50 text-warning-700">
                              {request.status || "Pending"}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="font-semibold">
                              Blood: <span className="text-primary">{request.bloodGroup}</span>
                            </span>
                            <span>•</span>
                            <span>{request.units} units</span>
                            <span>•</span>
                            <span>{request.city}</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Edit Blood Bank Modal */}
            {editingBank && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 flex flex-col overflow-hidden">
                  <div className="flex justify-between items-center p-6 border-b border-border">
                    <h2 className="text-2xl font-bold text-foreground">Edit Blood Bank: {editingBank.name}</h2>
                    <button
                      onClick={closeEditBank}
                      className="text-muted-foreground hover:text-foreground">
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                  <div className="overflow-y-auto flex-1 p-6 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Bank Name</label>
                        <input
                          type="text"
                          value={editFormData.name}
                          onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                          className="w-full px-3 py-2 border border-border bg-white rounded-md focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">City</label>
                        <input
                          type="text"
                          value={editFormData.city}
                          onChange={(e) => setEditFormData({ ...editFormData, city: e.target.value })}
                          className="w-full px-3 py-2 border border-border bg-white rounded-md focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Address</label>
                        <input
                          type="text"
                          value={editFormData.address}
                          onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                          className="w-full px-3 py-2 border border-border bg-white rounded-md focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-muted-foreground mb-1">Phone</label>
                        <input
                          type="text"
                          value={editFormData.phone}
                          onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                          className="w-full px-3 py-2 border border-border bg-white rounded-md focus:ring-2 focus:ring-primary text-sm"
                        />
                      </div>
                    </div>

                    {/* Blood Inventory Edit */}
                    <div>
                      <label className="block text-xs font-semibold text-muted-foreground mb-2">Update Blood Inventory (units)</label>
                      <div className="grid grid-cols-4 gap-2">
                        {(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const).map((bg) => (
                          <div key={bg}>
                            <label className="text-xs text-muted-foreground block mb-1 text-center font-semibold">{bg}</label>
                            <input
                              type="number"
                              min="0"
                              value={editFormData.inventory[bg] || 0}
                              onChange={(e) =>
                                setEditFormData({
                                  ...editFormData,
                                  inventory: {
                                    ...editFormData.inventory,
                                    [bg]: parseInt(e.target.value) || 0,
                                  },
                                })
                              }
                              className="w-full px-2 py-2 border border-border bg-white rounded-md focus:ring-2 focus:ring-primary text-xs text-center"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-border">
                      <button
                        onClick={handleSaveEdit}
                        className="flex-1 bg-primary hover:bg-primary-700 text-primary-foreground px-4 py-2 rounded-md font-medium text-sm transition">
                        Save Changes
                      </button>
                      <button
                        onClick={closeEditBank}
                        className="flex-1 bg-gray-200 hover:bg-gray-300 text-foreground px-4 py-2 rounded-md font-medium text-sm transition">
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
