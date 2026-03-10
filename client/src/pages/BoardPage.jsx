import { useEffect, useRef, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getSocket } from '../app/socket';
import {
  clearSearchResults,
  createCard,
  fetchBoardFull,
  moveCard,
  optimisticMoveCard,
  optimisticReorderList,
  pushRecentBoard,
  reorderList,
  searchBoard,
  toggleFavoriteBoard,
  updateCard,
} from '../features/boards/boardSlice';
import {
  selectCurrentBoard,
  selectFavoriteBoardIds,
  selectFilteredBoardLists,
} from '../features/boards/selectors';
import { setActiveCardId } from '../features/cards/uiSlice';
import { fetchWorkspaces, setActiveWorkspace } from '../features/workspaces/workspaceSlice';
import AddListInline from '../components/board/AddListInline';
import BoardHeader from '../components/board/BoardHeader';
import BoardMenu from '../components/board/BoardMenu';
import CardModal from '../components/board/CardModal';
import FilterBar from '../components/board/FilterBar';
import ListColumn from '../components/board/ListColumn';
import Skeleton from '../components/common/Skeleton';
import { useDebounce } from '../hooks/useDebounce';
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts';
import AppShell from '../layouts/AppShell';

function BoardPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { boardId } = useParams();
  const searchInputRef = useRef(null);

  const currentBoard = useSelector(selectCurrentBoard);
  const boardLists = useSelector(selectFilteredBoardLists);
  const favoriteBoardIds = useSelector(selectFavoriteBoardIds);
  const { boardStatus, searchResults } = useSelector((state) => state.boards);
  const { activeCardId } = useSelector((state) => state.ui);
  const { user } = useSelector((state) => state.auth);

  const [searchValue, setSearchValue] = useState('');
  const [typingUsers, setTypingUsers] = useState({});
  const debouncedSearch = useDebounce(searchValue, 350);

  useEffect(() => {
    if (boardId) {
      dispatch(fetchBoardFull(boardId));
      dispatch(pushRecentBoard(boardId));
      dispatch(fetchWorkspaces({ page: 1, limit: 20 }));
    }
  }, [dispatch, boardId]);

  useEffect(() => {
    if (currentBoard?.workspaceId) {
      dispatch(setActiveWorkspace(currentBoard.workspaceId));
    }
  }, [dispatch, currentBoard?.workspaceId]);

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
    socket.on('board:typing', (payload) => {
      if (!payload?.userId || payload.userId === user?._id) return;
      setTypingUsers((prev) => ({ ...prev, [payload.userId]: payload.userName || 'A member' }));
      setTimeout(() => {
        setTypingUsers((prev) => {
          const next = { ...prev };
          delete next[payload.userId];
          return next;
        });
      }, 2000);
    });

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
      socket.off('board:typing');
    };
  }, [dispatch, boardId, user?._id]);

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
        if (['INPUT', 'TEXTAREA'].includes(event.target?.tagName)) return;
        event.preventDefault();
        searchInputRef.current?.focus();
      },
    },
    {
      key: 'Escape',
      action: () => dispatch(setActiveCardId(null)),
    },
    {
      key: 'c',
      action: (event) => {
        if (['INPUT', 'TEXTAREA'].includes(event.target?.tagName)) return;
        const firstList = boardLists[0]?.list;
        if (!firstList) return;
        dispatch(createCard({ listId: firstList._id, title: 'Quick card' }));
        toast.success('Quick card created');
      },
    },
    {
      key: 'l',
      action: (event) => {
        if (['INPUT', 'TEXTAREA'].includes(event.target?.tagName)) return;
        if (!activeCardId) return;
        const card = currentBoard?.cardsById?.[activeCardId];
        if (!card) return;
        dispatch(
          updateCard({
            cardId: activeCardId,
            payload: {
              labels: [...(card.labels || []), { text: 'Shortcut', color: '#8b5cf6' }],
            },
          }),
        );
        toast.success('Label added via shortcut');
      },
    },
    {
      key: 'm',
      action: (event) => {
        if (['INPUT', 'TEXTAREA'].includes(event.target?.tagName)) return;
        if (!activeCardId) return;
        const card = currentBoard?.cardsById?.[activeCardId];
        const firstMember = currentBoard?.members?.[0];
        if (!card || !firstMember) return;
        const exists = (card.members || []).includes(firstMember._id);
        dispatch(
          updateCard({
            cardId: activeCardId,
            payload: {
              members: exists
                ? (card.members || []).filter((id) => id !== firstMember._id)
                : [...(card.members || []), firstMember._id],
            },
          }),
        );
        toast.success('Member assignment updated');
      },
    },
  ]);

  const activeCard = currentBoard?.cardsById?.[activeCardId] || null;

  const onDragEnd = async (result) => {
    const { destination, source, draggableId, type } = result;
    if (!destination) return;
    if (destination.index === source.index && destination.droppableId === source.droppableId) return;

    try {
      if (type === 'list') {
        dispatch(optimisticReorderList({ listId: draggableId, position: destination.index }));
        const response = await dispatch(
          reorderList({ listId: draggableId, position: destination.index, boardId }),
        );
        if (reorderList.rejected.match(response)) throw new Error(response.payload);
      } else {
        dispatch(
          optimisticMoveCard({
            cardId: draggableId,
            targetListId: destination.droppableId,
            targetPosition: destination.index,
          }),
        );

        const response = await dispatch(
          moveCard({
            cardId: draggableId,
            payload: { targetListId: destination.droppableId, targetPosition: destination.index },
          }),
        );
        if (moveCard.rejected.match(response)) throw new Error(response.payload);
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

  const liveEditors = Object.values(typingUsers);

  return (
    <AppShell
      workspaceId={currentBoard.workspaceId}
      onWorkspaceChange={() => navigate('/dashboard')}
      title="Board"
    >
      <main
        className="min-h-[calc(100vh-8rem)] rounded-2xl border border-app p-2 sm:p-3 md:p-5"
        style={{
          background: currentBoard.background?.value || '#0b78de',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <BoardHeader
          board={currentBoard}
          isFavorite={favoriteBoardIds.includes(currentBoard._id)}
          onToggleFavorite={() => dispatch(toggleFavoriteBoard(currentBoard._id))}
          liveEditors={liveEditors}
        />

        <FilterBar searchInputRef={searchInputRef} onSearchChange={setSearchValue} />

        {searchResults && debouncedSearch ? (
          <section className="mb-4 rounded-xl bg-panel p-3 text-sm text-app shadow-soft">
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
                className="flex min-h-[60vh] gap-3 overflow-x-auto pb-3 sm:pb-4"
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
      </main>

      {activeCard ? (
        <CardModal
          card={activeCard}
          boardId={currentBoard._id}
          lists={currentBoard.listOrder.map((listId) => currentBoard.listsById[listId])}
          members={currentBoard.members || []}
          onTyping={() => {
            const socket = getSocket();
            socket?.emit('board:typing', {
              boardId: currentBoard._id,
              userId: user?._id,
              userName: user?.name,
              cardId: activeCard._id,
            });
          }}
        />
      ) : null}
      <BoardMenu />
    </AppShell>
  );
}

export default BoardPage;
