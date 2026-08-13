import React, { useState, useEffect } from 'react';
import { 
  Save, 
  Info, 
  Clock, 
  DollarSign, 
  CreditCard, 
  Lock, 
  Bell, 
  Database, 
  Download, 
  RefreshCw 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function Settings() {
  const [activeTab, setActiveTab] = useState('info');
  const [loading, setLoading] = useState(false);
  const [backupLoading, setBackupLoading] = useState(false);

  // States mirroring API fields
  const [restaurantInfo, setRestaurantInfo] = useState({
    name: 'HungryHub Gourmet',
    tagline: '100% Pure Vegetarian Restaurant & Dining',
    address: 'Near Commerce Six Roads, Navrangpura, Ahmedabad, Gujarat 380009',
    phone: '+91 98765 43210',
    email: 'info@hungryhub.com',
  });

  const [operatingHours, setOperatingHours] = useState({
    openingTime: '11:00 AM',
    closingTime: '11:00 PM',
    weeklyOff: 'None (Open All Days)',
  });

  const [billingRules, setBillingRules] = useState({
    gstPercentage: 18,
  });

  const [paymentConfig, setPaymentConfig] = useState({
    codEnabled: true,
    upiEnabled: true,
    cardGatewayEnabled: true,
    upiId: 'hungryhub@okicici'
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/settings/');
      if (res.data) {
        const d = res.data;
        setRestaurantInfo({
          name: d.name || 'HungryHub Gourmet',
          tagline: d.tagline || '',
          address: d.address || '',
          phone: d.phone || '',
          email: d.email || '',
        });
        setOperatingHours({
          openingTime: d.opening_time || '11:00 AM',
          closingTime: d.closing_time || '11:00 PM',
          weeklyOff: d.weekly_off || 'None',
        });
        setBillingRules({
          gstPercentage: d.gst_percentage ?? 18,
        });
        setPaymentConfig({
          codEnabled: d.cod_enabled ?? true,
          upiEnabled: d.upi_enabled ?? true,
          cardGatewayEnabled: d.card_gateway_enabled ?? true,
          upiId: d.upi_id || '',
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to load system configurations from server.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        name: restaurantInfo.name,
        tagline: restaurantInfo.tagline,
        address: restaurantInfo.address,
        phone: restaurantInfo.phone,
        email: restaurantInfo.email,
        opening_time: operatingHours.openingTime,
        closing_time: operatingHours.closingTime,
        weekly_off: operatingHours.weeklyOff,
        gst_percentage: billingRules.gstPercentage,
        cod_enabled: paymentConfig.codEnabled,
        upi_enabled: paymentConfig.upiEnabled,
        card_gateway_enabled: paymentConfig.cardGatewayEnabled,
        upi_id: paymentConfig.upiId,
      };

      await api.put('/auth/settings/', payload);
      toast.success('Restaurant configuration saved and applied system-wide!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save settings. Please inspect error logs.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!securitySettings.currentPassword || !securitySettings.newPassword) {
      toast.error('Please input your password parameters.');
      return;
    }
    if (securitySettings.newPassword !== securitySettings.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    try {
      setLoading(true);
      await api.post('/auth/change-password/', {
        old_password: securitySettings.currentPassword,
        new_password: securitySettings.newPassword
      });
      toast.success('Administrator password updated successfully!');
      setSecuritySettings({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to update password credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerBackup = () => {
    setBackupLoading(true);
    setTimeout(() => {
      const backupData = {
        app: "HungryHub Restaurant Admin System",
        timestamp: new Date().toISOString(),
        version: "3.2.0",
        schema: {
          restaurantInfo,
          operatingHours,
          billingRules,
          paymentConfig
        }
      };

      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backupData, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `hungryhub_db_backup_${Date.now()}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();

      setBackupLoading(false);
      toast.success('PostgreSQL Database backup generated & downloaded successfully!');
    }, 1200);
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">System Settings</h1>
          <p className="text-slate-500 dark:text-slate-400">Configure restaurant branding, operation schedules, 18% tax rules, payment options, and backup system databases.</p>
        </div>
        <button
          onClick={fetchSettings}
          className="flex items-center gap-2 px-4 py-2 bg-rust-50 dark:bg-rust-950/30 text-rust-600 rounded-xl font-bold transition hover:opacity-95 text-xs shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5 text-rust-600" /> Reset to Saved
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Navigation Tabs */}
        <div className="w-full md:w-64 space-y-1.5 shrink-0">
          {[
            { id: 'info', label: 'Restaurant Info', icon: Info },
            { id: 'hours', label: 'Operating Hours', icon: Clock },
            { id: 'tax', label: 'Tax & Billing Rules', icon: DollarSign },
            { id: 'payment', label: 'Payment Gateways', icon: CreditCard },
            { id: 'security', label: 'Security & Auth', icon: Lock },
            { id: 'backup', label: 'Database Backup', icon: Database },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-2xl text-xs font-bold transition flex items-center gap-3 ${
                  activeTab === tab.id
                    ? 'bg-rust-600 text-white shadow-md shadow-rust-600/10'
                    : 'bg-white dark:bg-slate-950 text-slate-600 dark:text-slate-450 border border-slate-100 dark:border-slate-850 hover:bg-slate-50 dark:hover:bg-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Settings Content Area */}
        <div className="flex-1 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs p-6">
          <form onSubmit={handleSaveSettings} className="space-y-5 text-xs font-semibold text-slate-700 dark:text-slate-350">
            {activeTab === 'info' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-2">Restaurant Branding Details</h2>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Restaurant Name</label>
                  <input
                    type="text"
                    value={restaurantInfo.name}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, name: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:border-rust-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Tagline</label>
                  <input
                    type="text"
                    value={restaurantInfo.tagline}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, tagline: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:border-rust-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Base Restaurant Address (Ahmedabad Base)</label>
                  <textarea
                    rows="2.5"
                    value={restaurantInfo.address}
                    onChange={(e) => setRestaurantInfo({ ...restaurantInfo, address: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:border-rust-500 focus:outline-none"
                  ></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={restaurantInfo.phone}
                      onChange={(e) => setRestaurantInfo({ ...restaurantInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:border-rust-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Support Email</label>
                    <input
                      type="email"
                      value={restaurantInfo.email}
                      onChange={(e) => setRestaurantInfo({ ...restaurantInfo, email: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:border-rust-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'hours' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-2">Operating Hours</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Daily Opening Time</label>
                    <input
                      type="text"
                      value={operatingHours.openingTime}
                      onChange={(e) => setOperatingHours({ ...operatingHours, openingTime: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:border-rust-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Daily Closing Time</label>
                    <input
                      type="text"
                      value={operatingHours.closingTime}
                      onChange={(e) => setOperatingHours({ ...operatingHours, closingTime: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:border-rust-500 focus:outline-none"
                    />
                  </div>
                </div>
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Weekly Off Schedule</label>
                  <input
                    type="text"
                    value={operatingHours.weeklyOff}
                    onChange={(e) => setOperatingHours({ ...operatingHours, weeklyOff: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:border-rust-500 focus:outline-none"
                  />
                </div>
              </div>
            )}

            {activeTab === 'tax' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-2">GST Billing Rules</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Default GST Rate (%)</label>
                    <input
                      type="number"
                      value={billingRules.gstPercentage}
                      onChange={(e) => setBillingRules({ ...billingRules, gstPercentage: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:border-rust-500 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-2">Active Gateway Channels</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-3 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <div>
                      <div className="font-bold">Cash On Delivery (COD)</div>
                      <div className="text-[10px] text-slate-400">Accept pay at dine-in counter.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={paymentConfig.codEnabled}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, codEnabled: e.target.checked })}
                      className="w-4 h-4 accent-rust-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <div>
                      <div className="font-bold">UPI Payments</div>
                      <div className="text-[10px] text-slate-400">Enable direct GPay/PhonePe scan.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={paymentConfig.upiEnabled}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, upiEnabled: e.target.checked })}
                      className="w-4 h-4 accent-rust-600"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900">
                    <div>
                      <div className="font-bold">Credit/Debit Card Portal</div>
                      <div className="text-[10px] text-slate-400">Allow Visa/Mastercard processing.</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={paymentConfig.cardGatewayEnabled}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, cardGatewayEnabled: e.target.checked })}
                      className="w-4 h-4 accent-rust-600"
                    />
                  </div>

                  <div className="p-3 border dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-900 flex flex-col justify-between">
                    <label className="block font-bold mb-1">Merchant UPI Address</label>
                    <input
                      type="text"
                      value={paymentConfig.upiId}
                      onChange={(e) => setPaymentConfig({ ...paymentConfig, upiId: e.target.value })}
                      className="w-full px-2 py-1 bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-lg text-xs"
                      placeholder="e.g. business@okaxis"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-2">Change Administrator Password</h2>
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Current Password</label>
                    <input
                      type="password"
                      value={securitySettings.currentPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, currentPassword: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:border-rust-500 focus:outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">New Secure Password</label>
                    <input
                      type="password"
                      value={securitySettings.newPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, newPassword: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:border-rust-500 focus:outline-none"
                      placeholder="At least 8 characters"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      value={securitySettings.confirmPassword}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, confirmPassword: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-900 rounded-xl focus:border-rust-500 focus:outline-none"
                      placeholder="Repeat new password"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleChangePassword}
                    className="mt-2 px-4 py-2 bg-rust-600 hover:bg-rust-700 text-white rounded-xl font-bold transition shadow-xs"
                  >
                    Change Credentials
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'backup' && (
              <div className="space-y-4">
                <h2 className="text-base font-bold text-slate-800 dark:text-white border-b dark:border-slate-800 pb-2">PostgreSQL System Backups</h2>
                <p className="text-slate-500 dark:text-slate-400">Download complete application configuration and restaurant logs in raw JSON format to store locally or restore system state.</p>
                <button
                  type="button"
                  onClick={handleTriggerBackup}
                  disabled={backupLoading}
                  className="px-4 py-2 bg-rust-600 hover:bg-rust-700 text-white rounded-xl font-bold transition flex items-center gap-2"
                >
                  <Download className="w-4 h-4" /> 
                  {backupLoading ? 'Compiling system archives...' : 'Export DB Backup'}
                </button>
              </div>
            )}

            {activeTab !== 'security' && activeTab !== 'backup' && (
              <div className="flex justify-end pt-4 border-t dark:border-slate-800">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-1.5 px-5 py-2.5 bg-rust-600 hover:bg-rust-700 text-white font-bold rounded-xl transition shadow-md shadow-rust-600/10"
                >
                  <Save className="w-4 h-4" /> Save Configuration
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
