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

function CardTile({ card, index, onOpen }) {
  const dueText = card.dueDate ? formatDistanceToNow(new Date(card.dueDate), { addSuffix: true }) : null;
  const progress = useMemo(() => getChecklistProgress(card.checklists), [card.checklists]);
  const isOverdue = card.dueDate ? new Date(card.dueDate).getTime() < Date.now() : false;

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 cursor-pointer rounded-xl border border-app bg-panel p-3 shadow transition duration-150 hover:-translate-y-0.5 hover:shadow-soft ${
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

          {(card.labels || []).length > 0 ? (
            <div className="mb-2 flex flex-wrap gap-1">
              {card.labels.map((label, idx) => (
                <span
                  key={`${card._id}-label-${idx}`}
                  className="rounded-md px-2 py-0.5 text-[11px] font-semibold text-white"
                  style={{ backgroundColor: label.color }}
                >
                  {label.text || 'label'}
                </span>
              ))}
            </div>
          ) : null}

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
        </article>
      )}
    </Draggable>
  );
}

export default memo(CardTile);
