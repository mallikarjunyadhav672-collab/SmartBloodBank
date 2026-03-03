import { useState, useEffect } from "react";
import { Heart, MapPin, Droplet, Phone } from "lucide-react";
import * as api from "../api";

interface SavedReceiver {
  id: number;
  userId: number;
  receiverId: number;
  receiver: {
    id: number;
    userId: number;
    donorId?: number;
    name: string;
    bloodGroup: string;
    units: number;
    city: string;
    latitude?: number;
    longitude?: number;
    contact: string;
    status: string;
    createdAt?: string;
  };
  savedAt: string;
}

export function SavedReceivers() {
  const [receivers, setReceivers] = useState<SavedReceiver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedReceivers();
  }, []);

  const loadSavedReceivers = async () => {
    try {
      setLoading(true);
      const data = await api.getSavedReceivers();
      setReceivers(data || []);
    } catch (err) {
      console.error("Failed to load saved receivers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = async (savedId: number) => {
    try {
      const receiver = receivers.find((r) => r.id === savedId);
      if (receiver) {
        await api.unsaveReceiver(receiver.receiverId);
        setReceivers(receivers.filter((r) => r.id !== savedId));
      }
    } catch (err) {
      console.error("Failed to unsave receiver:", err);
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
          <p className="text-muted-foreground">Loading saved receivers...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-surface">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-white rounded-lg border border-border shadow-sm p-8 mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Heart className="w-8 h-8 text-primary fill-current" />
            Saved Receivers
          </h2>
          <p className="text-muted-foreground mb-6">Track blood requests you've saved</p>

          {receivers.length === 0 ? (
            <div className="text-center py-16">
              <Heart className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
              <p className="text-lg text-muted-foreground mb-2">No saved receivers yet</p>
              <p className="text-sm text-muted-foreground">Save receivers to track their needs later</p>
            </div>
          ) : (
            <div>
              <div className="mb-4 p-4 bg-success-50 border border-success-200 rounded-lg">
                <p className="text-sm text-success-700 font-semibold">
                  <span className="text-lg">♥ {receivers.length}</span> saved receiver{receivers.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {receivers.map((saved) => {
                  const receiver = saved.receiver;
                  if (!receiver) return null;

                  return (
                    <div
                      key={saved.id}
                      className="bg-gradient-to-br from-white to-surface rounded-lg border border-border shadow-sm p-6 hover:shadow-md hover:border-primary-300 transition"
                    >
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-foreground text-lg">{receiver.name}</h3>
                          <p className="text-sm text-muted-foreground">Needs blood</p>
                        </div>
                        <button
                          onClick={() => handleUnsave(saved.id)}
                          className="text-primary hover:text-primary-700 hover:bg-primary-50 p-2 rounded-md transition flex-shrink-0"
                          title="Remove from saved"
                        >
                          <Heart className="w-5 h-5 fill-current" />
                        </button>
                      </div>

                      {/* Blood Group - Large and Prominent */}
                      <div className="mb-4 p-3 bg-destructive-50 rounded-lg border border-destructive-200">
                        <div className="flex items-center gap-2">
                          <Droplet className="w-5 h-5 text-destructive fill-current" />
                          <span className="text-2xl font-bold text-destructive">
                            {receiver.bloodGroup}
                          </span>
                        </div>
                      </div>

                      {/* Units Needed */}
                      <div className="mb-3">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-warning-50 text-warning-700">
                          {receiver.units} UNIT(S)
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-2 text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4 text-primary" />
                        <span className="text-sm">{receiver.city}</span>
                      </div>

                      {/* Contact */}
                      <div className="space-y-2 mb-4 border-t border-border pt-3">
                        <div className="flex items-center gap-2 text-sm text-primary">
                          <Phone className="w-4 h-4" />
                          {receiver.contact}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Status: <span className="font-semibold capitalize">{receiver.status}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
