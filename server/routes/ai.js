const router = require('express').Router();
const { auth } = require('../middleware/auth');

const motivationalQuotes = [
  "Every expert was once a beginner. Keep pushing forward!",
  "Consistency is more important than perfection. Show up every day!",
  "Your future self will thank you for the work you do today.",
  "Progress, not perfection. Every small step counts!",
  "The secret of getting ahead is getting started.",
  "Success is the sum of small efforts repeated day in and day out.",
  "Discipline is choosing between what you want now and what you want most.",
  "Don't watch the clock; do what it does. Keep going!",
  "Your only limit is your mind. Break it!",
  "Great things never come from comfort zones.",
  "Dream big. Work hard. Stay focused.",
  "Every day is a chance to be better than yesterday.",
  "The harder you work, the luckier you get.",
  "Push yourself because no one else is going to do it for you.",
  "Wake up with determination. Go to bed with satisfaction.",
];

router.get('/motivation', auth, async (req, res) => {
  try {
    // Try Ollama first, fallback to curated quotes
    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3.2:3b',
          prompt: 'Give one short, powerful motivational quote for productivity and consistency. Maximum 2 sentences. Be specific and inspiring.',
          stream: false,
        }),
        signal: AbortSignal.timeout(5000),
      });
      if (response.ok) {
        const data = await response.json();
        return res.json({ quote: data.response.trim(), source: 'ai' });
      }
    } catch (e) { /* Ollama not running, use fallback */ }

    const quote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
    res.json({ quote, source: 'curated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/summary', auth, async (req, res) => {
  try {
    const { productivity, completed, streak } = req.body;
    const prompt = `A user completed ${completed} tasks today with ${productivity}% productivity and has a ${streak} day streak. Give a 2-sentence encouraging summary and one tip.`;

    try {
      const response = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'llama3.2:3b', prompt, stream: false }),
        signal: AbortSignal.timeout(8000),
      });
      if (response.ok) {
        const data = await response.json();
        return res.json({ summary: data.response.trim(), source: 'ai' });
      }
    } catch (e) { /* fallback */ }

    const summaries = [
      `Amazing work completing ${completed} tasks! Your ${streak}-day streak shows incredible dedication. Keep this momentum going!`,
      `${productivity}% productivity is ${productivity >= 70 ? 'outstanding' : 'a great start'}! With a ${streak}-day streak, you're building real discipline.`,
      `You're on fire with a ${streak}-day streak! ${completed} tasks done today — consistency like this leads to extraordinary results.`,
    ];
    res.json({ summary: summaries[Math.floor(Math.random() * summaries.length)], source: 'curated' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
