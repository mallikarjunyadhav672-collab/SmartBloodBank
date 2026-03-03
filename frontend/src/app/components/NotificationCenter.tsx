import { useState, useEffect } from "react";
import { Bell, X, CheckCircle, AlertCircle } from "lucide-react";
import * as api from "../api";

interface Notification {
  id: number;
  donorId: number;
  receiverId: number;
  type: string;
  subject: string;
  message: string;
  status: string;
  emailSent: boolean;
  smsSent: boolean;
  createdAt: string;
}

interface NotificationCenterProps {
  donorId: number | undefined;
}

export function NotificationCenter({ donorId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showPanel, setShowPanel] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load notifications on mount
  useEffect(() => {
    if (!donorId) return;
    loadNotifications();
    // Refresh every 30 seconds
    const interval = setInterval(loadNotifications, 30_000);
    return () => clearInterval(interval);
  }, [donorId]);

  const loadNotifications = async () => {
    if (!donorId) return;
    try {
      setLoading(true);
      const [notifs, counts] = await Promise.all([
        api.getDonorNotifications(donorId).catch(() => []),
        api.getUnreadNotificationCount(donorId).catch(() => ({ unreadCount: 0 })),
      ]);
      setNotifications(notifs || []);
      setUnreadCount(counts?.unreadCount || 0);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const updated = await api.markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? updated : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark notification as read:", err);
    }
  };

  if (!donorId) return null;

  const unreadNotifs = notifications.filter((n) => n.status === "unread");

  return (
    <div className="relative">
      {/* Notification Bell Button */}
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="relative inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary-700 transition font-bold"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-2 bg-warning-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <span>Notifications</span>
      </button>

      {/* Notification Panel */}
      {showPanel && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-lg border border-border z-50 max-h-96 overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white p-4 border-b border-border flex justify-between items-center">
            <h3 className="text-lg font-bold text-foreground">
              Blood Requests {unreadNotifs.length > 0 && `(${unreadNotifs.length})`}
            </h3>
            <button
              onClick={() => setShowPanel(false)}
              className="text-muted-foreground hover:text-foreground transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Notifications List */}
          {loading ? (
            <div className="p-6 text-center text-muted-foreground">Loading...</div>
          ) : notifications.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <AlertCircle className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No notifications yet</p>
              <p className="text-xs mt-1">You'll see blood requests here when receivers need help</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-surface transition cursor-pointer ${
                    notif.status === "unread" ? "bg-primary-50" : ""
                  }`}
                  onClick={() => notif.status === "unread" && markAsRead(notif.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <h4 className="font-bold text-foreground text-sm leading-tight">
                        {notif.subject}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-2">{notif.message}</p>

                      {/* Notification Channels */}
                      <div className="flex gap-2 mt-3 text-xs">
                        {notif.emailSent && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-primary-50 border border-primary-200 text-primary rounded">
                            <CheckCircle className="w-3 h-3" />
                            Email sent
                          </span>
                        )}
                        {notif.smsSent && (
                          <span className="inline-flex items-center gap-1 px-2 py-1 bg-success-50 border border-success-200 text-success-600 rounded">
                            <CheckCircle className="w-3 h-3" />
                            SMS sent
                          </span>
                        )}
                      </div>

                      {/* Timestamp */}
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        {new Date(notif.createdAt).toLocaleDateString()} at{" "}
                        {new Date(notif.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Unread Badge */}
                    {notif.status === "unread" && (
                      <div className="w-2 h-2 bg-destructive rounded-full flex-shrink-0 mt-2"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="sticky bottom-0 bg-white p-3 border-t border-border text-center">
              <p className="text-xs text-muted-foreground">
                Showing {notifications.length} request{notifications.length !== 1 ? "s" : ""}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
