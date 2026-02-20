const { randomUUID } = require('node:crypto');
const bcrypt = require('bcryptjs');
const { dbState } = require('../config/db');
const { User, Task } = require('../models');

const memory = {
  users: [],
  tasks: []
};

function normalizeUser(user) {
  if (!user) {
    return null;
  }

  if (user.toObject) {
    const doc = user.toObject();
    return {
      id: String(doc._id),
      name: doc.name,
      email: doc.email,
      passwordHash: doc.passwordHash,
      role: doc.role
    };
  }

  return user;
}

function normalizeTask(task) {
  if (!task) {
    return null;
  }

  if (task.toObject) {
    const doc = task.toObject();
    return {
      id: String(doc._id),
      title: doc.title,
      description: doc.description,
      completed: doc.completed,
      ownerId: doc.ownerId,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
  }

  return task;
}

async function listUsers() {
  if (dbState.mongoEnabled) {
    return (await User.find()).map(normalizeUser);
  }
  return memory.users;
}

async function createUser(data) {
  if (dbState.mongoEnabled) {
    const created = await User.create(data);
    return normalizeUser(created);
  }

  const user = { id: randomUUID(), ...data };
  memory.users.push(user);
  return user;
}

async function findUserByEmail(email) {
  if (dbState.mongoEnabled) {
    const user = await User.findOne({ email });
    return normalizeUser(user);
  }

  return memory.users.find((user) => user.email === email) || null;
}

async function findUserById(id) {
  if (dbState.mongoEnabled) {
    const user = await User.findById(id);
    return normalizeUser(user);
  }

  return memory.users.find((user) => user.id === id) || null;
}

async function ensureDefaultAdmin(email, plainPassword) {
  const existing = await findUserByEmail(email);
  if (existing) {
    return existing;
  }

  const passwordHash = await bcrypt.hash(plainPassword, 10);
  return createUser({
    name: 'System Admin',
    email,
    passwordHash,
    role: 'admin'
  });
}

async function createTask(data) {
  if (dbState.mongoEnabled) {
    const created = await Task.create(data);
    return normalizeTask(created);
  }

  const now = new Date().toISOString();
  const task = { id: randomUUID(), createdAt: now, updatedAt: now, ...data };
  memory.tasks.push(task);
  return task;
}

async function listTasksForUser(user) {
  if (dbState.mongoEnabled) {
    const query = user.role === 'admin' ? {} : { ownerId: user.id };
    return (await Task.find(query)).map(normalizeTask);
  }

  return user.role === 'admin'
    ? memory.tasks
    : memory.tasks.filter((task) => task.ownerId === user.id);
}

async function findTaskById(id) {
  if (dbState.mongoEnabled) {
    const task = await Task.findById(id);
    return normalizeTask(task);
  }

  return memory.tasks.find((task) => task.id === id) || null;
}

async function updateTask(id, updates) {
  if (dbState.mongoEnabled) {
    const task = await Task.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    return normalizeTask(task);
  }

  const task = await findTaskById(id);
  if (!task) {
    return null;
  }

  Object.assign(task, updates, { updatedAt: new Date().toISOString() });
  return task;
}

async function deleteTask(id) {
  if (dbState.mongoEnabled) {
    const deleted = await Task.findByIdAndDelete(id);
    return Boolean(deleted);
  }

  const index = memory.tasks.findIndex((task) => task.id === id);
  if (index < 0) {
    return false;
  }

  memory.tasks.splice(index, 1);
  return true;
}

function resetMemoryStore() {
  memory.users = [];
  memory.tasks = [];
}

module.exports = {
  listUsers,
  createUser,
  findUserByEmail,
  findUserById,
  ensureDefaultAdmin,
  createTask,
  listTasksForUser,
  findTaskById,
  updateTask,
  deleteTask,
  resetMemoryStore
};
