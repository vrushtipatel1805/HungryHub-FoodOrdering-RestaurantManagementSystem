export default function PrimaryButton({ children, className = '', ...props }) {
  return (
    <button
      {...props}
      className={`rounded-full bg-rust-500 px-4 py-2.5 font-medium text-white transition hover:bg-rust-600 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}
