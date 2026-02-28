import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { TrendingUp, MapPin, Calendar, Info, AlertCircle } from "lucide-react";
import * as api from "../api";

interface BloodPrediction {
  demand: number;
  stock: number;
  ratio: number;
  priority: "High" | "Medium" | "Low";
}

export function PredictiveAnalytics() {
  const [predictionData, setPredictionData] = useState<Record<string, BloodPrediction> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    api
      .getBloodDemandPrediction()
      .then((data) => {
        if (mounted) {
          setPredictionData(data);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(
            err instanceof Error ? err.message : "Failed to load prediction data"
          );
          console.error("Failed to load prediction data:", err);
        }
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  // Transform prediction data for charts
  const chartData = predictionData
    ? Object.entries(predictionData).map(([bg, data]) => ({
        bloodGroup: bg,
        demand: data.demand,
        supply: data.stock,
      }))
    : [];

  const priorityData =
    predictionData && chartData.length > 0
      ? chartData.map(({ bloodGroup }) => ({
          bloodGroup,
          priority: predictionData[bloodGroup].priority,
          severity:
            predictionData[bloodGroup].priority === "High"
              ? 3
              : predictionData[bloodGroup].priority === "Medium"
                ? 2
                : 1,
        }))
      : [];

  const highPriorityGroups =
    predictionData
      ? Object.entries(predictionData)
          .filter(([, data]) => data.priority === "High")
          .slice(0, 3)
      : [];

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600">Loading blood demand analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Blood Demand Prediction</h1>
          <p className="text-gray-600">
            Real-time analysis of blood group demand vs available supply
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg mb-8">
            <div className="flex gap-3">
              <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {!error && predictionData && chartData.length > 0 && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Blood Demand vs Supply */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-900">Blood Demand vs Supply</h2>
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bloodGroup" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="demand" fill="#dc2626" name="Demand" />
                    <Bar dataKey="supply" fill="#16a34a" name="Supply" />
                  </BarChart>
                </ResponsiveContainer>
                <p className="text-sm text-gray-600 mt-4">
                  Comparison of blood demand requests vs available supply by blood group. Red
                  bars indicate areas with higher demand than current supply.
                </p>
              </div>

              {/* Priority Alert */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                  <h2 className="text-xl font-bold text-gray-900">Priority Alerts</h2>
                </div>
                <div className="space-y-3">
                  {highPriorityGroups.length > 0 ? (
                    highPriorityGroups.map(([bg, data]) => (
                      <div key={bg} className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-bold text-gray-900">{bg}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Demand: {data.demand} | Stock: {data.stock}
                            </p>
                            <p className="text-xs text-red-700 font-semibold mt-2">
                              ⚠️ HIGH PRIORITY - Stock shortage detected
                            </p>
                          </div>
                          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                            URGENT
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-700">
                        ✓ All blood groups have adequate supply
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Supply Sufficiency */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-900">Supply Sufficiency Ratio</h2>
                </div>
                <div className="space-y-3">
                  {chartData
                    .sort((a, b) => b.demand - a.demand)
                    .slice(0, 6)
                    .map((item) => {
                      const ratio = predictionData[item.bloodGroup].ratio;
                      const percentage = (1 / ratio) * 100;
                      const isLow = percentage < 80;

                      return (
                        <div key={item.bloodGroup}>
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {item.bloodGroup}
                            </span>
                            <span className="text-sm text-gray-600">
                              {percentage.toFixed(0)}% sufficient
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isLow ? "bg-red-600" : "bg-green-600"
                              }`}
                              style={{ width: `${Math.min(percentage, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Blood Group Summary */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-6 h-6 text-red-600" />
                  <h2 className="text-xl font-bold text-gray-900">Blood Group Summary</h2>
                </div>
                <div className="space-y-2">
                  {chartData.map((item) => (
                    <div key={item.bloodGroup} className="flex justify-between p-2 border-b">
                      <span className="font-semibold text-gray-900">{item.bloodGroup}</span>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          D: {item.demand} | S: {item.supply}
                        </p>
                        <p
                          className={`text-xs font-bold ${
                            predictionData[item.bloodGroup].priority === "High"
                              ? "text-red-600"
                              : predictionData[item.bloodGroup].priority === "Medium"
                                ? "text-orange-600"
                                : "text-green-600"
                          }`}
                        >
                          {predictionData[item.bloodGroup].priority}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Key Insights */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Key Insights</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="border-l-4 border-red-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Critical Groups</h3>
                  <p className="text-sm text-gray-600">
                    {highPriorityGroups.length} blood group(s) showing high demand vs supply
                    mismatch.
                  </p>
                </div>
                <div className="border-l-4 border-blue-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Total Demand</h3>
                  <p className="text-sm text-gray-600">
                    {chartData.reduce((sum, item) => sum + item.demand, 0)} units of blood
                    requested
                  </p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <h3 className="font-bold text-gray-900 mb-2">Available Stock</h3>
                  <p className="text-sm text-gray-600">
                    {chartData.reduce((sum, item) => sum + item.supply, 0)} units in inventory
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
