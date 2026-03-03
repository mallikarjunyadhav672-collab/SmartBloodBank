import { useState, useEffect } from "react";
import { Star, MessageSquare, Trash2, Send } from "lucide-react";
import * as api from "../api";

interface Feedback {
  id: number;
  fromUserId: number;
  toUserId: number;
  rating: number;
  comment: string;
  type: string;
  createdAt: string;
}

interface FeedbackProps {
  userId: number;
  userFullName: string;
  showSubmit?: boolean;
  targetUserId?: number;
  transactionId?: number;
}

export function FeedbackSystem({ userId, userFullName, showSubmit = false, targetUserId, transactionId }: FeedbackProps) {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ rating: 5, comment: "", type: "reliability" });
  const [submitting, setSubmitting] = useState(false);
  const [averageRating, setAverageRating] = useState(0);

  useEffect(() => {
    loadFeedback();
  }, [userId]);

  const loadFeedback = async () => {
    try {
      setLoading(true);
      const result = await api.getUserFeedback(userId);
      setFeedbacks(result || []);
      
      if (result && result.length > 0) {
        const avg = result.reduce((sum: number, f: Feedback) => sum + (f.rating || 0), 0) / result.length;
        setAverageRating(Math.round(avg * 10) / 10);
      }
    } catch (err) {
      console.error("Failed to load feedback:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetUserId) return;

    try {
      setSubmitting(true);
      await api.submitFeedback(targetUserId, formData.rating, formData.comment, transactionId, formData.type);
      setFormData({ rating: 5, comment: "", type: "reliability" });
      setShowForm(false);
      loadFeedback();
      alert("Feedback submitted successfully!");
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      alert("Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteFeedback = async (feedbackId: number) => {
    if (!window.confirm("Delete this feedback?")) return;

    try {
      await api.deleteFeedback(feedbackId);
      loadFeedback();
    } catch (err) {
      console.error("Failed to delete feedback:", err);
    }
  };

  const renderStars = (rating: number, interactive = false, onChange?: (v: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && onChange && onChange(star)}
            className={`transition ${
              interactive ? "cursor-pointer hover:scale-110" : "cursor-default"
            } ${star <= rating ? "text-warning-500" : "text-border"}`}
          >
            <Star className="w-4 h-4 fill-current" />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Average Rating Display */}
      {feedbacks.length > 0 && (
        <div className="bg-primary-50 border border-primary-200 p-4 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Average Rating</p>
              <div className="flex items-center gap-3">
                <span className="text-3xl font-bold text-warning-500">{averageRating}</span>
                {renderStars(Math.round(averageRating))}
                <span className="text-sm text-muted-foreground">({feedbacks.length} reviews)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Submit Feedback Form */}
      {showSubmit && targetUserId && (
        <div className="bg-white border border-border rounded-lg p-4">
          {!showForm ? (
            <button
              onClick={() => setShowForm(true)}
              className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary-700 transition font-bold flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" />
              Leave Feedback
            </button>
          ) : (
            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-sm text-foreground mb-2">Rating (1-5 stars)</label>
                {renderStars(formData.rating, true, (v) => setFormData({ ...formData, rating: v }))}
              </div>

              <div>
                <label className="block text-sm text-foreground mb-2">Feedback Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-surface text-foreground px-3 py-2 rounded border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="reliability">Reliability</option>
                  <option value="response_speed">Response Speed</option>
                  <option value="communication">Communication</option>
                  <option value="professionalism">Professionalism</option>
                </select>
              </div>

              <div>
                <label className="block text-sm text-foreground mb-2">Comment</label>
                <textarea
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  maxLength={500}
                  className="w-full bg-surface text-foreground px-3 py-2 rounded border border-border text-sm h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Share your experience..."
                />
                <p className="text-xs text-muted-foreground mt-1">{formData.comment.length}/500 characters</p>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-success-600 text-white px-4 py-2 rounded hover:bg-success-700 transition font-bold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? "Submitting..." : "Submit"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-muted text-foreground px-4 py-2 rounded hover:bg-muted/80 transition font-bold"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Feedback List */}
      <div className="space-y-3">
        <h3 className="text-lg font-bold text-foreground">Feedback ({feedbacks.length})</h3>
        {loading ? (
          <p className="text-muted-foreground">Loading feedback...</p>
        ) : feedbacks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No feedback yet</p>
        ) : (
          feedbacks.map((feedback) => (
            <div key={feedback.id} className="bg-surface border border-border p-4 rounded-lg">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(feedback.rating)}
                    <span className="text-xs text-muted-foreground bg-border px-2 py-1 rounded">{feedback.type}</span>
                  </div>
                  {feedback.comment && <p className="text-sm text-foreground mb-2">{feedback.comment}</p>}
                  <p className="text-xs text-muted-foreground">{new Date(feedback.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
