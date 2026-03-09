import mongoose from 'mongoose';

const listSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    boardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    position: { type: Number, required: true },
    cards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }],
  },
  { timestamps: true },
);

listSchema.index({ boardId: 1, position: 1 });

export default mongoose.model('List', listSchema);