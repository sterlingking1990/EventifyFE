import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { FiDollarSign, FiClock, FiCheckCircle } from "react-icons/fi";
import {
  getBalance,
  getPayoutHistory,
  listBanks,
  getFeeInfo,
  requestPayout,
} from "../services/payoutService";
import LoadingSpinner from "../components/LoadingSpinner";

const STATUS_LABELS = {
  PENDING: "Pending review",
  PROCESSING: "Processing",
  OTP_PENDING: "Processing",
  PROCESSED: "Paid",
  FAILED: "Failed",
};

const STATUS_COLORS = {
  PENDING: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  PROCESSING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  OTP_PENDING: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  PROCESSED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  FAILED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

function StatCard({ icon, label, value, hint }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-3 mb-2 text-gray-500 dark:text-gray-400">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      {hint && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

export default function PayoutsPage() {
  const [balance, setBalance] = useState(null);
  const [history, setHistory] = useState([]);
  const [banks, setBanks] = useState([]);
  const [feeInfo, setFeeInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    amount: "",
    bankCode: "",
    bankName: "",
    accountNumber: "",
    accountName: "",
  });

  const load = () => {
    Promise.all([getBalance(), getPayoutHistory(), listBanks(), getFeeInfo()])
      .then(([b, h, bk, fee]) => {
        setBalance(b);
        setHistory(Array.isArray(h) ? h : []);
        setBanks(Array.isArray(bk) ? bk : []);
        setFeeInfo(fee);
      })
      .catch(() => toast.error("Failed to load payout data"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleBankChange = (e) => {
    const code = e.target.value;
    const bank = banks.find((b) => String(b.code) === code);
    setForm((f) => ({ ...f, bankCode: code, bankName: bank?.name || "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.amount || !form.bankCode || !form.accountNumber || !form.accountName) {
      toast.error("Please fill in every field");
      return;
    }
    setSubmitting(true);
    try {
      await requestPayout({
        amount: Number(form.amount),
        bankName: form.bankName,
        bankCode: form.bankCode,
        accountNumber: form.accountNumber,
        accountName: form.accountName,
      });
      toast.success("Cashout requested");
      setForm({ amount: "", bankCode: "", bankName: "", accountNumber: "", accountName: "" });
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to request cashout");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;

  const feePercent = feeInfo ? Number(feeInfo.cashoutFeePercent) : 0;
  const slaHours = feeInfo?.payoutSlaHours ?? 24;
  const amountNum = Number(form.amount) || 0;
  const previewFee = amountNum * (feePercent / 100);
  const previewNet = amountNum - previewFee;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Cashout</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FiDollarSign />}
          label="Available"
          value={`₦${Number(balance?.availableBalance || 0).toLocaleString()}`}
          hint="Withdrawable now"
        />
        <StatCard
          icon={<FiClock />}
          label="Held"
          value={`₦${Number(balance?.heldBalance || 0).toLocaleString()}`}
          hint={
            balance?.nextReleaseAt
              ? `Next release ${new Date(balance.nextReleaseAt).toLocaleDateString()}`
              : "Nothing held"
          }
        />
        <StatCard
          icon={<FiClock />}
          label="In Progress"
          value={`₦${Number(balance?.pendingPayouts || 0).toLocaleString()}`}
          hint="Requested, not yet paid"
        />
        <StatCard
          icon={<FiCheckCircle />}
          label="Total Paid Out"
          value={`₦${Number(balance?.totalPaidOut || 0).toLocaleString()}`}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Request Cashout</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            A {feePercent}% fee applies. Admin will respond within {slaHours} hours of your request.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label>
              <input
                type="number"
                min="1"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-eventify-500"
                placeholder="0.00"
              />
              {amountNum > 0 && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Fee: ₦{previewFee.toLocaleString()} — You'll receive: ₦{previewNet.toLocaleString()}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bank</label>
              <select
                value={form.bankCode}
                onChange={handleBankChange}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-eventify-500"
              >
                <option value="">Select a bank</option>
                {banks.map((b) => (
                  <option key={b.code} value={b.code}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Number
              </label>
              <input
                type="text"
                value={form.accountNumber}
                onChange={(e) => setForm((f) => ({ ...f, accountNumber: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-eventify-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Account Name
              </label>
              <input
                type="text"
                value={form.accountName}
                onChange={(e) => setForm((f) => ({ ...f, accountName: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-eventify-500"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                We'll verify this against your bank before sending.
              </p>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full px-4 py-2.5 bg-eventify-600 text-white rounded-lg text-sm font-medium hover:bg-eventify-700 transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Submitting..." : "Request Cashout"}
            </button>
          </form>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">History</h2>
          <div className="space-y-3 max-h-[520px] overflow-y-auto">
            {history.map((p) => (
              <div
                key={p.id}
                className="border border-gray-200 dark:border-gray-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ₦{Number(p.netAmount ?? p.amount).toLocaleString()}
                  </span>
                  <span
                    className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                      STATUS_COLORS[p.status] || ""
                    }`}
                  >
                    {STATUS_LABELS[p.status] || p.status}
                  </span>
                </div>
                {p.feeAmount != null && (
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Gross ₦{Number(p.amount).toLocaleString()} − fee ₦{Number(p.feeAmount).toLocaleString()}
                    {p.feePercentApplied != null && ` (${p.feePercentApplied}%)`}
                  </p>
                )}
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Requested {p.requestedAt ? new Date(p.requestedAt).toLocaleString() : "-"}
                </p>
                {p.status === "PENDING" && p.responseDueAt && (
                  <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                    Admin will respond by {new Date(p.responseDueAt).toLocaleString()}
                  </p>
                )}
                {p.status === "FAILED" && p.failureReason && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">Reason: {p.failureReason}</p>
                )}
              </div>
            ))}
            {history.length === 0 && (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                No cashout requests yet.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
