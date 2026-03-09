const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema(
  {
    action: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    meta: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const boardSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    background: {
      type: {
        type: String,
        enum: ['color', 'image'],
        default: 'color',
      },
      value: { type: String, default: '#0b78de' },
    },
    workspaceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Workspace', required: true },
    lists: [{ type: mongoose.Schema.Types.ObjectId, ref: 'List' }],
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    activityLog: [activitySchema],
  },
  { timestamps: { createdAt: true, updatedAt: true } },
);

boardSchema.index({ workspaceId: 1, createdAt: -1 });
boardSchema.index({ title: 'text' });

module.exports = mongoose.model('Board', boardSchema);
