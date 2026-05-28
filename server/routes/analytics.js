const router = require('express').Router();
const Task = require('../models/Task');
const Habit = require('../models/Habit');
const { auth } = require('../middleware/auth');

router.get('/weekly', auth, async (req, res) => {
  try {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const start = new Date(date); start.setHours(0,0,0,0);
      const end = new Date(date); end.setHours(23,59,59,999);
      const tasks = await Task.find({ user: req.user._id, createdAt: { $gte: start, $lte: end } });
      const completed = tasks.filter(t => t.status === 'completed').length;
      const total = tasks.length;
      days.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        fullDate: date.toISOString().split('T')[0],
        total, completed,
        productivity: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }
    res.json(days);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/monthly', auth, async (req, res) => {
  try {
    const weeks = [];
    for (let w = 3; w >= 0; w--) {
      const end = new Date(); end.setDate(end.getDate() - w * 7); end.setHours(23,59,59,999);
      const start = new Date(end); start.setDate(start.getDate() - 6); start.setHours(0,0,0,0);
      const tasks = await Task.find({ user: req.user._id, createdAt: { $gte: start, $lte: end } });
      const completed = tasks.filter(t => t.status === 'completed').length;
      const total = tasks.length;
      weeks.push({
        week: `Week ${4 - w}`,
        total, completed,
        productivity: total > 0 ? Math.round((completed / total) * 100) : 0,
      });
    }
    res.json(weeks);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/category-breakdown', auth, async (req, res) => {
  try {
    const categories = ['study', 'fitness', 'work', 'personal', 'health', 'coding', 'other'];
    const result = await Promise.all(categories.map(async (cat) => {
      const total = await Task.countDocuments({ user: req.user._id, category: cat });
      const completed = await Task.countDocuments({ user: req.user._id, category: cat, status: 'completed' });
      return { category: cat, total, completed };
    }));
    res.json(result.filter(r => r.total > 0));
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
