import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, MapPin, Droplet, AlertCircle } from "lucide-react";
import { createReceiver, searchDonors, getDonorsByCity, listBloodBanks, listDonationCamps, getReceiversByUser } from "../api";
import { useAuth } from "../contexts/AuthContext";

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
        getDonorsByCity(formData.location).catch(() => []),
      ]).then(([exact, bycity]) => {
        // Combine and deduplicate results
        const combined = [...exact, ...bycity];
        const unique = Array.from(
          new Map(combined.map((d: any) => [d.id, d])).values()
        );
        return unique.slice(0, 10); // Limit to 10
      });

      setMatchedDonors(
        donors.map((d: any, idx: number) => ({
          id: d.id?.toString() || idx.toString(),
          name: d.fullName,
          bloodGroup: d.bloodGroup,
          city: d.city,
          phone: d.phone || "Contact via system",
          distance:
            typeof d.distance === "number"
              ? `${d.distance.toFixed(1)} km`
              : d.distance
              ? `${d.distance} token match`
              : "Nearby",
        }))
      );
      // fetch blood banks and camps for location
      const b = await listBloodBanks(formData.location).catch(() => []);
      const c = await listDonationCamps(formData.location).catch(() => []);
      setBanks(b || []);
      setCamps(c || []);

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
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        {userRequests.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Requests</h2>
            <div className="space-y-4">
              {userRequests.map((r) => (
                <div
                  key={r.id}
                  className="bg-white rounded-lg shadow p-4 border-l-4 border-red-600"
                >
                  <p className="font-semibold text-gray-900">{r.name}</p>
                  <p className="text-sm text-gray-600">
                    {r.bloodGroup} &ndash; {r.units} unit(s) &ndash; {r.city}
                  </p>
                  <p className="mt-1 text-sm">
                    Status: <span className="font-medium capitalize">{r.status}</span>
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Form */}
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Request Blood</h1>
            <p className="text-gray-600 mb-8">Submit emergency blood request</p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Patient Name *
                </label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter patient name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Blood Group Needed *
                </label>
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Units Required *
                </label>
                <input
                  type="number"
                  name="units"
                  value={formData.units}
                  onChange={handleChange}
                  required
                  min="1"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Number of units"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Emergency Level *
                </label>
                <select
                  name="emergencyLevel"
                  value={formData.emergencyLevel}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">Select Priority</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hospital Name *
                </label>
                <input
                  type="text"
                  name="hospitalName"
                  value={formData.hospitalName}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="Enter hospital name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder="e.g. Village, Mandal, District, State"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Processing..." : "Submit Request"}
              </button>
            </form>
          </div>

          {/* Results */}
          <div className="space-y-6">
            {!showResults ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Droplet className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Request</h3>
                <p className="text-gray-600">
                  Fill in the form to find nearby eligible donors
                </p>
              </div>
            ) : isSearching ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-600">Searching for matching donors...</p>
              </div>
            ) : (
              <>
                {/* Matched Donors */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">
                    <AlertCircle className="inline w-6 h-6 text-red-600 mr-2" />
                    Nearby Eligible Donors ({matchedDonors.length})
                  </h2>
                  <div className="space-y-4">
                    {matchedDonors.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        No matching donors found in {formData.location}. Please try another location.
                      </div>
                    ) : (
                      matchedDonors.map((donor) => (
                        <div
                          key={donor.id}
                          className="border border-gray-200 rounded-lg p-4 hover:border-red-300 transition"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="font-bold text-gray-900">{donor.name}</h3>
                            <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-sm font-semibold">
                              {donor.bloodGroup}
                            </span>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
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
                            className="mt-3 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm font-medium"
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
                  <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                    <h3 className="text-xl font-bold mb-4">Nearby Blood Banks</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {banks.map((b) => (
                        <li key={b.id}>
                          <strong>{b.name}</strong> – {b.address} ({b.phone})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {camps.length > 0 && (
                  <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
                    <h3 className="text-xl font-bold mb-4">Upcoming Donation Camps</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                      {camps.map((c) => (
                        <li key={c.id}>
                          <strong>{c.name}</strong> – {c.address} on {c.date}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* donor detail modal */}
                {showModal && selectedDonor && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                      <h3 className="text-xl font-bold mb-4">Donor Details</h3>
                      <p><strong>Name:</strong> {selectedDonor.name}</p>
                      <p><strong>Blood Group:</strong> {selectedDonor.bloodGroup}</p>
                      <p><strong>City:</strong> {selectedDonor.city}</p>
                      <p><strong>Phone:</strong> {selectedDonor.phone}</p>
                      {selectedDonor.lastDonationDate && (
                        <p><strong>Last Donation:</strong> {selectedDonor.lastDonationDate}</p>
                      )}
                      <button
                        onClick={() => setShowModal(false)}
                        className="mt-4 bg-gray-200 px-4 py-2 rounded-lg"
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
