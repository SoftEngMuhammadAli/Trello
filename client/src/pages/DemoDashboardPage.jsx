import { Link } from 'react-router-dom';
import Button from '../components/common/Button';

const previewWorkspaces = [
  { id: 'ws-product', name: 'Product Launch', projects: 8 },
  { id: 'ws-growth', name: 'Growth Ops', projects: 5 },
  { id: 'ws-design', name: 'Design System', projects: 3 },
];

const previewBoards = [
  {
    id: 'board-q2',
    title: 'Q2 Launch Roadmap',
    accent: 'linear-gradient(135deg, #0f766e, #06b6d4)',
    updated: 'Mar 11',
    tasks: 24,
  },
  {
    id: 'board-mobile',
    title: 'Mobile App Refresh',
    accent: 'linear-gradient(135deg, #1d4ed8, #38bdf8)',
    updated: 'Mar 9',
    tasks: 17,
  },
  {
    id: 'board-content',
    title: 'Content Production',
    accent: 'linear-gradient(135deg, #7c2d12, #f97316)',
    updated: 'Mar 8',
    tasks: 11,
  },
  {
    id: 'board-support',
    title: 'Customer Success Queue',
    accent: 'linear-gradient(135deg, #312e81, #8b5cf6)',
    updated: 'Mar 7',
    tasks: 29,
  },
];

const previewTasks = [
  { id: 'task-1', title: 'Finalize pricing page copy', column: 'Review', owner: 'Aisha', due: 'Today' },
  { id: 'task-2', title: 'QA checklist for release candidate', column: 'Doing', owner: 'Marcus', due: 'Tomorrow' },
  { id: 'task-3', title: 'Ship onboarding tooltip updates', column: 'Ready', owner: 'Nina', due: 'Mar 14' },
  { id: 'task-4', title: 'Prepare investor update deck', column: 'Backlog', owner: 'Ray', due: 'Mar 18' },
];

const previewActivity = [
  'Design feedback resolved on the launch board',
  'Sprint planning notes synced into the roadmap',
  'Two blockers flagged for engineering review',
];

