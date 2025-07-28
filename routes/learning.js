const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const LearningPath = require('../models/LearningPath');
const UserProgress = require('../models/UserProgress');

const router = express.Router();

// Get all learning paths
router.get('/', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const paths = await LearningPath.find(filter)
      .populate('createdBy', 'name')
      .sort({ 'rating.average': -1, totalEnrollments: -1 });

    res.json(paths);
  } catch (error) {
    console.error('Learning paths error:', error);
    res.status(500).json({ message: 'Failed to fetch learning paths' });
  }
});

// Get specific learning path
router.get('/:id', async (req, res) => {
  try {
    const path = await LearningPath.findById(req.params.id)
      .populate('createdBy', 'name');

    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    res.json(path);
  } catch (error) {
    console.error('Learning path error:', error);
    res.status(500).json({ message: 'Failed to fetch learning path' });
  }
});

// Enroll in learning path
router.post('/:id/enroll', authenticateToken, async (req, res) => {
  try {
    const pathId = req.params.id;
    const userId = req.user._id;

    // Check if path exists
    const path = await LearningPath.findById(pathId);
    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    // Check if already enrolled
    const existingProgress = await UserProgress.findOne({ userId, learningPathId: pathId });
    if (existingProgress) {
      return res.status(409).json({ message: 'Already enrolled in this path' });
    }

    // Create progress record
    const progress = new UserProgress({ userId, learningPathId: pathId });
    await progress.save();

    // Update enrollment count
    path.totalEnrollments += 1;
    await path.save();

    res.status(201).json({ message: 'Successfully enrolled', progress });
  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({ message: 'Failed to enroll in learning path' });
  }
});

// Get user's learning progress
router.get('/progress/me', authenticateToken, async (req, res) => {
  try {
    const progress = await UserProgress.find({ userId: req.user._id })
      .populate('learningPathId')
      .sort({ lastAccessedAt: -1 });

    res.json(progress);
  } catch (error) {
    console.error('Progress error:', error);
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
});

// Mark milestone as completed
router.post('/:pathId/milestone/:milestoneId/complete', authenticateToken, async (req, res) => {
  try {
    const { pathId, milestoneId } = req.params;
    const { timeSpent, notes, rating } = req.body;

    const progress = await UserProgress.findOne({
      userId: req.user._id,
      learningPathId: pathId
    });

    if (!progress) {
      return res.status(404).json({ message: 'Not enrolled in this learning path' });
    }

    await progress.completeMilestone(milestoneId, timeSpent, notes, rating);

    res.json({ message: 'Milestone completed', progress });
  } catch (error) {
    console.error('Milestone completion error:', error);
    res.status(500).json({ message: 'Failed to complete milestone' });
  }
});

module.exports = router;