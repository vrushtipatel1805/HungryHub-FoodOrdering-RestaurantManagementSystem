import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Shield, 
  ShieldAlert, 
  ShieldCheck,
  Edit3, 
  Trash2, 
  Users, 
  Mail, 
  Phone, 
  Key, 
  Info,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const PREDEFINED_PERMISSIONS = [
  { key: 'view_menu', name: 'View Menu Items', desc: 'Allows viewing menu performance data' },
  { key: 'edit_menu', name: 'Modify Menu Items', desc: 'Allows CRUD of categories & dishes' },
  { key: 'view_orders', name: 'View Orders Pipeline', desc: 'Allows viewing kitchen/delivery pipelines' },
  { key: 'update_orders', name: 'Update Orders Status', desc: 'Allows status transitions' },
  { key: 'view_payments', name: 'View Payments Ledger', desc: 'Allows viewing credit/UPI transactions ledger' },
  { key: 'process_refunds', name: 'Process Billing Refunds', desc: 'Allows issuing full refunds' },
  { key: 'manage_carts', name: 'Manage Customer Carts', desc: 'Allows viewing and clearing customer active carts' },
  { key: 'send_notifications', name: 'Send Customer Notifications', desc: 'Allows dispatching email/SMS newsletters' },
  { key: 'manage_settings', name: 'Manage System Settings', desc: 'Allows configuring GST, delivery charges, and timing' },
];

