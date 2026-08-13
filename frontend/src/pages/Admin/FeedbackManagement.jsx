import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Star, 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  CornerUpLeft, 
  Trash2, 
  Filter, 
  MessageCircle,
  EyeOff
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function FeedbackManagement() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [replyingFeedback, setReplyingFeedback] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [starFilter, setStarFilter] = useState('All');

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/feedback/');
      setFeedbacks(res.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load feedback entries.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (item) => {
    const updatedStatus = !item.is_approved;
    try {
      await api.patch(`/feedback/${item.id}/`, { is_approved: updatedStatus });
      setFeedbacks(prev => prev.map(f => f.id === item.id ? { ...f, is_approved: updatedStatus } : f));
      toast.success(updatedStatus ? 'Feedback approved for public website display!' : 'Feedback hidden from website.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update feedback approval status.');
    }
  };

  const handleToggleResolved = async (item) => {
    const updatedStatus = !item.is_resolved;
    try {
      await api.patch(`/feedback/${item.id}/`, { is_resolved: updatedStatus });
      setFeedbacks(prev => prev.map(f => f.id === item.id ? { ...f, is_resolved: updatedStatus } : f));
      toast.success(updatedStatus ? 'Marked as resolved.' : 'Marked as pending resolution.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update resolution status.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this customer feedback entry?')) return;
    try {
      await api.delete(`/feedback/${id}/`);
      setFeedbacks(prev => prev.filter(f => f.id !== id));
      toast.success('Feedback entry deleted.');
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete feedback.');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await api.patch(`/feedback/${replyingFeedback.id}/`, {
        reply: replyText,
        is_resolved: true
      });
      setFeedbacks(prev => prev.map(f => f.id === replyingFeedback.id ? { ...f, reply: replyText, is_resolved: true } : f));
      toast.success('Reply saved and review marked as resolved.');
      setReplyingFeedback(null);
      setReplyText('');
    } catch (err) {
      console.error(err);
      toast.error('Failed to save reply.');
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    const matchesStars = starFilter === 'All' || f.rating.toString() === starFilter;
    return matchesStars;
  });

  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Feedback Management</h1>
          <p className="text-slate-500 dark:text-slate-400">Moderate customer ratings, approve reviews for website displays, and draft official reply resolutions.</p>
        </div>
      </div>

      {/* Filter rating */}
      <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl shadow-xs border border-slate-100 dark:border-slate-800 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Filter by Stars:</span>
        </div>
        <div className="flex bg-slate-150 dark:bg-slate-900 p-1 rounded-xl text-xs font-semibold">
          {['All', '5', '4', '3', '2', '1'].map(stars => (
            <button
              key={stars}
              onClick={() => setStarFilter(stars)}
              className={`px-3.5 py-1.5 rounded-lg transition ${starFilter === stars ? 'bg-white dark:bg-slate-805 shadow-xs font-bold text-emerald-600' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
            >
              {stars} {stars !== 'All' && '★'}
            </button>
          ))}
        </div>
      </div>

      {/* Feedbacks grid */}
      {loading ? (
        <div className="py-12 text-center text-slate-400 font-bold animate-pulse flex items-center justify-center gap-2">
          <MessageCircle className="w-4 h-4 animate-spin text-emerald-500" /> Loading customer reviews...
        </div>
      ) : filteredFeedbacks.length === 0 ? (
        <div className="bg-white dark:bg-slate-950 rounded-2xl p-12 text-center border border-slate-100 dark:border-slate-800 shadow-xs">
          <p className="text-slate-500 font-bold">No feedback entries match your star selection filter.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredFeedbacks.map(item => (
            <div key={item.id} className="bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xs p-5 space-y-4 hover:shadow-md transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-850 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-450 flex items-center justify-center font-bold text-base shadow-xs">
                    {item.name ? item.name.charAt(0).toUpperCase() : 'C'}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">{item.name}</h3>
                    <p className="text-[10px] text-slate-400 font-mono">{item.email} • {item.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Rating Stars */}
                  <div className="flex items-center text-amber-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-3.5 h-3.5 ${star <= item.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200 dark:text-slate-700'}`} />
                    ))}
                    <span className="ml-1.5 text-xs font-black text-slate-700 dark:text-slate-300">{item.rating}/5</span>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${
                    item.is_approved 
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  }`}>
                    {item.is_approved ? 'Approved Display' : 'Pending Approval'}
                  </span>
                </div>
              </div>

              {/* Message */}
              <div className="text-xs text-slate-700 dark:text-slate-350 space-y-2">
                <p className="italic font-medium leading-relaxed">"{item.message}"</p>
                {item.order_id && (
                  <span className="inline-block text-[10px] font-mono bg-slate-100 dark:bg-slate-900 text-slate-500 px-2 py-0.5 rounded-md border dark:border-slate-800">
                    Linked Order ID: #{item.order_id}
                  </span>
                )}
              </div>

              {/* Admin Reply preview */}
              {item.reply && (
                <div className="bg-slate-50 dark:bg-slate-900 border-l-4 border-emerald-500 p-3.5 rounded-r-xl text-xs space-y-1 font-semibold text-slate-650 dark:text-slate-400">
                  <span className="font-extrabold text-emerald-700 dark:text-emerald-450 flex items-center gap-1">
                    <CornerUpLeft className="w-3.5 h-3.5" /> Admin Official Response:
                  </span>
                  <p>{item.reply}</p>
                </div>
              )}

              {/* Actions Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleApproval(item)}
                    className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                      item.is_approved
                        ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 hover:bg-amber-100 border border-amber-200/50'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                    }`}
                  >
                    {item.is_approved ? <><EyeOff className="w-3.5 h-3.5" /> Hide Review</> : <><CheckCircle className="w-3.5 h-3.5" /> Approve Review</>}
                  </button>

                  <button
                    onClick={() => {
                      setReplyingFeedback(item);
                      setReplyText(item.reply || '');
                    }}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold transition flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> {item.reply ? 'Edit Response' : 'Draft Response'}
                  </button>

                  <button
                    onClick={() => handleToggleResolved(item)}
                    className={`px-3 py-1.5 rounded-xl font-bold border transition ${
                      item.is_resolved
                        ? 'bg-slate-50 dark:bg-slate-900 border-slate-250 text-slate-600'
                        : 'bg-teal-50 dark:bg-teal-950/20 border-teal-200 text-teal-700 hover:bg-teal-100'
                    }`}
                  >
                    {item.is_resolved ? '✓ Resolved Case' : 'Mark Resolved'}
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(item.id)}
                  className="px-3 py-1.5 text-rose-600 hover:bg-rose-50 rounded-xl font-bold transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reply Modal */}
      <AnimatePresence>
        {replyingFeedback && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="fixed inset-0" onClick={() => setReplyingFeedback(null)}></div>
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border dark:border-slate-800 z-50"
            >
              <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
                <h2 className="text-base font-extrabold">Compose Response to {replyingFeedback.name}</h2>
                <button onClick={() => setReplyingFeedback(null)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
              </div>
              <div className="text-xs bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-xl italic text-slate-500 border dark:border-slate-850">
                "{replyingFeedback.message}"
              </div>
              <form onSubmit={handleSendReply} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-550 mb-1">Official Response Message</label>
                  <textarea
                    rows="4"
                    required
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full px-3 py-2 border dark:border-slate-850 dark:bg-slate-950 rounded-xl focus:border-emerald-500 font-semibold leading-relaxed"
                    placeholder="We appreciate your valuable feedback. Our culinary team has been informed..."
                  ></textarea>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setReplyingFeedback(null)}
                    className="px-4 py-2 border dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-950 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md"
                  >
                    Publish Response
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
