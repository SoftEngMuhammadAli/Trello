import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateBoard } from '../../features/boards/boardSlice';
import { setBoardMenuOpen } from '../../features/cards/uiSlice';
import Button from '../common/Button';

const boardTabs = ['Tasks', 'Backlog', 'Sprints', 'Members', 'Files', 'Notes', 'Overview'];

function BoardHeader({ board, isFavorite, onToggleFavorite, liveEditors = [] }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(board.title);
  const [activeTab, setActiveTab] = useState('Tasks');

  const editorLabel = useMemo(() => {
    if (liveEditors.length === 0) return '';
    if (liveEditors.length === 1) return `${liveEditors[0]} is editing right now`;
    return `${liveEditors[0]} and ${liveEditors.length - 1} others are editing right now`;
  }, [liveEditors]);

  const saveTitle = () => {
    if (title.trim() && title !== board.title) {
      dispatch(updateBoard({ boardId: board._id, payload: { title: title.trim() } }));
    }
  };

  return (
    <header className="mb-4 space-y-3">
      <div className="rounded-2xl border border-app bg-panel p-4 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <input
              className="w-full rounded-lg bg-transparent px-1 py-1 text-2xl font-black tracking-tight text-white outline-none ring-brand-500 focus:ring-2 md:text-3xl"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onBlur={saveTitle}
            />
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-slate-200/85">Realtime project board workspace</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              className="rounded-lg border border-white/45 bg-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white hover:bg-white/20"
              onClick={onToggleFavorite}
            >
              {isFavorite ? 'Favorited' : 'Favorite'}
            </button>
            <Button variant="ghost" className="shrink-0 border-white/45 bg-white/15 text-white hover:bg-white/20 hover:text-white" onClick={() => dispatch(setBoardMenuOpen(true))}>
              Board menu
            </Button>
          </div>
        </div>

        <div className="mt-4 flex w-full items-center justify-between gap-2 overflow-x-auto rounded-xl border border-white/20 bg-black/15 p-1.5">
          <div className="flex min-w-max items-center gap-1.5">
            {boardTabs.map((tab) => (
              <button
                key={tab}
                className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${
                  activeTab === tab ? 'bg-white text-slate-900' : 'text-slate-100 hover:bg-white/15'
                }`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="hidden shrink-0 items-center gap-2 md:flex">
            <div className="flex -space-x-2">
              {(board.members || []).slice(0, 4).map((member) => (
                <div
                  key={member._id}
                  className="flex h-8 w-8 items-center justify-center rounded-full border border-white/60 bg-black/20 text-xs font-semibold text-white"
                  title={member.name}
                >
                  {member.name?.slice(0, 1).toUpperCase() || '?'}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {editorLabel ? (
        <p className="inline-flex items-center gap-2 rounded-full border border-emerald-300/35 bg-emerald-900/20 px-3 py-1 text-xs font-semibold text-emerald-200">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
          {editorLabel}
        </p>
      ) : null}
    </header>
  );
}

export default BoardHeader;
