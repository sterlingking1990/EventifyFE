import { NavLink, Outlet } from "react-router-dom";
import {
  FiLayout,
  FiCalendar,
  FiUsers,
  FiUserCheck,
  FiDollarSign,
  FiSettings,
  FiArrowLeft,
} from "react-icons/fi";
import { useAuth } from "../context/AuthContext";

const NAV = [
  { to: "/admin", icon: <FiLayout />, label: "Dashboard", end: true },
  { to: "/admin/events", icon: <FiCalendar />, label: "Events" },
  { to: "/admin/organizers", icon: <FiUsers />, label: "Organizers" },
  { to: "/admin/attendees", icon: <FiUserCheck />, label: "Attendees" },
  { to: "/admin/payouts", icon: <FiDollarSign />, label: "Payouts" },
  { to: "/admin/settings", icon: <FiSettings />, label: "Settings" },
];

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
        <div className="p-5 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-eventify-600">Eventify Admin</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? "bg-eventify-50 text-eventify-700 dark:bg-eventify-900/30 dark:text-eventify-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50"
                }`
              }
            >
              <span className="text-lg">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-1">
          <NavLink
            to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700/50 transition"
          >
            <FiArrowLeft />
            Back to App
          </NavLink>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition cursor-pointer"
          >
            Logout
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 sm:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
