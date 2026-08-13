import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { FiStar } from 'react-icons/fi';
import Input from '../../components/Forms/Input';
import PrimaryButton from '../../components/Buttons/PrimaryButton';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function Feedback() {
  const { user } = useAuth();
  const [form, setForm] = useState({
    name: user && user.name !== 'Guest' ? user.name || '' : '',
    email: user && user.name !== 'Guest' ? user.email || '' : '',
    rating: 5,
    message: ''
  });
  const [loading, setLoading] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);

  useEffect(() => {
    if (user && user.name !== 'Guest') {
      setForm((prev) => ({
        ...prev,
        name: prev.name || user.name || '',
        email: prev.email || user.email || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    const loadFeedbacks = async () => {
      try {
        const response = await api.get('/feedback/approved/');
        if (response.data && response.data.length > 0) {
          setFeedbacks(response.data);
          return;
        }
      } catch (err) {
        console.warn("Backend feedback fetch failed. Loading local data.");
      }
      const saved = localStorage.getItem('hungryhub_feedbacks');
      if (saved) {
        setFeedbacks(JSON.parse(saved));
      }
    };
    loadFeedbacks();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const payload = {
      name: form.name,
      email: form.email,
      rating: Number(form.rating),
      message: form.message
    };

    let backendFeedback = null;
    try {
      const response = await api.post('/feedback/', payload);
      backendFeedback = response.data;
    } catch (err) {
      console.warn("Backend feedback submit failed. Saving locally.", err);
    }

    const newFeedback = backendFeedback || {
      id: Date.now(),
      name: form.name,
      rating: Number(form.rating),
      message: form.message,
      date: new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };

    const updated = [newFeedback, ...feedbacks];
    setFeedbacks(updated);
    localStorage.setItem('hungryhub_feedbacks', JSON.stringify(updated));

    toast.success('Thank you for your feedback!');
    setForm({
      name: user && user.name !== 'Guest' ? user.name || '' : '',
      email: user && user.name !== 'Guest' ? user.email || '' : '',
      rating: 5,
      message: ''
    });
    setLoading(false);
  };

  return (
    <div className="animate-fade-in">
      {/* 1. Hero/Header Image (Full Width) */}
      <div className="relative h-[250px] md:h-[400px] w-full overflow-hidden bg-slate-100 border-b-2 border-rust-100">
        <img 
          src="/feedback.jpeg" 
          alt="Guest Welcoming Dining Atmosphere" 
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-center p-6">
          <h1 className="text-white text-3xl md:text-5xl font-black tracking-tight drop-shadow-md">Feedback</h1>
          <p className="text-white/90 text-xs md:text-sm mt-2 md:mt-4 max-w-lg font-light drop-shadow-md leading-relaxed">
            Help us make your dining experiences even better.
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        {/* 2. Share Your Feedback Section */}
        <div className="text-center mb-12">
          <span className="text-xs text-rust-500 font-bold uppercase tracking-widest block mb-2">Guest Opinion</span>
          <h2 className="text-3xl font-black text-slate-900 leading-tight">Share Your Feedback</h2>
          <p className="mt-3 text-slate-500 text-sm max-w-xl mx-auto leading-relaxed font-light">
            Help us improve by sharing your dining experience with us.
          </p>
        </div>

        {/* 3. Feedback Form Container */}
        <div className="max-w-3xl mx-auto flex flex-col gap-8 mb-20">
          {/* Form Block */}
          <div className="rounded-[2rem] border-2 border-rust-200 bg-white p-8 shadow-md">
            <form className="space-y-4" onSubmit={handleSubmit}>
              <Input label="Your Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Email Address" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              <label className="block text-sm text-slate-700 font-medium">
                <span className="mb-2 block text-xs font-semibold text-slate-700">Rating</span>
                <select 
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 focus:border-rust-500 focus:outline-none text-sm font-semibold" 
                  value={form.rating} 
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                >
                  <option value={5}>⭐⭐⭐⭐⭐ Excellent</option>
                  <option value={4}>⭐⭐⭐⭐ Very Good</option>
                  <option value={3}>⭐⭐⭐ Good</option>
                  <option value={2}>⭐⭐ Fair</option>
                  <option value={1}>⭐ Poor</option>
                </select>
              </label>
              <label className="block text-sm text-slate-700 font-medium">
                <span className="mb-2 block text-xs font-semibold text-slate-700">Message</span>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={5}
                  className="w-full rounded-2xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-rust-500 text-sm leading-relaxed"
                  placeholder="Share your experience..."
                  required
                />
              </label>
              <PrimaryButton className="w-full py-4 font-bold text-sm" type="submit" disabled={loading}>
                {loading ? 'Sending...' : 'Submit Feedback'}
              </PrimaryButton>
            </form>
          </div>

          {/* Feedback List Section */}
          {feedbacks.length > 0 && (
            <div className="flex flex-col gap-6 mt-4">
              <h2 className="text-2xl font-bold text-slate-900">Recent Guest Feedback</h2>
              <div className="flex flex-col gap-4">
                {feedbacks.map((item) => (
                  <div key={item.id} className="rounded-2xl border-2 border-rust-200 bg-white p-6 shadow-sm hover:shadow-md transition duration-300">
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <span className="text-xs text-slate-400">
                        {item.created_at 
                          ? new Date(item.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
                          : item.date}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 my-2">
                      {[...Array(5)].map((_, i) => (
                        <FiStar 
                          key={i} 
                          className={`h-4 w-4 ${i < item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                        />
                      ))}
                    </div>
                    <p className="text-sm text-slate-600 italic leading-relaxed">"{item.message}"</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* 4. Why Your Feedback Matters Section */}
        <div className="rounded-[2rem] border-2 border-rust-200 bg-gradient-to-br from-rust-50 to-white p-8 md:p-12 shadow-md">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-slate-900">Why Your Feedback Matters</h2>
            <p className="mt-3 text-slate-600 max-w-2xl mx-auto font-light leading-relaxed text-sm">
              Your dining experiences and reviews direct our improvements. Here is how your suggestions help build a better HungryHub:
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              "Help us understand your preferences",
              "Improve our menu and service",
              "Build a better dining experience",
              "Be part of our community"
            ].map((text, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-4 p-5 rounded-2xl border-2 border-rust-200 bg-white shadow-sm hover:shadow-md transition duration-300"
              >
                <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-rust-100 text-rust-500 font-bold text-sm">✓</span>
                <span className="text-sm font-semibold text-slate-800">{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
