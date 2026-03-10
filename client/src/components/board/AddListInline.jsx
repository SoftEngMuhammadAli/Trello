import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createList } from '../../features/boards/boardSlice';
import Button from '../common/Button';

function AddListInline({ boardId }) {
  const dispatch = useDispatch();
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');

  const onSubmit = () => {
    if (!title.trim()) return;
    dispatch(createList({ boardId, title: title.trim() }));
    setTitle('');
    setOpen(false);
  };

  if (!open) {
    return (
      <button
        className="flex h-64 w-[85vw] max-w-[24rem] shrink-0 items-center justify-center rounded-2xl border border-dashed border-app bg-panel/40 text-xl font-bold tracking-tight text-app-muted transition hover:border-brand-500 hover:text-white sm:w-[24rem]"
        onClick={() => setOpen(true)}
      >
        + Add Column
      </button>
    );
  }

  return (
    <div className="w-[85vw] max-w-[24rem] shrink-0 rounded-2xl border border-app bg-panel p-3 shadow-soft sm:w-[24rem]">
      <input
        className="mb-2 w-full rounded-lg border border-app bg-panel-soft px-3 py-2 text-sm text-app outline-none focus:border-brand-500"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Column title"
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSubmit();
        }}
        autoFocus
      />
      <div className="flex gap-2">
        <Button className="w-full" size="sm" onClick={onSubmit}>
          Add column
        </Button>
        <Button
          className="w-full"
          size="sm"
          variant="secondary"
          onClick={() => {
            setOpen(false);
            setTitle('');
          }}
        >
          Cancel
        </Button>
      </div>
    </div>
  );
}

export default AddListInline;
