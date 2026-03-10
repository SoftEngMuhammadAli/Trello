import { createSelector } from '@reduxjs/toolkit';

const isDueMatch = (card, dueDateStatus) => {
  if (!dueDateStatus) return true;
  if (!card.dueDate) return dueDateStatus === 'none';

  const due = new Date(card.dueDate).getTime();
  const now = Date.now();
  const twoDays = 2 * 24 * 60 * 60 * 1000;

  if (dueDateStatus === 'overdue') return due < now;
  if (dueDateStatus === 'soon') return due >= now && due <= now + twoDays;
  if (dueDateStatus === 'scheduled') return due > now + twoDays;
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
          const memberMatch = filters.memberId ? (card.members || []).includes(filters.memberId) : true;
          const labelMatch = filters.labelColor
            ? (card.labels || []).some((label) => label.color === filters.labelColor)
            : true;
          const textMatch = filters.query
            ? [card.title, card.description]
                .join(' ')
                .toLowerCase()
                .includes(filters.query.toLowerCase())
            : true;
          const dueMatch = isDueMatch(card, filters.dueDateStatus);
          return memberMatch && labelMatch && textMatch && dueMatch;
        });

      return { list, cards };
    });
  },
);
