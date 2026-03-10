import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-app px-4 text-center text-app">
      <p className="inline-flex items-center gap-2 rounded-full border border-app bg-panel-soft px-4 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">
        <span className="app-dot" />
        Missing route
      </p>
      <h1 className="text-6xl font-black tracking-tight">404</h1>
      <p className="max-w-md text-app-muted">The page you requested does not exist or was moved to another path.</p>
      <Link to="/dashboard" className="rounded-xl bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-accent-strong">
        Back to dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;
