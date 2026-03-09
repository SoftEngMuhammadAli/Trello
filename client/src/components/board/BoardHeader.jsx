import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { updateBoard } from '../../features/boards/boardSlice';
import { setBoardMenuOpen } from '../../features/cards/uiSlice';
import Button from '../common/Button';

function BoardHeader({ board }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState(board.title);

  const saveTitle = () => {
    if (title.trim() && title !== board.title) {
      dispatch(updateBoard({ boardId: board._id, payload: { title: title.trim() } }));
    }
  };

  return (
    <header className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/80 p-4 shadow-soft backdrop-blur">
      <div className="flex items-center gap-3">
        <input
          className="rounded-lg bg-transparent px-2 py-1 text-xl font-bold outline-none ring-brand-500 focus:ring-2"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={saveTitle}
        />
        <span className="rounded-full bg-slate-100 px-2 py-1 text-xs uppercase tracking-wide text-slate-600">
          {board.background?.type || 'color'}
        </span>
      </div>

      <div className="flex items-center gap-3">
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
        <Button variant="secondary" onClick={() => dispatch(setBoardMenuOpen(true))}>
          Board Menu
        </Button>
      </div>
    </header>
  );
}

export default BoardHeader;


