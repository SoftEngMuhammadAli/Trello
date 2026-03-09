import { useEffect, useMemo, useRef, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSocket } from '../app/socket';
import {
  clearSearchResults,
  fetchBoardFull,
  moveCard,
  pushRecentBoard,
  reorderList,
  searchBoard,
} from '../features/boards/boardSlice';
import { setActiveCardId } from '../features/cards/uiSlice';
import AddListInline from '../components/board/AddListInline';
import BoardHeader from '../components/board/BoardHeader';
import BoardMenu from '../components/board/BoardMenu';
import CardModal from '../components/board/CardModal';
import FilterBar from '../components/board/FilterBar';
import ListColumn from '../components/board/ListColumn';
import Skeleton from '../components/common/Skeleton';
import { useDebounce } from '../hooks/useDebounce';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';

function BoardPage() {
  const dispatch = useDispatch();
  const { boardId } = useParams();
  const searchInputRef = useRef(null);

  const { currentBoard, boardStatus, filters, searchResults } = useSelector((state) => state.boards);
  const { activeCardId } = useSelector((state) => state.ui);

  const [searchValue, setSearchValue] = useState('');
  const debouncedSearch = useDebounce(searchValue, 350);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoardFull(boardId));
      dispatch(pushRecentBoard(boardId));
    }
  }, [dispatch, boardId]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket || !boardId) return;

    socket.emit('board:join', boardId);

    const refreshBoard = () => dispatch(fetchBoardFull(boardId));

    socket.on('board:updated', refreshBoard);
    socket.on('list:created', refreshBoard);
    socket.on('list:updated', refreshBoard);
    socket.on('list:reordered', refreshBoard);
    socket.on('list:deleted', refreshBoard);
    socket.on('card:created', refreshBoard);
    socket.on('card:updated', refreshBoard);
    socket.on('card:moved', refreshBoard);
    socket.on('card:deleted', refreshBoard);
    socket.on('comment:created', refreshBoard);
    socket.on('comment:updated', refreshBoard);
    socket.on('comment:deleted', refreshBoard);

    return () => {
      socket.emit('board:leave', boardId);
      socket.off('board:updated', refreshBoard);
      socket.off('list:created', refreshBoard);
      socket.off('list:updated', refreshBoard);
      socket.off('list:reordered', refreshBoard);
      socket.off('list:deleted', refreshBoard);
      socket.off('card:created', refreshBoard);
      socket.off('card:updated', refreshBoard);
      socket.off('card:moved', refreshBoard);
      socket.off('card:deleted', refreshBoard);
      socket.off('comment:created', refreshBoard);
      socket.off('comment:updated', refreshBoard);
      socket.off('comment:deleted', refreshBoard);
    };
  }, [dispatch, boardId]);

  useEffect(() => {
    if (!boardId) return;
    if (!debouncedSearch.trim()) {
      dispatch(clearSearchResults());
      return;
    }

    dispatch(searchBoard({ q: debouncedSearch, boardId }));
  }, [dispatch, debouncedSearch, boardId]);

  useKeyboardShortcuts([
    {
      key: '/',
      action: (event) => {
        event.preventDefault();
        searchInputRef.current?.focus();
      },
    },
    {
      key: 'Escape',
      action: () => dispatch(setActiveCardId(null)),
    },
  ]);

  const boardLists = useMemo(() => {
    if (!currentBoard) return [];

    return currentBoard.listOrder.map((listId) => {
      const list = currentBoard.listsById[listId];
      const cards = (list.cardIds || [])
        .map((cardId) => currentBoard.cardsById[cardId])
        .filter(Boolean)
        .filter((card) => {
          const memberMatch = filters.memberId ? (card.members || []).includes(filters.memberId) : true;
          const labelMatch = filters.labelColor
            ? (card.labels || []).some((label) => label.color === filters.labelColor)
            : true;
          const textMatch = filters.query
            ? [card.title, card.description].join(' ').toLowerCase().includes(filters.query.toLowerCase())
            : true;
          return memberMatch && labelMatch && textMatch;
        });

      return { list, cards };
    });
  }, [currentBoard, filters]);

  const activeCard = currentBoard?.cardsById?.[activeCardId] || null;

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (destination.index === source.index && destination.droppableId === source.droppableId) return;

    try {
      if (type === 'list') {
        await dispatch(reorderList({ listId: draggableId, position: destination.index, boardId }));
      } else {
        await dispatch(
          moveCard({
            cardId: draggableId,
            payload: { targetListId: destination.droppableId, targetPosition: destination.index },
          }),
        );
      }
    } catch (_error) {
      toast.error('Failed to persist drag operation');
      dispatch(fetchBoardFull(boardId));
    }
  };

  if (boardStatus === 'loading' && !currentBoard) {
    return (
      <div className="p-4 md:p-8">
        <Skeleton className="mb-4 h-14" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={`list-skeleton-${idx}`} className="h-72 w-72" />
          ))}
        </div>
      </div>
    );
  }

  if (!currentBoard) {
    return <div className="p-8">Board not found or inaccessible.</div>;
  }

  return (
    <main className="min-h-screen p-4 md:p-8" style={{ background: currentBoard.background?.value || '#0b78de' }}>
      <div className="mx-auto max-w-[1500px]">
        <BoardHeader board={currentBoard} />
        <FilterBar searchInputRef={searchInputRef} onSearchChange={setSearchValue} />

        {searchResults && debouncedSearch ? (
          <section className="mb-4 rounded-xl bg-white/90 p-3 text-sm text-slate-700 shadow-soft">
            Search matched {searchResults.cards?.length || 0} cards, {searchResults.lists?.length || 0} lists,
            {' '}
            {searchResults.comments?.length || 0} comments.
          </section>
        ) : null}

        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="all-lists" direction="horizontal" type="list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="flex min-h-[65vh] gap-3 overflow-x-auto pb-4"
              >
                {boardLists.map(({ list, cards }, index) => (
                  <ListColumn
                    key={list._id}
                    list={list}
                    cards={cards}
                    index={index}
                    onOpenCard={(cardId) => dispatch(setActiveCardId(cardId))}
                  />
                ))}
                {provided.placeholder}
                <AddListInline boardId={currentBoard._id} />
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {activeCard ? <CardModal card={activeCard} members={currentBoard.members || []} /> : null}
      <BoardMenu />
    </main>
  );
}

export default BoardPage;


