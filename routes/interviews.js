const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const InterviewQuestion = require('../models/InterviewQuestion');
const UserInterviewProgress = require('../models/UserInterviewProgress');

const router = express.Router();

// Get interview questions
router.get('/questions', async (req, res) => {
  try {
    const { category, difficulty, limit = 20 } = req.query;
    const filter = { isActive: true };
    
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;

    const questions = await InterviewQuestion.find(filter)
      .limit(parseInt(limit))
      .sort({ practiceCount: 1 }); // Show less practiced questions first

    res.json(questions);
  } catch (error) {
    console.error('Interview questions error:', error);
    res.status(500).json({ message: 'Failed to fetch questions' });
  }
});

// Get random questions for practice
router.get('/questions/random', async (req, res) => {
  try {
    const { count = 5, categories, difficulty } = req.query;
    
    const categoriesArray = categories ? categories.split(',') : null;
    const questions = await InterviewQuestion.getRandomQuestions(
      parseInt(count),
      categoriesArray,
      difficulty
    );

    res.json(questions);
  } catch (error) {
    console.error('Random questions error:', error);
    res.status(500).json({ message: 'Failed to fetch random questions' });
  }
});

// Get specific question
router.get('/questions/:id', async (req, res) => {
  try {
    const question = await InterviewQuestion.findById(req.params.id);
    
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Question fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch question' });
  }
});

// Record practice session
router.post('/questions/:id/practice', authenticateToken, async (req, res) => {
  try {
    const questionId = req.params.id;
    const userId = req.user._id;
    const { userAnswer, confidenceLevel, timeSpent, rating, notes } = req.body;

    // Find existing progress or create new
    let progress = await UserInterviewProgress.findOne({ userId, questionId });

    if (progress) {
      // Update existing progress
      await progress.updatePractice(userAnswer, confidenceLevel, timeSpent, rating, notes);
    } else {
      // Create new progress
      progress = new UserInterviewProgress({
        userId,
        questionId,
        userAnswer,
        confidenceLevel,
        timeSpent,
        rating,
        notes
      });
      await progress.save();
    }

    // Increment question practice count
    await InterviewQuestion.findByIdAndUpdate(questionId, {
      $inc: { practiceCount: 1 }
    });

    res.json({ message: 'Practice session recorded', progress });
  } catch (error) {
    console.error('Practice recording error:', error);
    res.status(500).json({ message: 'Failed to record practice session' });
  }
});

// Get user's practice history
router.get('/progress', authenticateToken, async (req, res) => {
  try {
    const progress = await UserInterviewProgress.find({ userId: req.user._id })
      .populate('questionId', 'question category difficulty')
      .sort({ lastPracticedAt: -1 });

    res.json(progress);
  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch progress' });
  }
});

// Get user's practice statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const stats = await UserInterviewProgress.getUserStats(req.user._id);
    const categoryProgress = await UserInterviewProgress.getCategoryProgress(req.user._id);

    res.json({
      overall: stats,
      byCategory: categoryProgress
    });
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
});

// Get questions that need more practice
router.get('/progress/needs-practice', authenticateToken, async (req, res) => {
  try {
    const questionsNeedingPractice = await UserInterviewProgress.find({
      userId: req.user._id,
      needsMorePractice: true
    })
    .populate('questionId', 'question category difficulty sampleAnswer tips')
    .sort({ lastPracticedAt: 1 }); // Oldest first

    res.json(questionsNeedingPractice);
  } catch (error) {
    console.error('Needs practice fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch questions needing practice' });
  }
});

// Rate a question
router.post('/questions/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { rating } = req.body;
    const question = await InterviewQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    await question.updateRating(rating);

    res.json({ message: 'Rating submitted', averageRating: question.averageRating });
  } catch (error) {
    console.error('Rating error:', error);
    res.status(500).json({ message: 'Failed to submit rating' });
  }
});

// Get interview categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await InterviewQuestion.distinct('category', { isActive: true });
    
    // Get count for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const count = await InterviewQuestion.countDocuments({ category, isActive: true });
        return { category, count };
      })
    );

    res.json(categoriesWithCounts);
  } catch (error) {
    console.error('Categories fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch categories' });
  }
});

module.exports = router;