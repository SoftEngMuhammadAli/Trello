import { Link } from 'react-router-dom';

function AuthLayout({ title, subtitle, children, footer }) {
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-soft backdrop-blur">
        <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-600">{subtitle}</p>

        <div className="mt-6">{children}</div>

        {footer ? <div className="mt-4 text-sm text-slate-600">{footer}</div> : null}
        <div className="mt-4 text-center text-xs text-slate-500">
          <Link to="/dashboard" className="underline">
            Demo dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default AuthLayout;
