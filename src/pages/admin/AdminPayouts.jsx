import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getAdminPayouts,
  processPayout,
  rejectPayout,
  submitPayoutOtp,
  resendPayoutOtp,
  forceFailPayout,
} from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";

const STATUS_COLORS = {
  PENDING:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  PROCESSED:
    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  PROCESSING:
    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  OTP_PENDING:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
};

const STATUS_LABELS = {
  OTP_PENDING: "Awaiting OTP",
};

function SlaBadge({ responseDueAt }) {
  if (!responseDueAt) return null;
  const due = new Date(responseDueAt);
  const overdue = due < new Date();
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
        overdue
          ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
      }`}
    >
      {overdue ? "Overdue" : `Due ${due.toLocaleString()}`}
    </span>
  );
}

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [otpModal, setOtpModal] = useState(null);
  const [otpValue, setOtpValue] = useState("");
  const [otpError, setOtpError] = useState("");
  const [busyId, setBusyId] = useState(null);
  const [forceFailModal, setForceFailModal] = useState(null);
  const [forceFailReason, setForceFailReason] = useState("");

  const load = () => {
    getAdminPayouts()
      .then(setPayouts)
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleProcess = async (payoutId) => {
    setBusyId(payoutId);
    try {
      const result = await processPayout(payoutId);
      if (result.status === "OTP_PENDING") {
        toast.success("Transfer initiated — OTP required to complete it");
        setOtpModal(result);
      } else if (result.status === "PROCESSED") {
        toast.success("Payout sent");
      } else if (result.status === "FAILED") {
        toast.error(result.failureReason || "Transfer failed");
      } else {
        toast.success("Payout is processing");
      }
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to process payout");
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    try {
      await rejectPayout(rejectModal.id, rejectReason || null);
      toast.success("Payout rejected");
      setRejectModal(null);
      setRejectReason("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reject payout");
    }
  };

  const handleSubmitOtp = async () => {
    if (!otpModal || !otpValue) return;
    setOtpError("");
    try {
      const result = await submitPayoutOtp(otpModal.id, otpValue);
      if (result.status === "PROCESSED") {
        toast.success("Payout sent");
        setOtpModal(null);
        setOtpValue("");
      } else if (result.status === "FAILED") {
        toast.error(result.failureReason || "Transfer failed");
        setOtpModal(null);
        setOtpValue("");
      } else {
        setOtpModal(result);
      }
      load();
    } catch (err) {
      setOtpError(err.response?.data?.message || "Invalid OTP, please try again");
    }
  };

  const handleResendOtp = async () => {
    if (!otpModal) return;
    try {
      await resendPayoutOtp(otpModal.id);
      toast.success("OTP resent");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to resend OTP");
    }
  };

  const handleForceFail = async () => {
    if (!forceFailModal) return;
    try {
      await forceFailPayout(forceFailModal.id, forceFailReason || null);
      toast.success("Payout force-failed");
      setForceFailModal(null);
      setForceFailReason("");
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to force-fail payout");
    }
  };

  const filtered = payouts.filter(
    (p) => filter === "ALL" || p.status === filter
  );

  const pendingCount = payouts.filter((p) => p.status === "PENDING").length;

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Payouts
        </h1>
        {pendingCount > 0 && (
          <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-sm font-medium px-3 py-1 rounded-full">
            {pendingCount} pending
          </span>
        )}
      </div>

      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-eventify-500 outline-none"
        >
          <option value="ALL">All Status</option>
          <option value="PENDING">Pending</option>
          <option value="OTP_PENDING">Awaiting OTP</option>
          <option value="PROCESSING">Processing</option>
          <option value="PROCESSED">Processed</option>
          <option value="FAILED">Failed</option>
        </select>
      </div>

      <div className="space-y-4">
        {filtered.map((payout) => (
          <div
            key={payout.id}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {payout.userName}
                  </h3>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_COLORS[payout.status] || ""
                    }`}
                  >
                    {STATUS_LABELS[payout.status] || payout.status}
                  </span>
                  {payout.accountNameMismatch && (
                    <span
                      className="inline-block px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                      title="Destination account name shares no token with the organiser's signup name, or was not verified"
                    >
                      Name mismatch
                    </span>
                  )}
                  {payout.status === "PENDING" && (
                    <SlaBadge responseDueAt={payout.responseDueAt} />
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {payout.userEmail}
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      Gross
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      ₦{Number(payout.amount).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      Fee{payout.feePercentApplied != null ? ` (${payout.feePercentApplied}%)` : ""}
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {payout.feeAmount != null ? `₦${Number(payout.feeAmount).toLocaleString()}` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      Net Payout
                    </p>
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {payout.netAmount != null ? `₦${Number(payout.netAmount).toLocaleString()}` : "-"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      Bank
                    </p>
                    <p className="text-gray-700 dark:text-gray-300">
                      {payout.bankName || "-"} · {payout.accountNumber || "-"}
                    </p>
                  </div>
                </div>
                <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                  Reference: {payout.reference} | Requested:{" "}
                  {payout.requestedAt
                    ? new Date(payout.requestedAt).toLocaleString()
                    : "-"}
                  {payout.processedAt &&
                    ` | Processed: ${new Date(payout.processedAt).toLocaleString()}`}
                  {payout.failureReason &&
                    ` | Reason: ${payout.failureReason}`}
                </div>
              </div>

              {payout.status === "PENDING" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleProcess(payout.id)}
                    disabled={busyId === payout.id}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition cursor-pointer disabled:opacity-50"
                  >
                    {busyId === payout.id ? "Approving..." : "Approve"}
                  </button>
                  <button
                    onClick={() => setRejectModal(payout)}
                    className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition cursor-pointer"
                  >
                    Reject
                  </button>
                </div>
              )}

              {payout.status === "OTP_PENDING" && (
                <div className="flex flex-col items-end gap-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-[16rem] text-right">
                    Waiting for the Paystack OTP (expires after 30 minutes).
                    Enter or resend it, or force-fail to release the funds back
                    to the organiser.
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setOtpValue("");
                        setOtpError("");
                        setOtpModal(payout);
                      }}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition cursor-pointer"
                    >
                      Enter OTP
                    </button>
                    <button
                      onClick={() => setForceFailModal(payout)}
                      className="px-4 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition cursor-pointer"
                    >
                      Force Fail
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 py-12">
            No payouts found.
          </p>
        )}
      </div>

      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Reject Payout
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Rejecting payout #{rejectModal.id} for ₦
              {Number(rejectModal.amount).toLocaleString()} to{" "}
              {rejectModal.userName}
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason for rejection (optional)"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-eventify-500 mb-4"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition cursor-pointer"
              >
                Reject Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {otpModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Enter Transfer OTP
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Paystack sent a one-time PIN to Brandible's registered contact to
              authorize sending ₦{Number(otpModal.netAmount ?? otpModal.amount).toLocaleString()} to{" "}
              {otpModal.userName}. Enter it below to complete the transfer.
            </p>
            <input
              type="text"
              value={otpValue}
              onChange={(e) => setOtpValue(e.target.value)}
              placeholder="OTP"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-eventify-500 mb-2"
            />
            {otpError && <p className="text-sm text-red-600 dark:text-red-400 mb-2">{otpError}</p>}
            <div className="flex gap-2 justify-between items-center mt-4">
              <button
                onClick={handleResendOtp}
                className="text-sm text-eventify-600 dark:text-eventify-400 hover:underline cursor-pointer"
              >
                Resend OTP
              </button>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setOtpModal(null);
                    setOtpValue("");
                    setOtpError("");
                  }}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitOtp}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 transition cursor-pointer"
                >
                  Submit OTP
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {forceFailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Force Fail Payout
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Force-failing #{forceFailModal.id} for{" "}
              {Number(forceFailModal.amount).toLocaleString()} to{" "}
              {forceFailModal.userName}. The backend checks with Paystack first —
              if the transfer actually completed, it settles as paid instead.
              Funds return to the organiser's balance.
            </p>
            <textarea
              value={forceFailReason}
              onChange={(e) => setForceFailReason(e.target.value)}
              placeholder="Reason (optional)"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-eventify-500 mb-4"
              rows={3}
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setForceFailModal(null);
                  setForceFailReason("");
                }}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleForceFail}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition cursor-pointer"
              >
                Force Fail
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
