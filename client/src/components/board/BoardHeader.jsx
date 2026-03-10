import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateBoard } from '../../features/boards/boardSlice';
import { setBoardMenuOpen } from '../../features/cards/uiSlice';
import Button from '../common/Button';

function BoardHeader({ board, isFavorite, onToggleFavorite, liveEditors = [] }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(board.title);

  const editorLabel = useMemo(() => {
    if (liveEditors.length === 0) return '';
    if (liveEditors.length === 1) return `${liveEditors[0]} is editing...`;
    return `${liveEditors[0]} and ${liveEditors.length - 1} others are editing...`;
  }, [liveEditors]);

  const saveTitle = () => {
    if (title.trim() && title !== board.title) {
      dispatch(updateBoard({ boardId: board._id, payload: { title: title.trim() } }));
    }
  };

  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-app bg-panel p-4 shadow-soft">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <input
          className="w-full rounded-lg bg-transparent px-2 py-1 text-lg font-bold text-app outline-none ring-brand-500 focus:ring-2 md:text-xl"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={saveTitle}
        />
        <button
          className="shrink-0 rounded-lg border border-app bg-panel px-2 py-1 text-[11px] font-semibold uppercase tracking-wide text-app hover:bg-hover"
          onClick={onToggleFavorite}
        >
          {isFavorite ? 'Unfavorite' : 'Favorite'}
        </button>
      </div>

      <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-end">
        <div className="flex -space-x-2">
          {(board.members || []).slice(0, 5).map((member) => (
            <div
              key={member._id}
              className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-brand-100 text-xs font-semibold text-brand-700"
              title={member.name}
            >
              {member.name?.slice(0, 1).toUpperCase() || '?'}
            </div>
          ))}
        </div>
        <Button variant="secondary" className="shrink-0" onClick={() => dispatch(setBoardMenuOpen(true))}>
          Board Menu
        </Button>
      </div>

      {editorLabel ? (
        <p className="w-full text-xs font-medium text-emerald-600">{editorLabel}</p>
      ) : null}
    </header>
  );
}

export default BoardHeader;
