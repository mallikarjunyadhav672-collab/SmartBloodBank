import { useState, useEffect } from "react";
import { AlertCircle, CheckCircle, Clock } from "lucide-react";
import * as api from "../api";

interface EligibilityStatus {
  donorId: number;
  isEligible: boolean;
  message: string;
  eligibleDate: string | null;
}

export function EligibilityChecker({ donorId }: { donorId?: number }) {
  const [status, setStatus] = useState<EligibilityStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!donorId) return;
    loadEligibility();
  }, [donorId]);

  const loadEligibility = async () => {
    if (!donorId) return;
    try {
      setLoading(true);
      const result = await api.checkDonorEligibility(donorId);
      setStatus(result);
    } catch (err) {
      console.error("Failed to check eligibility:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!donorId || !status) return null;

  const bgColor = status.isEligible
    ? "bg-success-50 border-success-200"
    : "bg-warning-50 border-warning-200";

  const textColor = status.isEligible ? "text-success-900" : "text-warning-900";
  const icon = status.isEligible ? (
    <CheckCircle className="w-5 h-5 text-success-600" />
  ) : (
    <Clock className="w-5 h-5 text-warning-600" />
  );

  return (
    <div className={`p-4 border ${bgColor} rounded-lg`}>
      <div className="flex items-start gap-3">
        {icon}
        <div className="flex-1">
          <p className={`font-bold ${textColor}`}>{status.message}</p>
          {status.eligibleDate && (
            <p className="text-xs text-muted-foreground mt-2">
              💉 Eligible on: <span className="font-semibold">{status.eligibleDate}</span>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
