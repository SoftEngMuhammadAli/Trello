import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createList } from '../../features/boards/boardSlice';
import Button from '../common/Button';

function AddListInline({ boardId }) {
  const dispatch = useDispatch();
  const [title, setTitle] = useState('');

  const onSubmit = () => {
    if (!title.trim()) return;
    dispatch(createList({ boardId, title: title.trim() }));
    setTitle('');
  };

  return (
    <div className="w-[85vw] max-w-80 shrink-0 rounded-2xl border border-app bg-panel p-3 shadow-soft sm:w-80">
      <input
        className="mb-2 w-full rounded-lg border border-app bg-panel px-3 py-2 text-sm text-app outline-none focus:border-brand-500"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder="Add another list"
        onKeyDown={(event) => {
          if (event.key === 'Enter') onSubmit();
        }}
      />
      <Button className="w-full" onClick={onSubmit}>
        Add List
      </Button>
    </div>
  );
}

export default AddListInline;


