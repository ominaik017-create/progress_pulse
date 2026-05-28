const router = require('express').Router();
const Challenge = require('../models/Challenge');
const { auth } = require('../middleware/auth');

router.get('/public', async (req, res) => {
  try {
    const challenges = await Challenge.find({ isPublic: true, status: 'active' })
      .populate('creator', 'name avatar bio')
      .sort({ createdAt: -1 });
    res.json(challenges);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/my', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find({ 'participants.user': req.user._id })
      .populate('creator', 'name avatar');
    res.json(challenges);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/group/:groupId', auth, async (req, res) => {
  try {
    const challenges = await Challenge.find({ group: req.params.groupId, type: 'group' })
      .populate('participants.user', 'name avatar');
    res.json(challenges);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const data = { ...req.body, creator: req.user._id };
    if (data.isPublic) {
      data.status = req.user.isVerifiedCreator ? 'active' : 'pending';
    }
    data.participants = [{ user: req.user._id, score: 0, status: 'accepted' }];
    const challenge = await Challenge.create(data);
    res.status(201).json(challenge);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/join', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id);
    if (!challenge) return res.status(404).json({ message: 'Challenge not found' });
    const already = challenge.participants.find(p => p.user.toString() === req.user._id.toString());
    if (already) return res.status(400).json({ message: 'Already joined' });
    challenge.participants.push({ user: req.user._id, score: 0, status: challenge.isPublic ? 'pending' : 'accepted' });
    await challenge.save();
    res.json(challenge);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/complete-task', auth, async (req, res) => {
  try {
    const { taskId } = req.body;
    const challenge = await Challenge.findById(req.params.id);
    const participant = challenge.participants.find(p => p.user.toString() === req.user._id.toString());
    if (!participant) return res.status(403).json({ message: 'Not a participant' });
    if (!participant.completedTasks.includes(taskId)) {
      participant.completedTasks.push(taskId);
      const task = challenge.tasks.id(taskId);
      participant.score += task ? task.points : 10;
    }
    await challenge.save();
    res.json(challenge);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const challenge = await Challenge.findById(req.params.id)
      .populate('creator', 'name avatar bio')
      .populate('participants.user', 'name avatar streak');
    res.json(challenge);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
