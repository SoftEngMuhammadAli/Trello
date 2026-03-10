function Loader({ label = 'Loading...' }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-app bg-panel px-4 py-2 text-app-muted">
      <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-brand-600 border-r-transparent" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}

export default Loader;
