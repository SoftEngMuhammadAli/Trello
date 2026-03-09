import { useDispatch, useSelector } from 'react-redux';
import { setBoardMenuOpen } from '../../features/cards/uiSlice';
import Modal from '../common/Modal';

function BoardMenu() {
  const dispatch = useDispatch();
  const { boardMenuOpen } = useSelector((state) => state.ui);
  const { currentBoard } = useSelector((state) => state.boards);

  return (
    <Modal
      open={boardMenuOpen}
      onClose={() => dispatch(setBoardMenuOpen(false))}
      title="Board Menu"
      className="max-w-xl"
    >
      <div className="space-y-4 text-sm text-slate-700">
        <section>
          <h4 className="mb-1 text-base font-semibold">About Board</h4>
          <p>Workspace: {currentBoard?.workspaceId || 'N/A'}</p>
          <p>Visibility: Workspace members</p>
        </section>

        <section>
          <h4 className="mb-1 text-base font-semibold">Archived Items</h4>
          <p>
            {
              Object.values(currentBoard?.cardsById || {}).filter((card) => card.archived)
                .length
            }{' '}
            archived cards
          </p>
        </section>

        <section>
          <h4 className="mb-2 text-base font-semibold">Activity Log</h4>
          <div className="max-h-56 space-y-2 overflow-auto rounded-lg bg-slate-50 p-2">
            {(currentBoard?.activityLog || []).map((entry, index) => (
              <div key={`${entry.createdAt}-${index}`} className="rounded bg-white p-2">
                <p className="font-medium text-slate-800">{entry.action}</p>
                <p className="text-xs text-slate-500">{new Date(entry.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Modal>
  );
}

export default BoardMenu;


