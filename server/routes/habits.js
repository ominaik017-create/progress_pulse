const router = require('express').Router();
const Habit = require('../models/Habit');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const habits = await Habit.find({ user: req.user._id });
    res.json(habits);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const habit = await Habit.create({ ...req.body, user: req.user._id });
    res.status(201).json(habit);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/complete', auth, async (req, res) => {
  try {
    const habit = await Habit.findOne({ _id: req.params.id, user: req.user._id });
    if (!habit) return res.status(404).json({ message: 'Habit not found' });
    const today = new Date(); today.setHours(0,0,0,0);
    const alreadyDone = habit.completedDates.some(d => new Date(d).toDateString() === today.toDateString());
    if (!alreadyDone) {
      habit.completedDates.push(today);
      habit.currentStreak += 1;
      if (habit.currentStreak > habit.longestStreak) habit.longestStreak = habit.currentStreak;
    }
    await habit.save();
    res.json(habit);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    await Habit.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Habit deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
