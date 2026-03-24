import express from 'express';
import { handleDiscovery } from '../controllers/discoveryController.js';
import Problem from '../models/Problem.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/discover', protect, handleDiscovery);

// Fetch saved histories
router.get('/history', protect, async (req, res) => {
  try {
    const history = await Problem.find().sort({ createdAt: -1 }).limit(10);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

export default router;
