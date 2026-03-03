import { Link } from "react-router";
import { useState, useEffect } from "react";
import { Heart, Users, Award, AlertCircle, TrendingUp, Shield } from "lucide-react";
import logo from "../../assets/logo.svg";

export function LandingPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [urgentRequest, setUrgentRequest] = useState<any>(null);
  const [stats, setStats] = useState({
    totalDonors: 0,
    requestsServed: 0,
    livesSaved: 0,
    partnerHospitals: 0,
  });

  useEffect(() => {
    // Fetch real blood request notifications from backend
    const fetchNotifications = async () => {
      try {
        const apiBase = ((import.meta as any).env?.VITE_API_BASE as string) || "http://localhost:5000";
        const response = await fetch(`${apiBase}/api/receivers`);
        if (response.ok) {
          const data = await response.json();
          // Get recent requests (last 5) to display as notifications
          const recentRequests = (data || []).slice(0, 5);
          setNotifications(recentRequests);

          // Get the first (most urgent) request for the alert banner
          if (recentRequests.length > 0) {
            setUrgentRequest(recentRequests[0]);
          }
        }
      } catch (error) {
        console.warn("Could not fetch notifications:", error);
        setNotifications([]);
      }
    };

    // Fetch real-time statistics from backend
    const fetchStats = async () => {
      try {
        const apiBase = ((import.meta as any).env?.VITE_API_BASE as string) || "http://localhost:5000";
        const response = await fetch(`${apiBase}/api/stats`);
        if (response.ok) {
          const data = await response.json();
          setStats({
            totalDonors: data.totalDonors || 0,
            requestsServed: data.requestsServed || 0,
            livesSaved: data.livesSaved || 0,
            partnerHospitals: data.partnerHospitals || 0,
          });
        }
      } catch (error) {
        console.warn("Could not fetch stats:", error);
      }
    };

    fetchNotifications();
    fetchStats();

    // Refresh stats every 30 seconds
    const notificationInterval = setInterval(fetchNotifications, 30000);
    const statsInterval = setInterval(fetchStats, 30000);

    return () => {
      clearInterval(notificationInterval);
      clearInterval(statsInterval);
    };
  }, []);

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary via-primary-600 to-primary-800 text-white py-24 px-4 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none">
          <img
            src="https://source.unsplash.com/1600x900/?healthcare,medical"
            alt="healthcare background"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="relative max-w-7xl mx-auto text-center">
          <div className="mb-6 inline-block bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm">
            <span className="text-white font-semibold flex items-center justify-center gap-2 text-sm">
              ❤️ Save Lives Every Day
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Your Blood Can<br />Save Three Lives<br />Today
          </h1>
          <p className="text-lg md:text-xl mb-10 max-w-3xl mx-auto leading-relaxed text-white/95">
            BloodLink is India's smartest blood bank coordination platform — connecting willing donors with patients in need through AI-powered emergency matching, real-time availability, and safe donor screening.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/donor-register"
              className="bg-white text-primary px-8 py-3 rounded-md font-semibold hover:bg-primary-50 transition-colors text-lg"
            >
              🩸 Become a Donor
            </Link>
            <Link
              to="/request"
              className="bg-primary-900 text-white px-8 py-3 rounded-md font-semibold hover:bg-primary-950 transition-colors border border-white/20 text-lg"
            >
              🆘 Request Blood
            </Link>
          </div>
        </div>
      </section>

      {/* Emergency Alert Banner */}
      <section className="bg-warning-50 border-b border-warning-200 py-4 px-4">
        <div className="max-w-7xl mx-auto flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-warning-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-warning-900 font-medium">
              <span className="font-bold">URGENT REQUEST:</span> {urgentRequest ? `${urgentRequest.bloodGroup} blood needed at ${urgentRequest.contact || urgentRequest.city} - ${urgentRequest.units} unit(s)` : "AB- blood needed urgently"}
              <Link to="/request" className="ml-2 text-primary font-semibold hover:text-primary-700">
                View All Requests →
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Scrolling Notifications */}
      {notifications.length > 0 && (
        <section className="bg-primary-50 border-b border-primary-100 py-2 overflow-hidden">
          <div className="text-primary-700 font-medium text-sm animate-scroll whitespace-nowrap inline-block">
            {notifications.map((notif, idx) => (
              <span key={idx}>
                🚨 <span className="bg-destructive text-white px-2 py-1 rounded text-xs mr-3 ml-3">{notif.bloodGroup}</span>
                {notif.units} unit(s) needed at {notif.contact || notif.city}
                &nbsp;&nbsp;|&nbsp;&nbsp;
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Statistics Cards */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Real-Time Impact
            </h2>
            <p className="text-muted-foreground">Updated continuously as donors and receivers join our platform</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon="👤"
              number={stats.totalDonors.toString()}
              label="Active Donors"
              gradient="from-primary-100 to-primary-50"
              accent="primary"
            />
            <StatCard
              icon="✅"
              number={stats.requestsServed.toString()}
              label="Requests Served"
              gradient="from-success-100 to-success-50"
              accent="success"
            />
            <StatCard
              icon="💗"
              number={stats.livesSaved.toString()}
              label="Lives Saved"
              gradient="from-destructive-100 to-destructive-50"
              accent="destructive"
            />
            <StatCard
              icon="🏥"
              number={stats.partnerHospitals.toString()}
              label="Partner Hospitals"
              gradient="from-primary-100 to-primary-50"
              accent="primary"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-surface">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-foreground">
            How BloodLink Helps
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard
              icon={<AlertCircle className="w-7 h-7" />}
              title="Fast Emergency Matching"
              description="Instantly connects emergency blood requests with nearby available donors, saving critical time when every second counts."
            />
            <FeatureCard
              icon={<Shield className="w-7 h-7" />}
              title="Safe Donor Screening"
              description="Pre-screening questionnaire ensures only eligible donors are matched, maintaining safety standards before blood bank verification."
            />
            <FeatureCard
              icon={<Users className="w-7 h-7" />}
              title="Rural Area Support"
              description="Specially designed for rural and semi-urban areas where blood availability is difficult to manage and track."
            />
            <FeatureCard
              icon={<Heart className="w-7 h-7" />}
              title="Donor Coordination"
              description="Seamlessly coordinates between donors, receivers, and blood banks to ensure smooth donation processes."
            />
            <FeatureCard
              icon={<TrendingUp className="w-7 h-7" />}
              title="Predictive Analytics"
              description="Future-ready AI analytics to predict blood demand patterns and optimize inventory management at blood banks."
            />
            <FeatureCard
              icon={<Award className="w-7 h-7" />}
              title="Secure & Trustworthy"
              description="Data privacy assured with secure handling of donor and receiver information, building trust in the community."
            />
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-16 px-4 bg-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">
            Why Blood Donation Matters
          </h2>
          <img
            src="https://source.unsplash.com/800x400/?healthcare,blood"
            alt="blood donation"
            className="mx-auto mb-8 rounded-lg shadow-sm border border-border"
          />
          <p className="text-lg text-foreground mb-6 leading-relaxed">
            Every two seconds, someone in the world needs blood. Accidents, surgeries, cancer treatment, and chronic illnesses require blood transfusions. Yet, only a small percentage of eligible donors actually donate blood.
          </p>
          <p className="text-lg text-foreground mb-8 leading-relaxed">
            Your single donation can save up to three lives. In rural areas, the shortage is even more critical. This platform bridges the gap, ensuring no patient suffers due to lack of blood availability.
          </p>
          <Link
            to="/about"
            className="inline-block bg-primary text-primary-foreground px-8 py-3 rounded-md font-semibold hover:bg-primary-700 transition-colors"
          >
            Learn More About Our Mission
          </Link>
        </div>
      </section>

      {/* Quotes Section */}
      <section className="py-12 px-4 bg-surface">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <blockquote className="text-lg italic text-foreground">
            "The greatest gift you can give someone is the gift of life."
          </blockquote>
          <blockquote className="text-lg italic text-foreground">
            "Blood donation is a simple act of kindness that saves lives."
          </blockquote>
        </div>
      </section>
    </div>
  );
}

interface StatCardProps {
  icon: string;
  number: string;
  label: string;
  gradient: string;
  accent: string;
}

function StatCard({ icon, number, label, gradient, accent }: StatCardProps) {
  const bgClass = `bg-gradient-to-br ${gradient}`;
  const borderColor = accent === 'primary' ? 'border-primary-200' : accent === 'success' ? 'border-success-200' : 'border-destructive-200';

  return (
    <div className={`${bgClass} p-8 rounded-lg border ${borderColor} text-center shadow-sm`}>
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="text-3xl font-bold text-foreground mb-1">{number}</h3>
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-white border border-border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4 text-primary">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-foreground mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}
