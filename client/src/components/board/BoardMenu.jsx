import { useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateBoard, updateCard } from '../../features/boards/boardSlice';
import { setBoardMenuOpen } from '../../features/cards/uiSlice';
import Button from '../common/Button';

const boardBackgrounds = [
  'linear-gradient(130deg, #0f766e, #06b6d4)',
  'linear-gradient(130deg, #0369a1, #0891b2)',
  'linear-gradient(130deg, #166534, #14b8a6)',
  'linear-gradient(130deg, #0f172a, #1e293b)',
  '#0f172a',
];

function BoardMenu() {
  const dispatch = useDispatch();
  const { boardMenuOpen } = useSelector((state) => state.ui);
  const { currentBoard } = useSelector((state) => state.boards);
  const [imageUrl, setImageUrl] = useState('');

  const archivedCards = useMemo(
    () => Object.values(currentBoard?.cardsById || {}).filter((card) => card.archived),
    [currentBoard],
  );

  if (!currentBoard) return null;

  return (
    <>
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-full border-l border-app bg-panel p-3 shadow-soft transition-transform duration-300 sm:w-[380px] sm:p-4 ${
          boardMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-4 flex items-center justify-between border-b border-app pb-3">
          <h2 className="text-lg font-black tracking-tight text-app">Board Menu</h2>
          <button
            className="rounded-lg border border-app bg-panel-soft px-3 py-1.5 text-sm text-app-muted hover:bg-hover"
            onClick={() => dispatch(setBoardMenuOpen(false))}
          >
            Close
          </button>
        </div>

        <div className="custom-scrollbar space-y-5 overflow-auto pb-6 text-sm text-app" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
          <section className="rounded-xl border border-app bg-panel-soft p-3">
            <h4 className="mb-1 text-base font-black tracking-tight">About Board</h4>
            <p className="text-app-muted">Workspace: {currentBoard?.workspaceId || 'N/A'}</p>
            <p className="text-app-muted">Visibility: Workspace members</p>
          </section>

          <section className="rounded-xl border border-app bg-panel-soft p-3">
            <h4 className="mb-2 text-base font-black tracking-tight">Change Background</h4>
            <div className="mb-2 grid grid-cols-5 gap-2">
              {boardBackgrounds.map((value) => (
                <button
                  key={value}
                  className="h-9 rounded border border-white/40"
                  style={{ background: value }}
                  onClick={() =>
                    dispatch(
                      updateBoard({
                        boardId: currentBoard._id,
                        payload: { background: { type: 'gradient', value } },
                      }),
                    )
                  }
                />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="w-full rounded-lg border border-app bg-panel px-3 py-2"
                placeholder="Image URL"
                value={imageUrl}
                onChange={(event) => setImageUrl(event.target.value)}
              />
              <Button
                size="sm"
                onClick={() => {
                  if (!imageUrl.trim()) return;
                  dispatch(
                    updateBoard({
                      boardId: currentBoard._id,
                      payload: { background: { type: 'image', value: `url(${imageUrl.trim()})` } },
                    }),
                  );
                  setImageUrl('');
                }}
              >
                Apply
              </Button>
            </div>
          </section>

          <section className="rounded-xl border border-app bg-panel-soft p-3">
            <h4 className="mb-2 text-base font-black tracking-tight">Activity</h4>
            <div className="max-h-64 space-y-2 overflow-auto rounded-lg border border-app bg-panel p-2">
              {(currentBoard?.activityLog || []).map((entry, index) => (
                <div key={`${entry.createdAt}-${index}`} className="rounded-lg border border-app bg-panel-soft p-2">
                  <p className="font-semibold text-app">{entry.action}</p>
                  <p className="text-xs text-app-muted">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-app bg-panel-soft p-3">
            <h4 className="mb-2 text-base font-black tracking-tight">Archived Items</h4>
            {archivedCards.length === 0 ? <p className="text-xs text-app-muted">No archived cards.</p> : null}
            <div className="space-y-2">
              {archivedCards.map((card) => (
                <div key={card._id} className="flex items-center justify-between rounded-lg border border-app bg-panel p-2">
                  <span className="truncate pr-2 text-sm font-medium">{card.title}</span>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => dispatch(updateCard({ cardId: card._id, payload: { archived: false } }))}
                  >
                    Restore
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-xl border border-app bg-panel-soft p-3">
            <h4 className="mb-2 text-base font-black tracking-tight">Members</h4>
            <div className="space-y-2">
              {(currentBoard?.members || []).map((member) => (
                <div key={member._id} className="rounded-lg border border-app bg-panel p-2">
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-xs text-app-muted">{member.email}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>

      {boardMenuOpen ? (
        <button
          className="fixed inset-0 z-40 bg-slate-950/35"
          onClick={() => dispatch(setBoardMenuOpen(false))}
        />
      ) : null}
    </>
  );
}

export default BoardMenu;
