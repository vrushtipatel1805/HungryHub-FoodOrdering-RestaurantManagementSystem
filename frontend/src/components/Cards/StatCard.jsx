export default function StatCard({ title, value, subtitle, accent = 'rust' }) {
  const accentClasses = {
    rust: 'from-rust-50 to-rust-100 border-rust-200 text-rust-600',
    emerald: 'from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-600',
    sky: 'from-sky-50 to-sky-100 border-sky-200 text-sky-600',
  };

  return (
    <div className={`rounded-2xl border-2 bg-gradient-to-br ${accentClasses[accent]} p-5 shadow-md`}>
      <p className="text-sm text-slate-600 font-medium">{title}</p>
      <h3 className="mt-2 text-2xl font-semibold text-slate-900">{value}</h3>
      <p className="mt-2 text-sm text-slate-600">{subtitle}</p>
    </div>
  );
}
