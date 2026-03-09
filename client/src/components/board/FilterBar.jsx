import { useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '../../features/boards/boardSlice';
import Input from '../common/Input';

function FilterBar({ searchInputRef, onSearchChange }) {
  const dispatch = useDispatch();
  const { currentBoard, filters } = useSelector((state) => state.boards);

  const labelOptions = useMemo(() => {
    const colorSet = new Set();
    Object.values(currentBoard?.cardsById || {}).forEach((card) => {
      (card.labels || []).forEach((label) => {
        if (label.color) colorSet.add(label.color);
      });
    });
    return [...colorSet];
  }, [currentBoard]);

  return (
    <div className="mb-4 grid gap-3 rounded-2xl bg-white/80 p-4 shadow-soft backdrop-blur md:grid-cols-[1fr_220px_220px]">
      <Input
        ref={searchInputRef}
        placeholder="Search cards, lists, comments..."
        value={filters.query}
        onChange={(event) => {
          dispatch(setFilters({ query: event.target.value }));
          onSearchChange(event.target.value);
        }}
      />

      <select
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
        value={filters.memberId}
        onChange={(event) => dispatch(setFilters({ memberId: event.target.value }))}
      >
        <option value="">All Members</option>
        {(currentBoard?.members || []).map((member) => (
          <option key={member._id} value={member._id}>
            {member.name}
          </option>
        ))}
      </select>

      <select
        className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
        value={filters.labelColor}
        onChange={(event) => dispatch(setFilters({ labelColor: event.target.value }))}
      >
        <option value="">All Labels</option>
        {labelOptions.map((color) => (
          <option key={color} value={color}>
            {color}
          </option>
        ))}
      </select>
    </div>
  );
}

export default FilterBar;


