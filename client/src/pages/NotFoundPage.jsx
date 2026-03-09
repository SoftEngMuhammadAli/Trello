import { Link } from 'react-router-dom';

function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 text-center">
      <h1 className="text-4xl font-bold text-slate-900">404</h1>
      <p className="text-slate-600">The page you requested does not exist.</p>
      <Link to="/dashboard" className="rounded-lg bg-brand-600 px-4 py-2 text-white">
        Back to dashboard
      </Link>
    </div>
  );
}

export default NotFoundPage;


