// eslint-disable-next-line @typescript-eslint/no-explicit-any
const API_BASE = ((import.meta as any).env?.VITE_API_BASE as string) || "http://localhost:5000";

export interface User {
  id: number;
  fullName: string;
  email: string;
  role: "donor" | "receiver" | "admin";
  emailVerified: boolean;
  createdAt: string;
}

export interface Donor {
  id?: number;
  userId: number;
  fullName: string;
  age: string;
  gender: string;
  bloodGroup: string;
  weight: string;
  city: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  lastDonationDate: string;
  availabilityStatus: string;
  chronicIllness: string;
  recentSurgery: string;
  medication: string;
  infectionHistory: string;
  doctorAdvised: string;
  consent: boolean;
  createdAt?: string;
}

export interface ReceiverRequest {
  id?: number;
  userId: number;
  donorId?: number;
  name: string;
  bloodGroup: string;
  units: number;
  city: string;
  latitude?: number;
  longitude?: number;
  contact: string;
  status?: string;
  createdAt?: string;
}

function getAuthToken(): string | null {
  return localStorage.getItem("authToken");
}

async function request(path: string, options: RequestInit = {}) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  // Add JWT token if available
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const contentType = res.headers.get('content-type');
    let errorMessage = `API error ${res.status}`;

    try {
      const data = contentType?.includes('application/json')
        ? await res.json()
        : { error: await res.text() };
      errorMessage = data.error || errorMessage;
    } catch (e) {
      // If parsing fails, use default message
    }

    throw new Error(errorMessage);
  }
  return res.json();
}

// ==================== AUTH API ====================

export async function register(
  email: string,
  password: string,
  fullName: string,
  role: "donor" | "receiver" | "admin"
) {
  const result = await request("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password, fullName, role }),
  });
  if (result.token) {
    localStorage.setItem("authToken", result.token);
  }
  return result;
}

export async function login(email: string, password: string) {
  const result = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (result.token) {
    localStorage.setItem("authToken", result.token);
  }
  return result;
}

export function logout() {
  localStorage.removeItem("authToken");
}

export function getUser(userId: number) {
  return request(`/api/auth/user/${userId}`);
}

// ==================== DONOR API ====================

export function fetchPing() {
  return request("/api/ping");
}

export function listDonors() {
  return request("/api/donors");
}

export interface DonorResponse {
  donor: Donor;
  updated: boolean;
}

export function createDonor(donor: Donor) {
  return request("/api/donors", {
    method: "POST",
    body: JSON.stringify(donor),
  }) as Promise<DonorResponse>;
}

