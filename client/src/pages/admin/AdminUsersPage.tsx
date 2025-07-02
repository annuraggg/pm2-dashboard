import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { useAuth } from "../../hooks/useAuth";
import {  toast } from "sonner";
import { FiLoader, FiX } from "react-icons/fi";

type User = {
  _id: string;
  username: string;
  role: "admin" | "team";
  assignedServices: string[];
};

type Service = { _id: string; name: string };

const CustomCheckbox: React.FC<{
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}> = ({ checked, onChange, disabled }) => (
  <label className="inline-flex items-center cursor-pointer relative">
    <input
      type="checkbox"
      className="peer sr-only"
      checked={checked}
      onChange={onChange}
      disabled={disabled}
    />
    <span
      className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all
        ${
          checked
            ? "border-blue-600 bg-blue-700/80"
            : "border-gray-600 bg-gray-900"
        }
        peer-focus:ring-2 peer-focus:ring-blue-600
        ${disabled ? "opacity-50 cursor-not-allowed" : ""}
      `}
    >
      {checked && (
        <svg
          className="w-3 h-3 text-white"
          fill="none"
          viewBox="0 0 20 20"
          stroke="currentColor"
        >
          <path
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M5 10l4 4 6-7"
          />
        </svg>
      )}
    </span>
  </label>
);

const CustomInput: React.FC<React.InputHTMLAttributes<HTMLInputElement>> = (
  props
) => (
  <input
    {...props}
    className={`
      w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100
      placeholder-gray-500 outline-none transition
      focus:ring-2 focus:ring-blue-600 focus:border-blue-600
      disabled:opacity-60
      ${props.className ?? ""}
    `}
  />
);

const CustomSelect: React.FC<React.SelectHTMLAttributes<HTMLSelectElement>> = (
  props
) => (
  <select
    {...props}
    className={`
      w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-gray-100
      outline-none transition focus:ring-2 focus:ring-blue-600 focus:border-blue-600
      disabled:opacity-60
      ${props.className ?? ""}
    `}
  />
);

const UserFormModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  form: Partial<User> & { password?: string };
  setForm: React.Dispatch<
    React.SetStateAction<Partial<User> & { password?: string }>
  >;
  editId: string | null;
  services: Service[];
}> = ({ isOpen, onClose, onSubmit, form, setForm, editId, services }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gradient-to-br from-gray-900/90 to-gray-800/90 border border-gray-700 shadow-2xl rounded-2xl w-full max-w-md p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition"
          type="button"
        >
          <FiX size={22} />
        </button>
        <h2 className="text-xl font-bold text-white mb-4">
          {editId ? "Edit User" : "Add User"}
        </h2>
        <form onSubmit={onSubmit} className="space-y-4">
          <CustomInput
            type="text"
            placeholder="Username"
            value={form.username || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, username: e.target.value }))
            }
            disabled={!!editId}
            required
          />
          <CustomInput
            type="password"
            placeholder={
              editId ? "New Password (leave blank to keep)" : "Password"
            }
            value={form.password || ""}
            onChange={(e) =>
              setForm((f) => ({ ...f, password: e.target.value }))
            }
            autoComplete="new-password"
            required={!editId}
          />
          <CustomSelect
            value={form.role || ""}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                role: e.target.value as "admin" | "team",
              }))
            }
            required
          >
            <option value="">Select role...</option>
            <option value="team">Team</option>
            <option value="admin">Admin</option>
          </CustomSelect>
          <label className="block text-xs font-semibold text-gray-300 mt-1">
            Assign Services (for team role)
          </label>
          <div className="flex flex-wrap gap-3 mb-2 py-5">
            {services.map((s) => (
              <label
                key={s._id}
                className="flex items-center gap-2 text-xs text-gray-200"
              >
                <CustomCheckbox
                  disabled={form.role === "admin"}
                  checked={!!form.assignedServices?.includes(s._id)}
                  onChange={(e) => {
                    setForm((f) => {
                      const assigned = f.assignedServices || [];
                      if (e.target.checked)
                        return { ...f, assignedServices: [...assigned, s._id] };
                      else
                        return {
                          ...f,
                          assignedServices: assigned.filter(
                            (id) => id !== s._id
                          ),
                        };
                    });
                  }}
                />
                {s.name}
              </label>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              className="flex-1 bg-blue-700 hover:bg-blue-900 px-4 py-2 text-white rounded font-semibold transition"
              type="submit"
            >
              {editId ? "Update" : "Create"}
            </button>
            <button
              className="flex-1 bg-gray-700 hover:bg-gray-900 px-4 py-2 text-white rounded font-semibold transition"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminUsersPage: React.FC = () => {
  const { api } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Partial<User> & { password?: string }>({});
  const [editId, setEditId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [usersRes, servicesRes] = await Promise.all([
          api("/auth/users"),
          api("/api/admin/services"),
        ]);
        setUsers(usersRes.users);
        setServices(servicesRes.services);
      } catch {
        toast.error("Failed to load users or services.");
      } finally {
        setLoading(false);
      }
    })();
  }, [api]);

  const resetForm = () => {
    setForm({});
    setEditId(null);
    setShowModal(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || (!editId && !form.password) || !form.role) {
      toast.error("Please fill all required fields.");
      return;
    }
    try {
      if (editId) {
        await api(`/auth/users/${editId}`, {
          method: "PUT",
          data: {
            role: form.role,
            password: form.password,
            assignedServices: form.assignedServices,
          },
        });
        toast.success("User updated.");
      } else {
        await api("/auth/users", {
          method: "POST",
          data: {
            username: form.username,
            password: form.password,
            role: form.role,
            assignedServices: form.assignedServices,
          },
        });
        toast.success("User created.");
      }
      const usersRes = await api("/auth/users");
      setUsers(usersRes.users);
      resetForm();
    } catch {
      toast.error("Operation failed.");
    }
  };

  const startEdit = (u: User) => {
    setEditId(u._id);
    setForm({
      username: u.username,
      role: u.role,
      assignedServices: u.assignedServices,
      password: "",
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await api(`/auth/users/${id}`, { method: "DELETE" });
      setUsers((users) => users.filter((u) => u._id !== id));
      toast.success("User deleted.");
    } catch {
      toast.error("Delete failed.");
    }
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <Sidebar />
      <UserFormModal
        isOpen={showModal}
        onClose={resetForm}
        onSubmit={handleSubmit}
        form={form}
        setForm={setForm}
        editId={editId}
        services={services}
      />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-white tracking-wide">
            User Management
          </h1>
          <button
            className="bg-blue-700 hover:bg-blue-900 px-4 py-2 text-white rounded font-semibold transition"
            onClick={() => {
              setEditId(null);
              setForm({});
              setShowModal(true);
            }}
          >
            Add User
          </button>
        </div>
        <div className="rounded-2xl bg-gradient-to-br from-gray-900/80 to-gray-800/90 border border-gray-800 shadow-lg">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-800/60">
                <th className="p-3 text-left font-semibold text-gray-300">
                  Username
                </th>
                <th className="p-3 text-center font-semibold text-gray-300">
                  Role
                </th>
                <th className="p-3 text-center font-semibold text-gray-300">
                  Services
                </th>
                <th className="p-3 text-center font-semibold text-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-400">
                    <FiLoader className="inline mr-2 animate-spin" />
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-gray-500">
                    No users found.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr
                    key={u._id}
                    className="border-t border-gray-800 hover:bg-gray-900/60 transition"
                  >
                    <td className="p-3 text-gray-100">{u.username}</td>
                    <td className="p-3 text-center capitalize text-gray-200">
                      {u.role}
                    </td>
                    <td className="p-3 text-xs text-gray-200 text-center">
                      {services
                        .filter((s) => u.assignedServices?.includes(s._id))
                        .map((s) => s.name)
                        .join(", ") || "-"}
                    </td>
                    <td className="p-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          className="bg-blue-700 hover:bg-blue-900 px-2 py-1 text-xs text-white rounded transition"
                          onClick={() => startEdit(u)}
                        >
                          Edit
                        </button>
                        <button
                          className="bg-red-700 hover:bg-red-900 px-2 py-1 text-xs text-white rounded transition"
                          onClick={() => handleDelete(u._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
};

export default AdminUsersPage;
