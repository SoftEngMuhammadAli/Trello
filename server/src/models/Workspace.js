import mongoose from 'mongoose';

const workspaceMemberSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['admin', 'member'], default: 'member' },
  },
  { _id: false },
);

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: '', maxlength: 500 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [workspaceMemberSchema],
    boards: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Board' }],
  },
  { timestamps: true },
);

workspaceSchema.index({ createdBy: 1, createdAt: -1 });
workspaceSchema.index({ name: 'text', description: 'text' });

export default mongoose.model('Workspace', workspaceSchema);