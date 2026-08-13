import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShoppingBag, 
  DollarSign, 
  Calendar, 
  UtensilsCrossed, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Users, 
  Sparkles, 
  Tag, 
  TrendingUp, 
  Activity, 
  Printer, 
  Eye, 
  Trash2, 
  ChevronRight,
  RefreshCw,
  Heart,
  Briefcase,
  Layers,
  Home

} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useTheme } from '../../context/ThemeContext';

export default function Dashboard() {
  const { darkMode } = useTheme();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    acceptedOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    servedOrders: 0,
    totalRevenue: 0,
    todayRevenue: 0,
    avgOrderValue: 0,
    totalCustomers: 0,
    totalMenuCategories: 0,
    totalMenuItems: 0,
    activeCoupons: 0,
    activeReservations: 0,
    totalFeedback: 0,
    avgFeedbackRating: 0,
    popularCategories: [],
    mostOrderedFoods: [],
    chartData: { weekly: [], monthly: [], yearly: [] },
    recentActivities: []
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueTimeframe, setRevenueTimeframe] = useState('weekly');
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, ordersRes] = await Promise.all([
        api.get('/admin/dashboard/'),
        api.get('/orders/')
      ]);
      if (statsRes.data) {
        setStats(statsRes.data);
      }
      if (ordersRes.data) {
        setRecentOrders(ordersRes.data.slice(0, 5));
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to sync real-time dashboard analytics.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId, newStatus) => {
    try {
      await api.patch(`/orders/${orderId}/`, { status: newStatus });
      setRecentOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      toast.success(`Order #${orderId} set to "${newStatus}"`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status.');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order permanently?')) return;
    try {
      await api.delete(`/orders/${orderId}/`);
      setRecentOrders(prev => prev.filter(o => o.id !== orderId));
      toast.success('Order deleted successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete order.');
    }
  };

  // Dynamic Chart Data mapping from DB
  const chartData = stats.chartData?.[revenueTimeframe] || [];
  const maxChartVal = Math.max(...chartData.map(d => d.val)) || 1;

  const formatCardValue = (val, type = 'number') => {
    if (val === undefined || val === null || val === 0 || val === '0' || val === '₹0.00' || val === '0.0') {
      return "No Data Available";
    }
    if (type === 'currency') {
      const num = parseFloat(val);
      if (isNaN(num) || num === 0) return "No Data Available";
      return `₹${num.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
    }
    return val;
  };

  return (
    <div className="space-y-6 text-sm">
      {/* Dashboard Greeting Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage real-time restaurant statistics, order pipelines, and table reservation summaries.</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="flex items-center gap-2 px-4 py-2 bg-rust-50 dark:bg-rust-950/30 text-rust-600 rounded-xl font-bold transition hover:opacity-95 text-xs shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Sync Live Data
        </button>
      </div>

      {/* Quick Actions Row */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs">
        <div className="text-[10px] font-black uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">Quick Workflows</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <button onClick={() => navigate('/admin/menu')} className="flex items-center gap-2 p-2.5 bg-rust-50 hover:bg-rust-100 dark:bg-rust-950/20 text-rust-600 rounded-xl transition font-bold text-xs justify-center">
            <UtensilsCrossed className="w-4 h-4 shrink-0 text-rust-500" /> <span>Add Menu Item</span>
          </button>
          <button onClick={() => navigate('/admin/menu')} className="flex items-center gap-2 p-2.5 bg-rust-50 hover:bg-rust-100 dark:bg-rust-950/20 text-rust-600 rounded-xl transition font-bold text-xs justify-center">
            <Layers className="w-4 h-4 shrink-0 text-rust-500" /> <span>Add Category</span>
          </button>
          <button onClick={() => navigate('/admin/coupons')} className="flex items-center gap-2 p-2.5 bg-rust-50 hover:bg-rust-100 dark:bg-rust-950/20 text-rust-600 rounded-xl transition font-bold text-xs justify-center">
            <Tag className="w-4 h-4 shrink-0 text-rust-500" /> <span>Create Coupon</span>
          </button>
          <button onClick={() => navigate('/admin/orders')} className="flex items-center gap-2 p-2.5 bg-rust-50 hover:bg-rust-100 dark:bg-rust-950/20 text-rust-600 rounded-xl transition font-bold text-xs justify-center">
            <ShoppingBag className="w-4 h-4 shrink-0 text-rust-500" /> <span>View Orders</span>
          </button>
          <button onClick={() => navigate('/admin/tables')} className="flex items-center gap-2 p-2.5 bg-rust-50 hover:bg-rust-100 dark:bg-rust-950/20 text-rust-600 rounded-xl transition font-bold text-xs justify-center">
            <Calendar className="w-4 h-4 shrink-0 text-rust-500" /> <span>View Reservations</span>
          </button>
          <button onClick={() => navigate('/admin/customers')} className="flex items-center gap-2 p-2.5 bg-rust-50 hover:bg-rust-100 dark:bg-rust-950/20 text-rust-600 rounded-xl transition font-bold text-xs justify-center">
            <Users className="w-4 h-4 shrink-0 text-rust-500" /> <span>Manage Customers</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(16)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-slate-800 rounded-2xl animate-pulse flex items-center justify-center">
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Syncing...</span>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* 16 SaaS Analytic Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              { title: "Total Orders", val: formatCardValue(stats.totalOrders), color: "text-rust-600 bg-rust-50 dark:bg-rust-950/20", icon: ShoppingBag },
              { title: "Today's Orders", val: formatCardValue(stats.todayOrders), color: "text-rust-600 bg-rust-50 dark:bg-rust-950/20", icon: Activity },
              { title: "Pending Orders", val: formatCardValue(stats.pendingOrders), color: "text-amber-600 bg-amber-50 dark:bg-amber-950/20", icon: Clock },
              { title: "Accepted Orders", val: formatCardValue(stats.acceptedOrders), color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20", icon: CheckCircle },
              { title: "Preparing Orders", val: formatCardValue(stats.preparingOrders), color: "text-blue-600 bg-blue-50 dark:bg-blue-950/20", icon: RefreshCw },
              { title: "Ready Orders", val: formatCardValue(stats.readyOrders), color: "text-purple-600 bg-purple-50 dark:bg-purple-950/20", icon: Sparkles },
              { title: "Served Orders", val: formatCardValue(stats.servedOrders), color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20", icon: CheckCircle },
              { title: "Total Revenue", val: formatCardValue(stats.totalRevenue, 'currency'), color: "text-rust-600 bg-rust-50 dark:bg-rust-950/20", icon: DollarSign },
              { title: "Today's Revenue", val: formatCardValue(stats.todayRevenue, 'currency'), color: "text-rust-600 bg-rust-50 dark:bg-rust-950/20", icon: DollarSign },
              { title: "Average Order Value", val: formatCardValue(stats.avgOrderValue, 'currency'), color: "text-rust-600 bg-rust-50 dark:bg-rust-950/20", icon: DollarSign },
              { title: "Total Customers", val: formatCardValue(stats.totalCustomers), color: "text-rust-600 bg-rust-50 dark:bg-rust-950/20", icon: Users },
              { title: "Total Menu Categories", val: formatCardValue(stats.totalMenuCategories), color: "text-rust-600 bg-rust-50 dark:bg-rust-950/20", icon: Layers },
              { title: "Total Menu Items", val: formatCardValue(stats.totalMenuItems), color: "text-rust-600 bg-rust-50 dark:bg-rust-950/20", icon: UtensilsCrossed },
              { title: "Active Coupons", val: formatCardValue(stats.activeCoupons), color: "text-rust-600 bg-rust-50 dark:bg-rust-950/20", icon: Tag },
              { title: "Active Reservations", val: formatCardValue(stats.activeReservations), color: "text-rust-600 bg-rust-50 dark:bg-rust-950/20", icon: Calendar },
              { title: "Total Feedback & Ratings", val: stats.totalFeedback > 0 ? `${stats.totalFeedback} (${stats.avgFeedbackRating?.toFixed(1)}★)` : "No Data Available", color: "text-rust-600 bg-rust-50 dark:bg-rust-950/20", icon: Heart },
            ].map((card, idx) => {
              const Icon = card.icon;
              return (
                <div key={idx} className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between h-28 hover:shadow-md transition">
                  <div className="flex justify-between items-center text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold tracking-wider">
                    <span>{card.title}</span>
                    <div className={`p-1.5 rounded-lg ${card.color}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <div className={`${typeof card.val === 'string' && card.val.includes('No Data') ? 'text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500' : 'text-xl sm:text-2xl font-bold'} tracking-tight`}>
                    {card.val}
                  </div>
                </div>
              );
            })}
          </div>


          {/* Interactive Sales Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Sales Chart */}
            <div className="lg:col-span-8 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <h2 className="text-base font-bold flex items-center gap-2">
                  <TrendingUp className="text-rust-500" /> Revenue Growth Chart
                </h2>
                <div className="flex bg-slate-100 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
                  {['weekly', 'monthly', 'yearly'].map(tf => (
                    <button
                      key={tf}
                      onClick={() => setRevenueTimeframe(tf)}
                      className={`px-3 py-1.5 rounded-lg transition capitalize ${revenueTimeframe === tf ? 'bg-white dark:bg-slate-800 shadow-xs font-bold text-rust-600 dark:text-rust-400' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
                    >
                      {tf}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic SVG / Styled Columns Chart */}
              <div className="h-56 flex items-end justify-between gap-4 pt-6 border-b border-slate-100 dark:border-slate-800 px-4">
                {chartData.map((d, i) => {
                  const percent = Math.round((d.val / maxChartVal) * 100);
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group cursor-pointer">
                      <div className="opacity-0 group-hover:opacity-100 transition duration-200 text-[10px] font-bold bg-slate-800 dark:bg-white text-white dark:text-slate-800 px-2 py-1 rounded shadow-md pointer-events-none">
                        ₹{d.val.toLocaleString()}
                      </div>
                      <div 
                        style={{ height: `${percent}%` }}
                        className="w-full bg-rust-500 hover:bg-rust-600 dark:bg-rust-600 dark:hover:bg-rust-500 rounded-t-xl transition-all duration-300 shadow-xs"
                      ></div>
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{d.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Order Status Distribution Pie Chart */}
            <div className="lg:col-span-4 bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs flex flex-col justify-between">
              <h2 className="text-base font-bold">Order Analytics Status</h2>
              <div className="flex justify-center items-center py-4">
                {/* SVG circular progress */}
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="50" fill="transparent" stroke={darkMode ? "#1e293b" : "#f1f5f9"} strokeWidth="10" />
                  <circle 
                    cx="64" 
                    cy="64" 
                    r="50" 
                    fill="transparent" 
                    stroke="#b7410e" 
                    strokeWidth="10" 
                    strokeDasharray="314" 
                    strokeDashoffset={314 - (314 * (stats.servedOrders || 0)) / (stats.totalOrders || 1)} 
                    strokeLinecap="round" 
                  />
                  <text x="64" y="-58" transform="rotate(90)" textAnchor="middle" alignmentBaseline="middle" className="text-lg font-extrabold fill-slate-800 dark:fill-white">
                    {Math.round(((stats.servedOrders || 0) / (stats.totalOrders || 1)) * 100)}%
                  </text>
                </svg>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rust-500"></span> Served ({stats.servedOrders})</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Pending ({stats.pendingOrders})</div>
                <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-700"></span> Total ({stats.totalOrders})</div>
              </div>
            </div>
          </div>


          {/* Popular Categories & Food Products & Recent Activities */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Categories */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-base font-bold">Popular Categories</h2>
              <div className="space-y-3.5">
                {(stats.popularCategories && stats.popularCategories.length > 0) ? (
                  stats.popularCategories.map((item, i) => (
                    <div key={i} className="space-y-1 text-xs">
                      <div className="flex justify-between font-semibold">
                        <span>{item.name}</span>
                        <span className="text-slate-400">{item.orders} Orders</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500" style={{ width: `${item.progress}%` }}></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 py-6 text-center">No category data available</div>
                )}
              </div>
            </div>

            {/* Most Ordered Food */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-base font-bold">Most Ordered Foods</h2>
              <div className="divide-y divide-slate-100 dark:divide-slate-850">
                {(stats.mostOrderedFoods && stats.mostOrderedFoods.length > 0) ? (
                  stats.mostOrderedFoods.map((dish, i) => (
                    <div key={i} className="py-2.5 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center font-bold">{i + 1}</span>
                        <span className="font-semibold">{dish.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold">{dish.rev}</span>
                        <p className="text-[10px] text-slate-400">{dish.qty} servings</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-400 py-6 text-center">No food item sales recorded</div>
                )}
              </div>
            </div>

            {/* Recent Activity Feed */}
            <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs space-y-4">
              <h2 className="text-base font-bold">Recent Activity Feed</h2>
              <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-1">
                {(stats.recentActivities && stats.recentActivities.length > 0) ? (
                  stats.recentActivities.map((act, i) => {
                    let typeBadge = "bg-slate-100 text-slate-700";
                    if (act.type === 'order') typeBadge = "bg-emerald-50 text-emerald-700 border-emerald-100";
                    else if (act.type === 'reservation') typeBadge = "bg-blue-50 text-blue-700 border-blue-100";
                    else if (act.type === 'customer') typeBadge = "bg-purple-50 text-purple-700 border-purple-100";
                    else if (act.type === 'payment') typeBadge = "bg-amber-50 text-amber-700 border-amber-100";
                    else if (act.type === 'menu') typeBadge = "bg-rose-50 text-rose-700 border-rose-100";
                    else if (act.type === 'coupon') typeBadge = "bg-indigo-50 text-indigo-700 border-indigo-100";

                    return (
                      <div key={i} className="flex gap-3 text-xs border-b last:border-0 pb-2.5 last:pb-0 dark:border-slate-850">
                        <div className="flex-1 space-y-0.5">
                          <div className="flex justify-between items-center gap-2">
                            <span className="font-extrabold text-slate-800 dark:text-slate-100">{act.title}</span>
                            <span className={`text-[9px] uppercase font-black px-1.5 py-0.5 rounded border ${typeBadge}`}>{act.type}</span>
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 leading-tight">{act.desc}</p>
                          <span className="text-[10px] text-slate-400 block">{new Date(act.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {new Date(act.time).toLocaleDateString()}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-xs text-slate-400 py-6 text-center">No recent activities logged</div>
                )}
              </div>
            </div>
          </div>

          {/* Recent Orders Table */}
          <div className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs p-6 space-y-4">
            <h2 className="text-base font-bold">Recent Orders Table</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-300 border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Customer</th>
                    <th className="py-3 px-4">Food Items</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Payment</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {recentOrders.map(order => (
                    <tr key={order.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-900/60 transition">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">#{order.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold">{order.customer_name}</div>
                        <div className="text-[10px] text-slate-400">{order.phone}</div>
                      </td>
                      <td className="py-3 px-4 truncate max-w-xs">{order.items?.map(i => `${i.menu_item?.name} (x${i.quantity})`).join(', ') || 'Veg Gourmet items'}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">₹{parseFloat(order.grand_total).toFixed(2)}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-medium">{order.payment_method}</span>
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] border focus:outline-none ${
                            order.status === 'Served' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' :
                            'bg-amber-50 border-amber-200 text-amber-700'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Preparing">Preparing</option>
                          <option value="Ready">Ready</option>
                          <option value="Served">Served</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 text-slate-400">{new Date(order.created_at).toLocaleDateString()}</td>
                      <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition text-slate-600 dark:text-slate-300 inline-flex"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-900/30 rounded-lg transition text-rose-600 inline-flex"
                          title="Delete Order"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Order View Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setSelectedOrder(null)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 border border-slate-100 dark:border-slate-800 z-50"
            >
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                <h3 className="text-base font-bold">Order Details #{selectedOrder.id}</h3>
                <button onClick={() => setSelectedOrder(null)} className="font-bold text-slate-400">✕</button>
              </div>

              <div className="space-y-2 text-xs">
                <p><span className="text-slate-400">Customer Name:</span> <strong>{selectedOrder.customer_name}</strong></p>
                <p><span className="text-slate-400">Phone:</span> <strong>{selectedOrder.phone}</strong></p>
                <p><span className="text-slate-400">Address:</span> {selectedOrder.address}</p>
                <p><span className="text-slate-400">Payment Status:</span> <span className="font-bold text-emerald-600">{selectedOrder.payment_status}</span> ({selectedOrder.payment_method})</p>
                <p><span className="text-slate-400">Status:</span> <span className="font-bold text-amber-600">{selectedOrder.status}</span></p>
              </div>

              <div className="border-t pt-3 dark:border-slate-800">
                <p className="font-bold mb-2">Order Items:</p>
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs py-1 border-b dark:border-slate-800 last:border-0">
                      <span>{item.menu_item?.name} (x{item.quantity})</span>
                      <span className="font-bold">₹{(item.quantity * parseFloat(item.price)).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-3 flex justify-between font-bold dark:border-slate-800 text-sm">
                <span>Grand Total:</span>
                <span className="text-emerald-600 dark:text-emerald-400">₹{parseFloat(selectedOrder.grand_total).toFixed(2)}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
