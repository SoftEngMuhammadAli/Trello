import { Draggable } from 'react-beautiful-dnd';
import { formatDistanceToNow } from 'date-fns';

function CardTile({ card, index, onOpen }) {
  const dueText = card.dueDate ? formatDistanceToNow(new Date(card.dueDate), { addSuffix: true }) : null;

  return (
    <Draggable draggableId={card._id} index={index}>
      {(provided, snapshot) => (
        <article
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`mb-2 cursor-pointer rounded-xl bg-white p-3 shadow transition hover:shadow-soft ${
            snapshot.isDragging ? 'rotate-1' : ''
          }`}
          onClick={() => onOpen(card._id)}
        >
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

          <h4 className="line-clamp-3 text-sm font-medium text-slate-800">{card.title}</h4>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
            <span>{dueText || 'No due date'}</span>
            <span>{(card.commentsData || []).length} comments</span>
          </div>
        </article>
      )}
    </Draggable>
  );
}

export default CardTile;


