import { memo, useMemo, useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { useDispatch } from 'react-redux';
import { createCard, deleteList, updateList } from '../../features/boards/boardSlice';
import CardTile from './CardTile';
import Button from '../common/Button';

function ListColumn({ list, cards, index, onOpenCard }) {
  const dispatch = useDispatch();
  const [listTitle, setListTitle] = useState(list.title);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(40);

  const visibleCards = useMemo(() => cards.slice(0, visibleCount), [cards, visibleCount]);

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

  const toggleCollapse = () => {
    dispatch(updateList({ listId: list._id, payload: { collapsed: !list.collapsed } }));
    setMenuOpen(false);
  };

  return (
    <Draggable draggableId={list._id} index={index}>
      {(dragProvided) => (
        <section
          ref={dragProvided.innerRef}
          {...dragProvided.draggableProps}
          className="flex h-fit w-[85vw] max-w-80 shrink-0 flex-col rounded-2xl border border-app bg-panel p-3 shadow sm:w-80"
        >
          <div className="mb-3 flex items-center gap-2" {...dragProvided.dragHandleProps}>
            <input
              className="w-full rounded-lg bg-transparent px-2 py-1 font-semibold text-app outline-none ring-brand-500 focus:ring-2"
              value={listTitle}
              onChange={(event) => setListTitle(event.target.value)}
              onBlur={saveListTitle}
            />
            <div className="relative">
              <button className="rounded p-1 text-app-muted hover:bg-hover" onClick={() => setMenuOpen((s) => !s)}>
                ...
              </button>
              {menuOpen ? (
                <div className="absolute right-0 z-10 w-40 rounded-xl border border-app bg-panel p-2 text-sm shadow-soft">
                  <button className="mb-1 w-full rounded px-2 py-1 text-left hover:bg-hover" onClick={toggleCollapse}>
                    {list.collapsed ? 'Expand list' : 'Collapse list'}
                  </button>
                  <button
                    className="w-full rounded px-2 py-1 text-left text-rose-500 hover:bg-hover"
                    onClick={() => dispatch(deleteList({ listId: list._id }))}
                  >
                    Delete list
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {list.collapsed ? (
            <button className="rounded-lg border border-app py-2 text-sm text-app-muted" onClick={toggleCollapse}>
              Show cards ({cards.length})
            </button>
          ) : (
            <>
              <Droppable droppableId={list._id} type="card">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="max-h-[50vh] overflow-y-auto sm:max-h-[55vh]"
                  >
                    {visibleCards.map((card, cardIndex) => (
                      <CardTile key={card._id} card={card} index={cardIndex} onOpen={onOpenCard} />
                    ))}
                    {provided.placeholder}
                    {visibleCount < cards.length ? (
                      <button
                        className="mb-2 w-full rounded-lg border border-app py-1 text-xs text-app-muted hover:bg-hover"
                        onClick={() => setVisibleCount((count) => count + 30)}
                      >
                        Load more cards
                      </button>
                    ) : null}
                  </div>
                )}
              </Droppable>

              <div className="mt-3 space-y-2">
                <input
                  className="w-full rounded-lg border border-app bg-panel px-3 py-2 text-sm outline-none focus:border-brand-500"
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
            </>
          )}
        </section>
      )}
    </Draggable>
  );
}

export default memo(ListColumn);
