import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import MenuCategories from '../../components/Cards/MenuCategories';
import api from '../../services/api';

const gallery = [
  '/home1.jpeg',
  '/home2.jpeg',
  '/home3.jpeg',
];

const ratings = [4.8];

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

export default function Home() {
  const [searchParams] = useSearchParams();
  useEffect(() => {
    if (searchParams.get('scroll') === 'menu-categories') {
      const element = document.getElementById('menu-categories');
      if (element) {
        const timer = setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth' });
        }, 150);
        return () => clearTimeout(timer);
      }
    }
  }, [searchParams]);

  return (
    <div className="pb-16">
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-24">
        <div className="space-y-6">
          <div className="inline-flex rounded-full border border-rust-200 bg-rust-50 px-3 py-1 text-sm text-rust-600">
            Authentic dining • Fast delivery • Premium service
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-slate-900 sm:text-5xl">HungryHub</h1>
          <p className="max-w-xl text-lg text-slate-600">
            Experience modern Indian dining with a contemporary twist. From handcrafted vegetarian platters to warm hospitality, HungryHub delivers a refined restaurant experience for every occasion.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/order-now">
              <PrimaryButton>Order Now</PrimaryButton>
            </Link>
            <Link to="/reserve" className="rounded-full border-2 border-rust-500 px-4 py-2.5 font-medium text-rust-500 transition hover:bg-rust-50">Reserve Table</Link>
          </div>
          <div className="inline-flex rounded-full border-2 border-rust-200 bg-rust-50 px-4 py-2">
            {ratings.map((rating) => (
              <div key={rating} className="flex items-center gap-2 text-sm text-slate-700">
                <FiStar className="text-rust-500" />
                <span>{rating.toFixed(1)} Avg Rating</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          {gallery.map((image, index) => (
            <img 
              key={index} 
              src={image} 
              alt="Restaurant ambience" 
              className={`h-56 w-full rounded-3xl object-cover shadow-lg ${index === 0 ? 'sm:col-span-2' : ''}`}
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1495195129352-aeb325a55b65?auto=format&fit=crop&q=80&w=400';
              }}
            />
          ))}
        </div>
      </section>

      {/* Menu Categories Section */}
      <MenuCategories featuredOnly={true} />

      <section className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="rounded-[2rem] border-2 border-rust-200 bg-rust-50 p-8">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <p className="text-sm text-rust-500 font-semibold">Customer love</p>
              <h2 className="text-2xl font-semibold text-slate-900">Why guests keep coming back</h2>
            </div>
            <Link to="/about" className="text-sm text-slate-600 hover:text-rust-500 font-medium">About us</Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {['Freshly prepared vegetarian cuisine', 'Fast delivery and polished service', 'Elegant dine-in ambience for groups'].map((feature) => (
              <div key={feature} className="rounded-2xl border-2 border-rust-200 bg-white p-5 shadow-sm hover:shadow-md transition">
                <p className="text-slate-700">{feature}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
