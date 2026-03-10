import { useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import Button from '../components/common/Button';
import {
  selectFavoriteBoards,
  selectRecentBoards,
} from '../features/boards/selectors';
import { toggleFavoriteBoard } from '../features/boards/boardSlice';
import { fetchWorkspaces, setActiveWorkspace } from '../features/workspaces/workspaceSlice';
import { setSidebarOpen, toggleTheme } from '../features/cards/uiSlice';

function AppShell({ children, workspaceId, onWorkspaceChange, title = 'Workspace' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { user } = useSelector((state) => state.auth);
  const { items: workspaces } = useSelector((state) => state.workspaces);
  const { sidebarOpen, theme } = useSelector((state) => state.ui);
  const favoriteBoards = useSelector(selectFavoriteBoards);
  const recentBoards = useSelector(selectRecentBoards);

  useEffect(() => {
    if (workspaces.length === 0) {
      dispatch(fetchWorkspaces({ page: 1, limit: 20 }));
    }
  }, [dispatch, workspaces.length]);

  const activeWorkspaceId = workspaceId || '';

  const selectWorkspace = (nextWorkspaceId) => {
    dispatch(setActiveWorkspace(nextWorkspaceId));
    dispatch(setSidebarOpen(false));
    onWorkspaceChange?.(nextWorkspaceId);
  };

  return (
    <div className="min-h-screen bg-app text-app transition-colors duration-300">
      <header className="sticky top-0 z-40 flex h-16 items-center gap-2 border-b border-app px-3 backdrop-blur md:gap-3 md:px-6">
        <button
          className="rounded-xl border border-app p-2 text-sm md:hidden"
          onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
        >
          Menu
        </button>
        <button className="shrink-0 text-xl font-black tracking-tight" onClick={() => navigate('/dashboard')}>
          Flowllo
        </button>

        <div className="hidden min-w-[220px] md:block">
          <select
            className="w-full rounded-xl border border-app bg-panel px-3 py-2 text-sm"
            value={activeWorkspaceId}
            onChange={(event) => selectWorkspace(event.target.value)}
          >
            <option value="">Select workspace</option>
            {workspaces.map((workspace) => (
              <option key={workspace._id} value={workspace._id}>
                {workspace.name}
              </option>
            ))}
          </select>
        </div>

        <h1 className="hidden text-sm font-semibold text-app-muted lg:block">{title}</h1>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="secondary" className="px-3" onClick={() => dispatch(toggleTheme())}>
            {theme === 'dark' ? 'Light' : 'Dark'}
          </Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">
            {user?.name?.slice(0, 1).toUpperCase() || 'U'}
          </div>
        </div>

      </header>

      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-[1700px] grid-cols-1 md:grid-cols-[280px_minmax(0,1fr)]">
        <aside
          className={`fixed inset-y-16 left-0 z-30 w-[min(85vw,20rem)] overflow-auto border-r border-app bg-panel p-4 transition-transform duration-300 md:sticky md:top-16 md:h-[calc(100vh-4rem)] md:w-[280px] md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <section className="mb-6">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-app-muted">Workspaces</h2>
            <div className="space-y-1">
              {workspaces.map((workspace) => (
                <button
                  key={workspace._id}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    activeWorkspaceId === workspace._id ? 'bg-brand-600 text-white' : 'hover:bg-hover'
                  }`}
                  onClick={() => selectWorkspace(workspace._id)}
                >
                  {workspace.name}
                </button>
              ))}
            </div>
          </section>

          <section className="mb-6">
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-app-muted">Favorite Boards</h2>
            <div className="space-y-2">
              {favoriteBoards.length === 0 ? <p className="text-xs text-app-muted">No favorites yet.</p> : null}
              {favoriteBoards.map((board) => (
                <div key={`fav-${board._id}`} className="flex items-center gap-2 rounded-lg p-2 hover:bg-hover">
                  <Link
                    to={`/board/${board._id}`}
                    className="min-w-0 flex-1 text-sm font-medium"
                    onClick={() => dispatch(setSidebarOpen(false))}
                  >
                    <span className="block truncate">{board.title}</span>
                  </Link>
                  <button
                    className="rounded px-1 py-0.5 text-xs text-app-muted hover:bg-hover"
                    onClick={() => dispatch(toggleFavoriteBoard(board._id))}
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="mb-2 text-xs font-bold uppercase tracking-wider text-app-muted">Recent Boards</h2>
            <div className="space-y-2">
              {recentBoards.length === 0 ? <p className="text-xs text-app-muted">No recent boards.</p> : null}
              {recentBoards.map((board) => (
                <Link
                  key={`recent-${board._id}`}
                  to={`/board/${board._id}`}
                  onClick={() => dispatch(setSidebarOpen(false))}
                  className={`block rounded-lg px-3 py-2 text-sm ${
                    location.pathname.includes(board._id) ? 'bg-brand-600 text-white' : 'hover:bg-hover'
                  }`}
                >
                  {board.title}
                </Link>
              ))}
            </div>
          </section>
        </aside>

        {sidebarOpen ? (
          <button
            className="fixed inset-0 top-16 z-20 bg-slate-950/30 md:hidden"
            onClick={() => dispatch(setSidebarOpen(false))}
          />
          ) : null}

        <div className="min-w-0 p-3 md:p-6">{children}</div>
      </div>
    </div>
  );
}

export default AppShell;
