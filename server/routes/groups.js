const router = require('express').Router();
const Group = require('../models/Group');
const Message = require('../models/Message');
const { auth } = require('../middleware/auth');

const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

router.get('/', auth, async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('admin', 'name avatar')
      .populate('members', 'name avatar streak');
    res.json(groups);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, description } = req.body;
    const inviteCode = generateCode();
    const group = await Group.create({
      name, description,
      admin: req.user._id,
      members: [req.user._id],
      inviteCode,
    });
    await group.populate('admin', 'name avatar');
    res.status(201).json(group);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/join', auth, async (req, res) => {
  try {
    const { inviteCode } = req.body;
    const group = await Group.findOne({ inviteCode });
    if (!group) return res.status(404).json({ message: 'Invalid invite code' });
    if (group.members.includes(req.user._id)) return res.status(400).json({ message: 'Already a member' });
    if (group.members.length >= group.maxMembers) return res.status(400).json({ message: 'Group is full' });
    group.members.push(req.user._id);
    await group.save();
    await group.populate('admin', 'name avatar');
    await group.populate('members', 'name avatar streak');
    res.json(group);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('admin', 'name avatar')
      .populate('members', 'name avatar streak totalTasksCompleted');
    if (!group) return res.status(404).json({ message: 'Group not found' });
    res.json(group);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id/messages', auth, async (req, res) => {
  try {
    const messages = await Message.find({ group: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .limit(100);
    res.json(messages);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.delete('/:id/leave', auth, async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ message: 'Group not found' });
    group.members = group.members.filter(m => m.toString() !== req.user._id.toString());
    await group.save();
    res.json({ message: 'Left group' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
