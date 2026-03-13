import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from '../features/auth/authSlice';
import { selectFavoriteBoards, selectRecentBoards } from '../features/boards/selectors';
import { toggleFavoriteBoard } from '../features/boards/boardSlice';
import { fetchWorkspaces, setActiveWorkspace } from '../features/workspaces/workspaceSlice';
import { setSidebarOpen, toggleTheme } from '../features/cards/uiSlice';

const navItems = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  { id: 'workspaces', label: 'Workspaces', path: '/dashboard' },
  { id: 'projects', label: 'Projects', path: '/dashboard' },
  { id: 'tasks', label: 'My Tasks', path: '/dashboard' },
  { id: 'meetings', label: 'Meetings', path: '/dashboard' },
  { id: 'notifications', label: 'Notifications', path: '/dashboard' },
  { id: 'checkins', label: 'Check-ins', path: '/settings/profile' },
  { id: 'chats', label: 'Chats', path: '/settings/profile' },
  { id: 'notes', label: 'Notes', path: '/settings/profile' },
  { id: 'docs', label: 'Docs', path: '/settings/profile' },
];

function AppShell({ children, workspaceId, onWorkspaceChange, title = 'Workspace' }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [globalSearch, setGlobalSearch] = useState('');

  const { user } = useSelector((state) => state.auth);
  const { items: workspaces } = useSelector((state) => state.workspaces);
  const { boards } = useSelector((state) => state.boards);
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

  const searchMatch = useMemo(() => {
    if (!globalSearch.trim()) return null;
    const query = globalSearch.toLowerCase();
    return boards.find((board) => board.title.toLowerCase().includes(query)) || null;
  }, [boards, globalSearch]);

  const onGlobalSearch = (event) => {
    if (event.key !== 'Enter') return;
    if (searchMatch?._id) {
      navigate(`/board/${searchMatch._id}`);
      dispatch(setSidebarOpen(false));
    }
  };

  const onLogout = async () => {
    await dispatch(logoutUser());
    navigate('/login');
  };

  const isNavActive = (itemId) => {
    if (itemId === 'dashboard') return location.pathname === '/dashboard';
    if (itemId === 'projects') return location.pathname.startsWith('/board/');
    if (['checkins', 'chats', 'notes', 'docs'].includes(itemId)) {
      return location.pathname.startsWith('/settings/profile');
    }
    return false;
  };

  const goToNavItem = (item) => {
    if (item.id === 'projects' && recentBoards[0]?._id) {
      navigate(`/board/${recentBoards[0]._id}`);
    } else {
      navigate(item.path);
    }
    dispatch(setSidebarOpen(false));
  };

  const userNameInitial = user?.name?.slice(0, 1).toUpperCase() || 'U';

  return (
    <div className="min-h-screen bg-app text-app transition-colors duration-300">
      <div className="flex min-h-screen">
        <aside
          className={`fixed inset-y-0 left-0 z-50 w-[min(88vw,22rem)] border-r border-app bg-panel transition-transform duration-300 md:static md:w-[21.5rem] md:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex h-20 items-center justify-between border-b border-app px-4">
            <button
              className="flex items-center gap-3 text-left"
              onClick={() => navigate('/dashboard')}
            >
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-lg font-black text-white shadow-soft">
                {userNameInitial}
              </span>
              <span>
                <span className="block text-2xl font-black tracking-tight">Trello-Clone</span>
                <span className="block text-[11px] uppercase tracking-[0.2em] text-app-muted">
                  Team Command
                </span>
              </span>
            </button>
            <button
              className="rounded-xl border border-app bg-panel-soft px-3 py-1.5 text-xs font-semibold text-app-muted hover:bg-hover md:hidden"
              onClick={() => dispatch(setSidebarOpen(false))}
            >
              Close
            </button>
          </div>

          <div className="flex h-[calc(100vh-5rem)] flex-col">
            <div className="custom-scrollbar flex-1 space-y-5 overflow-auto px-3 py-4">
              <section className="rounded-2xl border border-app bg-panel-soft p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-app-muted">
                  Focused Today
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl border border-app bg-panel px-3 py-2">
                    <p className="text-xs text-app-muted">Boards</p>
                    <p className="text-lg font-black">{boards.length}</p>
                  </div>
                  <div className="rounded-xl border border-app bg-panel px-3 py-2">
                    <p className="text-xs text-app-muted">Favorites</p>
                    <p className="text-lg font-black">{favoriteBoards.length}</p>
                  </div>
                </div>
              </section>

              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold transition ${
                      isNavActive(item.id)
                        ? 'border border-app bg-accent-soft text-app'
                        : 'text-app-muted hover:bg-hover hover:text-app'
                    }`}
                    onClick={() => goToNavItem(item)}
                  >
                    <span className="app-dot" />
                    {item.label}
                  </button>
                ))}
              </nav>

              <section>
                <h2 className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.14em] text-app-muted">
                  Spaces
                </h2>
                <div className="space-y-1">
                  {workspaces.map((workspace) => (
                    <button
                      key={workspace._id}
                      className={`w-full rounded-xl border px-3 py-2 text-left text-sm font-semibold transition ${
                        activeWorkspaceId === workspace._id
                          ? 'border-app bg-accent-soft text-app'
                          : 'border-transparent text-app-muted hover:border-app hover:bg-hover hover:text-app'
                      }`}
                      onClick={() => selectWorkspace(workspace._id)}
                    >
                      {workspace.name}
                    </button>
                  ))}
                  {workspaces.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-app-muted">No workspaces found yet.</p>
                  ) : null}
                </div>
              </section>

              <section>
                <h2 className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.14em] text-app-muted">
                  Favorite Boards
                </h2>
                <div className="space-y-1">
                  {favoriteBoards.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-app-muted">No favorites yet.</p>
                  ) : (
                    favoriteBoards.map((board) => (
                      <div
                        key={`fav-${board._id}`}
                        className="flex items-center gap-2 rounded-xl border border-app bg-panel-soft p-2"
                      >
                        <Link
                          to={`/board/${board._id}`}
                          className="min-w-0 flex-1 text-sm font-semibold"
                          onClick={() => dispatch(setSidebarOpen(false))}
                        >
                          <span className="block truncate">{board.title}</span>
                        </Link>
                        <button
                          className="rounded-md border border-app bg-panel px-2 py-1 text-[11px] text-app-muted hover:bg-hover"
                          onClick={() => dispatch(toggleFavoriteBoard(board._id))}
                        >
                          Remove
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </section>

              <section>
                <h2 className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.14em] text-app-muted">
                  Recent Boards
                </h2>
                <div className="space-y-1">
                  {recentBoards.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-app-muted">No recent boards.</p>
                  ) : (
                    recentBoards.map((board) => (
                      <Link
                        key={`recent-${board._id}`}
                        to={`/board/${board._id}`}
                        onClick={() => dispatch(setSidebarOpen(false))}
                        className={`block rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                          location.pathname.includes(board._id)
                            ? 'border-app bg-accent-soft text-app'
                            : 'border-transparent text-app-muted hover:border-app hover:bg-hover hover:text-app'
                        }`}
                      >
                        {board.title}
                      </Link>
                    ))
                  )}
                </div>
              </section>
            </div>

            <div className="space-y-1 border-t border-app px-3 py-3">
              <button
                className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-app-muted hover:bg-hover hover:text-app"
                onClick={() => {
                  navigate('/settings/profile');
                  dispatch(setSidebarOpen(false));
                }}
              >
                Settings
              </button>
              <button
                className="w-full rounded-xl px-3 py-2 text-left text-sm font-semibold text-rose-400 hover:bg-rose-900/20"
                onClick={onLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </aside>

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex h-20 items-center gap-2 border-b border-app bg-app px-3 backdrop-blur md:gap-3 md:px-6">
            <button
              className="rounded-xl border border-app bg-panel-soft p-2 text-sm md:hidden"
              onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
            >
              Menu
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-2">
              <input
                className="w-full rounded-xl border border-app bg-panel px-4 py-2.5 text-sm text-app outline-none ring-brand-500 focus:border-brand-500 focus:ring-2"
                placeholder="Search boards, projects, tasks"
                value={globalSearch}
                onChange={(event) => setGlobalSearch(event.target.value)}
                onKeyDown={onGlobalSearch}
              />
              {searchMatch ? (
                <button
                  className="hidden rounded-lg border border-app bg-panel-soft px-3 py-2 text-xs font-semibold text-accent md:block"
                  onClick={() => navigate(`/board/${searchMatch._id}`)}
                >
                  Open
                </button>
              ) : null}
            </div>

            <button
              className="hidden rounded-xl bg-accent px-5 py-2 text-sm font-bold text-white hover:bg-accent-strong md:block"
              onClick={() => navigate('/settings/profile')}
            >
              Profile
            </button>
            <button
              className="rounded-xl border border-app bg-panel-soft px-3 py-2 text-sm text-app-muted hover:text-app"
              onClick={() => dispatch(toggleTheme())}
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? 'Light' : 'Dark'}
            </button>
            <button
              className="hidden rounded-xl border border-app bg-panel-soft px-3 py-2 text-xs font-semibold text-app-muted md:block"
              onClick={() => navigate('/settings/profile')}
              title={title}
            >
              {title}
            </button>
            <button
              className="flex h-11 w-11 items-center justify-center rounded-full border border-app bg-panel text-base font-bold text-accent"
              onClick={() => navigate('/settings/profile')}
            >
              {userNameInitial}
            </button>
          </header>

          <div className="min-w-0 flex-1 p-3 md:p-6">{children}</div>
        </div>
      </div>

      {sidebarOpen ? (
        <button
          className="fixed inset-0 z-40 bg-slate-950/45 md:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
        />
      ) : null}
    </div>
  );
}

export default AppShell;
