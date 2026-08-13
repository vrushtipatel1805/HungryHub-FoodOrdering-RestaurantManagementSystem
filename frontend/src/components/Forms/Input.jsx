export default function Input({ label, error, icon, ...props }) {
  return (
    <label className="block text-sm text-slate-700 w-full">
      {label && <span className="mb-1.5 block font-semibold text-slate-700">{label}</span>}
      <div className="relative">
        {icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            {icon}
          </div>
        )}
        <input
          {...props}
          className={`w-full rounded-2xl border-2 bg-white ${icon ? 'pl-10' : 'px-4'} py-2.5 text-slate-900 outline-none transition focus:border-rust-500 focus:shadow-sm text-sm ${
            error ? 'border-red-400 focus:border-red-500' : 'border-slate-200 focus:border-rust-500'
          }`}
        />
      </div>
      {error && <span className="mt-1 block text-xs text-red-500 font-medium">{error}</span>}
    </label>
  );
}
