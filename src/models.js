const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' }
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '', trim: true },
    completed: { type: Boolean, default: false },
    ownerId: { type: String, required: true }
  },
  { timestamps: true }
);

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

module.exports = { User, Task };
