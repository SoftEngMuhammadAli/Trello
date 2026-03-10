import { useDispatch, useSelector } from 'react-redux';
import { setFilters } from '../../features/boards/boardSlice';
import Input from '../common/Input';

function FilterBar({ searchInputRef, onSearchChange }) {
  const dispatch = useDispatch();
  const { currentBoard, filters } = useSelector((state) => state.boards);

  return (
    <div className="sticky top-[5.1rem] z-20 mb-4 space-y-3 rounded-2xl border border-app bg-panel p-3 shadow-soft md:p-4">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1.35fr)_repeat(3,minmax(0,1fr))_minmax(0,1.05fr)]">
        <Input
          ref={searchInputRef}
          placeholder="Search tasks..."
          value={filters.query}
          onChange={(event) => {
            const value = event.target.value;
            dispatch(setFilters({ query: value }));
            onSearchChange(value);
          }}
        />

        <select
          className="rounded-xl border border-app bg-panel px-3 py-2 text-sm text-app"
          value={filters.status}
          onChange={(event) => dispatch(setFilters({ status: event.target.value }))}
        >
          <option value="">All Status</option>
          <option value="backlog">Backlog</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="in_review">In Review</option>
          <option value="done">Done</option>
          <option value="blocked">Blocked</option>
        </select>

        <select
          className="rounded-xl border border-app bg-panel px-3 py-2 text-sm text-app"
          value={filters.priority}
          onChange={(event) => dispatch(setFilters({ priority: event.target.value }))}
        >
          <option value="">All Priority</option>
          <option value="urgent">Urgent</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>

        <select
          className="rounded-xl border border-app bg-panel px-3 py-2 text-sm text-app"
          value={filters.memberId}
          onChange={(event) => dispatch(setFilters({ memberId: event.target.value }))}
        >
          <option value="">All Assignees</option>
          {(currentBoard?.members || []).map((member) => (
            <option key={member._id} value={member._id}>
              {member.name}
            </option>
          ))}
        </select>

        <select
          className="rounded-xl border border-app bg-panel px-3 py-2 text-sm text-app"
          value={filters.dateRange}
          onChange={(event) => dispatch(setFilters({ dateRange: event.target.value }))}
        >
          <option value="">Date Range</option>
          <option value="overdue">Overdue</option>
          <option value="today">Today</option>
          <option value="week">Next 7 days</option>
          <option value="month">Next 30 days</option>
          <option value="upcoming">Upcoming</option>
          <option value="none">No due date</option>
        </select>
      </div>

      <div className="flex justify-end">
        <div className="inline-flex rounded-xl border border-app bg-panel-soft p-1">
          <button
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${
              filters.view !== 'list' ? 'bg-accent text-white' : 'text-app-muted hover:text-app'
            }`}
            onClick={() => dispatch(setFilters({ view: 'board' }))}
          >
            Board
          </button>
          <button
            className={`rounded-lg px-4 py-1.5 text-sm font-semibold ${
              filters.view === 'list' ? 'bg-accent text-white' : 'text-app-muted hover:text-app'
            }`}
            onClick={() => dispatch(setFilters({ view: 'list' }))}
          >
            List
          </button>
        </div>
      </div>
    </div>
  );
}

export default FilterBar;