// update existing donor profile (partial allowed)
export function updateDonor(donorId: number, updates: Partial<Donor>) {
  return request(`/api/donors/${donorId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  }) as Promise<Donor>;
}

export function getDonorByUser(userId: number) {
  return request(`/api/donors/by-user/${userId}`);
}

export function listReceivers() {
  return request("/api/receivers");
}

export function createReceiver(req: ReceiverRequest) {
  return request("/api/receivers", {
    method: "POST",
    body: JSON.stringify(req),
  });
}

export function getReceiversByUser(userId: number) {
  return request(`/api/receivers/by-user/${userId}`);
}

export function getReceiversByDonor(donorId: number) {
  return request(`/api/receivers/by-donor/${donorId}`);
}

export function updateReceiverRequest(
  requestId: number,
  status: string,
  donorId?: number
) {
  const body: any = { status };
  if (donorId !== undefined) body.donorId = donorId;
  return request(`/api/receivers/${requestId}`, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function deleteReceiverRequest(requestId: number, userId?: number) {
  const body = userId !== undefined ? { userId } : {};
  return request(`/api/receivers/${requestId}`, {
    method: "DELETE",
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  });
}

export function getStats() {
  return request("/api/stats");
}

export function searchDonors(
  bloodGroup?: string,
  city?: string,
  lat?: number,
  lon?: number
) {
  const params = new URLSearchParams();
  if (bloodGroup) params.append("bloodGroup", bloodGroup);
  if (city) params.append("city", city);
  if (lat !== undefined) params.append("lat", lat.toString());
  if (lon !== undefined) params.append("lon", lon.toString());
  return request(`/api/donors/search?${params}`);
}

export function getDonorsByCity(city: string) {
  return request(`/api/donors/by-city/${encodeURIComponent(city)}`);
}

export interface BloodBank {
  id?: number;
  userId?: number; // admin who added
  name: string;
  city: string;
  address: string;
  phone: string;
  inventory?: {
    "A+": number;
    "A-": number;
    "B+": number;
    "B-": number;
    "AB+": number;
    "AB-": number;
    "O+": number;
    "O-": number;
  };
  verified?: boolean;
}

export function listBloodBanks(city?: string) {
  const params = new URLSearchParams();
  if (city) params.append("city", city);
  return request(`/api/blood-banks?${params}`);
}

export function createBloodBank(bank: BloodBank) {
  return request(`/api/blood-banks`, {
    method: "POST",
    body: JSON.stringify(bank),
  });
}

export function updateBloodBank(bankId: number, updates: Partial<BloodBank>) {
  return request(`/api/blood-banks/${bankId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export function deleteBloodBank(bankId: number, userId?: number) {
  const body = userId !== undefined ? { userId } : {};
  return request(`/api/blood-banks/${bankId}`, {
    method: "DELETE",
    body: JSON.stringify(body),
  });
}

export function searchBloodBanks(bloodGroup?: string, city?: string, lat?: number, lon?: number, radius?: number) {
  const params = new URLSearchParams();
  if (bloodGroup) params.append("bloodGroup", bloodGroup);
  if (city) params.append("city", city);
  if (lat !== undefined) params.append("lat", lat.toString());
  if (lon !== undefined) params.append("lon", lon.toString());
  if (radius !== undefined) params.append("radius", radius.toString());
  return request(`/api/blood-banks/search?${params}`);
}

export function listDonationCamps(city?: string) {
  // alias kept for compatibility, backend will serve same data
  const params = new URLSearchParams();
  if (city) params.append("city", city);
  return request(`/api/donation-camps?${params}`);
}

// new camp management helper for admin
export interface Camp {
  id?: number;
  userId?: number; // admin creating the camp
  name: string;
  city: string;
  address: string;
  date: string;
}

export function listCamps(city?: string) {
  const params = new URLSearchParams();
  if (city) params.append("city", city);
  return request(`/api/camps?${params}`);
}

export function createCamp(camp: Camp) {
  return request(`/api/camps`, {
    method: "POST",
    body: JSON.stringify(camp),
  });
}

export function updateCamp(campId: number, updates: Partial<Camp>) {
  return request(`/api/camps/${campId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export function deleteCamp(campId: number, userId?: number) {
  const body = userId !== undefined ? { userId } : {};
  return request(`/api/camps/${campId}`, {
    method: "DELETE",
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  });
}

// ==================== NOTIFICATION API ====================

export function getDonorNotifications(donorId: number) {
  return request(`/api/notifications/donor/${donorId}`);
}

export function getUnreadNotificationCount(donorId: number) {
  return request(`/api/notifications/donor/${donorId}/unread-count`);
}

export function markNotificationAsRead(notificationId: number) {
  return request(`/api/notifications/${notificationId}/mark-read`, {
    method: "PUT",
    body: JSON.stringify({}),
  });
}

export function getBloodInventory() {
  return request("/api/blood-inventory");
}

export function getBloodDemandPrediction() {
  return request("/api/blood-demand-prediction");
}

// ==================== ELIGIBILITY & STATS API ====================

export function checkDonorEligibility(donorId: number) {
  return request(`/api/donors/${donorId}/eligibility`);
}

export function getDonorStats(donorId: number) {
  return request(`/api/donors/${donorId}/stats`);
}

export function getDonorResponseProbability(donorId: number) {
  return request(`/api/donors/${donorId}/response-probability`);
}

// ==================== FEEDBACK API ====================

export function submitFeedback(toUserId: number, rating: number, comment: string, transactionId?: number, type?: string) {
  return request("/api/feedback", {
    method: "POST",
    body: JSON.stringify({ toUserId, rating, comment, transactionId, type }),
  });
}

export function getUserFeedback(userId: number) {
  return request(`/api/feedback/for/${userId}`);
}

export function getUserGivenFeedback(userId: number) {
  return request(`/api/feedback/from/${userId}`);
}

export function deleteFeedback(feedbackId: number) {
  return request(`/api/feedback/${feedbackId}`, {
    method: "DELETE",
  });
}

// ==================== ADVANCED SEARCH API ====================

export function advancedDonorSearch(filters: any) {
  return request("/api/donors/search/advanced", {
    method: "POST",
    body: JSON.stringify(filters),
  });
}

// ==================== SAVED DONORS/RECEIVERS API ====================

export function getSavedDonors() {
  return request("/api/saved-donors");
}

export function saveDonor(donorId: number) {
  return request(`/api/saved-donors/${donorId}`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function unsaveDonor(donorId: number) {
  return request(`/api/saved-donors/${donorId}`, {
    method: "DELETE",
  });
}

export function getSavedReceivers() {
  return request("/api/saved-receivers");
}

export function saveReceiver(receiverId: number) {
  return request(`/api/saved-receivers/${receiverId}`, {
    method: "POST",
    body: JSON.stringify({}),
  });
}

export function unsaveReceiver(receiverId: number) {
  return request(`/api/saved-receivers/${receiverId}`, {
    method: "DELETE",
  });
}

// ==================== SEARCH HISTORY API ====================

export function getSearchHistory() {
  return request("/api/search-history");
}

export function clearSearchHistory() {
  return request("/api/search-history", {
    method: "DELETE",
  });
}
