import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMenuCategories } from '../../services/orderService';
import Loader from '../Common/Loader';

const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder.jpeg';
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

export default function MenuCategories({ onCategorySelect, activeCategory, featuredOnly }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getMenuCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error("Failed to load categories from backend.", err);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Filter out any potential non-vegetarian categories dynamically
  const vegetarianCategories = categories.filter(category => {
    const nonVegKeywords = ['chicken', 'mutton', 'fish', 'pork', 'beef', 'non-veg', 'meat', 'prawn', 'shrimp', 'crab', 'lobster'];
    const nameLower = (category.name || '').toLowerCase();
    const slugLower = (category.slug || '').toLowerCase();
    return !nonVegKeywords.some(kw => nameLower.includes(kw) || slugLower.includes(kw));
  });

  const sortedCategories = [...vegetarianCategories].sort((a, b) => (a.display_order || 0) - (b.display_order || 0));
  const displayedCategories = featuredOnly
    ? sortedCategories.slice(0, 4)
    : sortedCategories;

  if (loading) return <div className="py-12 text-center text-slate-500 font-medium">Loading Categories...</div>;

  return (
    <section id="menu-categories" className="bg-white py-16 px-4 sm:px-6 lg:px-8 scroll-mt-20">
      <div className="mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-rust-900 sm:text-4xl">
            Explore Our Menu Categories
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
            Discover a wide variety of delicious food and beverages crafted to satisfy every craving.
          </p>
        </div>

        {/* 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {displayedCategories.map((category) => {
            const isActive = activeCategory === category.slug;
            return (
              <div
                key={category.slug}
                onClick={() => onCategorySelect && onCategorySelect(category.slug)}
                className={`group flex flex-col justify-between h-full overflow-hidden rounded-2xl bg-white shadow-md transition-all duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl ${
                  onCategorySelect ? 'cursor-pointer' : ''
                } ${
                  isActive
                    ? 'border-2 border-rust-500 ring-4 ring-rust-500/10'
                    : 'border border-rust-100'
                }`}
              >
                {/* Image Container with Zoom effect on hover */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-100">
                  <img
                    src={getImageUrl(category.image)}
                    alt={category.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                  />
                  {/* Light orange gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-rust-900/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </div>

                {/* Card Body & Button */}
                <div className="flex flex-grow flex-col items-center justify-between p-6 text-center">
                  <h3 className="mb-5 text-lg font-bold text-rust-900 transition-colors duration-200 group-hover:text-rust-500">
                    {category.name}
                  </h3>
                  
                  {onCategorySelect ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onCategorySelect(category.slug);
                      }}
                      className={`inline-flex items-center justify-center rounded-full px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.03] active:scale-[0.98] ${
                        isActive
                          ? 'bg-rust-700 hover:bg-rust-800'
                          : 'bg-rust-500 hover:bg-rust-600'
                      }`}
                    >
                      {isActive ? 'Selected' : 'View More'}
                    </button>
                  ) : (
                    <Link
                      to={category.route}
                      className="inline-flex items-center justify-center rounded-full bg-rust-500 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-rust-600 hover:shadow-md hover:scale-[1.03] active:scale-[0.98]"
                    >
                      View More
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* View Full Menu Button for homepage featured view */}
        {featuredOnly && (
          <div className="mt-12 text-center">
            <Link
              to="/menu"
              className="inline-flex items-center justify-center rounded-full bg-rust-500 px-8 py-3 text-base font-bold text-white shadow-md transition-all duration-200 hover:bg-rust-600 hover:shadow-lg hover:scale-[1.03] active:scale-[0.98]"
            >
              View Full Items
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
