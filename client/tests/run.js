import assert from 'node:assert/strict';
import { normalizeBoard } from '../src/features/boards/normalizeBoard.js';

function runTest(name, fn) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

runTest('normalizeBoard converts nested board to normalized maps', () => {
  const board = {
    _id: 'b1',
    listsData: [
      { _id: 'l2', position: 1, cardsData: [{ _id: 'c2', listId: 'l2', position: 0 }] },
      { _id: 'l1', position: 0, cardsData: [{ _id: 'c1', listId: 'l1', position: 0 }] },
    ],
  };

  const normalized = normalizeBoard(board);
  assert.deepEqual(normalized.listOrder, ['l1', 'l2']);
  assert.deepEqual(normalized.listsById.l1.cardIds, ['c1']);
  assert.equal(normalized.cardsById.c2.listId, 'l2');
});

if (process.exitCode) process.exit(process.exitCode);