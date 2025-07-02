import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import {
  HiOutlineHome,
  HiOutlineUserGroup,
  HiOutlineCog,
  HiOutlineClipboardList,
  HiOutlineLogout,
} from "react-icons/hi";

const navLinks = [
  { to: "/", label: "Dashboard", icon: HiOutlineHome, admin: false },
  {
    to: "/admin/users",
    label: "Manage Users",
    icon: HiOutlineUserGroup,
    admin: true,
  },
  {
    to: "/admin/services",
    label: "Manage Services",
    icon: HiOutlineCog,
    admin: true,
  },
  {
    to: "/admin/logs",
    label: "Action Logs",
    icon: HiOutlineClipboardList,
    admin: true,
  },
];

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();
  const { pathname } = useLocation();

  return (
    <aside className="h-full w-64 bg-gradient-to-b from-gray-900 via-gray-950 to-gray-900 text-white flex flex-col shadow-xl relative z-20 border-r border-gray-800">
      {/* Brand */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-gray-800">
        <span className="font-black text-xl text-center text-white select-none">
          PM2 Dashboard
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex flex-col gap-1 px-4 py-6">
        {navLinks.map(
          ({ to, label, icon: Icon, admin }) =>
            (!admin || user?.role === "admin") && (
              <Link
                key={to}
                to={to}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-lg group font-medium transition
                  ${
                    pathname === to
                      ? "bg-gray-800 text-white shadow"
                      : "hover:bg-gray-800/80 hover:text-blue-300 text-gray-200"
                  }
                  `}
                tabIndex={0}
                aria-current={pathname === to ? "page" : undefined}
              >
                <Icon className="text-xl transition group-hover:scale-110" />
                <span>{label}</span>
              </Link>
            )
        )}
      </nav>

      {/* User & Logout */}
      <div className="border-t border-gray-800 px-6 py-5 mt-auto flex flex-col gap-2 bg-gradient-to-t from-gray-950/80 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-fuchsia-600 flex items-center justify-center text-lg font-bold uppercase shadow border-2 border-blue-600">
            {user?.username?.charAt(0) || "U"}
          </div>
          <div>
            <div className="text-sm text-gray-400">Signed in as</div>
            <div className="font-semibold text-white">{user?.username}</div>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 justify-center mt-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 font-semibold text-white transition focus:ring-2 focus:ring-red-400 active:scale-95"
          aria-label="Logout"
        >
          <HiOutlineLogout className="text-lg" />
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
