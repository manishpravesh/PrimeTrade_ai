const express = require('express');
const { body, param } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { createTask, listTasksForUser, findTaskById, updateTask, deleteTask } = require('../services/store');

const router = express.Router();

router.use(authenticate);

router.get('/', async (req, res, next) => {
  try {
    const tasks = await listTasksForUser(req.user);
    return res.status(200).json(tasks);
  } catch (error) {
    return next(error);
  }
});

router.post(
  '/',
  [
    body('title').trim().isLength({ min: 1, max: 140 }),
    body('description').optional().trim().isLength({ max: 500 })
  ],
  validate,
  async (req, res, next) => {
    try {
      const task = await createTask({
        title: req.body.title,
        description: req.body.description || '',
        completed: false,
        ownerId: req.user.id
      });
      return res.status(201).json(task);
    } catch (error) {
      return next(error);
    }
  }
);

router.put(
  '/:id',
  [
    param('id').trim().notEmpty(),
    body('title').optional().trim().isLength({ min: 1, max: 140 }),
    body('description').optional().trim().isLength({ max: 500 }),
    body('completed').optional().isBoolean()
  ],
  validate,
  async (req, res, next) => {
    try {
      const task = await findTaskById(req.params.id);
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }
      if (task.ownerId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden: cannot modify this task' });
      }

      const updated = await updateTask(task.id, req.body);
      return res.status(200).json(updated);
    } catch (error) {
      return next(error);
    }
  }
);

router.delete('/:id', [param('id').trim().notEmpty()], validate, async (req, res, next) => {
  try {
    const task = await findTaskById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.ownerId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden: cannot delete this task' });
    }

    await deleteTask(task.id);
    return res.status(204).send();
  } catch (error) {
    return next(error);
  }
});

module.exports = router;
