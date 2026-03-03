import { useState } from "react";
import { Link } from "react-router";
import { ArrowLeft, MailCheck } from "lucide-react";

export function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // in a real app we'd call an endpoint; here just simulate
    if (email) {
      setMessage(
        `If an account exists for ${email}, a password reset link has been sent.`
      );
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-background">
      <div className="max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl mx-auto px-4 py-12">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-primary hover:text-primary-700 mb-8 font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Login
        </Link>

        <div className="bg-white rounded-lg border border-border shadow-sm p-8">
          <h1 className="text-3xl font-bold text-foreground mb-2 text-center">
            Forgot Password
          </h1>
          <p className="text-muted-foreground mb-8 text-center">
            Enter your email to receive a reset link.
          </p>

          {message && (
            <div className="mb-4 p-3 bg-success-50 border border-success-200 rounded-lg">
              <p className="text-sm text-success-700">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-border bg-surface rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder-muted-foreground transition-colors"
                placeholder="your.email@example.com"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground py-2.5 rounded-md font-medium hover:bg-primary-700 transition-colors"
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