function DemoDashboardPage() {
  return (
    <div className="min-h-screen bg-app text-app">
      <div className="mx-auto min-h-screen max-w-7xl p-4 sm:p-6">
        <div className="grid min-h-[calc(100vh-2rem)] overflow-hidden rounded-[2rem] border border-app bg-panel shadow-soft lg:grid-cols-[19rem_1fr]">
          <aside className="border-b border-app bg-panel-soft p-4 lg:border-b-0 lg:border-r lg:p-5">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-accent text-lg font-black text-white">
                FL
              </span>
              <div>
                <p className="text-2xl font-black tracking-tight">Flowllo</p>
                <p className="text-[11px] uppercase tracking-[0.18em] text-app-muted">Demo Preview</p>
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-app bg-panel p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">Read only</p>
              <h1 className="mt-2 text-2xl font-black tracking-tight">Public dashboard preview</h1>
              <p className="mt-2 text-sm text-app-muted">
                This page is open to unauthenticated visitors. Sign in to create boards, move cards, and collaborate live.
              </p>
            </div>

            <section className="mt-6">
              <p className="px-2 text-xs font-bold uppercase tracking-[0.14em] text-app-muted">Sample spaces</p>
              <div className="mt-2 space-y-2">
                {previewWorkspaces.map((workspace) => (
                  <div key={workspace.id} className="rounded-2xl border border-app bg-panel px-4 py-3">
                    <p className="text-sm font-semibold">{workspace.name}</p>
                    <p className="mt-1 text-xs text-app-muted">{workspace.projects} active projects</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-6">
              <p className="px-2 text-xs font-bold uppercase tracking-[0.14em] text-app-muted">Why sign in</p>
              <div className="mt-2 space-y-2">
                {['Realtime board updates', 'Workspace and member management', 'Card comments, files, and search'].map(
                  (item) => (
                    <div key={item} className="rounded-2xl border border-app bg-panel px-4 py-3 text-sm font-medium">
                      {item}
                    </div>
                  ),
                )}
              </div>
            </section>
          </aside>

          <main className="min-w-0 bg-app">
            <header className="border-b border-app px-4 py-4 sm:px-6">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="inline-flex items-center gap-2 rounded-full border border-app bg-panel-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">
                    <span className="app-dot" />
                    Workspace overview
                  </p>
                  <h2 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">See the product before you sign in</h2>
                  <p className="mt-2 max-w-2xl text-sm text-app-muted sm:text-base">
                    Explore the structure of the dashboard, boards, and daily execution flow. Interactive actions stay locked until authentication.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Link to="/login">
                    <Button>Sign in</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="secondary">Create account</Button>
                  </Link>
                </div>
              </div>
            </header>

            <div className="space-y-6 p-4 sm:p-6">
              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  { label: 'Boards', value: '14' },
                  { label: 'Members', value: '08' },
                  { label: 'Tasks due today', value: '06' },
                  { label: 'Automations', value: '12' },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-2xl border border-app bg-panel p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-app-muted">{stat.label}</p>
                    <p className="mt-2 text-3xl font-black tracking-tight">{stat.value}</p>
                  </div>
                ))}
              </section>

              <section className="rounded-3xl border border-app bg-panel p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black tracking-tight">Featured boards</h3>
                    <p className="mt-1 text-sm text-app-muted">Representative projects shown in preview mode.</p>
                  </div>
                  <span className="rounded-full border border-app bg-panel-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-app-muted">
                    Demo only
                  </span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {previewBoards.map((board) => (
                    <div
                      key={board.id}
                      className="overflow-hidden rounded-2xl border border-white/15 shadow-soft"
                      style={{ background: board.accent }}
                    >
                      <div className="bg-black/35 p-4 text-white">
                        <p className="text-lg font-black tracking-tight">{board.title}</p>
                        <div className="mt-8 flex items-center justify-between text-xs font-semibold uppercase tracking-[0.12em] text-white/85">
                          <span>{board.tasks} tasks</span>
                          <span>{board.updated}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
                <section className="rounded-3xl border border-app bg-panel p-4 sm:p-5">
                  <h3 className="text-xl font-black tracking-tight">Today on the team</h3>
                  <p className="mt-1 text-sm text-app-muted">A snapshot of the task view available after login.</p>

                  <div className="mt-4 overflow-hidden rounded-2xl border border-app">
                    <table className="w-full border-collapse text-sm">
                      <thead className="bg-panel-soft text-left text-[11px] uppercase tracking-[0.14em] text-app-muted">
                        <tr>
                          <th className="px-4 py-3">Task</th>
                          <th className="px-4 py-3">Column</th>
                          <th className="px-4 py-3">Owner</th>
                          <th className="px-4 py-3">Due</th>
                        </tr>
                      </thead>
                      <tbody>
                        {previewTasks.map((task) => (
                          <tr key={task.id} className="border-t border-app">
                            <td className="px-4 py-3 font-semibold">{task.title}</td>
                            <td className="px-4 py-3 text-app-muted">{task.column}</td>
                            <td className="px-4 py-3 text-app-muted">{task.owner}</td>
                            <td className="px-4 py-3 text-app-muted">{task.due}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="space-y-6">
                  <div className="rounded-3xl border border-app bg-panel p-4 sm:p-5">
                    <h3 className="text-xl font-black tracking-tight">Recent activity</h3>
                    <div className="mt-4 space-y-3">
                      {previewActivity.map((item) => (
                        <div key={item} className="rounded-2xl border border-app bg-panel-soft px-4 py-3">
                          <p className="text-sm font-medium">{item}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-3xl border border-app bg-panel p-4 sm:p-5">
                    <h3 className="text-xl font-black tracking-tight">Unlock the full workspace</h3>
                    <p className="mt-2 text-sm text-app-muted">
                      Authentication enables editing, drag and drop, comments, uploads, filters, and realtime collaboration.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Link to="/signup">
                        <Button>Create an account</Button>
                      </Link>
                      <Link to="/login">
                        <Button variant="ghost">Back to login</Button>
                      </Link>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default DemoDashboardPage;
