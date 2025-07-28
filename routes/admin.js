const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const User = require('../models/User');
const LearningPath = require('../models/LearningPath');
const InterviewQuestion = require('../models/InterviewQuestion');
const Resume = require('../models/Resume');

const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken, requireAdmin);

// Dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      users: {
        total: await User.countDocuments(),
        verified: await User.countDocuments({ isEmailVerified: true }),
        activeThisWeek: await User.countDocuments({
          'stats.lastActive': { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        })
      },
      learningPaths: {
        total: await LearningPath.countDocuments(),
        active: await LearningPath.countDocuments({ isActive: true })
      },
      interviewQuestions: {
        total: await InterviewQuestion.countDocuments(),
        active: await InterviewQuestion.countDocuments({ isActive: true })
      },
      resumes: {
        total: await Resume.countDocuments(),
        thisMonth: await Resume.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
        })
      }
    };

    res.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({ message: 'Failed to fetch admin statistics' });
  }
});

// User management
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(filter);

    res.json({
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Admin users error:', error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Update user role
router.put('/users/:id/role', async (req, res) => {
  try {
    const { role } = req.body;
    
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true }
    ).select('-password');

    res.json({ message: 'User role updated', user });
  } catch (error) {
    console.error('Role update error:', error);
    res.status(500).json({ message: 'Failed to update user role' });
  }
});

// Learning path management
router.get('/learning-paths', async (req, res) => {
  try {
    const paths = await LearningPath.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(paths);
  } catch (error) {
    console.error('Admin learning paths error:', error);
    res.status(500).json({ message: 'Failed to fetch learning paths' });
  }
});

// Create learning path
router.post('/learning-paths', async (req, res) => {
  try {
    const pathData = {
      ...req.body,
      createdBy: req.user._id
    };

    const path = new LearningPath(pathData);
    await path.save();

    res.status(201).json(path);
  } catch (error) {
    console.error('Learning path creation error:', error);
    res.status(500).json({ message: 'Failed to create learning path' });
  }
});

// Update learning path
router.put('/learning-paths/:id', async (req, res) => {
  try {
    const path = await LearningPath.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastUpdated: new Date() },
      { new: true, runValidators: true }
    );

    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    res.json(path);
  } catch (error) {
    console.error('Learning path update error:', error);
    res.status(500).json({ message: 'Failed to update learning path' });
  }
});

// Delete learning path
router.delete('/learning-paths/:id', async (req, res) => {
  try {
    const path = await LearningPath.findByIdAndDelete(req.params.id);

    if (!path) {
      return res.status(404).json({ message: 'Learning path not found' });
    }

    res.json({ message: 'Learning path deleted successfully' });
  } catch (error) {
    console.error('Learning path deletion error:', error);
    res.status(500).json({ message: 'Failed to delete learning path' });
  }
});

// Interview question management
router.get('/interview-questions', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await InterviewQuestion.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(questions);
  } catch (error) {
    console.error('Admin questions error:', error);
    res.status(500).json({ message: 'Failed to fetch interview questions' });
  }
});

// Create interview question
router.post('/interview-questions', async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user._id
    };

    const question = new InterviewQuestion(questionData);
    await question.save();

    res.status(201).json(question);
  } catch (error) {
    console.error('Question creation error:', error);
    res.status(500).json({ message: 'Failed to create interview question' });
  }
});

// Update interview question
router.put('/interview-questions/:id', async (req, res) => {
  try {
    const question = await InterviewQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({ message: 'Interview question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Question update error:', error);
    res.status(500).json({ message: 'Failed to update interview question' });
  }
});

// Delete interview question
router.delete('/interview-questions/:id', async (req, res) => {
  try {
    const question = await InterviewQuestion.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Interview question not found' });
    }

    res.json({ message: 'Interview question deleted successfully' });
  } catch (error) {
    console.error('Question deletion error:', error);
    res.status(500).json({ message: 'Failed to delete interview question' });
  }
});

// Bulk import interview questions
router.post('/interview-questions/bulk-import', async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions)) {
      return res.status(400).json({ message: 'Questions must be an array' });
    }

    const questionsWithCreator = questions.map(q => ({
      ...q,
      createdBy: req.user._id
    }));

    const result = await InterviewQuestion.insertMany(questionsWithCreator);

    res.status(201).json({
      message: `Successfully imported ${result.length} questions`,
      imported: result.length
    });
  } catch (error) {
    console.error('Bulk import error:', error);
    res.status(500).json({ message: 'Failed to import questions' });
  }
});

module.exports = router;