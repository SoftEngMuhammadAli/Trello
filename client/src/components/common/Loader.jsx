function Loader({ label = 'Loading...' }) {
  return (
    <div className="flex items-center gap-3 text-slate-600">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-r-transparent" />
      <span>{label}</span>
    </div>
  );
}

export default Loader;


