import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  ShoppingBag, 
  Clock, 
  Star, 
  TrendingUp, 
  Search, 
  Filter, 
  Download, 
  Edit, 
  Check, 
  X, 
  Flame, 
  PieChart, 
  LayoutDashboard, 
  Settings, 
  History,
  Activity
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function TasteMatchAdmin() {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // Tab 1: Dashboard Stats state
  const [stats, setStats] = useState({
    totalRecommendations: 0,
    todayRecommendations: 0,
    topRecommendedDish: "Loading...",
    avgMatchScore: 0,
    mostSelectedTaste: "Loading...",
    mostSelectedBudget: "Loading...",
    mostSelectedMood: "Loading...",
    mostSelectedSpiceLevel: "Loading...",
    trendData: []
  });

  // Tab 2: Menu AI settings state
  const [menuItems, setMenuItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null); // stores copying of object being edited in modal
  const [menuSearch, setMenuSearch] = useState('');
  const [menuFilterCategory, setMenuFilterCategory] = useState('All');

  // Tab 3: Recommendation History state
  const [history, setHistory] = useState([]);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilterTaste, setHistoryFilterTaste] = useState('');
  const [historyFilterSpice, setHistoryFilterSpice] = useState('');
  const [historyFilterMood, setHistoryFilterMood] = useState('');
  const [historyFilterBudget, setHistoryFilterBudget] = useState('');

  // Tab 4: Analytics state
  const [analytics, setAnalytics] = useState({
    topRecommendedFoods: [],
    tasteDistribution: [],
    budgetDistribution: [],
    mealPreference: [],
    moodPreference: [],
    spicePreference: [],
    mostOrderedRecommendedFoods: [],
    repeatUsersCount: 0
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTabData();
  }, [activeTab]);

  const fetchTabData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'dashboard') {
        const res = await api.get('/admin/taste-match/stats/');
        if (res.data?.ok) {
          setStats(res.data.stats);
        }
      } else if (activeTab === 'settings') {
        const res = await api.get('/admin/taste-match/menu-items/');
        if (res.data?.ok) {
          setMenuItems(res.data.menu_items);
        }
      } else if (activeTab === 'history') {
        const params = {
          search: historySearch,
          taste: historyFilterTaste,
          spice: historyFilterSpice,
          mood: historyFilterMood,
          budget: historyFilterBudget
        };
        const res = await api.get('/admin/taste-match/history/', { params });
        if (res.data?.ok) {
          setHistory(res.data.history);
        }
      } else if (activeTab === 'analytics') {
        const res = await api.get('/admin/taste-match/analytics/');
        if (res.data?.ok) {
          setAnalytics(res.data.analytics);
        }
      }
    } catch (err) {
      toast.error('Failed to sync admin data with server.');
    } finally {
      setLoading(false);
    }
  };

  // Trigger search / filters for history tab
  const handleApplyHistoryFilters = () => {
    fetchTabData();
  };

  // Reset filters
  const handleResetHistoryFilters = () => {
    setHistorySearch('');
    setHistoryFilterTaste('');
    setHistoryFilterSpice('');
    setHistoryFilterMood('');
    setHistoryFilterBudget('');
    // Trigger reloading
    setTimeout(() => {
      fetchTabData();
    }, 50);
  };

  // Direct toggle inline recommended status
  const handleToggleRecommended = async (item) => {
    try {
      const updatedVal = !item.is_recommended;
      const res = await api.patch('/admin/taste-match/menu-items/', {
        id: item.id,
        is_recommended: updatedVal
      });
      if (res.data?.ok) {
        setMenuItems(prev => prev.map(m => m.id === item.id ? { ...m, is_recommended: updatedVal } : m));
        toast.success(`Updated recommendation status for ${item.name}`);
      }
    } catch (err) {
      toast.error("Failed to update status.");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (item) => {
    setEditingItem({ ...item });
  };

  // Save Modal Configurations
  const handleSaveAISettings = async () => {
    if (!editingItem) return;
    try {
      const res = await api.patch('/admin/taste-match/menu-items/', editingItem);
      if (res.data?.ok) {
        setMenuItems(prev => prev.map(m => m.id === editingItem.id ? res.data.menu_item : m));
        setEditingItem(null);
        toast.success(`Successfully saved settings for ${editingItem.name}`);
      }
    } catch (err) {
      toast.error("Failed to save AI configuration settings.");
    }
  };

  // Export Recommendation History to CSV
  const handleExportCSV = () => {
    if (history.length === 0) {
      toast.error("No recommendation logs to export.");
      return;
    }
    const headers = ['ID', 'User Email/Name', 'Dish Recommended', 'Match Score (%)', 'Selected Budget', 'Selected Taste', 'Selected Spice', 'Selected Mood', 'Converted To Order', 'Date Generated'];
    const rows = history.map(h => [
      h.id,
      `"${h.user_name}"`,
      `"${h.dish_name}"`,
      h.match_score,
      `"${h.selected_budget}"`,
      h.selected_taste,
      h.selected_spice,
      h.selected_mood,
      h.is_ordered ? 'Yes' : 'No',
      new Date(h.created_at).toLocaleString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `HungryHub_AI_Recommendations_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV spreadsheet exported successfully!");
  };

  // Filter menu list items
  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearch.toLowerCase()) || item.id.toLowerCase().includes(menuSearch.toLowerCase());
    const matchesCat = menuFilterCategory === 'All' || item.category_name === menuFilterCategory;
    return matchesSearch && matchesCat;
  });

  const categoriesList = Array.from(new Set(menuItems.map(m => m.category_name)));

  return (
    <div className="space-y-6 text-sm p-6">
      {/* Page Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">AI Taste Match Engine</h1>
          <p className="text-slate-500 dark:text-slate-400">Configure recommendation weights, monitor conversion logs, and inspect user preference matrices.</p>
        </div>
        <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { id: 'settings', label: 'Menu AI Settings', icon: Settings },
            { id: 'history', label: 'Recommendation History', icon: History },
            { id: 'analytics', label: 'Analytics', icon: PieChart },
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition ${
                  activeTab === tab.id 
                    ? 'bg-white dark:bg-slate-800 shadow-xs font-bold text-rust-600 dark:text-rust-400' 
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {loading ? (
          <div className="h-60 flex flex-col items-center justify-center gap-3">
            <Activity className="w-8 h-8 animate-spin text-rust-500" />
            <span className="text-xs font-bold text-slate-400">Syncing database parameters...</span>
          </div>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* TAB 1: RECOMMENDATION DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                {/* Stats cards grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { title: "Total Recommendations", val: stats.totalRecommendations, icon: Sparkles, color: "text-rust-600 bg-rust-50 dark:bg-rust-950/20" },
                    { title: "Today's Matches", val: stats.todayRecommendations, icon: Activity, color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20" },
                    { title: "Average Match Score", val: `${stats.avgMatchScore}%`, icon: Star, color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20" },
                    { title: "Top Recommended Dish", val: stats.topRecommendedDish, icon: ShoppingBag, color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20" }
                  ].map((card, idx) => {
                    const Icon = card.icon;
                    return (
                      <div key={idx} className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between h-28">
                        <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                          <span>{card.title}</span>
                          <div className={`p-1.5 rounded-lg ${card.color}`}>
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                        </div>
                        <div className="text-lg font-extrabold tracking-tight truncate mt-2">
                          {card.val}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Preferred user selections metrics */}
                <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Customer Selections Breakdown</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-850">
                    {[
                      { label: "Most Selected Taste", val: stats.mostSelectedTaste },
                      { label: "Most Selected Budget", val: stats.mostSelectedBudget },
                      { label: "Most Selected Mood", val: stats.mostSelectedMood },
                      { label: "Most Selected Spice", val: stats.mostSelectedSpiceLevel }
                    ].map((pref, i) => (
                      <div key={i} className={`flex flex-col pt-3 md:pt-0 ${i > 0 ? 'md:pl-6' : ''}`}>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">{pref.label}</span>
                        <span className="text-base font-bold text-slate-700 dark:text-slate-350 mt-1">{pref.val}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trend Chart */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-sm font-bold flex items-center gap-1.5">
                    <TrendingUp className="text-rust-500 w-4 h-4" /> Recommendation Trend (Last 7 Days)
                  </h3>
                  {stats.trendData?.length > 0 ? (
                    <div className="h-56 flex items-end justify-between gap-4 pt-6 border-b border-slate-100 dark:border-slate-800 px-4">
                      {stats.trendData.map((d, i) => {
                        const maxVal = Math.max(...stats.trendData.map(t => t.val)) || 1;
                        const percent = Math.round((d.val / maxVal) * 100);
                        return (
                          <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                            <div className="opacity-0 group-hover:opacity-100 transition duration-200 text-[10px] font-bold bg-slate-800 dark:bg-white text-white dark:text-slate-800 px-2 py-0.5 rounded shadow-sm pointer-events-none">
                              {d.val} Matches
                            </div>
                            <div 
                              style={{ height: `${percent > 5 ? percent : 5}%` }}
                              className="w-full bg-rust-500 hover:bg-rust-600 dark:bg-rust-600 dark:hover:bg-rust-500 rounded-t-lg transition-all duration-300 shadow-xs"
                            ></div>
                            <span className="text-[10px] text-slate-400 font-semibold mt-1">{d.date}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-slate-400">No trend logs logged.</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MENU AI SETTINGS */}
            {activeTab === 'settings' && (
              <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                {/* Search & filters tools */}
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                  <div className="relative flex-1 w-full">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                    <input 
                      type="text" 
                      placeholder="Search by Dish Name or ID..."
                      value={menuSearch}
                      onChange={(e) => setMenuSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 border rounded-xl w-full text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none"
                    />
                  </div>
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="w-4 h-4 text-slate-400 shrink-0" />
                    <select
                      value={menuFilterCategory}
                      onChange={(e) => setMenuFilterCategory(e.target.value)}
                      className="border rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none w-full sm:w-auto"
                    >
                      <option value="All">All Categories</option>
                      {categoriesList.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                        <th className="px-5 py-4">ID</th>
                        <th className="px-5 py-4">Dish Name</th>
                        <th className="px-5 py-4">Taste Type</th>
                        <th className="px-5 py-4">Spice Level</th>
                        <th className="px-5 py-4">Meal Type</th>
                        <th className="px-5 py-4">Mood Fit</th>
                        <th className="px-5 py-4 text-center">Calories</th>
                        <th className="px-5 py-4 text-center">Prep Time</th>
                        <th className="px-5 py-4 text-center">Boost</th>
                        <th className="px-5 py-4 text-center">Status</th>
                        <th className="px-5 py-4 text-center">Configure</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                      {filteredMenuItems.map(item => (
                        <tr key={item.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition">
                          <td className="px-5 py-3 font-semibold text-slate-400">{item.id}</td>
                          <td className="px-5 py-3 font-bold text-slate-800 dark:text-slate-200">
                            {item.name}
                            <span className="block text-[10px] text-slate-400 font-medium">{item.category_name}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold">{item.taste_type}</span>
                          </td>
                          <td className="px-5 py-3">
                            <span className="px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/20 text-orange-600 text-[10px] font-semibold">{item.spice_level}</span>
                          </td>
                          <td className="px-5 py-3">{item.preferred_meal_type}</td>
                          <td className="px-5 py-3">{item.preferred_mood}</td>
                          <td className="px-5 py-3 text-center">{item.calories} Kcal</td>
                          <td className="px-5 py-3 text-center">{item.preparation_time}m</td>
                          <td className="px-5 py-3 text-center font-bold text-rust-500">+{item.recommendation_boost}</td>
                          <td className="px-5 py-3 text-center">
                            <button
                              onClick={() => handleToggleRecommended(item)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black transition-all ${
                                item.is_recommended
                                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                              }`}
                            >
                              {item.is_recommended ? 'Featured' : 'Standard'}
                            </button>
                          </td>
                          <td className="px-5 py-3 text-center">
                            <button
                              onClick={() => handleOpenEdit(item)}
                              className="p-1.5 text-slate-400 hover:text-rust-500 transition rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {filteredMenuItems.length === 0 && (
                    <div className="p-12 text-center text-slate-400">No dishes found matching search criteria.</div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: RECOMMENDATION HISTORY */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                {/* Search & Filters */}
                <div className="bg-white dark:bg-slate-950 p-5 rounded-2xl border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                  <div className="md:col-span-4 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Search logs</label>
                    <div className="relative">
                      <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="Search by User or Dish..."
                        value={historySearch}
                        onChange={(e) => setHistorySearch(e.target.value)}
                        className="pl-9 pr-4 py-2 border rounded-xl w-full text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none"
                      />
                    </div>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Taste</label>
                    <select
                      value={historyFilterTaste}
                      onChange={(e) => setHistoryFilterTaste(e.target.value)}
                      className="border rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none w-full"
                    >
                      <option value="">All Tastes</option>
                      <option value="Sweet">Sweet</option>
                      <option value="Salty">Salty</option>
                      <option value="Tangy">Tangy</option>
                      <option value="Creamy">Creamy</option>
                      <option value="Cheesy">Cheesy</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Spice</label>
                    <select
                      value={historyFilterSpice}
                      onChange={(e) => setHistoryFilterSpice(e.target.value)}
                      className="border rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none w-full"
                    >
                      <option value="">All Spice Levels</option>
                      <option value="Mild">Mild</option>
                      <option value="Medium">Medium</option>
                      <option value="Spicy">Spicy</option>
                      <option value="Extra Spicy">Extra Spicy</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase">Mood</label>
                    <select
                      value={historyFilterMood}
                      onChange={(e) => setHistoryFilterMood(e.target.value)}
                      className="border rounded-xl px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none w-full"
                    >
                      <option value="">All Moods</option>
                      <option value="Happy">Happy</option>
                      <option value="Family Dinner">Family Dinner</option>
                      <option value="Party">Party</option>
                      <option value="Romantic">Romantic</option>
                      <option value="Office Lunch">Office Lunch</option>
                      <option value="Celebration">Celebration</option>
                    </select>
                  </div>
                  <div className="md:col-span-2 flex gap-2">
                    <button
                      onClick={handleApplyHistoryFilters}
                      className="bg-rust-500 hover:bg-rust-600 text-white rounded-xl py-2 px-4 text-xs font-bold transition flex-1 text-center"
                    >
                      Apply
                    </button>
                    <button
                      onClick={handleResetHistoryFilters}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-500 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl p-2 transition shrink-0"
                      title="Reset filters"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* History Table display */}
                <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 overflow-hidden">
                  <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center flex-wrap gap-2">
                    <span className="font-bold text-slate-700 dark:text-slate-350">Historical recommendation logs ({history.length})</span>
                    <button
                      onClick={handleExportCSV}
                      className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/20 text-emerald-600 rounded-xl py-1.5 px-3 text-xs font-bold transition"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Export CSV</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                          <th className="px-5 py-4">Date</th>
                          <th className="px-5 py-4">User</th>
                          <th className="px-5 py-4">Recommended Dish</th>
                          <th className="px-5 py-4 text-center">Score</th>
                          <th className="px-5 py-4">Taste Pref</th>
                          <th className="px-5 py-4">Spice Pref</th>
                          <th className="px-5 py-4">Mood Pref</th>
                          <th className="px-5 py-4">Budget Pref</th>
                          <th className="px-5 py-4 text-center">Ordered</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-850">
                        {history.map(row => (
                          <tr key={row.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-900/20 transition">
                            <td className="px-5 py-3 text-slate-400 whitespace-nowrap">{new Date(row.created_at).toLocaleDateString(undefined, {month:'short', day:'numeric', hour:'numeric', minute:'numeric'})}</td>
                            <td className="px-5 py-3 font-bold">{row.user_name}</td>
                            <td className="px-5 py-3 font-semibold text-rust-600">{row.dish_name}</td>
                            <td className="px-5 py-3 text-center font-bold">{row.match_score}%</td>
                            <td className="px-5 py-3">{row.selected_taste}</td>
                            <td className="px-5 py-3">{row.selected_spice}</td>
                            <td className="px-5 py-3">{row.selected_mood}</td>
                            <td className="px-5 py-3 whitespace-nowrap">{row.selected_budget}</td>
                            <td className="px-5 py-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${row.is_ordered ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {row.is_ordered ? 'Yes' : 'No'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {history.length === 0 && (
                      <div className="p-12 text-center text-slate-400">No recommendation logs found. Try adjusting filter query.</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ANALYTICS */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Chart 1: Top Recommended Foods */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Top Recommended Foods</h3>
                  {analytics.topRecommendedFoods?.length > 0 ? (
                    <div className="space-y-3 pt-2">
                      {analytics.topRecommendedFoods.map((item, idx) => {
                        const maxVal = Math.max(...analytics.topRecommendedFoods.map(a => a.val)) || 1;
                        const percent = (item.val / maxVal) * 100;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-350">
                              <span>{item.label}</span>
                              <span className="font-bold">{item.val} matches</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                              <div style={{ width: `${percent}%` }} className="h-full bg-rust-500 rounded-full" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-slate-400">No recommendation logs logged.</div>
                  )}
                </div>

                {/* Chart 2: Most Ordered Recommended Foods */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Most Ordered Recommended Foods</h3>
                  {analytics.mostOrderedRecommendedFoods?.length > 0 ? (
                    <div className="space-y-3 pt-2">
                      {analytics.mostOrderedRecommendedFoods.map((item, idx) => {
                        const maxVal = Math.max(...analytics.mostOrderedRecommendedFoods.map(a => a.val)) || 1;
                        const percent = (item.val / maxVal) * 100;
                        return (
                          <div key={idx} className="space-y-1">
                            <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-slate-350">
                              <span>{item.label}</span>
                              <span className="font-bold">{item.val} orders</span>
                            </div>
                            <div className="h-2 w-full bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                              <div style={{ width: `${percent}%` }} className="h-full bg-emerald-500 rounded-full" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-slate-400">No ordered conversions logged yet.</div>
                  )}
                </div>

                {/* Chart 3: Taste Preference Distribution */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">Taste Preference Distribution</h3>
                  {analytics.tasteDistribution?.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.tasteDistribution.map((item, idx) => {
                        const total = analytics.tasteDistribution.reduce((acc, a) => acc + a.val, 0) || 1;
                        const percent = Math.round((item.val / total) * 100);
                        return (
                          <div key={idx} className="flex items-center gap-3">
                            <span className="w-20 text-slate-500 text-xs font-bold text-right truncate">{item.label}</span>
                            <div className="flex-1 h-3.5 bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden relative">
                              <div style={{ width: `${percent}%` }} className="h-full bg-rust-500" />
                              <span className="absolute inset-y-0 left-2 text-[9px] font-black text-slate-600 flex items-center">{percent}%</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="h-40 flex items-center justify-center text-slate-400">No taste distribution logged.</div>
                  )}
                </div>

                {/* Chart 4: Mood & Budget Preferences */}
                <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-4 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 mb-4">Mood Preferences</h3>
                    {analytics.moodPreference?.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {analytics.moodPreference.slice(0,4).map((item, idx) => (
                          <div key={idx} className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                            <span className="block text-[9px] text-slate-400 font-bold uppercase">{item.label}</span>
                            <span className="text-sm font-extrabold text-slate-700 dark:text-slate-350">{item.val} Selections</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-slate-400 text-center py-4">No data logged.</div>
                    )}
                  </div>
                  
                  <div className="border-t border-slate-100 dark:border-slate-850 pt-4 mt-4">
                    <h4 className="text-[10px] text-slate-400 font-bold uppercase mb-2">Engagement Metrics</h4>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-600">Repeat Recommendation Users:</span>
                      <span className="text-base font-black text-rust-600">{analytics.repeatUsersCount} Users</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* POPUP MODAL: CONFIGURE AI PARAMETERS */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-xl bg-white dark:bg-slate-950 rounded-2xl border border-slate-150 dark:border-slate-850 overflow-hidden shadow-2xl p-6 space-y-6"
          >
            <div className="flex justify-between items-center border-b dark:border-slate-850 pb-4">
              <div>
                <span className="text-[10px] font-black uppercase text-rust-500">Configure Parameters</span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">{editingItem.name}</h3>
              </div>
              <button 
                onClick={() => setEditingItem(null)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Taste Type</label>
                <select
                  value={editingItem.taste_type}
                  onChange={(e) => setEditingItem({ ...editingItem, taste_type: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none"
                >
                  <option value="Sweet">Sweet</option>
                  <option value="Salty">Salty</option>
                  <option value="Tangy">Tangy</option>
                  <option value="Creamy">Creamy</option>
                  <option value="Cheesy">Cheesy</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Spice Level</label>
                <select
                  value={editingItem.spice_level}
                  onChange={(e) => setEditingItem({ ...editingItem, spice_level: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none"
                >
                  <option value="Mild">Mild</option>
                  <option value="Medium">Medium</option>
                  <option value="Spicy">Spicy</option>
                  <option value="Extra Spicy">Extra Spicy</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Preferred Meal Type</label>
                <select
                  value={editingItem.preferred_meal_type}
                  onChange={(e) => setEditingItem({ ...editingItem, preferred_meal_type: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none"
                >
                  <option value="Lunch">Lunch</option>
                  <option value="Dinner">Dinner</option>
                  <option value="Snacks">Snacks</option>
                  <option value="Dessert">Dessert</option>
                  <option value="Beverage">Beverage</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Preferred Mood</label>
                <select
                  value={editingItem.preferred_mood}
                  onChange={(e) => setEditingItem({ ...editingItem, preferred_mood: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none"
                >
                  <option value="Happy">Happy</option>
                  <option value="Family Dinner">Family Dinner</option>
                  <option value="Party">Party</option>
                  <option value="Romantic">Romantic</option>
                  <option value="Office Lunch">Office Lunch</option>
                  <option value="Celebration">Celebration</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Diet Type</label>
                <select
                  value={editingItem.diet_type}
                  onChange={(e) => setEditingItem({ ...editingItem, diet_type: e.target.value })}
                  className="w-full border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none"
                >
                  <option value="Veg">Veg</option>
                  <option value="Jain Veg">Jain Veg</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Calories (Kcal)</label>
                <input 
                  type="number" 
                  value={editingItem.calories}
                  onChange={(e) => setEditingItem({ ...editingItem, calories: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Prep Time (mins)</label>
                <input 
                  type="number" 
                  value={editingItem.preparation_time}
                  onChange={(e) => setEditingItem({ ...editingItem, preparation_time: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">AI priority weight</label>
                <input 
                  type="number" 
                  value={editingItem.ai_priority}
                  onChange={(e) => setEditingItem({ ...editingItem, ai_priority: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Recommendation Boost Score</label>
                <input 
                  type="number" 
                  value={editingItem.recommendation_boost}
                  onChange={(e) => setEditingItem({ ...editingItem, recommendation_boost: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Popularity Score (0-100)</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={editingItem.popularity_score}
                  onChange={(e) => setEditingItem({ ...editingItem, popularity_score: parseInt(e.target.value) || 0 })}
                  className="w-full border rounded-xl px-3 py-2 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-4 border-t dark:border-slate-850">
              <button
                onClick={() => setEditingItem(null)}
                className="flex-1 rounded-xl border py-2.5 text-xs font-bold text-slate-500 text-center hover:bg-slate-50 transition"
              >
                Discard
              </button>
              <button
                onClick={handleSaveAISettings}
                className="flex-1 rounded-xl bg-rust-500 py-2.5 text-xs font-bold text-white text-center hover:bg-rust-600 shadow-md transition"
              >
                Save configurations
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
