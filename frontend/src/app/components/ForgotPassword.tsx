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
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-md mx-auto px-4 py-12">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-red-600 hover:text-red-700 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Login
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
            Forgot Password
          </h1>
          <p className="text-gray-600 mb-8 text-center">
            Enter your email to receive a reset link.
          </p>

          {message && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">{message}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="your.email@example.com"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition"
            >
              Send Reset Link
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
