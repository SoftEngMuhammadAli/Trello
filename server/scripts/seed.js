import mongoose from 'mongoose';
import connectDb from '../src/config/db.js';
import User from '../src/models/User.js';
import Workspace from '../src/models/Workspace.js';
import Board from '../src/models/Board.js';
import List from '../src/models/List.js';
import Card from '../src/models/Card.js';

async function seed() {
  await connectDb();

  await Promise.all([
    User.deleteMany({}),
    Workspace.deleteMany({}),
    Board.deleteMany({}),
    List.deleteMany({}),
    Card.deleteMany({}),
  ]);

  const user = await User.create({
    name: 'Demo Admin',
    email: 'demo@trelloclone.dev',
    password: 'password123',
    avatar: 'https://i.pravatar.cc/150?u=demo',
  });

  const workspace = await Workspace.create({
    name: 'Demo Workspace',
    description: 'Seeded workspace for local testing',
    createdBy: user._id,
    members: [{ userId: user._id, role: 'admin' }],
  });

  user.workspaces = [workspace._id];
  await user.save();

  const board = await Board.create({
    title: 'Product Roadmap',
    workspaceId: workspace._id,
    members: [user._id],
    background: { type: 'color', value: '#0b78de' },
    activityLog: [{ action: 'board.created', userId: user._id, meta: { seeded: true } }],
  });

  workspace.boards = [board._id];
  await workspace.save();

  const todo = await List.create({ title: 'To Do', boardId: board._id, position: 0, cards: [] });
  const doing = await List.create({ title: 'Doing', boardId: board._id, position: 1, cards: [] });

  board.lists = [todo._id, doing._id];
  await board.save();

  const card = await Card.create({
    title: 'Set up CI pipeline',
    description: 'Create lint, test, and build checks.',
    boardId: board._id,
    listId: todo._id,
    position: 0,
    members: [user._id],
    labels: [{ text: 'DevOps', color: '#2563eb' }],
  });

  todo.cards = [card._id];
  await todo.save();

  console.log('Seed completed.');
  console.log('Demo login: demo@trelloclone.dev / password123');

  await mongoose.connection.close();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});