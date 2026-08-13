import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  CheckCircle, 
  XCircle, 
  Clock, 
  DollarSign, 
  Layers, 
  FolderPlus, 
  Tag, 
  Eye, 
  Info,
  Maximize2
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function MenuManagement() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingCat, setEditingCat] = useState(null);
  const [selectedItemDetails, setSelectedItemDetails] = useState(null);

  const [formData, setFormData] = useState({
    id: '',
    name: '',
    category: '',
    price: '',
    approx_qty_gms: '250',
    description: '',
    ingredients: '',
    image: '',
    prep_time: '15',
    is_available: true,
    is_featured: false,
    is_veg: true
  });

  const [catFormData, setCatFormData] = useState({
    name: '',
    slug: '',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchMenuData = async () => {
    try {
      setLoading(true);
      const [resItems, resCats] = await Promise.all([
        api.get('/menu-items/'),
        api.get('/menu-categories/')
      ]);
      setItems(resItems.data || []);
      setCategories(resCats.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load menu data.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleAvailability = async (item) => {
    const updatedStatus = !item.is_available;
    try {
      await api.patch(`/menu-items/${item.id}/`, {
        is_available: updatedStatus
      });
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, is_available: updatedStatus } : i));
      toast.success(`${item.name} is now ${updatedStatus ? 'Available' : 'Out of Stock'}`);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update availability.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) return;
    try {
      await api.delete(`/menu-items/${id}/`);
      setItems(prev => prev.filter(i => i.id !== id));
      toast.success('Menu item deleted successfully.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete item.');
    }
  };

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      id: `cb-${Date.now().toString().slice(-4)}`,
      name: '',
      category: categories[0]?.slug || '',
      price: '',
      approx_qty_gms: '250',
      description: '',
      ingredients: '',
      image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
      prep_time: '15',
      is_available: true,
      is_featured: false,
      is_veg: true
    });
    setShowItemModal(true);
  };

  const handleOpenEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      id: item.id,
      name: item.name,
      category: item.category || '',
      price: item.price,
      approx_qty_gms: item.approx_qty_gms || 250,
      description: item.description || '',
      ingredients: item.ingredients || '',
      image: item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400',
      prep_time: item.prep_time || 15,
      is_available: item.is_available ?? true,
      is_featured: item.is_featured ?? false,
      is_veg: true
    });
    setShowItemModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: formData.id,
        name: formData.name,
        category: formData.category,
        price: parseFloat(formData.price),
        approx_qty_gms: parseInt(formData.approx_qty_gms),
        description: formData.description,
        ingredients: formData.ingredients,
        image: formData.image,
        prep_time: parseInt(formData.prep_time),
        is_available: formData.is_available,
        is_featured: formData.is_featured,
        is_veg: true
      };

      if (editingItem) {
        await api.put(`/menu-items/${formData.id}/`, payload);
        toast.success('Menu item updated successfully.');
      } else {
        await api.post('/menu-items/', payload);
        toast.success('New menu item created successfully.');
      }
      setShowItemModal(false);
      fetchMenuData();
    } catch (err) {
      console.error(err);
      let errMsg = 'Failed to save menu item. Check duplicate IDs.';
      if (err.response?.data) {
        if (err.response.data.detail) {
          errMsg = err.response.data.detail;
        } else if (typeof err.response.data === 'object') {
          const errors = Object.entries(err.response.data)
            .map(([field, msgs]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
            .join(' | ');
          if (errors) errMsg = errors;
        }
      }
      toast.error(errMsg);
    }
  };

  // Category CRUD logic
  const handleOpenCatModal = (cat = null) => {
    if (cat) {
      setEditingCat(cat);
      setCatFormData({
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        is_active: cat.is_active ?? true
      });
    } else {
      setEditingCat(null);
      setCatFormData({
        name: '',
        slug: '',
        description: '',
        is_active: true
      });
    }
    setShowCatModal(true);
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: catFormData.name,
        slug: catFormData.slug || catFormData.name.toLowerCase().replace(/ /g, '-'),
        description: catFormData.description,
        is_active: catFormData.is_active
      };

      if (editingCat) {
        await api.put(`/menu-categories/${editingCat.slug}/`, payload);
        toast.success('Category updated successfully.');
      } else {
        await api.post('/menu-categories/', payload);
        toast.success('New category added successfully.');
      }
      setShowCatModal(false);
      fetchMenuData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save category.');
    }
  };

  const handleDeleteCat = async (slug) => {
    if (!window.confirm('Deleting category will NOT delete dishes, but they will be uncategorized. Continue?')) return;
    try {
      await api.delete(`/menu-categories/${slug}/`);
      toast.success('Category deleted.');
      fetchMenuData();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete category.');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (item.ingredients && item.ingredients.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6 text-sm">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Menu Management</h1>
          <p className="text-slate-500 dark:text-slate-400">100% Pure Vegetarian menu records, dynamic categories, pricing controls, and ingredients listing.</p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            onClick={() => handleOpenCatModal(null)}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 rounded-xl font-bold transition hover:bg-slate-50 dark:hover:bg-slate-900 text-xs shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-emerald-500" /> Dynamic Categories
          </button>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl font-bold transition text-xs shadow-md shadow-emerald-600/10"
          >
            <Plus className="w-4 h-4" /> Add Menu Item
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search dish name, description, ingredients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-xs transition"
          />
        </div>
        <div className="w-full md:w-72">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full py-2.5 px-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 text-xs font-semibold text-slate-700 dark:text-slate-350"
          >
            <option value="All">All Categories ({categories.length} Active)</option>
            {categories.map(cat => (
              <option key={cat.slug} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Categories CRUD Overview when managing categories */}
      <div className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs">
        <div className="flex items-start gap-2 text-emerald-800 dark:text-emerald-350">
          <Info className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Pure Veg Resto Policy:</span> Categories & dishes strictly comply with vegetarian kitchen standards. Predefined categories are editable for customization.
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {categories.map(cat => (
            <span key={cat.slug} className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-lg px-2.5 py-1 font-bold inline-flex items-center gap-1">
              {cat.name}
              <button onClick={() => handleOpenCatModal(cat)} className="text-blue-500 hover:text-blue-700 ml-1">✍️</button>
              <button onClick={() => handleDeleteCat(cat.slug)} className="text-red-500 hover:text-red-700">✕</button>
            </span>
          ))}
        </div>
      </div>

      {/* Item List Grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold animate-pulse flex items-center justify-center gap-2">
          <Layers className="w-5 h-5 animate-spin" /> Syncing pure veg items...
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-slate-500 font-bold">No menu items found. Click "Add Menu Item" to expand card catalog.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
            const catName = categories.find(c => c.slug === item.category)?.name || 'Vegetarian';
            return (
              <div key={item.id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs hover:shadow-md transition overflow-hidden flex flex-col justify-between">
                <div>
                  <div className="p-5 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2 border-b dark:border-slate-900 pb-2">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md uppercase tracking-wider">
                          {catName}
                        </span>
                        <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                          100% Veg
                        </span>
                        {item.is_featured && (
                          <span className="text-[9px] bg-amber-500 text-white font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Featured
                          </span>
                        )}
                        {!item.is_available && (
                          <span className="text-[9px] bg-rose-600 text-white font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-slate-400" /> {item.prep_time || 15} mins
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-base leading-tight pt-1">{item.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{item.description || 'Delicately prepared 100% vegetarian dish.'}</p>
                    {item.ingredients && (
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 font-mono truncate">
                        🧪 Ingredients: {item.ingredients}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t dark:border-slate-900">
                      <div className="text-lg font-black text-slate-900 dark:text-white">₹{item.price} <span className="text-[10px] text-slate-400 font-normal">({item.approx_qty_gms || 250}g)</span></div>
                      <span className="text-[10px] text-slate-400 font-mono">ID: {item.id}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-4 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => handleToggleAvailability(item)}
                    className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                      item.is_available
                        ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 hover:bg-amber-100'
                        : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 hover:bg-emerald-100'
                    }`}
                  >
                    {item.is_available ? <><XCircle className="w-3.5 h-3.5" /> Out of Stock</> : <><CheckCircle className="w-3.5 h-3.5" /> Set In Stock</>}
                  </button>
                  <button
                    onClick={() => setSelectedItemDetails(item)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition"
                    title="View Item details"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(item)}
                    className="p-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition"
                    title="Edit Item"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="p-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl transition"
                    title="Delete Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Add / Edit Modal */}
      <AnimatePresence>
        {showItemModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setShowItemModal(false)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[95vh] overflow-y-auto border border-slate-150 dark:border-slate-800 z-50"
            >
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                <h2 className="text-base font-extrabold">
                  {editingItem ? `Edit Menu Item (ID: ${formData.id})` : 'Create New Menu Item'}
                </h2>
                <button onClick={() => setShowItemModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Dish ID (slug, e.g. cb-20) *</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingItem}
                      value={formData.id}
                      onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500 disabled:opacity-50"
                      placeholder="cb-5"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Dish Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                      placeholder="e.g. Paneer Butter Masala"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Category *</label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500 font-semibold"
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.slug} value={cat.slug}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Price (INR ₹) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500 font-bold"
                      placeholder="280"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Quantity (gms / ml)</label>
                    <input
                      type="number"
                      value={formData.approx_qty_gms}
                      onChange={(e) => setFormData({ ...formData, approx_qty_gms: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                      placeholder="300"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-500 mb-1">Preparation Time (minutes)</label>
                    <input
                      type="number"
                      value={formData.prep_time}
                      onChange={(e) => setFormData({ ...formData, prep_time: e.target.value })}
                      className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                      placeholder="15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Ingredients (comma separated)</label>
                  <input
                    type="text"
                    value={formData.ingredients}
                    onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                    placeholder="Paneer, Tomato Puree, Fresh Cream, Kasuri Methi, Butter"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Description</label>
                  <textarea
                    rows="2.5"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                    placeholder="Creamy vegetarian gravy cooked to perfection..."
                  ></textarea>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_available}
                      onChange={(e) => setFormData({ ...formData, is_available: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded dark:bg-slate-950 dark:border-slate-800"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Available in stock</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="w-4 h-4 text-amber-500 rounded dark:bg-slate-950 dark:border-slate-800"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Feature on customer site</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowItemModal(false)}
                    className="px-4 py-2 border dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                  >
                    Save Menu Item
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Category Add / Edit Modal */}
      <AnimatePresence>
        {showCatModal && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setShowCatModal(false)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-slate-150 dark:border-slate-800 z-50"
            >
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                <h2 className="text-base font-extrabold">
                  {editingCat ? `Edit Category: ${editingCat.name}` : 'Add New Category'}
                </h2>
                <button onClick={() => setShowCatModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>

              <form onSubmit={handleCatSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block font-bold text-slate-500 mb-1">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={catFormData.name}
                    onChange={(e) => setCatFormData({ ...catFormData, name: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                    placeholder="e.g. Sizzler Platter"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Category Slug (URL safe string, e.g. sizzler) *</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingCat}
                    value={catFormData.slug}
                    onChange={(e) => setCatFormData({ ...catFormData, slug: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500 font-mono"
                    placeholder="sizzlers"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-500 mb-1">Description</label>
                  <textarea
                    rows="2.5"
                    value={catFormData.description}
                    onChange={(e) => setCatFormData({ ...catFormData, description: e.target.value })}
                    className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl focus:border-emerald-500"
                    placeholder="Delicately seasoned vegetable platters..."
                  ></textarea>
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catFormData.is_active}
                      onChange={(e) => setCatFormData({ ...catFormData, is_active: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded dark:bg-slate-950 dark:border-slate-800"
                    />
                    <span className="font-bold text-slate-700 dark:text-slate-300">Category Active</span>
                  </label>
                </div>

                <div className="flex items-center justify-end gap-2 pt-4 border-t dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowCatModal(false)}
                    className="px-4 py-2 border dark:border-slate-800 rounded-xl font-bold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-950 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                  >
                    Save Category
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Item Details View Modal */}
      <AnimatePresence>
        {selectedItemDetails && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setSelectedItemDetails(null)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-150 dark:border-slate-800 z-50 flex flex-col"
            >
              <div className="p-6 space-y-3.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded uppercase tracking-wider">
                    {categories.find(c => c.slug === selectedItemDetails.category)?.name || 'Vegetarian'}
                  </span>
                  <button 
                    onClick={() => setSelectedItemDetails(null)} 
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 flex items-center justify-center font-bold text-xs"
                  >
                    ✕
                  </button>
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 dark:text-white text-lg">{selectedItemDetails.name}</h3>
                </div>
                
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-justify">{selectedItemDetails.description || 'No description provided.'}</p>
                
                {selectedItemDetails.ingredients && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl space-y-1.5">
                    <span className="font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider text-[9px]">Ingredients</span>
                    <p className="font-mono text-slate-500 dark:text-slate-400">{selectedItemDetails.ingredients}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2 border-t dark:border-slate-850">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Price</span>
                    <span className="text-base font-black text-slate-900 dark:text-white">₹{selectedItemDetails.price}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Preparation Time</span>
                    <span className="font-bold">{selectedItemDetails.prep_time || 15} minutes</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Quantity</span>
                    <span className="font-bold">{selectedItemDetails.approx_qty_gms || 250} grams</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Dish ID Code</span>
                    <span className="font-mono font-bold text-slate-500">{selectedItemDetails.id}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
