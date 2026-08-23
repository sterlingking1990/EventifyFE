import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  FiGrid,
  FiTag,
  FiCalendar,
  FiPlusCircle,
  FiUser,
  FiCamera,
  FiDollarSign,
} from "react-icons/fi";

export default function Sidebar() {
  const { user } = useAuth();
  const isOrg = user?.role === "organizer";

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-eventify-50 dark:bg-eventify-900/30 text-eventify-700 dark:text-eventify-400"
        : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
    }`;

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 min-h-screen p-4 hidden lg:block">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <div className="w-10 h-10 rounded-full bg-eventify-500 flex items-center justify-center text-white font-bold">
          {user?.name?.charAt(0) || "U"}
        </div>
        <div className="text-sm">
          <p className="font-semibold text-gray-900 dark:text-white">{user?.name}</p>
          <p className="text-gray-500 dark:text-gray-400 capitalize">{user?.role}</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1">
        <NavLink to="/dashboard" end className={linkClass}>
          <FiGrid className="text-lg" /> Dashboard
        </NavLink>

        <NavLink to="/tickets" className={linkClass}>
          <FiTag className="text-lg" /> My Tickets
        </NavLink>

        {isOrg && (
          <>
            <NavLink to="/dashboard/events" end className={linkClass}>
              <FiCalendar className="text-lg" /> Manage Events
            </NavLink>
            <NavLink to="/dashboard/events/new" className={linkClass}>
              <FiPlusCircle className="text-lg" /> Create Event
            </NavLink>
            <NavLink to="/dashboard/scan" className={linkClass}>
              <FiCamera className="text-lg" /> QR Check-In
            </NavLink>
            <NavLink to="/dashboard/payouts" className={linkClass}>
              <FiDollarSign className="text-lg" /> Cashout
            </NavLink>
          </>
        )}
      </nav>
    </aside>
  );
}
