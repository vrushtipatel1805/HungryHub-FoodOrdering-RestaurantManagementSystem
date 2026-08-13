import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  UtensilsCrossed,
  Package,
  CalendarCheck,
  Sparkles,
  Users,
  Tag,
  MessageSquare,
  FileText,
  Settings,
  LogOut,
  Mail,
  Search,
  Sun,
  Moon,
  Menu,
  ChevronDown,
  CreditCard,
  Image,
  Shield,
  Brain
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const NAV_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/menu', label: 'Menu Management', icon: UtensilsCrossed },
  { to: '/admin/orders', label: 'Order Management', icon: Package },
  { to: '/admin/tables', label: 'Table Reservations', icon: CalendarCheck },
  { to: '/admin/events', label: 'Event Packages', icon: Sparkles },
  { to: '/admin/taste-match', label: 'AI Taste Match', icon: Brain },
  { to: '/admin/customers', label: 'Customer Management', icon: Users },
  { to: '/admin/coupons', label: 'Coupons', icon: Tag },
  { to: '/admin/payments', label: 'Payment', icon: CreditCard },
  { to: '/admin/admins', label: 'Admin Users RBAC', icon: Shield },
  { to: '/admin/feedback', label: 'Feedback Management', icon: MessageSquare },
  { to: '/admin/reports', label: 'Reports', icon: FileText },
  { to: '/admin/email-notifications', label: 'Email Notifications', icon: Mail },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];


