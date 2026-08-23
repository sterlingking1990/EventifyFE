import { useState, useEffect } from "react";
import {
  FiCalendar,
  FiUsers,
  FiUserCheck,
  FiDollarSign,
  FiTrendingUp,
  FiAlertCircle,
} from "react-icons/fi";
import { getAdminDashboard } from "../../services/adminService";
import LoadingSpinner from "../../components/LoadingSpinner";

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
      <div className="flex items-center gap-4">
        <div
          className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl ${color}`}
        >
          {icon}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdminDashboard()
      .then(setStats)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="mt-20" size="lg" />;
  if (!stats) return <p className="text-center text-gray-500 mt-20">Failed to load dashboard.</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Dashboard
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FiCalendar />}
          label="Total Events"
          value={stats.totalEvents}
          color="bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
        />
        <StatCard
          icon={<FiUsers />}
          label="Organizers"
          value={stats.totalOrganizers}
          color="bg-purple-50 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400"
        />
        <StatCard
          icon={<FiUserCheck />}
          label="Attendees"
          value={stats.totalAttendees}
          color="bg-green-50 text-green-600 dark:bg-green-900/30 dark:text-green-400"
        />
        <StatCard
          icon={<FiTrendingUp />}
          label="Tickets Sold"
          value={stats.totalTicketsSold}
          color="bg-orange-50 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={<FiDollarSign />}
          label="Total Revenue"
          value={`₦${Number(stats.totalRevenue).toLocaleString()}`}
          color="bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400"
        />
        <StatCard
          icon={<FiDollarSign />}
          label="Platform Fees"
          value={`₦${Number(stats.platformFees).toLocaleString()}`}
          color="bg-teal-50 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400"
        />
        <StatCard
          icon={<FiDollarSign />}
          label="Total Paid Out"
          value={`₦${Number(stats.totalPaidOut).toLocaleString()}`}
          color="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400"
        />
        <StatCard
          icon={<FiDollarSign />}
          label="In Flight"
          value={`₦${Number(stats.inFlightPayoutAmount || 0).toLocaleString()}`}
          color="bg-cyan-50 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <FiAlertCircle className="text-amber-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Pending Payouts
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.pendingPayouts}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            ₦{Number(stats.pendingPayoutAmount).toLocaleString()} awaiting
            processing
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <FiCalendar className="text-blue-500" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Active Events
            </h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">
            {stats.activeEvents}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Out of {stats.totalEvents} total events
          </p>
        </div>
      </div>
    </div>
  );
}
