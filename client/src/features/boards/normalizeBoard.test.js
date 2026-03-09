import { describe, expect, it } from 'vitest';
import { normalizeBoard } from './normalizeBoard';

describe('normalizeBoard', () => {
  it('normalizes lists and cards into id maps', () => {
    const board = {
      _id: 'b1',
      listsData: [
        {
          _id: 'l1',
          position: 1,
          cardsData: [{ _id: 'c2', listId: 'l1', position: 0 }],
        },
        {
          _id: 'l0',
          position: 0,
          cardsData: [{ _id: 'c1', listId: 'l0', position: 0 }],
        },
      ],
    };

    const normalized = normalizeBoard(board);
    expect(normalized.listOrder).toEqual(['l0', 'l1']);
    expect(normalized.listsById.l0.cardIds).toEqual(['c1']);
    expect(normalized.cardsById.c2.listId).toBe('l1');
  });
});
