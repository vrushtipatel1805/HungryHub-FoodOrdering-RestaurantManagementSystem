import { useEffect, useState } from 'react';
import { useSearchParams, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Loader from '../../components/Common/Loader';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { getMenuItems, getMenuCategories } from '../../services/orderService';
import MenuCategories from '../../components/Cards/MenuCategories';

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1495195129352-aeb325a55b65?auto=format&fit=crop&q=80&w=200';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  let backendBase = 'http://localhost:8000';
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.startsWith('http')) {
    try {
      const urlObj = new URL(envUrl);
      backendBase = urlObj.origin;
    } catch (e) {
      // Ignore
    }
  }
  let cleanPath = imagePath;
  if (cleanPath.startsWith('/')) {
    cleanPath = cleanPath.slice(1);
  }
  if (cleanPath.startsWith('media/')) {
    return `${backendBase}/${cleanPath}`;
  }
  return `${backendBase}/media/${cleanPath}`;
};

export default function Menu() {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addItem } = useCart();

  const selectedCategory = searchParams.get('category') || '';

  useEffect(() => {
    const load = async () => {
      try {
        const [itemsRes, categoriesRes] = await Promise.all([
          getMenuItems(),
          getMenuCategories()
        ]);
        setItems(itemsRes.data || []);
        setCategories(categoriesRes.data || []);
      } catch (error) {
        console.warn('Backend API connection failed.');
        toast.error('Unable to load menu from server');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const scrollTarget = searchParams.get('scroll');
    if (scrollTarget) {
      const element = document.getElementById(scrollTarget);
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams]);

  // Strictly vegetarian filter function
  const isVegetarian = (item) => {
    if (item.is_veg === false || item.isVeg === false) return false;
    const nonVegKeywords = ['chicken', 'mutton', 'fish', 'pork', 'beef', 'egg', 'shrimp', 'prawn', 'meat', 'crab', 'lobster'];
    const nameLower = (item.name || '').toLowerCase();
    const descLower = (item.description || '').toLowerCase();
    const catLower = (item.category || '').toLowerCase();
    
    const hasNonVegKeyword = nonVegKeywords.some(keyword => {
      if (nameLower.includes(keyword) || descLower.includes(keyword) || catLower.includes(keyword)) {
        if (keyword === 'egg') {
          const isEggplant = nameLower.includes('eggplant') || descLower.includes('eggplant');
          const isEggless = nameLower.includes('eggless') || descLower.includes('eggless');
          const isVeggie = nameLower.includes('veggie') || descLower.includes('veggie');
          return !(isEggplant || isEggless || isVeggie);
        }
        return true;
      }
      return false;
    });
    
    return !hasNonVegKeyword;
  };

  // Filter items first to be strictly vegetarian
  const vegOnlyItems = items.filter(isVegetarian);

  const filteredItems = selectedCategory
    ? vegOnlyItems.filter((item) => (item.category_slug || item.category) === selectedCategory)
    : [];

  // Helper to handle category select
  const handleCategorySelect = (slug) => {
    setSearchParams({ category: slug });
  };

  const vegetarianCategories = categories.filter(category => {
    const nonVegKeywords = ['chicken', 'mutton', 'fish', 'pork', 'beef', 'non-veg', 'meat', 'prawn', 'shrimp', 'crab', 'lobster'];
    const nameLower = (category.name || '').toLowerCase();
    const slugLower = (category.slug || '').toLowerCase();
    return !nonVegKeywords.some(kw => nameLower.includes(kw) || slugLower.includes(kw));
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
      {/* Category grid: ONLY rendered when no category is selected */}
      {!selectedCategory ? (
        <div className="mb-12 border-b border-rust-100 pb-8">
          <MenuCategories
            onCategorySelect={handleCategorySelect}
            activeCategory={selectedCategory}
          />
        </div>
      ) : (
        <>
          {/* Menu Header / Items Section */}
          <div id="menu-items-section" className="mx-auto max-w-3xl mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 scroll-mt-24">
            <div>
              <p className="text-sm text-rust-500 font-semibold">Strictly vegetarian menu</p>
              <h1 className="text-3xl font-semibold text-slate-900 capitalize">
                {categories.find((c) => c.slug === selectedCategory)?.name || 'Order Food'}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSearchParams({})}
                className="text-sm font-semibold text-rust-500 hover:text-rust-600 hover:underline"
              >
                Back to Categories
              </button>
              <div className="rounded-full border-2 border-rust-200 bg-rust-50 px-4 py-2 text-sm text-slate-700 font-medium">Veg only</div>
            </div>
          </div>

          {/* Premium Horizontal Category Pills */}
          <div className="mx-auto max-w-3xl mb-8 overflow-x-auto flex gap-2 pb-3 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {vegetarianCategories.map((cat) => {
              const isActive = cat.slug === selectedCategory;
              return (
                <button
                  key={cat.slug}
                  onClick={() => handleCategorySelect(cat.slug)}
                  className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 shadow-sm border ${
                    isActive 
                      ? 'bg-rust-500 text-white border-rust-500' 
                      : 'bg-white text-slate-700 border-slate-200 hover:border-rust-200 hover:text-rust-500'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          {loading ? <Loader /> : (
            <div className="mx-auto max-w-3xl w-full">
              {filteredItems.length === 0 ? (
                <div className="rounded-3xl bg-rust-50/50 border border-rust-100 p-12 text-center">
                  <p className="text-lg font-medium text-slate-600">No items found in this category.</p>
                  <button
                    onClick={() => setSearchParams({})}
                    className="mt-4 text-sm font-semibold text-rust-500 hover:text-rust-600 underline"
                  >
                    View all categories
                  </button>
                </div>
              ) : (
                /* Premium list layout (Image, Name & Description on left, Price and '+' button on right) */
                <div className="divide-y divide-rust-100 rounded-2xl border-2 border-rust-200 bg-white shadow-sm overflow-hidden">
                  {filteredItems.map((item) => {
                    const isAvailable = item.is_available ?? true;
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center justify-between gap-4 p-5 transition duration-150 ${isAvailable ? 'hover:bg-rust-50/30' : 'bg-slate-50/80 opacity-75'}`}
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="flex flex-col gap-1 min-w-0 pr-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-slate-900 text-base md:text-lg">{item.name}</span>
                              {!isAvailable && (
                                <span className="bg-red-100 text-red-700 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-200">
                                  ❌ Out of Stock
                                </span>
                              )}
                            </div>
                            {item.description && (
                              <p className="text-xs md:text-sm text-slate-500 font-normal leading-relaxed line-clamp-2">
                                {item.description}
                              </p>
                            )}
                            {!isAvailable && (
                              <p className="text-xs text-rose-600 font-medium italic mt-0.5">
                                This item is currently unavailable.
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                          {parseInt(item.discount || 0) > 0 ? (
                            <div className="flex flex-col items-end">
                              <div className="flex items-center gap-1.5">
                                <span className="text-xs text-slate-400 line-through">₹{parseFloat(item.price).toFixed(2)}</span>
                                <span className="font-bold text-rust-500 text-base md:text-lg">
                                  ₹{(parseFloat(item.price) - (parseFloat(item.price) * parseInt(item.discount) / 100)).toFixed(2)}
                                </span>
                              </div>
                              <span className="bg-rose-100 text-rose-700 text-[10px] font-black px-2 py-0.5 rounded-md mt-0.5">
                                {item.discount}% OFF
                              </span>
                            </div>
                          ) : (
                            <span className="font-bold text-rust-500 text-base md:text-lg">₹{parseFloat(item.price).toFixed(2)}</span>
                          )}
                          <button
                            disabled={!isAvailable}
                            onClick={() => {
                              if (!isAvailable) return;
                              addItem(item);
                              toast.success(`${item.name} added to cart`);
                            }}
                            className={`flex items-center justify-center rounded-full w-10 h-10 text-xl font-bold text-white transition shadow-sm ${
                              isAvailable
                                ? 'bg-rust-500 hover:bg-rust-600 active:scale-95'
                                : 'bg-slate-300 cursor-not-allowed opacity-60'
                            }`}
                            title={!isAvailable ? 'This item is currently unavailable' : 'Add to Cart'}
                          >
                            +
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
