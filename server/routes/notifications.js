const router = require('express').Router();
const Notification = require('../models/Notification');
const Countdown = require('../models/Countdown');
const { auth } = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(20);
    res.json(notifications);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true });
    res.json({ message: 'All marked as read' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Countdowns
router.get('/countdowns', auth, async (req, res) => {
  try {
    const countdowns = await Countdown.find({ user: req.user._id }).sort({ targetDate: 1 });
    res.json(countdowns);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/countdowns', auth, async (req, res) => {
  try {
    const countdown = await Countdown.create({ ...req.body, user: req.user._id });
    res.status(201).json(countdown);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/countdowns/:id', auth, async (req, res) => {
  try {
    await Countdown.findOneAndDelete({ _id: req.params.id, user: req.user._id });
    res.json({ message: 'Deleted' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
