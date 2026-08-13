import { useState, useEffect } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { getMenuCategories } from '../../services/orderService';
import api from '../../services/api';

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

export default function MenuBrowser({ isOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (isOpen) {
      const loadCategories = async () => {
        try {
          const catResponse = await getMenuCategories();
          setCategories(catResponse.data || []);
        } catch (err) {
          console.error("Failed to load categories in MenuBrowser", err);
        }
      };
      loadCategories();
    }
  }, [isOpen]);

  // Filter categories to only vegetarian
  const vegetarianCategories = categories.filter(category => {
    const nonVegKeywords = ['chicken', 'mutton', 'fish', 'pork', 'beef', 'non-veg', 'meat', 'prawn', 'shrimp', 'crab', 'lobster'];
    const nameLower = (category.name || '').toLowerCase();
    const slugLower = (category.slug || '').toLowerCase();
    return !nonVegKeywords.some(kw => nameLower.includes(kw) || slugLower.includes(kw));
  });

  if (!isOpen) return null;

  const handleCategoryClick = (categorySlug) => {
    if (location.pathname === '/menu') {
      setSearchParams({ category: categorySlug, scroll: 'menu-items-section' });
      setTimeout(() => {
        const element = document.getElementById('menu-items-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      navigate(`/menu?category=${categorySlug}&scroll=menu-items-section`);
    }
  };

  return (
    <div
      style={{ top: 'var(--navbar-height, 73px)' }}
      className="fixed inset-x-0 bottom-0 z-40 flex flex-col bg-rust-900/98 backdrop-blur-2xl text-white overflow-hidden animate-fade-in"
    >
      {/* Main Container */}
      <div className="flex-1 overflow-y-auto px-6 py-8 md:px-12 md:py-12 max-w-7xl mx-auto w-full">
        <div>


          <h3 className="text-lg font-semibold mb-6 text-amber-400">
            Browse Menu Categories
          </h3>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {vegetarianCategories.map(category => (
              <div
                key={category.slug}
                onClick={() => handleCategoryClick(category.slug)}
                className="group relative h-40 rounded-2xl overflow-hidden cursor-pointer shadow-md border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-amber-400/30"
              >
                {/* Category Image */}
                <img
                  src={getImageUrl(category.image)}
                  alt={category.name}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Dark overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-rust-950/90 via-rust-950/40 to-transparent" />
                
                {/* Title */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h4 className="text-sm font-bold text-white tracking-wide group-hover:text-amber-400 transition-colors duration-200">
                    {category.name}
                  </h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
