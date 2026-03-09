import { useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import {
  createComment,
  deleteCard,
  updateCard,
  uploadAttachment,
} from '../../features/boards/boardSlice';
import { setActiveCardId } from '../../features/cards/uiSlice';
import Button from '../common/Button';
import Modal from '../common/Modal';

function CardModal({ card, members = [] }) {
  const dispatch = useDispatch();
  const [draft, setDraft] = useState(card);
  const [comment, setComment] = useState('');

  const memberSet = useMemo(() => new Set(draft.members || []), [draft.members]);

  const saveChanges = () => {
    dispatch(
      updateCard({
        cardId: card._id,
        payload: {
          title: draft.title,
          description: draft.description,
          labels: draft.labels,
          dueDate: draft.dueDate,
          members: draft.members,
          cover: draft.cover,
        },
      }),
    );
  };

  const onAddComment = () => {
    if (!comment.trim()) return;
    dispatch(createComment({ cardId: card._id, text: comment.trim() }));
    setComment('');
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    dispatch(uploadAttachment({ cardId: card._id, file }));
  };

  const closeModal = () => dispatch(setActiveCardId(null));

  return (
    <Modal open={Boolean(card)} onClose={closeModal} title="Card Details" className="max-w-4xl">
      <div className="grid gap-6 md:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          <input
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-lg font-semibold"
            value={draft.title}
            onChange={(event) => setDraft((prev) => ({ ...prev, title: event.target.value }))}
          />

          <textarea
            className="min-h-28 w-full rounded-lg border border-slate-300 px-3 py-2"
            value={draft.description || ''}
            onChange={(event) => setDraft((prev) => ({ ...prev, description: event.target.value }))}
            placeholder="Add a more detailed description"
          />

          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-700">Labels</h4>
            <div className="flex flex-wrap gap-2">
              {(draft.labels || []).map((label, index) => (
                <span
                  key={`${card._id}-modal-label-${index}`}
                  className="rounded px-2 py-1 text-xs text-white"
                  style={{ backgroundColor: label.color }}
                >
                  {label.text || 'label'}
                </span>
              ))}
              <button
                className="rounded bg-slate-200 px-2 py-1 text-xs"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    labels: [...(prev.labels || []), { text: 'New', color: '#3b82f6' }],
                  }))
                }
              >
                + Label
              </button>
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-700">Due Date</h4>
            <DatePicker
              selected={draft.dueDate ? new Date(draft.dueDate) : null}
              onChange={(date) => setDraft((prev) => ({ ...prev, dueDate: date ? date.toISOString() : null }))}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
              placeholderText="Select due date"
              isClearable
            />
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-700">Comments</h4>
            <div className="mb-3 flex gap-2">
              <input
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder="Write a comment"
              />
              <Button onClick={onAddComment}>Post</Button>
            </div>

            <div className="max-h-44 space-y-2 overflow-auto rounded-xl bg-slate-50 p-2">
              {(card.commentsData || []).map((item) => (
                <div key={item._id} className="rounded-lg bg-white p-2 text-sm">
                  <p className="font-semibold text-slate-700">{item.userId?.name || 'Member'}</p>
                  <p className="text-slate-700">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-4 rounded-2xl bg-slate-50 p-4">
          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-700">Members</h4>
            <div className="space-y-2">
              {members.map((member) => {
                const selected = memberSet.has(member._id);
                return (
                  <label key={member._id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => {
                        setDraft((prev) => ({
                          ...prev,
                          members: selected
                            ? (prev.members || []).filter((id) => id !== member._id)
                            : [...(prev.members || []), member._id],
                        }));
                      }}
                    />
                    <span>{member.name}</span>
                  </label>
                );
              })}
            </div>
          </div>

          <div>
            <h4 className="mb-2 text-sm font-semibold text-slate-700">Attachments</h4>
            <input type="file" onChange={handleFileUpload} className="mb-2 text-sm" />
            <div className="space-y-1 text-xs">
              {(card.attachments || []).map((attachment, idx) => (
                <a
                  key={`${attachment.url}-${idx}`}
                  className="block text-brand-700 underline"
                  href={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000'}${attachment.url}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {attachment.name}
                </a>
              ))}
            </div>
          </div>

          <Button className="w-full" onClick={saveChanges}>
            Save Changes
          </Button>
          <Button
            className="w-full"
            variant="danger"
            onClick={() => {
              dispatch(deleteCard(card._id));
              closeModal();
            }}
          >
            Delete Card
          </Button>
        </aside>
      </div>
    </Modal>
  );
}

export default CardModal;