export default function AdminManagement() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAdmin, setEditingAdmin] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'staff',
    mobile: '',
    permissions: [],
    is_active: true
  });

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/admins/');
      setAdmins(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load administrator accounts database.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (admin) => {
    const updatedStatus = !admin.is_active;
    try {
      await api.put(`/auth/admins/${admin.email}/`, { is_active: updatedStatus });
      setAdmins(prev => prev.map(a => a.email === admin.email ? { ...a, is_active: updatedStatus } : a));
      toast.success(`Admin "${admin.full_name}" is now ${updatedStatus ? 'Active' : 'Deactivated'}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to toggle admin status.');
    }
  };

  const handleDelete = async (email) => {
    if (!window.confirm(`Permanently remove administrator account ${email}?`)) return;
    try {
      await api.delete(`/auth/admins/${email}/`);
      setAdmins(prev => prev.filter(a => a.email !== email));
      toast.success('Admin user removed successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete admin account.');
    }
  };

  const handleOpenAddModal = () => {
    setEditingAdmin(null);
    setFormData({
      full_name: '',
      email: '',
      password: '',
      role: 'staff',
      mobile: '',
      permissions: ['view_menu', 'view_orders'],
      is_active: true
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (admin) => {
    setEditingAdmin(admin);
    setFormData({
      full_name: admin.full_name,
      email: admin.email,
      password: '', // blank password unless resetting
      role: admin.role,
      mobile: admin.mobile || '',
      permissions: admin.permissions || [],
      is_active: admin.is_active ?? true
    });
    setShowModal(true);
  };

  const handlePermissionToggle = (permKey) => {
    setFormData(prev => {
      const exists = prev.permissions.includes(permKey);
      const newPerms = exists 
        ? prev.permissions.filter(p => p !== permKey) 
        : [...prev.permissions, permKey];
      return { ...prev, permissions: newPerms };
    });
  };

  const handleSelectAllPermissions = () => {
    const allKeys = PREDEFINED_PERMISSIONS.map(p => p.key);
    setFormData(prev => ({ ...prev, permissions: allKeys }));
  };

  const handleClearAllPermissions = () => {
    setFormData(prev => ({ ...prev, permissions: [] }));
  };

  const handleRoleSelect = (roleVal) => {
    setFormData(prev => {
      let perms = [...prev.permissions];
      if (roleVal === 'super_admin') {
        perms = PREDEFINED_PERMISSIONS.map(p => p.key);
      } else if (roleVal === 'manager') {
        perms = ['view_menu', 'edit_menu', 'view_orders', 'update_orders', 'view_payments', 'manage_carts', 'send_notifications'];
      } else {
        perms = ['view_menu', 'view_orders', 'update_orders'];
      }
      return { ...prev, role: roleVal, permissions: perms };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.full_name.trim() || !formData.email.trim()) {
      toast.error('Name and Email are required.');
      return;
    }

    try {
      const payload = {
        full_name: formData.full_name,
        email: formData.email,
        role: formData.role,
        mobile: formData.mobile,
        permissions: formData.permissions,
        is_active: formData.is_active
      };
      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      if (editingAdmin) {
        await api.put(`/auth/admins/${editingAdmin.email}/`, payload);
        toast.success('Admin role privileges updated.');
      } else {
        await api.post('/auth/admins/', payload);
        toast.success('New administrator account established.');
      }
      setShowModal(false);
      fetchAdmins();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to save admin user details.');
    }
  };

  const getRoleIconBadge = (role) => {
    switch (role) {
      case 'super_admin':
        return <div className="flex items-center gap-1 text-rose-600 bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 rounded-full font-bold border border-rose-200 dark:border-rose-900/50"><ShieldAlert className="w-3.5 h-3.5" /> Super Admin</div>;
      case 'manager':
        return <div className="flex items-center gap-1 text-amber-600 bg-amber-50 dark:bg-amber-950/20 px-2 py-0.5 rounded-full font-bold border border-amber-200 dark:border-amber-900/50"><ShieldCheck className="w-3.5 h-3.5" /> Manager</div>;
      default:
        return <div className="flex items-center gap-1 text-blue-600 bg-blue-50 dark:bg-blue-950/20 px-2 py-0.5 rounded-full font-bold border border-blue-200 dark:border-blue-900/50"><Shield className="w-3.5 h-3.5" /> Staff</div>;
    }
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Admin User Accounts & RBAC</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage internal restaurant administrator personnel accounts, assign workflow roles, and partition dashboard read/write permission privileges.</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-rust-600 hover:bg-rust-700 text-white px-4 py-2.5 rounded-xl font-bold transition text-xs shadow-md shadow-rust-600/10"
        >
          <Plus className="w-4 h-4" /> Add Admin User
        </button>
      </div>


      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold animate-pulse flex items-center justify-center gap-2">
          <Clock className="w-4 h-4 animate-spin text-rust-600" /> Querying employee tables...
        </div>
      ) : admins.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xs">
          <Users className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 font-bold">No internal administrator accounts found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {admins.map(admin => (
            <div 
              key={admin.email} 
              className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between hover:shadow-md transition gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 flex items-center justify-center font-bold">
                      {admin.full_name.slice(0,2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-850 dark:text-slate-100">{admin.full_name}</h3>
                      <p className="text-[10px] text-slate-400">Member Joined: {new Date(admin.date_joined).toLocaleDateString()}</p>
                    </div>
                  </div>
                  {getRoleIconBadge(admin.role)}
                </div>

                <div className="space-y-1.5 pl-1.5 pt-1.5 text-xs text-slate-500 dark:text-slate-400 border-t border-slate-50 dark:border-slate-900">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{admin.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{admin.mobile || 'No contact saved'}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="font-bold text-[10px] uppercase text-slate-400 tracking-wider">Assigned Scope / permissions ({admin.permissions?.length || 0})</span>
                  <div className="flex flex-wrap gap-1">
                    {admin.permissions && admin.permissions.length > 0 ? (
                      admin.permissions.map(perm => (
                        <span 
                          key={perm} 
                          className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 text-[10px] font-semibold"
                        >
                          {perm.replace(/_/g, ' ')}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-400 italic">No permissions allocated</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-slate-50 dark:border-slate-900 pt-3">
                <button
                  onClick={() => handleToggleStatus(admin)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                    admin.is_active
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-rose-50 border-rose-200 text-rose-700'
                  }`}
                >
                  {admin.is_active ? 'Active Employee' : 'Suspended'}
                </button>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEditModal(admin)}
                    className="p-1.5 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg transition inline-flex"
                    title="Edit account scopes"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  {admin.email !== 'admin@hungryhub.com' && (
                    <button
                      onClick={() => handleDelete(admin.email)}
                      className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition inline-flex"
                      title="Decommission account"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Admin Account Form Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setShowModal(false)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 border dark:border-slate-800 z-50 text-xs"
            >
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-850">
                <h3 className="text-base font-extrabold">{editingAdmin ? `Edit Permissions: ${formData.full_name}` : 'Provision Administrator Account'}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 font-bold">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold">Full Name</label>
                      <input
                        type="text"
                        required
                        value={formData.full_name}
                        onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                        className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:outline-none focus:border-rust-500 font-semibold"
                        placeholder="e.g. Ramesh Patel"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold">Secure Email ID</label>
                      <input
                        type="email"
                        required
                        disabled={editingAdmin}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:outline-none focus:border-rust-500 font-semibold disabled:opacity-50"
                        placeholder="ramesh@hungryhub.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold">Mobile Phone</label>
                      <input
                        type="text"
                        value={formData.mobile}
                        onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                        className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:outline-none focus:border-rust-500 font-semibold"
                        placeholder="+91 99999 88888"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-slate-700 dark:text-slate-300 font-bold">Password {editingAdmin && '(Leave blank to retain)'}</label>
                      <div className="relative flex items-center">
                        <input
                          type="password"
                          required={!editingAdmin}
                          value={formData.password}
                          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                          className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:outline-none focus:border-rust-500 font-semibold"
                          placeholder={editingAdmin ? '••••••••' : 'Password (min 8 chars)'}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-slate-700 dark:text-slate-300 font-bold">Staff Role Profile</label>
                        <select
                          value={formData.role}
                          onChange={(e) => handleRoleSelect(e.target.value)}
                          className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:outline-none focus:border-rust-500 font-semibold"
                        >
                          <option value="super_admin">Super Admin</option>
                          <option value="manager">Manager</option>
                          <option value="staff">Staff / Cashier</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-slate-700 dark:text-slate-300 font-bold">Active Status</label>
                        <select
                          value={formData.is_active ? "true" : "false"}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.value === "true" })}
                          className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:outline-none focus:border-rust-500 font-semibold"
                        >
                          <option value="true">Active</option>
                          <option value="false">Suspended</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* Permissions matrix */}
                  <div className="space-y-2 border-l pl-4 dark:border-slate-800">
                    <div className="flex items-center justify-between font-bold mb-1">
                      <span className="text-slate-700 dark:text-slate-300">Privilege permissions Scope</span>
                      <div className="flex gap-2">
                        <button type="button" onClick={handleSelectAllPermissions} className="text-rust-600 hover:underline text-[10px]">All</button>
                        <button type="button" onClick={handleClearAllPermissions} className="text-slate-400 hover:underline text-[10px]">None</button>
                      </div>
                    </div>
                    
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {PREDEFINED_PERMISSIONS.map(perm => {
                        const checked = formData.permissions.includes(perm.key);
                        return (
                          <div 
                            key={perm.key} 
                            onClick={() => handlePermissionToggle(perm.key)}
                            className={`flex items-start gap-2.5 p-2 rounded-xl border transition cursor-pointer ${
                              checked 
                                ? 'bg-rust-50/50 border-rust-200 dark:bg-rust-950/20 dark:border-rust-900/50' 
                                : 'border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-955'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={checked}
                              readOnly
                              className="mt-0.5 accent-rust-600 focus:ring-0"
                            />
                            <div>
                              <div className="font-bold text-[11px] text-slate-800 dark:text-slate-200">{perm.name}</div>
                              <div className="text-[10px] text-slate-400 leading-tight">{perm.desc}</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 border-t pt-4 dark:border-slate-850">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-955 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rust-600 hover:bg-rust-700 text-white rounded-xl font-bold shadow-md shadow-rust-600/10"
                  >
                    {editingAdmin ? 'Save privileges' : 'Provision Admin'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
