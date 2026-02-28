import { Link } from "react-router";
import { Heart, Target, Users, Shield, Award, Zap } from "lucide-react";

export function About() {
  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">About Our Mission</h1>
          <p className="text-xl max-w-3xl mx-auto">
            Bridging the gap between blood donors and those in need through technology and
            compassion
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Mission Statement */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <Target className="w-8 h-8 text-red-600" />
            <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
          </div>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            The Smart Blood Bank Management System is designed to address one of healthcare's most
            critical challenges: ensuring timely availability of safe blood for patients in need.
            Our platform leverages modern technology to create a seamless network connecting blood
            donors, receivers, and blood banks, especially in rural and semi-urban areas where
            blood scarcity is most acute.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            We believe that no patient should suffer due to lack of blood availability, and no
            willing donor should be unable to help because of coordination challenges. This system
            is our contribution to making blood donation more accessible, safer, and more efficient
            for everyone involved.
          </p>
        </div>

        {/* Key Features */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Zap className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Fast Emergency Matching</h3>
              <p className="text-gray-600">
                Instantly connects emergency blood requests with nearby available donors using
                smart matching algorithms. Critical time savings when every second counts.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Shield className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Safe Donor Screening</h3>
              <p className="text-gray-600">
                Comprehensive pre-screening questionnaire ensures only eligible donors are matched,
                maintaining safety standards before blood bank verification.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Users className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Multi-User Platform</h3>
              <p className="text-gray-600">
                Separate interfaces for donors, receivers, and administrators ensure each user type
                gets relevant information and controls.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Heart className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Donor Dashboard</h3>
              <p className="text-gray-600">
                Personal dashboard for donors to track donation history, eligibility status,
                respond to emergency requests, and manage availability.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Award className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Predictive Analytics</h3>
              <p className="text-gray-600">
                Future-ready AI analytics to predict blood demand patterns, optimize inventory
                management, and identify high-demand locations.
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
              <div className="bg-red-100 w-14 h-14 rounded-full flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Rural Focus</h3>
              <p className="text-gray-600">
                Specially designed for rural and semi-urban areas where blood availability is
                difficult to manage and traditional systems are inadequate.
              </p>
            </div>
          </div>
        </div>

        {/* The Problem We Solve */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">The Problem We Solve</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xl font-semibold text-red-600 mb-3">Current Challenges</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>
                    <strong>Limited Blood Availability:</strong> Rural areas often lack organized
                    blood banks and donor networks
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>
                    <strong>Coordination Gaps:</strong> No efficient system to connect willing
                    donors with those in need
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>
                    <strong>Emergency Delays:</strong> Critical time lost in finding compatible
                    blood during emergencies
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>
                    <strong>Safety Concerns:</strong> Lack of proper donor screening leading to
                    potential health risks
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600 font-bold">•</span>
                  <span>
                    <strong>Poor Tracking:</strong> No centralized system to track donations,
                    availability, or demand patterns
                  </span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-green-600 mb-3">Our Solutions</h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    <strong>Digital Network:</strong> Connect thousands of donors, receivers, and
                    blood banks on one platform
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    <strong>Smart Matching:</strong> Automated algorithms to instantly find
                    compatible donors nearby
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    <strong>Rapid Response:</strong> Emergency request system with priority-based
                    notifications
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    <strong>Pre-Screening:</strong> Medical questionnaire to ensure donor safety
                    before blood bank testing
                  </span>
                </li>
                <li className="flex gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  <span>
                    <strong>Analytics Dashboard:</strong> Track donations, predict demand, and
                    optimize resource allocation
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Social Impact */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl shadow-lg p-8 mb-8 border-2 border-red-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Real Social Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold text-red-600 mb-2">1+</div>
              <p className="text-gray-700 font-semibold">Registered Donors</p>
              <p className="text-sm text-gray-600 mt-2">
                Across rural and urban areas, ready to help
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-red-600 mb-2">1+</div>
              <p className="text-gray-700 font-semibold">Requests Fulfilled</p>
              <p className="text-sm text-gray-600 mt-2">
                Successful blood donation coordination
              </p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold text-red-600 mb-2">12+</div>
              <p className="text-gray-700 font-semibold">Lives Impacted</p>
              <p className="text-sm text-gray-600 mt-2">Patients who received timely blood</p>
            </div>
          </div>
        </div>

        {/* Technology Stack */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Technology & Integration</h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            This platform is built with modern web technologies designed for scalability,
            reliability, and ease of integration with existing healthcare systems:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Frontend Technology</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span className="text-red-600">•</span>
                  <span>React for responsive, dynamic user interfaces</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">•</span>
                  <span>Tailwind CSS for modern, mobile-first design</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">•</span>
                  <span>Recharts for interactive data visualizations</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-3">Backend Integration Ready</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex gap-2">
                  <span className="text-red-600">•</span>
                  <span>Flask + MySQL for reliable data management</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">•</span>
                  <span>RESTful API architecture for easy integration</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-red-600">•</span>
                  <span>Secure authentication and data encryption</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Life-Saving Network</h2>
          <p className="text-xl mb-6 max-w-2xl mx-auto">
            Whether you want to donate blood, request blood for a patient, or manage a blood bank,
            our platform is here to help.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/donor-register"
              className="bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Register as Donor
            </Link>
            <Link
              to="/request"
              className="bg-red-800 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-900 transition border-2 border-white"
            >
              Request Blood
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
