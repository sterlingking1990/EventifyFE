import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getPlatformSettings, updatePlatformSettings } from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";

export default function AdminSettings() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ cashoutFeePercent: "", payoutSlaHours: "" });

  useEffect(() => {
    getPlatformSettings()
      .then((s) => {
        setSettings(s);
        setForm({
          cashoutFeePercent: s.cashoutFeePercent,
          payoutSlaHours: s.payoutSlaHours,
        });
      })
      .catch(() => toast.error("Failed to load settings"))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = await updatePlatformSettings({
        cashoutFeePercent: Number(form.cashoutFeePercent),
        payoutSlaHours: Number(form.payoutSlaHours),
      });
      setSettings(updated);
      toast.success("Settings saved");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm max-w-lg">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Cashouts</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Applies to every new cashout request going forward — requests already submitted keep the
          fee and SLA that were in effect when they were made.
        </p>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Cashout Fee (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={form.cashoutFeePercent}
              onChange={(e) => setForm((f) => ({ ...f, cashoutFeePercent: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-eventify-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Admin Response SLA (hours)
            </label>
            <input
              type="number"
              min="1"
              step="1"
              value={form.payoutSlaHours}
              onChange={(e) => setForm((f) => ({ ...f, payoutSlaHours: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm outline-none focus:ring-2 focus:ring-eventify-500"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-eventify-600 text-white rounded-lg text-sm font-medium hover:bg-eventify-700 transition disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
        {settings?.updatedAt && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4">
            Last updated {new Date(settings.updatedAt).toLocaleString()}
            {settings.updatedByName && ` by ${settings.updatedByName}`}
          </p>
        )}
      </div>
    </div>
  );
}
