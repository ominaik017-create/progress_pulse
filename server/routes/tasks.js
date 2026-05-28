const router = require('express').Router();
const Task = require('../models/Task');
const User = require('../models/User');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const { date, status, category } = req.query;
    let query = { user: req.user._id };
    if (status) query.status = status;
    if (category) query.category = category;
    if (date) {
      const start = new Date(date); start.setHours(0,0,0,0);
      const end = new Date(date); end.setHours(23,59,59,999);
      query.createdAt = { $gte: start, $lte: end };
    }
    const tasks = await Task.find(query).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const task = await Task.create({ ...req.body, user: req.user._id });
    res.status(201).json(task);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.user._id });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (req.body.status === 'completed' && task.status !== 'completed') {
      req.body.completedAt = new Date();
      await User.findByIdAndUpdate(req.user._id, { $inc: { totalTasksCompleted: 1 } });
    }
    const updated = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Task.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Task deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/today-stats', auth, async (req, res) => {
  try {
    const start = new Date(); start.setHours(0,0,0,0);
    const end = new Date(); end.setHours(23,59,59,999);
    const tasks = await Task.find({ user: req.user._id, createdAt: { $gte: start, $lte: end } });
    const completed = tasks.filter(t => t.status === 'completed').length;
    const total = tasks.length;
    const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;
    res.json({ total, completed, pending: total - completed, productivity });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
