import { memo, useMemo, useState } from 'react';
import { Droppable, Draggable } from 'react-beautiful-dnd';
import { useDispatch } from 'react-redux';
import { createCard, deleteList, updateList } from '../../features/boards/boardSlice';
import CardTile from './CardTile';
import Button from '../common/Button';

const inferStatusFromListTitle = (title = '') => {
  const value = title.toLowerCase();
  if (value.includes('backlog')) return 'backlog';
  if (value.includes('progress') || value.includes('doing')) return 'in_progress';
  if (value.includes('review')) return 'in_review';
  if (value.includes('done') || value.includes('completed')) return 'done';
  if (value.includes('block')) return 'blocked';
  return 'todo';
};

function ListColumn({ list, cards, index, onOpenCard }) {
  const dispatch = useDispatch();
  const [listTitle, setListTitle] = useState(list.title);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [addingCard, setAddingCard] = useState(false);
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
        status: inferStatusFromListTitle(list.title),
        priority: 'medium',
      }),
    );
    setNewCardTitle('');
    setAddingCard(false);
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
          className="flex h-fit w-[85vw] max-w-[24rem] shrink-0 flex-col rounded-2xl border border-app bg-panel p-3 shadow-soft sm:w-[24rem]"
        >
          <div className="mb-3 flex items-center gap-2" {...dragProvided.dragHandleProps}>
            <span className="text-xs text-app-muted">::</span>
            <input
              className="w-full rounded-lg bg-transparent px-2 py-1 text-xl font-black tracking-tight text-app outline-none ring-brand-500 focus:ring-2"
              value={listTitle}
              onChange={(event) => setListTitle(event.target.value)}
              onBlur={saveListTitle}
            />
            <span className="rounded-full border border-app bg-accent-soft px-2.5 py-0.5 text-xs font-semibold text-app">
              {cards.length}
            </span>
            <div className="relative">
              <button className="rounded-lg border border-app bg-panel-soft px-2 py-1 text-xs text-app-muted hover:bg-hover" onClick={() => setMenuOpen((s) => !s)}>
                Menu
              </button>
              {menuOpen ? (
                <div className="absolute right-0 z-10 mt-1 w-40 rounded-xl border border-app bg-panel p-2 text-sm shadow-soft">
                  <button className="mb-1 w-full rounded px-2 py-1 text-left hover:bg-hover" onClick={toggleCollapse}>
                    {list.collapsed ? 'Expand list' : 'Collapse list'}
                  </button>
                  <button
                    className="w-full rounded px-2 py-1 text-left text-rose-400 hover:bg-hover"
                    onClick={() => dispatch(deleteList({ listId: list._id }))}
                  >
                    Delete list
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {list.collapsed ? (
            <button className="rounded-lg border border-app bg-panel-soft py-2 text-sm text-app-muted" onClick={toggleCollapse}>
              Show cards ({cards.length})
            </button>
          ) : (
            <>
              <Droppable droppableId={list._id} type="card">
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="custom-scrollbar max-h-[50vh] space-y-2 overflow-y-auto pr-1 sm:max-h-[55vh]"
                  >
                    {visibleCards.map((card, cardIndex) => (
                      <CardTile key={card._id} card={card} index={cardIndex} onOpen={onOpenCard} />
                    ))}
                    {provided.placeholder}
                    {visibleCount < cards.length ? (
                      <button
                        className="mb-2 w-full rounded-lg border border-app bg-panel-soft py-1 text-xs text-app-muted hover:bg-hover"
                        onClick={() => setVisibleCount((count) => count + 30)}
                      >
                        Load more cards
                      </button>
                    ) : null}
                  </div>
                )}
              </Droppable>

              {addingCard ? (
                <div className="mt-3 space-y-2 rounded-xl border border-app bg-panel-soft p-2">
                  <input
                    className="w-full rounded-lg border border-app bg-panel px-3 py-2 text-sm outline-none focus:border-brand-500"
                    placeholder="Add task title"
                    value={newCardTitle}
                    onChange={(event) => setNewCardTitle(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') addCard();
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button className="w-full" size="sm" onClick={addCard}>
                      Add task
                    </Button>
                    <Button
                      className="w-full"
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setAddingCard(false);
                        setNewCardTitle('');
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  className="mt-3 w-full rounded-xl border border-dashed border-app bg-panel-soft px-3 py-3 text-sm font-semibold text-app-muted transition hover:border-brand-500 hover:text-app"
                  onClick={() => setAddingCard(true)}
                >
                  + Add Task
                </button>
              )}
            </>
          )}
        </section>
      )}
    </Draggable>
  );
}

export default memo(ListColumn);
