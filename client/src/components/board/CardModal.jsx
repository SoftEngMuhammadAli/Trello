import { useEffect, useMemo, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useDispatch } from 'react-redux';
import {
  createCard,
  createComment,
  deleteCard,
  deleteComment,
  moveCard,
  updateCard,
  updateComment,
  uploadAttachment,
} from '../../features/boards/boardSlice';
import { setActiveCardId } from '../../features/cards/uiSlice';
import Button from '../common/Button';
import Modal from '../common/Modal';

const makeChecklist = () => ({
  id: crypto.randomUUID(),
  title: 'Checklist',
  items: [],
});

const makeChecklistItem = () => ({
  id: crypto.randomUUID(),
  text: 'Task',
  done: false,
});

function CardModal({ card, members = [], lists = [], onTyping }) {
  const dispatch = useDispatch();
  const [draft, setDraft] = useState(card);
  const [comment, setComment] = useState('');
  const [editingComment, setEditingComment] = useState({ id: '', text: '' });
  const [moveTargetListId, setMoveTargetListId] = useState(card.listId);

  useEffect(() => {
    setDraft(card);
    setMoveTargetListId(card.listId);
  }, [card]);

  const memberSet = useMemo(() => new Set(draft.members || []), [draft.members]);

  const saveChanges = () => {
    dispatch(
      updateCard({
        cardId: card._id,
        payload: {
          title: draft.title,
          description: draft.description,
          labels: draft.labels,
          status: draft.status,
          priority: draft.priority,
          startDate: draft.startDate,
          dueDate: draft.dueDate,
          members: draft.members,
          cover: draft.cover,
          checklists: draft.checklists,
        },
      }),
    );
  };

  const onAddComment = () => {
    if (!comment.trim()) return;
    dispatch(createComment({ cardId: card._id, text: comment.trim() }));
    setComment('');
  };

  const onUpdateComment = () => {
    if (!editingComment.id || !editingComment.text.trim()) return;
    dispatch(updateComment({ commentId: editingComment.id, text: editingComment.text.trim() }));
    setEditingComment({ id: '', text: '' });
  };

  const handleFileUpload = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    dispatch(uploadAttachment({ cardId: card._id, file }));
  };

  const closeModal = () => dispatch(setActiveCardId(null));

  const checklistStats = (draft.checklists || []).map((checklist) => {
    const done = (checklist.items || []).filter((item) => item.done).length;
    return {
      id: checklist.id,
      done,
      total: checklist.items?.length || 0,
    };
  });

  return (
    <Modal open={Boolean(card)} onClose={closeModal} title="Card Details" className="max-w-6xl">
      <div className="grid gap-4 lg:grid-cols-[1fr_300px] lg:gap-6">
        <div className="space-y-5 rounded-2xl border border-app bg-panel-soft p-4">
          <input
            className="w-full rounded-lg border border-app bg-panel px-3 py-2 text-lg font-black tracking-tight text-app"
            value={draft.title}
            onChange={(event) => {
              onTyping?.();
              setDraft((prev) => ({ ...prev, title: event.target.value }));
            }}
          />

          <textarea
            className="min-h-28 w-full rounded-lg border border-app bg-panel px-3 py-2 text-app"
            value={draft.description || ''}
            onChange={(event) => {
              onTyping?.();
              setDraft((prev) => ({ ...prev, description: event.target.value }));
            }}
            placeholder="Add a more detailed description"
          />

          <section>
            <div className="mb-2 flex items-center justify-between">
              <h4 className="text-sm font-black uppercase tracking-wide text-app-muted">Checklists</h4>
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    checklists: [...(prev.checklists || []), makeChecklist()],
                  }))
                }
              >
                + Checklist
              </Button>
            </div>

            <div className="space-y-3">
              {(draft.checklists || []).map((checklist) => {
                const stat = checklistStats.find((entry) => entry.id === checklist.id);
                return (
                  <div key={checklist.id} className="rounded-xl border border-app bg-panel p-3">
                    <input
                      className="mb-2 w-full rounded border border-app bg-transparent px-2 py-1 text-sm font-semibold text-app"
                      value={checklist.title}
                      onChange={(event) =>
                        setDraft((prev) => ({
                          ...prev,
                          checklists: (prev.checklists || []).map((entry) =>
                            entry.id === checklist.id ? { ...entry, title: event.target.value } : entry,
                          ),
                        }))
                      }
                    />
                    <p className="mb-2 text-xs text-app-muted">
                      {stat?.done || 0}/{stat?.total || 0} complete
                    </p>

                    <div className="space-y-2">
                      {(checklist.items || []).map((item) => (
                        <label key={item.id} className="flex items-center gap-2 text-sm text-app">
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={() =>
                              setDraft((prev) => ({
                                ...prev,
                                checklists: (prev.checklists || []).map((entry) =>
                                  entry.id === checklist.id
                                    ? {
                                        ...entry,
                                        items: (entry.items || []).map((it) =>
                                          it.id === item.id ? { ...it, done: !it.done } : it,
                                        ),
                                      }
                                    : entry,
                                ),
                              }))
                            }
                          />
                          <input
                            className="w-full rounded border border-app bg-transparent px-2 py-1"
                            value={item.text}
                            onChange={(event) =>
                              setDraft((prev) => ({
                                ...prev,
                                checklists: (prev.checklists || []).map((entry) =>
                                  entry.id === checklist.id
                                    ? {
                                        ...entry,
                                        items: (entry.items || []).map((it) =>
                                          it.id === item.id ? { ...it, text: event.target.value } : it,
                                        ),
                                      }
                                    : entry,
                                ),
                              }))
                            }
                          />
                        </label>
                      ))}
                    </div>

                    <div className="mt-2 flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            checklists: (prev.checklists || []).map((entry) =>
                              entry.id === checklist.id
                                ? { ...entry, items: [...(entry.items || []), makeChecklistItem()] }
                                : entry,
                            ),
                          }))
                        }
                      >
                        + Item
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() =>
                          setDraft((prev) => ({
                            ...prev,
                            checklists: (prev.checklists || []).filter((entry) => entry.id !== checklist.id),
                          }))
                        }
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-black uppercase tracking-wide text-app-muted">Comments</h4>
            <div className="mb-3 flex flex-col gap-2 sm:flex-row">
              <input
                className="w-full rounded-lg border border-app bg-panel px-3 py-2"
                value={comment}
                onChange={(event) => {
                  onTyping?.();
                  setComment(event.target.value);
                }}
                placeholder="Write a comment"
              />
              <Button className="w-full sm:w-auto" onClick={onAddComment}>
                Post
              </Button>
            </div>

            <div className="custom-scrollbar max-h-56 space-y-2 overflow-auto rounded-xl border border-app bg-panel p-2">
              {(card.commentsData || []).map((item) => (
                <div key={item._id} className="rounded-lg border border-app bg-panel-soft p-2 text-sm">
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <p className="font-semibold text-app">{item.userId?.name || 'Member'}</p>
                    <p className="text-[11px] text-app-muted">{new Date(item.createdAt).toLocaleString()}</p>
                  </div>

                  {editingComment.id === item._id ? (
                    <div className="space-y-2">
                      <textarea
                        className="w-full rounded border border-app bg-panel px-2 py-1"
                        value={editingComment.text}
                        onChange={(event) => setEditingComment((prev) => ({ ...prev, text: event.target.value }))}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={onUpdateComment}>
                          Save
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setEditingComment({ id: '', text: '' })}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-app">{item.text}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          className="rounded px-1 py-0.5 text-xs text-accent hover:bg-hover"
                          onClick={() => setEditingComment({ id: item._id, text: item.text })}
                        >
                          Edit
                        </button>
                        <button
                          className="rounded px-1 py-0.5 text-xs text-rose-400 hover:bg-hover"
                          onClick={() => dispatch(deleteComment({ commentId: item._id, cardId: card._id }))}
                        >
                          Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-4 rounded-2xl border border-app bg-panel p-4">
          <section>
            <h4 className="mb-2 text-sm font-black uppercase tracking-wide text-app-muted">Members</h4>
            <div className="space-y-2">
              {members.map((member) => {
                const selected = memberSet.has(member._id);
                return (
                  <label key={member._id} className="flex items-center gap-2 text-sm text-app">
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
          </section>

          <section>
            <h4 className="mb-2 text-sm font-black uppercase tracking-wide text-app-muted">Labels</h4>
            <div className="mb-2 flex flex-wrap gap-1">
              {(draft.labels || []).map((label, index) => (
                <span
                  key={`${card._id}-modal-label-${index}`}
                  className="rounded px-2 py-1 text-xs font-semibold text-white"
                  style={{ backgroundColor: label.color }}
                >
                  {label.text || 'label'}
                </span>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() =>
                  setDraft((prev) => ({
                    ...prev,
                    labels: [...(prev.labels || []), { text: 'Label', color: '#0891b2' }],
                  }))
                }
              >
                + Label
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setDraft((prev) => ({ ...prev, labels: [] }))}>
                Clear
              </Button>
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-black uppercase tracking-wide text-app-muted">Due Date</h4>
            <DatePicker
              selected={draft.startDate ? new Date(draft.startDate) : null}
              onChange={(date) => setDraft((prev) => ({ ...prev, startDate: date ? date.toISOString() : null }))}
              className="mb-2 w-full rounded-lg border border-app bg-panel px-3 py-2"
              placeholderText="Select start date"
              isClearable
            />
            <DatePicker
              selected={draft.dueDate ? new Date(draft.dueDate) : null}
              onChange={(date) => setDraft((prev) => ({ ...prev, dueDate: date ? date.toISOString() : null }))}
              className="w-full rounded-lg border border-app bg-panel px-3 py-2"
              placeholderText="Select due date"
              isClearable
            />
          </section>

          <section>
            <h4 className="mb-2 text-sm font-black uppercase tracking-wide text-app-muted">Status & Priority</h4>
            <div className="space-y-2">
              <select
                className="w-full rounded-lg border border-app bg-panel px-3 py-2 text-sm text-app"
                value={draft.status || 'todo'}
                onChange={(event) => setDraft((prev) => ({ ...prev, status: event.target.value }))}
              >
                <option value="backlog">Backlog</option>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="done">Done</option>
                <option value="blocked">Blocked</option>
              </select>
              <select
                className="w-full rounded-lg border border-app bg-panel px-3 py-2 text-sm text-app"
                value={draft.priority || 'medium'}
                onChange={(event) => setDraft((prev) => ({ ...prev, priority: event.target.value }))}
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-black uppercase tracking-wide text-app-muted">Cover Image</h4>
            <input
              className="w-full rounded-lg border border-app bg-panel px-3 py-2 text-sm"
              value={draft.cover || ''}
              onChange={(event) => setDraft((prev) => ({ ...prev, cover: event.target.value }))}
              placeholder="Image URL"
            />
          </section>

          <section>
            <h4 className="mb-2 text-sm font-black uppercase tracking-wide text-app-muted">Attachments</h4>
            <input type="file" onChange={handleFileUpload} className="mb-2 text-sm" />
            <div className="space-y-1 text-xs">
              {(card.attachments || []).map((attachment, idx) => (
                <a
                  key={`${attachment.url}-${idx}`}
                  className="block break-all text-accent underline"
                  href={`${import.meta.env.VITE_SOCKET_URL || 'http://localhost:3030'}${attachment.url}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {attachment.name}
                </a>
              ))}
            </div>
          </section>

          <section>
            <h4 className="mb-2 text-sm font-black uppercase tracking-wide text-app-muted">Move / Copy</h4>
            <select
              className="mb-2 w-full rounded-lg border border-app bg-panel px-3 py-2 text-sm"
              value={moveTargetListId}
              onChange={(event) => setMoveTargetListId(event.target.value)}
            >
              {lists.map((list) => (
                <option key={list._id} value={list._id}>
                  {list.title}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() =>
                  dispatch(
                    moveCard({
                      cardId: card._id,
                      payload: {
                        targetListId: moveTargetListId,
                        targetPosition: lists.find((list) => list._id === moveTargetListId)?.cardIds?.length || 0,
                      },
                    }),
                  )
                }
              >
                Move
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() =>
                  dispatch(
                    createCard({
                      listId: card.listId,
                      title: `${card.title} (Copy)`,
                      description: card.description,
                      labels: card.labels,
                      status: card.status,
                      priority: card.priority,
                      startDate: card.startDate,
                      dueDate: card.dueDate,
                      members: card.members,
                      cover: card.cover,
                      checklists: card.checklists,
                    }),
                  )
                }
              >
                Copy
              </Button>
            </div>
          </section>

          <Button className="w-full" onClick={saveChanges}>
            Save changes
          </Button>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => dispatch(updateCard({ cardId: card._id, payload: { archived: true } }))}
          >
            Archive card
          </Button>
          <Button
            className="w-full"
            variant="danger"
            onClick={() => {
              dispatch(deleteCard(card._id));
              closeModal();
            }}
          >
            Delete card
          </Button>
        </aside>
      </div>
    </Modal>
  );
}

export default CardModal;
