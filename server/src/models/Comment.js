import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true, maxlength: 2000 },
    cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true },
);

commentSchema.index({ cardId: 1, createdAt: -1 });
commentSchema.index({ text: 'text' });

export default mongoose.model('Comment', commentSchema);