const router = require('express').Router();
const User = require('../models/User');
const Challenge = require('../models/Challenge');
const { adminAuth } = require('../middleware/auth');

router.get('/users', adminAuth, async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/users/:id/verify-creator', adminAuth, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, { isVerifiedCreator: true, role: 'creator' }, { new: true }).select('-password');
    res.json(user);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/challenges/pending', adminAuth, async (req, res) => {
  try {
    const challenges = await Challenge.find({ status: 'pending', isPublic: true }).populate('creator', 'name email');
    res.json(challenges);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/challenges/:id/approve', adminAuth, async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(req.params.id, { status: 'active' }, { new: true });
    res.json(challenge);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/challenges/:id/reject', adminAuth, async (req, res) => {
  try {
    const challenge = await Challenge.findByIdAndUpdate(req.params.id, { status: 'rejected' }, { new: true });
    res.json(challenge);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/stats', adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalChallenges = await Challenge.countDocuments();
    const pendingChallenges = await Challenge.countDocuments({ status: 'pending' });
    res.json({ totalUsers, totalChallenges, pendingChallenges });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
