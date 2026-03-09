import { useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { useDispatch } from 'react-redux';
import { createCard, updateList } from '../../features/boards/boardSlice';
import CardTile from './CardTile';
import Button from '../common/Button';

function ListColumn({ list, cards, index, onOpenCard }) {
  const dispatch = useDispatch();
  const [listTitle, setListTitle] = useState(list.title);
  const [newCardTitle, setNewCardTitle] = useState('');

  const saveListTitle = () => {
    if (listTitle.trim() && listTitle !== list.title) {
      dispatch(updateList({ listId: list._id, payload: { title: listTitle.trim() } }));
    }
  };

  const addCard = () => {
    if (!newCardTitle.trim()) return;
    dispatch(
      createCard({
        listId: list._id,
        title: newCardTitle.trim(),
      }),
    );
    setNewCardTitle('');
  };

  return (
    <Draggable draggableId={list._id} index={index}>
      {(dragProvided) => (
        <section
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          className="flex h-fit w-72 shrink-0 flex-col rounded-2xl bg-slate-100/90 p-3 shadow"
        >
          <div className="mb-3 flex items-center gap-2" {...dragProvided.dragHandleProps}>
            <input
              className="w-full rounded-lg bg-transparent px-2 py-1 font-semibold text-slate-800 outline-none ring-brand-500 focus:ring-2"
              value={listTitle}
              onChange={(event) => setListTitle(event.target.value)}
              onBlur={saveListTitle}
            />
          </div>

          <Droppable droppableId={list._id} type="card">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="max-h-[55vh] overflow-y-auto">
                {cards.map((card, cardIndex) => (
                  <CardTile key={card._id} card={card} index={cardIndex} onOpen={onOpenCard} />
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>

          <div className="mt-3 space-y-2">
            <input
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-brand-500"
              placeholder="Add a card"
              value={newCardTitle}
              onChange={(event) => setNewCardTitle(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') addCard();
              }}
            />
            <Button className="w-full" onClick={addCard}>
              Add Card
            </Button>
          </div>
        </section>
      )}
    </Draggable>
  );
}

export default ListColumn;


