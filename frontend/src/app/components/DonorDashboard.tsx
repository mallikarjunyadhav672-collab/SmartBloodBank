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
import { NotificationCenter } from "./NotificationCenter";
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
          // send partial update to existing donor record
          api.updateDonor(donorProfile.userId, { latitude, longitude }).catch(
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
          api.updateDonor(donorProfile!.userId, { latitude, longitude }).catch(
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

  const cancelDonation = async (request: BloodRequest) => {
    if (!window.confirm("Are you sure you want to cancel this donation? The request will be available for other donors.")) {
      return;
    }

    try {
      // Revert status to pending (clear donorId to make it available for other donors)
      await api.updateReceiverRequest(request.id, "pending");
      setHistory((prev) => prev.filter((r) => r.id !== request.id));
      alert("Donation cancelled. The request is now available for other donors.");
    } catch (err) {
      console.error(err);
      alert("Could not cancel donation.");
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading your dashboard...</p>
      </div>
    );
  }

  if (!donorProfile) {
    return (
      <div className="pt-16 min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-foreground mb-8">Donor Dashboard</h1>
          <div className="bg-white rounded-lg border border-border shadow-sm p-12 text-center">
            <AlertCircle className="w-16 h-16 text-warning-600 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-foreground mb-2">
              Complete Your Donor Profile
            </h2>
            <p className="text-muted-foreground mb-6">
              Please complete your donor profile to start receiving blood requests matching your blood group and location.
            </p>
            <Link
              to="/donor-register"
              className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold hover:bg-primary-700 transition-colors"
            >
              Complete Donor Profile
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8 flex justify-between items-start gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Donor Dashboard</h1>
            <p className="text-muted-foreground">Manage your donations and respond to blood requests</p>
          </div>
          <div className="flex-shrink-0">
            <NotificationCenter donorId={donorProfile?.id} />
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-8 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-6">Your Profile</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* User Info */}
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <User className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">{donorProfile.fullName}</h3>
                  <p className="text-sm text-muted-foreground">Donor ID: {donorProfile.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
                  <p className="text-xs text-muted-foreground font-medium mb-1">Blood Group</p>
                  <p className="text-3xl font-bold text-primary">{donorProfile.bloodGroup}</p>
                </div>
                <div className={`border p-4 rounded-lg ${
                  donorProfile.availabilityStatus === "available"
                    ? "bg-success-50 border-success-200"
                    : "bg-muted border-border"
                }`}>
                  <p className="text-xs text-muted-foreground font-medium mb-1">Status</p>
                  <p className={`font-bold ${
                    donorProfile.availabilityStatus === "available"
                      ? "text-success-700"
                      : "text-muted-foreground"
                  }`}>
                    {donorProfile.availabilityStatus === "available" ? "Available" : "Unavailable"}
                  </p>
                </div>
              </div>
            </div>

            {/* Contact & Medical Info */}
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground font-medium mb-3">Contact Information</p>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-primary" />
                    <span className="text-foreground font-medium">{donorProfile.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-muted-foreground">{donorProfile.city}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="space-y-4">
              <div className="p-4 border border-border rounded-lg">
                <p className="text-xs text-muted-foreground font-medium mb-3">Medical Information</p>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>Age: <span className="text-foreground font-medium">{donorProfile.age} years</span></p>
                  <p>Gender: <span className="text-foreground font-medium">{donorProfile.gender}</span></p>
                  <p>Weight: <span className="text-foreground font-medium">{donorProfile.weight} kg</span></p>
                  {donorProfile.lastDonationDate && (
                    <p className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Last Donation: <span className="text-foreground font-medium">{donorProfile.lastDonationDate}</span>
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Health Warning */}
          {donorProfile.chronicIllness === "yes" && (
            <div className="mt-6 bg-warning-50 border-l-4 border-warning-600 p-4 rounded">
              <p className="text-sm text-warning-900">
                <span className="font-semibold">⚠️ Medical Note:</span> You have reported chronic illness. Please consult with a medical professional before donating.
              </p>
            </div>
          )}
        </div>

        {/* Requests Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Available Requests */}
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Matching Blood Requests <span className="text-primary text-lg">({requests.length})</span>
            </h2>

            {requests.length === 0 ? (
              <div className="bg-white rounded-lg border border-border shadow-sm p-12 text-center">
                <Droplet className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">No Matching Requests</h3>
                <p className="text-muted-foreground">
                  There are no pending blood requests matching your blood group ({donorProfile.bloodGroup}) in {donorProfile.city}. Check back later!
                </p>
              </div>
            ) : (
              <div className="grid gap-6">
                {requests.map((request) => (
                  <div
                    key={request.id}
                    className="bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow p-6 border-l-4 border-primary"
                  >
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h3 className="font-bold text-lg text-foreground mb-3">{request.name}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-foreground">
                            <Droplet className="w-4 h-4 text-destructive" />
                            <span className="font-semibold">
                              {request.bloodGroup} - {request.units} unit(s)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{request.city}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-3">Contact Details</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <a
                              href={`tel:${request.contact}`}
                              className="text-primary hover:text-primary-700 underline font-medium"
                            >
                              {request.contact}
                            </a>
                          </div>
                          {request.city && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Receiver in {request.city}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-end">
                        <button
                          onClick={() => handleContact(request)}
                          className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary-700 transition-colors font-medium"
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

          {/* Response History */}
          {history.length > 0 && (
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Your Response History <span className="text-primary text-lg">({history.length})</span>
              </h2>
              <div className="grid gap-6">
                {history.map((req) => (
                  <div
                    key={req.id}
                    className="bg-white rounded-lg border border-border shadow-sm hover:shadow-md transition-shadow p-6 border-l-4 border-success-600"
                  >
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <h3 className="font-bold text-lg text-foreground mb-3">{req.name}</h3>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-foreground">
                            <Droplet className="w-4 h-4 text-destructive" />
                            <span className="font-semibold">
                              {req.bloodGroup} - {req.units} unit(s)
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin className="w-4 h-4" />
                            <span>{req.city}</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-3">Contact Details</p>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Phone className="w-4 h-4 text-muted-foreground" />
                            <a
                              href={`tel:${req.contact}`}
                              className="text-primary hover:text-primary-700 underline font-medium"
                            >
                              {req.contact}
                            </a>
                          </div>
                          {req.city && (
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">
                                Receiver in {req.city}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col justify-end items-start gap-2">
                        {req.status === "matched" && (
                          <div className="flex gap-2 w-full">
                            <button
                              onClick={() => markDonated(req)}
                              className="flex-1 bg-success-600 text-white px-4 py-2 rounded-md hover:bg-success-700 transition-colors font-medium text-sm"
                            >
                              Mark Donated
                            </button>
                            <button
                              onClick={() => cancelDonation(req)}
                              className="flex-1 bg-destructive text-white px-4 py-2 rounded-md hover:bg-destructive-700 transition-colors font-medium text-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                        {req.status === "donated" && (
                          <span className="text-success-700 font-bold flex items-center gap-1">
                            ✓ Donated
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Contact Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-border shadow-lg max-w-md w-full p-8">
            <h3 className="text-lg font-bold text-foreground mb-6">Contact Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">Receiver Name</p>
                <p className="text-foreground font-medium">{selectedRequest.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">Blood Required</p>
                <p className="text-foreground font-medium">
                  {selectedRequest.bloodGroup} - {selectedRequest.units} unit(s)
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-2">Contact Phone</p>
                <a
                  href={`tel:${selectedRequest.contact}`}
                  className="text-primary hover:text-primary-700 font-bold text-lg"
                >
                  {selectedRequest.contact}
                </a>
              </div>
              <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
                <p className="text-sm text-primary-900">
                  Click the phone number above to call directly, or save the number to contact later.
                </p>
              </div>
              <div className="flex gap-3">
                <a
                  href={`tel:${selectedRequest.contact}`}
                  className="flex-1 bg-success-600 text-white px-4 py-2 rounded-md hover:bg-success-700 transition-colors font-medium text-center"
                >
                  Call Now
                </a>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="flex-1 bg-muted text-foreground px-4 py-2 rounded-md hover:bg-muted/80 transition-colors font-medium"
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

