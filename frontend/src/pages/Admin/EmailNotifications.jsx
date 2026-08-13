import React, { useState } from 'react';
import { 
  Mail, 
  Send, 
  Eye, 
  CheckCircle, 
  User, 
  FileText, 
  Sparkles, 
  BellRing 
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function EmailNotifications() {
  const [selectedTemplate, setSelectedTemplate] = useState('new_menu');
  const [recipientGroup, setRecipientGroup] = useState('all');
  const [showPreview, setShowPreview] = useState(false);

  const TEMPLATES = {
    new_menu: {
      title: 'New Menu Launch',
      subject: '✨ Introducing 8 New Gourmet 100% Veg Specialties at HungryHub!',
      body: `Exciting News!\n\nOur Master Chefs have curated 8 brand-new 100% vegetarian culinary masterpieces including Cheese Ka Khazana sizzlers, Tandoor Ke Sholay, and artisanal smoothies.\n\nExplore the updated menu on our website or visit us today!\n\nHungryHub Ahmedabad`
    }
  };

  const currentTemplate = TEMPLATES[selectedTemplate];
  const [subject, setSubject] = useState(currentTemplate.subject);
  const [body, setBody] = useState(currentTemplate.body);

  const handleSelectTemplate = (key) => {
    setSelectedTemplate(key);
    setSubject(TEMPLATES[key].subject);
    setBody(TEMPLATES[key].body);
  };

  const [sending, setSending] = useState(false);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    try {
      setSending(true);
      const res = await api.post('/admin/notifications/send/', {
        notification_type: 'email',
        recipients_type: recipientGroup,
        title: subject,
        message: body
      });
      if (res.data?.ok) {
        toast.success(res.data.message || 'Broadcast email dispatched successfully!');
      } else {
        toast.error(res.data?.error || 'Failed to send broadcast email.');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to communicate with notification server.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6 text-sm">
      <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Email Notifications</h1>
        <p className="text-slate-500 dark:text-slate-400">Broadcast the official New Menu Launch email to your selected customer segments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Template List Selector */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-4 space-y-2 self-start shadow-xs">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2 mb-3">Email Templates ({Object.keys(TEMPLATES).length})</h2>
          {Object.keys(TEMPLATES).map(key => (
            <button
              key={key}
              onClick={() => handleSelectTemplate(key)}
              className={`w-full text-left p-3 rounded-xl text-xs font-bold transition flex items-center justify-between border ${
                selectedTemplate === key
                  ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-400 border-emerald-250'
                  : 'border-transparent text-slate-655 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Mail className={`w-4 h-4 ${selectedTemplate === key ? 'text-emerald-600' : 'text-slate-400'}`} />
                {TEMPLATES[key].title}
              </span>
              {selectedTemplate === key && <span className="text-emerald-600">●</span>}
            </button>
          ))}
        </div>

        {/* Email Editor */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-800 p-6 space-y-5 shadow-xs">
          <div className="flex items-center justify-between border-b dark:border-slate-850 pb-3">
            <h2 className="text-base font-bold">Edit {currentTemplate.title} Template</h2>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition"
            >
              <Eye className="w-4 h-4" /> Live Preview
            </button>
          </div>

          <form onSubmit={handleSendEmail} className="space-y-4 text-xs font-semibold text-slate-700 dark:text-slate-350">
            <div>
              <label className="block font-bold text-slate-500 mb-1">Target Recipient Segment *</label>
              <select
                value={recipientGroup}
                onChange={(e) => setRecipientGroup(e.target.value)}
                className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl"
              >
                <option value="all">All Registered Customers (Active Database)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-500 mb-1">Email Subject Line *</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-3 py-2 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-bold focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-500 mb-1">Email Body Content *</label>
              <textarea
                rows="11"
                required
                value={body}
                onChange={(e) => setBody(e.target.value)}
                className="w-full p-3.5 border dark:border-slate-800 dark:bg-slate-950 rounded-xl font-mono text-xs leading-relaxed"
              ></textarea>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t dark:border-slate-850">
              <button
                type="button"
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 border dark:border-slate-800 text-slate-600 dark:text-slate-400 font-bold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition"
              >
                Preview Email
              </button>
              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold shadow-md"
              >
                <Send className="w-4 h-4" /> {sending ? 'Sending...' : 'Send Broadcast Email'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Live Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="fixed inset-0" onClick={() => setShowPreview(false)}></div>
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 border dark:border-slate-800 z-50">
            <div className="flex items-center justify-between border-b pb-3 dark:border-slate-800">
              <h2 className="text-base font-extrabold flex items-center gap-1.5">
                <BellRing className="w-5 h-5 text-emerald-500" /> Email Live Preview
              </h2>
              <button onClick={() => setShowPreview(false)} className="text-slate-450 hover:text-slate-600 font-bold">✕</button>
            </div>
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden text-xs font-semibold">
              <div className="bg-slate-50 dark:bg-slate-950/80 p-3 space-y-1 border-b dark:border-slate-800 text-slate-500">
                <div><span className="font-bold text-slate-400">From:</span> HungryHub Restaurant &lt;notifications@hungryhub.com&gt;</div>
                <div><span className="font-bold text-slate-400">To:</span> {recipientGroup === 'all' ? 'All Registered Users' : 'Target Customer Segment'}</div>
                <div><span className="font-bold text-slate-400">Subject:</span> {subject}</div>
              </div>
              <div className="p-5 bg-white text-slate-800 space-y-4 whitespace-pre-line font-sans">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <span className="text-xl">🌿</span>
                  <span className="font-bold text-emerald-700 text-base">HungryHub 100% Pure Veg</span>
                </div>
                <div>{body}</div>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowPreview(false)}
                className="px-5 py-2 bg-slate-850 hover:opacity-95 text-white rounded-xl text-xs font-bold"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
