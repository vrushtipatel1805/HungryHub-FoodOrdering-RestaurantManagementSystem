export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-4xl items-center justify-center px-4 py-20">
      <div className="rounded-[2rem] border-2 border-rust-200 bg-rust-50 p-10 text-center shadow-md">
        <p className="text-sm text-rust-500 font-bold">404</p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-900">Page not found</h1>
        <p className="mt-3 text-slate-600">The page you are looking for does not exist.</p>
      </div>
    </div>
  );
}
