import { useState } from "react";
import { Search, Heart, MapPin, Droplet } from "lucide-react";
import * as api from "../api";

interface DonorResult {
  id: number;
  fullName: string;
  bloodGroup: string;
  city: string;
  phone: string;
  availabilityStatus: string;
  distance?: number;
}

export function AdvancedSearch() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [results, setResults] = useState<DonorResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [saved, setSaved] = useState<number[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSearching(true);
      const response = await api.searchDonors(bloodGroup || undefined, city || undefined);
      setResults(response || []);
    } catch (err) {
      console.error("Search failed:", err);
      alert("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const toggleSaveDonor = async (donorId: number) => {
    try {
      if (saved.includes(donorId)) {
        await api.unsaveDonor(donorId);
        setSaved(saved.filter((id) => id !== donorId));
      } else {
        await api.saveDonor(donorId);
        setSaved([...saved, donorId]);
      }
    } catch (err) {
      console.error("Failed to save/unsave donor:", err);
      alert("Failed to save donor");
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Search Form */}
        <div className="bg-white rounded-lg border border-border shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Search className="w-6 h-6" />
            Find Donors
          </h2>
          <p className="text-muted-foreground mb-6">Search for available blood donors by blood group and location</p>

          <form onSubmit={handleSearch} className="space-y-4">
            {/* Main Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Blood Group</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value)}
                  className="w-full bg-surface text-foreground px-4 py-2.5 rounded-md border border-border focus:ring-2 focus:ring-primary"
                >
                  <option value="">Any Blood Group</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">City / Location</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Hyderabad, Mumbai, or Village/Mandal/District"
                  className="w-full bg-surface text-foreground px-4 py-2.5 rounded-md border border-border focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="flex items-end">
                <button
                  type="submit"
                  disabled={searching}
                  className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-md hover:bg-primary-700 transition font-bold disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  {searching ? "Searching..." : "Search"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results */}
        <div>
          {results.length === 0 && !searching && (
            <div className="text-center py-12 bg-white rounded-lg border border-border">
              <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Use the search form above to find donors</p>
            </div>
          )}

          {searching && (
            <div className="text-center py-12 bg-white rounded-lg border border-border">
              <p className="text-muted-foreground">Searching for matching donors...</p>
            </div>
          )}

          {results.length > 0 && !searching && (
            <div>
              <h3 className="text-lg font-bold text-foreground mb-4">Found {results.length} donor{results.length !== 1 ? "s" : ""}</h3>
              <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
                {results.map((donor) => (
                  <div
                    key={donor.id}
                    className="bg-white rounded-lg border border-border shadow-sm p-5 hover:shadow-lg transition"
                  >
                    <div className="mb-4">
                      <h3 className="font-bold text-foreground text-lg">{donor.fullName}</h3>
                      <p className="text-sm text-muted-foreground">ID: {donor.id}</p>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2">
                        <Droplet className="w-4 h-4 text-primary fill-current" />
                        <span className="font-bold text-primary">{donor.bloodGroup}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{donor.city}</span>
                      </div>
                      {donor.distance !== undefined && (
                        <div className="text-xs text-muted-foreground">
                          Distance: {typeof donor.distance === "number" ? `${donor.distance.toFixed(1)} km` : "N/A"}
                        </div>
                      )}
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground mb-2">AVAILABILITY</p>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-bold mb-4 ${
                          donor.availabilityStatus === "available"
                            ? "bg-success-50 text-success-700"
                            : "bg-muted text-foreground"
                        }`}
                      >
                        {donor.availabilityStatus === "available" ? "✓ Available" : "Unavailable"}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleSaveDonor(donor.id)}
                        className="flex-1 bg-primary text-primary-foreground px-3 py-2 rounded-md hover:bg-primary-700 transition text-sm font-bold flex items-center justify-center gap-1"
                      >
                        <Heart
                          className={`w-4 h-4 ${saved.includes(donor.id) ? "fill-current" : ""}`}
                        />
                        {saved.includes(donor.id) ? "Saved" : "Save"}
                      </button>
                      <a
                        href={`tel:${donor.phone}`}
                        className="flex-1 bg-success text-success-foreground px-3 py-2 rounded-md hover:bg-success-700 transition text-sm font-bold text-center"
                      >
                        Call
                      </a>
                    </div>
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
