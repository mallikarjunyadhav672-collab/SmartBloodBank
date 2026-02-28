import { Link } from "react-router";
import { Heart, Users, Award, AlertCircle, TrendingUp, Shield } from "lucide-react";

export function LandingPage() {
  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Donate Blood, Save Lives
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
            Connecting donors, receivers, and blood banks for a healthier tomorrow.
            Every drop counts in saving precious lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/donor-register"
              className="bg-white text-red-600 px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition text-lg"
            >
              Register as Donor
            </Link>
            <Link
              to="/request"
              className="bg-red-800 text-white px-8 py-4 rounded-lg font-semibold hover:bg-red-900 transition text-lg border-2 border-white"
            >
              Request Blood
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Alert Banner */}
      <section className="bg-yellow-50 border-l-4 border-yellow-400 py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <p className="text-yellow-800 font-medium">
            <span className="font-bold">URGENT:</span> AB- blood needed at City Hospital. 
            <Link to="/request" className="ml-2 underline hover:text-yellow-900">
              View Emergency Requests →
            </Link>
          </p>
        </div>
      </section>

      {/* Statistics Cards */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Our Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-red-50 p-8 rounded-xl shadow-lg text-center">
              <Users className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-red-600 mb-2">1+</h3>
              <p className="text-gray-700 font-medium">Registered Donors</p>
            </div>
            <div className="bg-red-50 p-8 rounded-xl shadow-lg text-center">
              <Heart className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-red-600 mb-2">1+</h3>
              <p className="text-gray-700 font-medium">Requests Served</p>
            </div>
            <div className="bg-red-50 p-8 rounded-xl shadow-lg text-center">
              <Award className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-4xl font-bold text-red-600 mb-2">12+</h3>
              <p className="text-gray-700 font-medium">Lives Impacted</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Helps Society */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            How This System Helps Society
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Fast Emergency Matching</h3>
              <p className="text-gray-600">
                Instantly connects emergency blood requests with nearby available donors,
                saving critical time when every second counts.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Safe Donor Screening</h3>
              <p className="text-gray-600">
                Pre-screening questionnaire ensures only eligible donors are matched,
                maintaining safety standards before blood bank verification.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Rural Area Support</h3>
              <p className="text-gray-600">
                Specially designed for rural and semi-urban areas where blood availability
                is difficult to manage and track.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Donor Coordination</h3>
              <p className="text-gray-600">
                Seamlessly coordinates between donors, receivers, and blood banks to ensure
                smooth donation processes.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <TrendingUp className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Predictive Analytics</h3>
              <p className="text-gray-600">
                Future-ready AI analytics to predict blood demand patterns and optimize
                inventory management at blood banks.
              </p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">Secure & Trustworthy</h3>
              <p className="text-gray-600">
                Data privacy assured with secure handling of donor and receiver information,
                building trust in the community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Awareness Message */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
            Why Blood Donation Matters
          </h2>
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            Every two seconds, someone in the world needs blood. Accidents, surgeries, cancer
            treatment, and chronic illnesses require blood transfusions. Yet, only a small
            percentage of eligible donors actually donate blood.
          </p>
          <p className="text-lg text-gray-700 mb-8 leading-relaxed">
            Your single donation can save up to three lives. In rural areas, the shortage is
            even more critical. This platform bridges the gap, ensuring no patient suffers due
            to lack of blood availability.
          </p>
          <Link
            to="/about"
            className="inline-block bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition"
          >
            Learn More About Our Mission
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Smart Blood Bank System</h3>
              <p className="text-gray-400">
                Connecting lives through blood donation. A complete management system for
                donors, receivers, and blood banks.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/about" className="text-gray-400 hover:text-white transition">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-gray-400 hover:text-white transition">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/analytics" className="text-gray-400 hover:text-white transition">
                    Analytics Dashboard
                  </Link>
                </li>
                <li>
                  <Link to="/admin-dashboard" className="text-gray-400 hover:text-white transition">
                    Admin Portal
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Information</h3>
              <p className="text-gray-400 mb-2">Email: support@smartbloodbank.org</p>
              <p className="text-gray-400 mb-2">Phone: +91 1800-BLOOD-HELP</p>
              <p className="text-gray-400">Emergency Hotline: Available 24/7</p>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Smart Blood Bank Management System. All rights reserved.</p>
            <p className="mt-2">
              Final Year Major Project - Designed for social impact and rural healthcare support.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
