import mongoose from 'mongoose';

const cardLabelSchema = new mongoose.Schema(
  {
    text: { type: String, trim: true, maxlength: 40 },
    color: { type: String, default: '#9ca3af' },
  },
  { _id: false },
);

const attachmentSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    url: { type: String, required: true },
    mimeType: { type: String, default: '' },
    size: { type: Number, default: 0 },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const checklistItemSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 200 },
    done: { type: Boolean, default: false },
  },
  { _id: false },
);

const checklistSchema = new mongoose.Schema(
  {
    id: { type: String, required: true },
    title: { type: String, required: true, trim: true, maxlength: 120 },
    items: [checklistItemSchema],
  },
  { _id: false },
);

const cardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 300 },
    description: { type: String, default: '' },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    listId: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
    position: { type: Number, required: true },
    labels: [cardLabelSchema],
    dueDate: { type: Date, default: null },
    attachments: [attachmentSchema],
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    cover: { type: String, default: '' },
    checklists: [checklistSchema],
    archived: { type: Boolean, default: false },
  },
  { timestamps: true },
);

cardSchema.index({ listId: 1, position: 1 });
cardSchema.index({ boardId: 1, archived: 1 });
cardSchema.index({ title: 'text', description: 'text' });

export default mongoose.model('Card', cardSchema);
