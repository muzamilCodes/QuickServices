'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit3, Trash2, Loader2, Save, Shield, Phone, MapPin, X } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface Address {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface User {
  _id: string;
  username: string;
  email: string;
  mobile?: string;
  address?: Address;
  isAdmin: boolean;
  isActive: boolean;
  createdAt: string;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [users, setUsers] = useState<User[] | undefined>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [filterAdmin, setFilterAdmin] = useState("all");
  const [editModal, setEditModal] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ mobile: "", street: "", city: "", state: "", pincode: "" });

  const API_URL = "http://localhost:4000";

  const getHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("token")}`,
    "Content-Type": "application/json",
  });

  const fetchUsers = useCallback(async () => {
    try {
      const params = new URLSearchParams({ admin: filterAdmin === "all" ? "" : filterAdmin });
      const res = await fetch(`${API_URL}/admin/users?${params}`, { headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [filterAdmin]);

  const createUser = async (email: string) => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage("User created! Check email for setup.");
        setNewUserEmail("");
        await fetchUsers();
      } else {
        setMessage(data.message || "Failed to create user");
      }
    } catch (error) {
      setMessage("Failed to create user");
    }
  };

  const toggleAdmin = async (userId: string, isAdmin: boolean) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/admin`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ isAdmin: !isAdmin }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? {...u, isAdmin: !isAdmin} : u));
        setMessage(`Admin ${isAdmin ? "removed" : "granted"}!`);
      }
    } catch (error) {
      setMessage("Update failed");
    }
  };

  const toggleActive = async (userId: string, isActive: boolean) => {
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/active`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ isActive: !isActive }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u._id === userId ? {...u, isActive: !isActive} : u));
        setMessage(`Account ${isActive ? "deactivated" : "activated"}!`);
      }
    } catch (error) {
      setMessage("Update failed");
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm("Delete this user account?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, { method: "DELETE", headers: getHeaders() });
      const data = await res.json();
      if (data.success) {
        setUsers(users.filter(u => u._id !== userId));
        setMessage("User deleted!");
      }
    } catch (error) {
      setMessage("Delete failed");
    }
  };

  const openEditModal = (user: User) => {
    setEditModal(user);
    setEditForm({
      mobile: user.mobile || "",
      street: user.address?.street || "",
      city: user.address?.city || "",
      state: user.address?.state || "",
      pincode: user.address?.pincode || ""
    });
  };

  const saveUserDetails = async () => {
    if (!editModal) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${editModal._id}`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          mobile: editForm.mobile,
          address: {
            street: editForm.street,
            city: editForm.city,
            state: editForm.state,
            pincode: editForm.pincode
          }
        }),
      });
      const data = await res.json();
      if (data.success) {
        setUsers(users.map(u => u._id === editModal._id ? {...u, mobile: editForm.mobile, address: { street: editForm.street, city: editForm.city, state: editForm.state, pincode: editForm.pincode }} : u));
        setEditModal(null);
        setMessage("User details updated!");
      } else {
        setMessage(data.message || "Failed to update");
      }
    } catch (error) {
      setMessage("Failed to update");
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchUsers();
  }, [isAuthenticated, fetchUsers]);

  if (loading) return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="min-h-screen px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center gap-4">
          <button 
            onClick={() => router.back()} 
            className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-semibold text-slate-950 mb-4">Users Management</h1>
            <p className="text-slate-600 mb-8">Manage customer accounts and admin roles</p>
          </div>
        </div>

        {message && (
          <div className="mb-6 rounded-2xl bg-emerald-50 p-4 text-emerald-800 mb-8">
            {message}
          </div>
        )}

        <div className="rounded-[28px] bg-white/90 p-8 mb-8 shadow-xl">
          <h2 className="text-2xl font-semibold mb-6">Create New User</h2>
          <div className="flex gap-3 max-w-md">
            <input
              type="email"
              placeholder="user@example.com"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={() => createUser(newUserEmail)}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-white hover:bg-blue-700 whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              Create User
            </button>
          </div>
        </div>

        <div className="mb-8 flex items-center gap-4">
          <select
            value={filterAdmin}
            onChange={(e) => setFilterAdmin(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="true">Admins</option>
            <option value="false">Customers</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users?.map((user) => (
            <div key={user._id} className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
{(user.username || "U").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">{user.username}</h3>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                  </div>
                  {user.mobile && <p className="text-sm text-slate-500 mt-2 flex items-center gap-1"><Phone className="h-4 w-4" /> {user.mobile}</p>}
                  {user.address?.street && (
                    <p className="text-sm text-slate-500 mt-1 flex items-center gap-1"><MapPin className="h-4 w-4" /> 
                      {user.address.street}{user.address.city ? `, ${user.address.city}` : ""}{user.address.pincode ? ` - ${user.address.pincode}` : ""}
                    </p>
                  )}
                </div>
                <div className="space-y-1 text-right">
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    user.isAdmin ? "bg-blue-50 text-blue-700" : "bg-slate-50 text-slate-700"
                  }`}>
                    <Shield className="h-3 w-3" />
                    {user.isAdmin ? "Admin" : "Customer"}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    user.isActive ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                  }`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="text-xs text-slate-500 mb-4">
                Joined {new Date(user.createdAt).toLocaleDateString()}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(user)}
                  className="flex-1 py-2 px-3 rounded-lg text-xs font-medium bg-amber-50 text-amber-700 hover:bg-amber-100 transition flex items-center justify-center gap-1"
                >
                  <Edit3 className="h-3 w-3" />
                  Edit
                </button>
                <button
                  onClick={() => toggleAdmin(user._id, user.isAdmin)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition ${
                    user.isAdmin 
                      ? "bg-rose-50 text-rose-700 hover:bg-rose-100" 
                      : "bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  {user.isAdmin ? "Remove Admin" : "Make Admin"}
                </button>
                <button
                  onClick={() => toggleActive(user._id, user.isActive)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition ${
                    user.isActive 
                      ? "bg-rose-50 text-rose-700 hover:bg-rose-100" 
                      : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {user.isActive ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => deleteUser(user._id)}
                  className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition"
                  title="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

{users?.length === 0 && (
          <div className="text-center py-20">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-slate-100 p-4 text-2xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No users found</h3>
            <p className="text-slate-600 mb-6">Create your first user above</p>
          </div>
        )}
      </div>

      {editModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold">Edit User Details</h2>
              <button onClick={() => setEditModal(null)} className="p-2 hover:bg-slate-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Mobile</label>
                <input
                  type="tel"
                  value={editForm.mobile}
                  onChange={(e) => setEditForm({...editForm, mobile: e.target.value})}
                  placeholder="1234567890"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Street Address</label>
                <input
                  type="text"
                  value={editForm.street}
                  onChange={(e) => setEditForm({...editForm, street: e.target.value})}
                  placeholder="123 Main Road"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input
                    type="text"
                    value={editForm.city}
                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                    placeholder="City"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input
                    type="text"
                    value={editForm.state}
                    onChange={(e) => setEditForm({...editForm, state: e.target.value})}
                    placeholder="State"
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                <input
                  type="text"
                  value={editForm.pincode}
                  onChange={(e) => setEditForm({...editForm, pincode: e.target.value})}
                  placeholder="123456"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setEditModal(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={saveUserDetails}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
