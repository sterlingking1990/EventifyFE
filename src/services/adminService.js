import api from "./api";

export async function getAdminDashboard() {
  const { data } = await api.get("/admin/dashboard");
  return data;
}

export async function getAdminEvents() {
  const { data } = await api.get("/admin/events");
  return data;
}

export async function getAdminOrganizers() {
  const { data } = await api.get("/admin/organizers");
  return data;
}

export async function getAdminAttendees() {
  const { data } = await api.get("/admin/attendees");
  return data;
}

export async function getAdminPayouts() {
  const { data } = await api.get("/admin/payouts");
  return data;
}

export async function processPayout(payoutId) {
  const { data } = await api.put(`/payouts/${payoutId}/process`);
  return data;
}

export async function rejectPayout(payoutId, reason) {
  const { data } = await api.put(`/payouts/${payoutId}/reject`, null, {
    params: { reason },
  });
  return data;
}

export async function submitPayoutOtp(payoutId, otp) {
  const { data } = await api.put(`/payouts/${payoutId}/submit-otp`, { otp });
  return data;
}

export async function resendPayoutOtp(payoutId) {
  const { data } = await api.put(`/payouts/${payoutId}/resend-otp`);
  return data;
}

export async function forceFailPayout(payoutId, reason) {
  const { data } = await api.put(`/payouts/${payoutId}/force-fail`, null, {
    params: { reason },
  });
  return data;
}

export async function getPlatformSettings() {
  const { data } = await api.get("/admin/platform-settings");
  return data;
}

export async function updatePlatformSettings(payload) {
  const { data } = await api.put("/admin/platform-settings", payload);
  return data;
}
