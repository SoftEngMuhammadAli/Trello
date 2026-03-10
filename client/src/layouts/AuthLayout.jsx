import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { loginUser } from '../features/auth/authSlice';

function AuthLayout({ title, subtitle, children, footer }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [demoLoading, setDemoLoading] = useState(false);

  const openDemoDashboard = async () => {
    if (demoLoading) return;
    setDemoLoading(true);
    const result = await dispatch(
      loginUser({ email: 'demo@trelloclone.dev', password: 'password123' }),
    );
    setDemoLoading(false);

    if (loginUser.fulfilled.match(result)) {
      toast.success('Demo session started');
      navigate('/dashboard');
      return;
    }

    toast.error(result.payload || 'Demo user unavailable. Run server seed first.');
  };

  return (
    <div className="min-h-screen bg-app px-4 py-6 text-app sm:px-6 sm:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-6xl overflow-hidden rounded-3xl border border-app bg-panel shadow-soft lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative hidden overflow-hidden border-r border-app p-8 lg:block">
          <div className="absolute -left-24 -top-24 h-64 w-64 rounded-full bg-brand-500/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-emerald-400/25 blur-3xl" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <p className="inline-flex items-center gap-2 rounded-full border border-app bg-panel-soft px-4 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-app-muted">
                <span className="app-dot" />
                Flowllo Platform
              </p>
              <h2 className="mt-7 text-5xl font-black leading-tight tracking-tight text-app">
                Work orchestration,
                <br />
                but beautiful.
              </h2>
              <p className="mt-5 max-w-xl text-base text-app-muted">
                Plan projects, move tasks at speed, and collaborate in real time with a board workspace designed for focus.
              </p>
            </div>

            <div className="rounded-2xl border border-app bg-panel-soft p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">Included</p>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                {['Live board updates', 'Filters and search', 'Rich card details', 'Member workflows'].map((item) => (
                  <div key={item} className="rounded-lg border border-app bg-panel px-3 py-2 font-medium text-app">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="flex items-center justify-center p-4 sm:p-6 lg:p-8">
          <div className="w-full max-w-md rounded-2xl border border-app bg-panel-soft p-6 shadow-soft sm:p-8">
            <h1 className="text-3xl font-black tracking-tight text-app">{title}</h1>
            <p className="mt-2 text-sm text-app-muted">{subtitle}</p>

            <div className="mt-6">{children}</div>

            {footer ? <div className="mt-5 text-sm text-app-muted">{footer}</div> : null}
            <div className="mt-4 text-center text-xs text-app-muted">
              <button
                className="font-semibold text-accent underline underline-offset-4 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={openDemoDashboard}
                disabled={demoLoading}
              >
                {demoLoading ? 'Opening demo...' : 'Open demo dashboard'}
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AuthLayout;
