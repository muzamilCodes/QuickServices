'use client';

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit3, Trash2, Loader2, Save, Shield, Mail, Phone, User as UserIcon } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

interface User {
  _id: string;
  username: string;
  email: string;
  phone?: string;
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

        {/* Create New User */}
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

        {/* Filter */}
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

        {/* Users List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users?.map((user) => (
            <div key={user._id} className="rounded-[24px] border border-slate-200 bg-white/90 p-6 shadow-lg hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                      {user.username.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-950">{user.username}</h3>
                      <p className="text-sm text-slate-600">{user.email}</p>
                    </div>
                  </div>
                  {user.phone && <p className="text-sm text-slate-500 mt-2 flex items-center gap-1"><Phone className="h-4 w-4" /> {user.phone}</p>}
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

        {users.length === 0 && (
          <div className="text-center py-20">
            <div className="mx-auto h-16 w-16 rounded-3xl bg-slate-100 p-4 text-2xl mb-4">👤</div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No users found</h3>
            <p className="text-slate-600 mb-6">Create your first user above</p>
          </div>
        )}
      </div>
    </div>
  );
}

