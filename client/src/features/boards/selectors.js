import { createSelector } from '@reduxjs/toolkit';

const isDateRangeMatch = (card, dateRange) => {
  if (!dateRange) return true;
  if (!card.dueDate) return dateRange === 'none';

  const due = new Date(card.dueDate).getTime();
  const now = Date.now();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const weekFromNow = now + 7 * 24 * 60 * 60 * 1000;
  const monthFromNow = now + 30 * 24 * 60 * 60 * 1000;

  if (dateRange === 'overdue') return due < now;
  if (dateRange === 'today') return due >= today.getTime() && due < tomorrow.getTime();
  if (dateRange === 'week') return due >= now && due <= weekFromNow;
  if (dateRange === 'month') return due >= now && due <= monthFromNow;
  if (dateRange === 'upcoming') return due > now;
  return true;
};

export const selectBoardsState = (state) => state.boards;
export const selectCurrentBoard = (state) => state.boards.currentBoard;

export const selectFavoriteBoardIds = (state) => state.boards.favoriteBoardIds;
export const selectRecentBoardIds = (state) => state.boards.recentBoardIds;

export const selectFavoriteBoards = createSelector(
  [(state) => state.boards.boards, selectFavoriteBoardIds],
  (boards, favoriteIds) => boards.filter((board) => favoriteIds.includes(board._id)),
);

export const selectRecentBoards = createSelector(
  [(state) => state.boards.boards, selectRecentBoardIds],
  (boards, recentIds) =>
    recentIds
      .map((id) => boards.find((board) => board._id === id))
      .filter(Boolean),
);

export const selectFilteredBoardLists = createSelector(
  [selectCurrentBoard, (state) => state.boards.filters],
  (currentBoard, filters) => {
    if (!currentBoard) return [];

    return currentBoard.listOrder.map((listId) => {
      const list = currentBoard.listsById[listId];
      const cards = (list.cardIds || [])
        .map((cardId) => currentBoard.cardsById[cardId])
        .filter(Boolean)
        .filter((card) => {
          if (card.archived) return false;
          const statusMatch = filters.status ? card.status === filters.status : true;
          const priorityMatch = filters.priority ? card.priority === filters.priority : true;
          const memberMatch = filters.memberId ? (card.members || []).includes(filters.memberId) : true;
          const textMatch = filters.query
            ? [card.title, card.description, card.status, card.priority]
                .join(' ')
                .toLowerCase()
                .includes(filters.query.toLowerCase())
            : true;
          const dueMatch = isDateRangeMatch(card, filters.dateRange);
          return statusMatch && priorityMatch && memberMatch && textMatch && dueMatch;
        });

      return { list, cards };
    });
  },
);