export default function AdminLayout() {
  const { logout, user } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  // Clock updates every second
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/login');
  };

  const filteredNavLinks = NAV_LINKS.filter(link => {
    const query = searchQuery.toLowerCase();
    const label = link.label.toLowerCase();

    let aliases = [];
    if (link.to === '/admin') aliases = ['dashboard'];
    else if (link.to === '/admin/menu') aliases = ['menu', 'categories', 'dishes', 'food'];
    else if (link.to === '/admin/orders') aliases = ['orders', 'billing', 'workflows', 'package'];
    else if (link.to === '/admin/tables') aliases = ['tables', 'reservations', 'bookings'];
    else if (link.to === '/admin/events') aliases = ['events', 'packages', 'anniversary', 'birthday', 'banquet'];
    else if (link.to === '/admin/taste-match') aliases = ['taste', 'match', 'ai', 'recommendations', 'settings', 'analytics'];
    else if (link.to === '/admin/customers') aliases = ['customers', 'users', 'directory'];
    else if (link.to === '/admin/coupons') aliases = ['coupons', 'offers', 'discounts'];
    else if (link.to === '/admin/payments') aliases = ['payment', 'payments', 'ledger', 'transactions', 'receipts'];
    else if (link.to === '/admin/admins') aliases = ['admins', 'users', 'rbac', 'roles', 'permissions'];
    else if (link.to === '/admin/feedback') aliases = ['feedback', 'reviews', 'ratings'];
    else if (link.to === '/admin/reports') aliases = ['reports', 'analytics', 'statistics'];
    else if (link.to === '/admin/email-notifications') aliases = ['email', 'notifications', 'mail', 'alerts'];
    else if (link.to === '/admin/settings') aliases = ['settings', 'configuration', 'profile'];

    return label.includes(query) || aliases.some(alias => alias.includes(query));
  });

  return (
    <div className={`min-h-screen font-sans transition-colors duration-300 ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`fixed inset-y-0 left-0 z-40 border-r transition-all duration-300 flex flex-col justify-between shadow-xs ${collapsed ? 'w-20' : 'w-64'
            } ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'}`}
        >
          {/* Logo & Toggle Header */}
          <div>
            <div className={`h-16 flex items-center justify-between px-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 rounded-2xl bg-rust-600 text-white flex items-center justify-center font-bold text-xl shadow-md shrink-0">
                  🌿
                </div>
                {!collapsed && (
                  <motion.div
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex flex-col"
                  >
                    <span className={`font-bold text-sm tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-slate-950'}`}>HungryHub</span>
                    <span className="text-[10px] font-semibold text-rust-500 uppercase tracking-wider">SaaS Admin</span>
                  </motion.div>
                )}
              </div>
              <button
                onClick={() => setCollapsed(!collapsed)}
                className={`p-2 rounded-xl transition ${darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-900' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
              >
                <Menu className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-140px)]">
              {NAV_LINKS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/admin'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 ${isActive
                      ? 'bg-rust-600 text-white shadow-md shadow-rust-600/20'
                      : darkMode
                        ? 'text-slate-400 hover:bg-slate-900 hover:text-slate-100'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`
                  }

                  title={collapsed ? label : undefined}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {!collapsed && <span className="truncate">{label}</span>}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Logout Footer */}
          <div className={`p-3 border-t ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${darkMode ? 'text-rose-400 hover:bg-rose-950/30' : 'text-rose-600 hover:bg-rose-50'
                }`}
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!collapsed && <span>Logout Account</span>}
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className={`flex-1 transition-all duration-300 min-h-screen flex flex-col ${collapsed ? 'ml-20' : 'ml-64'}`}>
          {/* Sticky Top Header */}
          <header className={`sticky top-0 z-30 h-16 backdrop-blur-md border-b px-6 flex items-center justify-between shadow-xs ${darkMode ? 'bg-slate-900/80 border-slate-800' : 'bg-white/80 border-slate-200'
            }`}>
            {/* Global Search Bar */}
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <button
                onClick={() => setShowSearchModal(true)}
                className={`w-full flex items-center gap-2.5 px-4 py-2 border rounded-xl text-xs text-left transition ${darkMode
                    ? 'bg-slate-950 border-slate-800 hover:bg-slate-900 text-slate-400'
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 text-slate-500'
                  }`}
              >
                <Search className="w-4 h-4" />
                <span>Search everything (menu, orders, tables, coupons)...</span>
              </button>
            </div>

            {/* Header Right Tools */}
            <div className="flex items-center gap-4">
              {/* Date & Time */}
              <div className={`hidden lg:flex flex-col text-right text-[11px] font-semibold tracking-wide ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                <span>{currentTime.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <span className="text-rust-500 font-bold">{currentTime.toLocaleTimeString()}</span>
              </div>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`p-2.5 rounded-xl transition ${darkMode ? 'hover:bg-slate-800 text-amber-400' : 'hover:bg-slate-100 text-indigo-600'}`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Messages Notification */}
              <button
                onClick={() => navigate('/admin/email-notifications')}
                className={`p-2.5 rounded-xl transition ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                title="Email Notifications"
              >
                <Mail className="w-4 h-4" />
              </button>

              {/* Admin Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className={`flex items-center gap-2 p-1.5 pl-3 border-l rounded-xl transition ${darkMode ? 'border-slate-800 text-slate-200 hover:bg-slate-800' : 'border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                >
                  <div className="w-7 h-7 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                    {user?.name?.charAt(0).toUpperCase() || 'A'}
                  </div>
                  <div className="hidden md:block text-left text-xs">
                    <div className="font-bold leading-tight">{user?.name || 'Admin'}</div>
                    <div className={`text-[10px] uppercase font-semibold text-emerald-500`}>{user?.role || 'Administrator'}</div>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowProfileMenu(false)}></div>
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className={`absolute right-0 mt-2 w-48 rounded-xl border shadow-xl p-2 space-y-1 z-50 ${darkMode ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
                          }`}
                      >
                        <div className="px-3 py-2 border-b text-xs border-slate-800/10 dark:border-slate-800">
                          <p className="font-bold">Signed in as</p>
                          <p className={`truncate text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{user?.email || 'admin@hungryhub.com'}</p>
                        </div>
                        <button
                          onClick={() => { navigate('/admin/settings'); setShowProfileMenu(false); }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 ${darkMode ? 'hover:bg-slate-900 text-slate-300' : 'hover:bg-slate-100 text-slate-600'
                            }`}
                        >
                          <Settings className="w-3.5 h-3.5" /> Settings
                        </button>
                        <button
                          onClick={handleLogout}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 text-rose-500 ${darkMode ? 'hover:bg-rose-950/20' : 'hover:bg-rose-50'
                            }`}
                        >
                          <LogOut className="w-3.5 h-3.5" /> Logout
                        </button>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </header>

          {/* Page Body */}
          <main className="p-6 flex-1 max-w-7xl w-full mx-auto">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Global Search Modal */}
      <AnimatePresence>
        {showSearchModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
            <div className="fixed inset-0" onClick={() => { setShowSearchModal(false); setSearchQuery(''); }}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className={`rounded-2xl max-w-xl w-full p-4 shadow-2xl space-y-4 z-50 border ${darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                }`}
            >
              <div className="relative">
                <Search className="absolute left-3.5 top-3.5 text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  autoFocus
                  placeholder="Search sidebar options (Dashboard, Menu, Orders, Bookings, Payments...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full pl-11 pr-4 py-3 rounded-xl text-sm focus:outline-none border ${darkMode
                      ? 'bg-slate-950 border-slate-800 focus:border-emerald-500'
                      : 'bg-slate-50 border-slate-200 focus:border-emerald-500'
                    }`}
                />
                <button
                  onClick={() => { setShowSearchModal(false); setSearchQuery(''); }}
                  className="absolute right-3.5 top-3.5 text-xs font-bold text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded"
                >
                  ESC
                </button>
              </div>
              <div className="text-xs space-y-2 p-2 max-h-60 overflow-y-auto">
                <div className={`font-semibold uppercase tracking-wider text-[10px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Search Results</div>
                {searchQuery.trim() === '' ? (
                  NAV_LINKS.map(link => {
                    const Icon = link.icon;
                    return (
                      <div
                        key={link.to}
                        onClick={() => { navigate(link.to); setShowSearchModal(false); setSearchQuery(''); }}
                        className={`p-2 rounded-xl cursor-pointer font-semibold flex items-center gap-2 ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                      >
                        <Icon className="w-3.5 h-3.5 text-rust-500 shrink-0" /> <span>{link.label}</span>
                      </div>
                    );
                  })
                ) : filteredNavLinks.length > 0 ? (
                  filteredNavLinks.map(link => {
                    const Icon = link.icon;
                    return (
                      <div
                        key={link.to}
                        onClick={() => { navigate(link.to); setShowSearchModal(false); setSearchQuery(''); }}
                        className={`p-2 rounded-xl cursor-pointer font-semibold flex items-center gap-2 ${darkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'}`}
                      >
                        <Icon className="w-3.5 h-3.5 text-rust-500 shrink-0" /> <span>{link.label}</span>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-6 text-center text-slate-500 font-bold">No results found</div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
