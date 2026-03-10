/**
 * Converts nested board payload into normalized maps for faster UI updates.
 * @param {object} board
 */
export function normalizeBoard(board) {
  const listsById = {};
  const cardsById = {};
  const listOrder = [];

  (board.listsData || [])
    .slice()
    .sort((a, b) => a.position - b.position)
    .forEach((list) => {
      const listId = list._id;
      const cardIds = [];

      (list.cardsData || [])
        .slice()
        .sort((a, b) => a.position - b.position)
        .forEach((card) => {
          cardsById[card._id] = {
            ...card,
            commentsData: card.commentsData || [],
            checklists: card.checklists || [],
          };
          cardIds.push(card._id);
        });

      listsById[listId] = {
        ...list,
        cardIds,
      };

      listOrder.push(listId);
    });

  return {
    ...board,
    listsById,
    cardsById,
    listOrder,
  };
}
