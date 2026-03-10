import { memo, useMemo } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { formatDistanceToNow } from 'date-fns';

function getChecklistProgress(checklists = []) {
  let total = 0;
  let completed = 0;

  checklists.forEach((list) => {
    (list.items || []).forEach((item) => {
      total += 1;
      if (item.done) completed += 1;
    });
  });

  return { total, completed };
}

const statusTone = {
  backlog: 'bg-slate-600/20 text-slate-200',
  todo: 'bg-cyan-600/20 text-cyan-200',
  in_progress: 'bg-amber-500/20 text-amber-200',
  in_review: 'bg-indigo-500/20 text-indigo-200',
  done: 'bg-emerald-600/20 text-emerald-200',
  blocked: 'bg-rose-600/20 text-rose-200',
};

const priorityTone = {
  urgent: 'bg-rose-600/20 text-rose-200',
  high: 'bg-amber-600/20 text-amber-200',
  medium: 'bg-cyan-600/20 text-cyan-200',
  low: 'bg-emerald-600/20 text-emerald-200',
};

function CardTile({ card, index, onOpen }) {
  const dueText = card.dueDate ? formatDistanceToNow(new Date(card.dueDate), { addSuffix: true }) : null;
  const progress = useMemo(() => getChecklistProgress(card.checklists), [card.checklists]);
  const isOverdue = card.dueDate ? new Date(card.dueDate).getTime() < Date.now() : false;
  const priorityLabel = card.priority ? card.priority.replace('_', ' ') : 'medium';
  const statusLabel = card.status ? card.status.replace('_', ' ') : 'todo';

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`cursor-pointer rounded-xl border border-app bg-panel-soft p-3 shadow transition duration-150 hover:-translate-y-0.5 hover:shadow-soft ${
            snapshot.isDragging ? 'rotate-1 shadow-soft' : ''
          }`}
          onClick={() => onOpen(card._id)}
        >
          {card.cover ? (
            <div
              className="mb-2 h-20 rounded-lg bg-cover bg-center"
              style={{ backgroundImage: `url(${card.cover})` }}
            />
          ) : null}

          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="rounded-lg border border-app px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-app-muted">
              Task
            </span>
            <div className="flex items-center gap-1.5">
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${priorityTone[card.priority] || priorityTone.medium}`}>
                {priorityLabel}
              </span>
              <span className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${statusTone[card.status] || statusTone.todo}`}>
                {statusLabel}
              </span>
            </div>
          </div>

          <h4 className="line-clamp-3 text-sm font-semibold text-app">{card.title}</h4>

          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-app-muted">
            <span className={`inline-flex items-center gap-1 ${isOverdue ? 'text-rose-400' : ''}`}>
              Due {dueText || 'none'}
            </span>
            <span className="inline-flex items-center gap-1">Comments {(card.commentsData || []).length}</span>
            <span className="inline-flex items-center gap-1">Files {(card.attachments || []).length}</span>
            {progress.total > 0 ? (
              <span className="inline-flex items-center gap-1">
                Checklist {progress.completed}/{progress.total}
              </span>
            ) : null}
          </div>

          {(card.members || []).length > 0 ? (
            <div className="mt-3 flex -space-x-1">
              {(card.members || []).slice(0, 3).map((memberId, memberIndex) => (
                <span
                  key={`${card._id}-member-${memberId}-${memberIndex}`}
                  className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-app bg-panel text-[10px] font-bold uppercase text-app"
                >
                  {String(memberId).slice(-1)}
                </span>
              ))}
            </div>
          ) : null}
        </article>
      )}
    </Draggable>
  );
}

export default memo(CardTile);
