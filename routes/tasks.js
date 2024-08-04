const express = require('express');
const jwt = require('jsonwebtoken');
const Task = require('../models/Task');

const router = express.Router();

const auth = (req, res, next) => {
  const token = req.header('Authorization');
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }
  try {
    const decoded = jwt.verify(token, 'secret');
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Success
 */
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user.userId });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: title
 *         in: body
 *         required: true
 *         schema:
 *           type: string
 *       - name: description
 *         in: body
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       201:
 *         description: Created
 */
router.post('/', auth, async (req, res) => {
  const { title, description } = req.body;
  try {
    const task = new Task({ userId: req.user.userId, title, description });
    await task.save();
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   put:
 *     summary: Update a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: title
 *         in: body
 *         required: true
 *         schema:
 *           type: string
 *       - name: description
 *         in: body
 *         required: false
 *         schema:
 *           type: string
 *       - name: completed
 *         in: body
 *         required: false
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: Success
 */
router.put('/:id', auth, async (req, res) => {
  const { id } = req.params;
  const { title, description, completed } = req.body;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.userId.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    task.title = title;
    task.description = description;
    task.completed = completed;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Delete a task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success
 */
router.delete('/:id', auth, async (req, res) => {
  const { id } = req.params;
  try {
    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    if (task.userId.toString() !== req.user.userId) {
      return res.status(401).json({ message: 'Not authorized' });
    }
    await task.remove();
    res.json({ message: 'Task removed' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
