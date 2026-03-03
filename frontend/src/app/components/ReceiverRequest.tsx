import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, MapPin, Droplet, AlertCircle, Trash2, Eye, X } from "lucide-react";
import { createReceiver, searchDonors, listBloodBanks, listCamps, getReceiversByUser, deleteReceiverRequest, searchBloodBanks } from "../api";
import { useAuth } from "../contexts/AuthContext";
import logo from "../../assets/logo.svg";

// Haversine formula to calculate distance between two coordinates
const haversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

interface Donor {
  id: string;
  name: string;
  bloodGroup: string;
  city: string;
  phone: string;
  distance: string;
  lastDonationDate?: string;
}

interface BloodBank {
  id: string;
  name: string;
  location: string;
  availability: Record<string, number>;
  phone: string;
  distance: string;
}

export function ReceiverRequest() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    patientName: "",
    bloodGroup: "",
    units: "",
    emergencyLevel: "",
    hospitalName: "",
    location: "",
  });

  const [showResults, setShowResults] = useState(false);
  const [matchedDonors, setMatchedDonors] = useState<Donor[]>([]);
  const [userRequests, setUserRequests] = useState<any[]>([]); // receiver's own requests

  // new states for additional features
  const [banks, setBanks] = useState<any[]>([]);
  const [camps, setCamps] = useState<any[]>([]);
  const [selectedDonor, setSelectedDonor] = useState<Donor | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // load user's existing requests so they can see status updates
  const loadUserRequests = async () => {
    if (!user) return;
    try {
      const list = await getReceiversByUser(user.id);
      setUserRequests(list || []);
    } catch {
      setUserRequests([]);
    }
  };

  // fetch on mount and after submit
  useEffect(() => {
    loadUserRequests();
    // refresh periodically so the receiver can see when someone responds
    const interval = setInterval(loadUserRequests, 30_000);
    return () => clearInterval(interval);
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      alert("Please log in first");
      navigate("/login");
      return;
    }

    if (!formData.patientName || !formData.bloodGroup || !formData.units || !formData.location) {
      alert("Please fill all required fields");
      return;
    }

    setIsSubmitting(true);
    setIsSearching(true);

    try {
      // gather optional geolocation
      let latitude: number | undefined;
      let longitude: number | undefined;
      if (navigator.geolocation) {
        const pos = await new Promise<GeolocationPosition>((res, rej) => {
          navigator.geolocation.getCurrentPosition(res, rej);
        }).catch(() => null);
        if (pos) {
          latitude = pos.coords.latitude;
          longitude = pos.coords.longitude;
        }
      }

      // Save the request with userId (include coords if available)
      await createReceiver({
        userId: user.id,
        name: formData.patientName,
        bloodGroup: formData.bloodGroup,
        units: Number(formData.units),
        city: formData.location,
        contact: formData.hospitalName,
        latitude,
        longitude,
      });
      // refresh list of user's own requests
      await loadUserRequests();

      // Fetch matched donors from database by blood group and city
      const donors = await Promise.all([
        searchDonors(
          formData.bloodGroup,
          formData.location,
          latitude,
          longitude
        ).catch(() => []),
        searchDonors(formData.bloodGroup, formData.location).catch(() => []),
      ]).then(([exact, bycity]) => {
        // Combine and deduplicate results
        const combined = [...exact, ...bycity];
        const unique = Array.from(
          new Map(combined.map((d: any) => [d.id, d])).values()
        );
        return unique.slice(0, 10); // Limit to 10
      });

      setMatchedDonors(
        donors.map((d: any, idx: number) => {
          let distance = "Nearby";
          // Calculate distance using haversine if coordinates available
          if (latitude && longitude && d.latitude && d.longitude) {
            const dist = haversine(latitude, longitude, d.latitude, d.longitude);
            distance = `${dist.toFixed(1)} km`;
          } else if (typeof d.distance === "number") {
            distance = `${d.distance.toFixed(1)} km`;
          } else if (d.distance) {
            distance = `${d.distance}`;
          }
          return {
            id: d.id?.toString() || idx.toString(),
            name: d.fullName,
            bloodGroup: d.bloodGroup,
            city: d.city,
            phone: d.phone || "Contact via system",
            distance,
          };
        })
      );
      
      // Fetch blood banks and camps - search for nearby blood banks with the blood group
      const [bankResults, campResults] = await Promise.all([
        searchBloodBanks(formData.bloodGroup, formData.location, latitude, longitude).catch(() => []),
        listCamps(formData.location).catch(() => []),
      ]);
      
      setBanks(bankResults || []);
      setCamps(campResults || []);

      setShowResults(true);
      alert(`Found ${donors.length} matching donors in ${formData.location}!`);
    } catch (err: any) {
      console.error(err);
      alert("Error processing your request: " + (err.message || err));
      setShowResults(false);
    } finally {
      setIsSubmitting(false);
      setIsSearching(false);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-700 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Blood Request</h1>
          <p className="text-muted-foreground">Find nearby donors or alternative blood sources</p>
        </div>

        {userRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">Your Requests</h2>
            <div className="space-y-4">
              {userRequests.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-lg border border-border shadow-sm p-6 border-l-4 border-primary"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">{r.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {r.bloodGroup} &ndash; {r.units} unit(s) &ndash; {r.city}
                      </p>
                      {r.createdAt && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Submitted: {new Date(r.createdAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground mb-2">Status:</p>
                      {r.status === "pending" && (
                        <span className="inline-block px-3 py-1 rounded-full bg-warning-50 border border-warning-200 text-warning-700 text-xs font-bold">
                          🔄 Pending
                        </span>
                      )}
                      {r.status === "matched" && (
                        <span className="inline-block px-3 py-1 rounded-full bg-primary-50 border border-primary-200 text-primary text-xs font-bold">
                          ✓ Donor Confirmed
                        </span>
                      )}
                      {r.status === "donated" && (
                        <span className="inline-block px-3 py-1 rounded-full bg-success-50 border border-success-200 text-success-700 text-xs font-bold">
                          ✓✓ Blood Received
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => alert(`Request Details:\n\nPatient: ${r.name}\nBlood Group: ${r.bloodGroup}\nUnits: ${r.units}\nLocation: ${r.city}\nStatus: ${r.status}\nID: ${r.id}`)}
                      className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-700 transition text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    {r.status === "pending" && (
                      <button
                        onClick={async () => {
                          if (window.confirm("Are you sure you want to cancel this request?")) {
                            try {
                              if (!user?.id) {
                                alert("Error: User not authenticated");
                                return;
                              }
                              await deleteReceiverRequest(r.id, user.id);
                              setUserRequests(userRequests.filter(req => req.id !== r.id));
                              alert("Request cancelled successfully");
                            } catch (err) {
                              console.error(err);
                              const errorMsg = err instanceof Error ? err.message : "Failed to cancel request";
                              alert("Error: " + errorMsg);
                            }
                          }
                        }}
                        className="flex items-center gap-2 px-4 py-2 bg-warning bg-opacity-20 text-warning-700 border border-warning rounded-md hover:bg-opacity-30 transition text-sm font-medium"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                    )}
                    <button
                      onClick={async () => {
                        if (window.confirm("Are you sure you want to delete this request?")) {
                          try {
                            if (!user?.id) {
                              alert("Error: User not authenticated");
                              return;
                            }
                            await deleteReceiverRequest(r.id, user.id);
                            setUserRequests(userRequests.filter(req => req.id !== r.id));
                            alert("Request deleted successfully");
                          } catch (err) {
                            console.error(err);
                            const errorMsg = err instanceof Error ? err.message : "Failed to delete request";
                            alert("Error: " + errorMsg);
                          }
                        }
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive-700 transition text-sm font-medium"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Form */}
          <div className="bg-white rounded-lg border border-border shadow-sm p-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Request Blood</h2>
            <p className="text-muted-foreground mb-8">Submit emergency blood request</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground placeholder-muted-foreground transition-colors"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Blood Group Needed *
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-muted disabled:cursor-not-allowed text-foreground"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Units Required *
                </label>
                <input
                  type="number"
                  name="units"
                  value={formData.units}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-400"
                  placeholder="Number of units"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Emergency Level *
                </label>
                <select
                  name="emergencyLevel"
                  value={formData.emergencyLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">Select Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Hospital Name *
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-400"
                  placeholder="Enter hospital name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 placeholder-gray-400"
                  placeholder="e.g. Village, Mandal, District, State"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-700 text-white py-3 rounded-full font-bold hover:bg-red-800 transition disabled:bg-gray-600 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? "Processing..." : "Submit Request"}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {!showResults ? (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 text-center border border-red-700 border-opacity-30">
                <div className="w-16 h-16 bg-red-900 bg-opacity-40 border border-red-700 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplet className="w-8 h-8 text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Submit Request</h3>
                <p className="text-gray-300">
                  Fill in the form to find nearby eligible donors
                </p>
              </div>
            ) : isSearching ? (
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-8 text-center border border-red-700 border-opacity-30">
                <p className="text-gray-300">Searching for matching donors...</p>
              </div>
            ) : (
              <>
                {/* Matched Donors */}
                <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 border border-red-700 border-opacity-30">
                  <h2 className="text-2xl font-bold text-white mb-4">
                    <AlertCircle className="inline w-6 h-6 text-red-400 mr-2" />
                    Nearby Eligible Donors ({matchedDonors.length})
                  </h2>
                  <div className="space-y-4">
                    {matchedDonors.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        No matching donors found in {formData.location}. Please try another location.
                      </div>
                    ) : (
                      matchedDonors.map((donor) => (
                        <div
                          key={donor.id}
                          className="border border-gray-700 bg-gray-700 bg-opacity-50 rounded-lg p-4 hover:border-red-600 transition"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-white">{donor.name}</h3>
                            <span className="bg-red-700 text-white px-3 py-1 rounded-full text-sm font-semibold">
                              {donor.bloodGroup}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-300">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              <span>
                                {donor.city} • {donor.distance}
                              </span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSelectedDonor(donor);
                              setShowModal(true);
                            }}
                            className="mt-3 w-full bg-red-700 text-white py-2 rounded-full hover:bg-red-800 transition text-sm font-bold"
                          >
                            Contact & Confirm
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Additional info sections */}
                {banks.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mt-6 border border-red-700 border-opacity-30">
                    <h3 className="text-xl font-bold text-white mb-4">Nearby Blood Banks</h3>
                    <div className="space-y-4">
                      {banks.map((b) => {
                        const inventory = b.inventory || {};
                        const availableGroups = Object.entries(inventory).filter(([_, units]) => (units as number) > 0);

                        return (
                          <div key={b.id} className="bg-gray-700 bg-opacity-50 rounded-lg p-4 border border-gray-600 hover:border-orange-400 transition">
                            <div className="mb-3">
                              <h4 className="text-lg font-bold text-white">{b.name}</h4>
                              <p className="text-sm text-gray-300">📍 {b.address}</p>
                              <p className="text-sm text-gray-300">📞 {b.phone}</p>
                            </div>

                            {/* Blood Inventory */}
                            <div className="mt-3 pt-3 border-t border-gray-600">
                              <p className="text-xs font-semibold text-orange-300 mb-2">Blood Stock Available ({availableGroups.length} groups):</p>
                              <div className="grid grid-cols-4 gap-2">
                                {(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const).map((bg) => {
                                  const units = inventory[bg] as number || 0;
                                  const hasStock = units > 0;
                                  return (
                                    <div
                                      key={bg}
                                      className={`rounded-lg p-2 text-center transition ${
                                        hasStock
                                          ? 'bg-red-600 bg-opacity-70 border border-red-400'
                                          : 'bg-gray-600 bg-opacity-40 border border-gray-500 opacity-60'
                                      }`}
                                    >
                                      <span className="font-bold text-white text-xs block">{bg}</span>
                                      <p className={`text-sm font-semibold ${hasStock ? 'text-white' : 'text-gray-400'}`}>
                                        {units} {units === 1 ? 'unit' : 'units'}
                                      </p>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                {camps.length > 0 && (
                  <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl p-6 mt-6 border border-red-700 border-opacity-30">
                    <h3 className="text-xl font-bold text-white mb-4">Upcoming Donation Camps</h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      {camps.map((c) => (
                        <li key={c.id}>
                          <strong className="text-orange-400">{c.name}</strong> – {c.address} on {c.date}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* donor detail modal */}
                {showModal && selectedDonor && (
                  <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-lg p-6 max-w-md w-full border border-red-700 border-opacity-30">
                      <h3 className="text-xl font-bold text-white mb-4">Donor Details</h3>
                      <p className="text-gray-300"><strong className="text-orange-400">Name:</strong> {selectedDonor.name}</p>
                      <p className="text-gray-300"><strong className="text-orange-400">Blood Group:</strong> {selectedDonor.bloodGroup}</p>
                      <p className="text-gray-300"><strong className="text-orange-400">City:</strong> {selectedDonor.city}</p>
                      <p className="text-gray-300"><strong className="text-orange-400">Phone:</strong> {selectedDonor.phone}</p>
                      {selectedDonor.lastDonationDate && (
                        <p className="text-gray-300"><strong className="text-orange-400">Last Donation:</strong> {selectedDonor.lastDonationDate}</p>
                      )}
                      <button
                        onClick={() => setShowModal(false)}
                        className="mt-4 bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
