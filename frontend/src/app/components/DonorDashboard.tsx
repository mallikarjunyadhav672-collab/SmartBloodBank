import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  User,
  MapPin,
  Droplet,
  Calendar,
  AlertCircle,
  Phone,
  Mail,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import * as api from "../api";

interface DonorProfile {
  id: number;
  userId: number;
  fullName: string;
  age: string;
  gender: string;
  bloodGroup: string;
  weight: string;
  city: string;
  phone: string;
  lastDonationDate?: string;
  availabilityStatus: string;
  chronicIllness: string;
}

interface BloodRequest {
  id: number;
  userId: number;
  name: string;
  bloodGroup: string;
  units: number;
  city: string;
  contact: string;
  status?: string;
}

export function DonorDashboard() {
  const { user } = useAuth();
  const [donorProfile, setDonorProfile] = useState<DonorProfile | null>(null);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [history, setHistory] = useState<BloodRequest[]>([]); // responded/donated requests
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);

  useEffect(() => {
    if (!user) return;

    let mounted = true;
    setLoading(true);

    Promise.all([
      api.getDonorByUser(user.id).catch(() => null),
      api.listReceivers().catch(() => []),
    ])
      .then(([donor, allRequests]) => {
        if (mounted) {
          if (donor) {
            setDonorProfile(donor);
            // Filter requests that match donor's blood group and city
            const matchedRequests = (allRequests || []).filter(
              (req: any) =>
                req.bloodGroup === donor.bloodGroup &&
                req.city.toLowerCase() === donor.city.toLowerCase() &&
                req.status === "pending"
            );
            setRequests(matchedRequests);
          }
        }
      })
      .catch((err) => console.error("Failed to load donor data:", err))
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [user]);

  // --- handlers -------------------------------------------------------
  const handleContact = async (request: BloodRequest) => {
    if (!donorProfile) return;
    try {
      // update request status
      await api.updateReceiverRequest(request.id, "matched", donorProfile.id);

      // optionally update donor location using browser geolocation
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude, longitude } = pos.coords;
          api.createDonor({ userId: donorProfile.userId, latitude, longitude }).catch(
            (e) => console.warn("Failed to update donor location", e)
          );
        });
      }

      // move to history
      setHistory((prev) => [
        ...prev,
        { ...request, status: "matched", donorId: donorProfile.id },
      ]);
      setRequests((prev) => prev.filter((r) => r.id !== request.id));
      alert("Marked as responded. Thank you for helping!");
    } catch (err) {
      console.error(err);
      alert("Failed to update request status.");
    }
  };

  const markDonated = async (request: BloodRequest) => {
    try {
      await api.updateReceiverRequest(request.id, "donated");
      setHistory((prev) =>
        prev.map((r) => (r.id === request.id ? { ...r, status: "donated" } : r))
      );
      // update lastDonationDate in local state
      setDonorProfile((prev) =>
        prev ? { ...prev, lastDonationDate: new Date().toISOString().split("T")[0] } : prev
      );

      // capture geo location as well
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const { latitude, longitude } = pos.coords;
          api.createDonor({ userId: donorProfile!.userId, latitude, longitude }).catch(
            (e) => console.warn("Failed to update donor location", e)
          );
        });
      }

      alert("Request marked as donated. Well done!");
    } catch (err) {
      console.error(err);
      alert("Could not update donation status.");
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  if (!donorProfile) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Donor Dashboard</h1>
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Complete Your Donor Profile
            </h2>
            <p className="text-gray-600 mb-6">
              Please complete your donor profile to start receiving blood requests matching your
              blood group and location.
            </p>
            <Link
              to="/donor-register"
              className="inline-block bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition font-medium"
            >
              Complete Donor Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Donor Dashboard</h1>

          {/* Your Profile Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Profile</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-red-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{donorProfile.fullName}</h3>
                    <p className="text-sm text-gray-600">Profile ID: {donorProfile.id}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-red-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Blood Group</p>
                    <p className="text-2xl font-bold text-red-600">{donorProfile.bloodGroup}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Status</p>
                    <p
                      className={`font-bold ${
                        donorProfile.availabilityStatus === "available"
                          ? "text-green-600"
                          : "text-gray-600"
                      }`}
                    >
                      {donorProfile.availabilityStatus === "available" ? "Available" : "Unavailable"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Contact Information</p>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-900 font-medium">{donorProfile.phone}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-gray-600" />
                      <span className="text-gray-900">{donorProfile.city}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-600 mb-1">Medical Information</p>
                  <div className="space-y-1 text-sm">
                    <p>Age: {donorProfile.age} years</p>
                    <p>Gender: {donorProfile.gender}</p>
                    <p>Weight: {donorProfile.weight}kg</p>
                    {donorProfile.lastDonationDate && (
                      <p className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Last Donation: {donorProfile.lastDonationDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {donorProfile.chronicIllness === "yes" && (
              <div className="mt-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">⚠️ Note:</span> You have reported chronic
                  illness. Please consult with a medical professional before donating.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Blood Requests Section */}
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Matching Blood Requests ({requests.length})
          </h2>

          {requests.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Droplet className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">No Requests Currently</h3>
              <p className="text-gray-600">
                There are no pending blood requests matching your blood group ({donorProfile.bloodGroup}
                ) in {donorProfile.city}. Check back later!
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-red-600 hover:shadow-xl transition"
                >
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{request.name}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Droplet className="w-4 h-4 text-red-600" />
                          <span className="font-semibold">
                            {request.bloodGroup} - {request.units} units needed
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{request.city}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-2 font-semibold">CONTACT DETAILS</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-600" />
                          <a
                            href={`tel:${request.contact}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {request.contact}
                          </a>
                        </div>
                        {request.city && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">
                              Receiver in {request.city}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-end items-start gap-2">
                      <button
                        onClick={() => handleContact(request)}
                        className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition font-medium"
                      >
                        Contact Receiver
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Response history */}
        {history.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Your Response History ({history.length})
            </h2>
            <div className="grid gap-6">
              {history.map((req) => (
                <div
                  key={req.id}
                  className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-blue-500 hover:shadow-xl transition"
                >
                  <div className="grid md:grid-cols-3 gap-6">
                    <div>
                      <h3 className="font-bold text-lg text-gray-900 mb-2">{req.name}</h3>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-gray-600">
                          <Droplet className="w-4 h-4 text-red-600" />
                          <span className="font-semibold">
                            {req.bloodGroup} - {req.units} units needed
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          <span>{req.city}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-gray-600 mb-2 font-semibold">CONTACT DETAILS</p>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-gray-600" />
                          <a
                            href={`tel:${req.contact}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {req.contact}
                          </a>
                        </div>
                        {req.city && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-600" />
                            <span className="text-sm text-gray-600">
                              Receiver in {req.city}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col justify-end items-start gap-2">
                      {req.status === "matched" && (
                        <button
                          onClick={() => markDonated(req)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium"
                        >
                          Mark Donated
                        </button>
                      )}
                      {req.status === "donated" && (
                        <span className="text-green-600 font-semibold">Donated</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Contact Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-gray-600 mb-1 font-semibold">RECEIVER NAME</p>
                <p className="text-gray-900 font-medium">{selectedRequest.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1 font-semibold">BLOOD REQUIRED</p>
                <p className="text-gray-900 font-medium">
                  {selectedRequest.bloodGroup} - {selectedRequest.units} units
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1 font-semibold">CONTACT PHONE</p>
                <a
                  href={`tel:${selectedRequest.contact}`}
                  className="text-blue-600 hover:underline font-medium text-lg"
                >
                  {selectedRequest.contact}
                </a>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-800">
                  Click the phone number above to call directly, or save the number to contact later.
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href={`tel:${selectedRequest.contact}`}
                  className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition font-medium text-center"
                >
                  Call Now
                </a>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

