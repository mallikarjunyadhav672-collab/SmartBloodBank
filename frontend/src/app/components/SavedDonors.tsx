import { useState, useEffect } from "react";
import { Heart, MapPin, Droplet, Mail, Phone } from "lucide-react";
import * as api from "../api";

interface SavedDonor {
  id: number;
  fullName: string;
  bloodGroup: string;
  city: string;
  phone: string;
  email: string;
  gender: string;
  age: string;
  availabilityStatus: string;
}

export function SavedDonors() {
  const [donors, setDonors] = useState<SavedDonor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedDonors();
  }, []);

  const loadSavedDonors = async () => {
    try {
      setLoading(true);
      const data = await api.getSavedDonors();
      setDonors(data || []);
    } catch (err) {
      console.error("Failed to load saved donors:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (donorId: number) => {
    try {
      await api.unsaveDonor(donorId);
      setDonors(donors.filter((d) => d.id !== donorId));
    } catch (err) {
      console.error("Failed to unsave donor:", err);
      alert("Failed to remove from saved");
    }
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse mb-4">
            <Heart className="w-12 h-12 mx-auto text-muted-foreground" />
          </div>
          <p className="text-muted-foreground">Loading saved donors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg border border-border shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Heart className="w-8 h-8 text-destructive fill-current" />
            Saved Donors
          </h2>
          <p className="text-muted-foreground mb-6">Quick access to your favorite donors</p>

          {donors.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-lg text-muted-foreground mb-2">No saved donors yet</p>
              <p className="text-sm text-muted-foreground">Save donors to access them quickly later</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-lg">
                <p className="text-sm text-success-700 font-semibold">
                  <span className="text-lg">♥ {donors.length}</span> saved donor{donors.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {donors.map((donor) => (
                  <div
                    key={donor.id}
                    className="bg-gradient-to-br from-white to-surface rounded-lg border border-border shadow-sm p-6 hover:shadow-md hover:border-primary-300 transition"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-bold text-foreground text-lg">{donor.fullName}</h3>
                        <p className="text-sm text-muted-foreground">
                          {donor.gender}, {donor.age} years
                        </p>
                      </div>
                      <button
                        onClick={() => handleUnsave(donor.id)}
                        className="text-destructive hover:text-destructive-700 hover:bg-destructive-50 p-2 rounded-md transition flex-shrink-0"
                        title="Remove from saved"
                      >
                        <Heart className="w-5 h-5 fill-current" />
                      </button>
                    </div>

                    {/* Blood Group - Large and Prominent */}
                    <div className="mb-4 p-3 bg-destructive-50 rounded-lg border border-destructive-200">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-5 h-5 text-destructive fill-current" />
                        <span className="text-2xl font-bold text-destructive">{donor.bloodGroup}</span>
                      </div>
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-2 text-muted-foreground mb-3">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm">{donor.city}</span>
                    </div>

                    {/* Contact */}
                    <div className="space-y-2 mb-4 border-t border-border pt-3">
                      <a
                        href={`mailto:${donor.email}`}
                        className="flex items-center gap-2 text-sm text-primary hover:text-primary-700 transition"
                      >
                        <Mail className="w-4 h-4" />
                        <span className="truncate">{donor.email}</span>
                      </a>
                      <a
                        href={`tel:${donor.phone}`}
                        className="flex items-center gap-2 text-sm text-success-600 hover:text-success-700 transition"
                      >
                        <Phone className="w-4 h-4" />
                        {donor.phone}
                      </a>
                    </div>

                    {/* Availability Status */}
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                        donor.availabilityStatus === "available"
                          ? "bg-success-50 text-success-700"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {donor.availabilityStatus === "available" ? "✓ Available" : "Unavailable"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
