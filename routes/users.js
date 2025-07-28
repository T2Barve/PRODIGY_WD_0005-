const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const User = require('../models/User');
const Resume = require('../models/Resume');
const UserProgress = require('../models/UserProgress');
const UserInterviewProgress = require('../models/UserInterviewProgress');

const router = express.Router();

// Get user dashboard data
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get user's resume count
    const resumeCount = await Resume.countDocuments({ userId });

    // Get learning progress
    const learningProgress = await UserProgress.find({ userId })
      .populate('learningPathId', 'title category')
      .sort({ lastAccessedAt: -1 })
      .limit(5);

    // Get interview practice stats
    const interviewStats = await UserInterviewProgress.getUserStats(userId);

    // Get recent activities (last 10)
    const recentResumes = await Resume.find({ userId })
      .sort({ lastModified: -1 })
      .limit(3)
      .select('title lastModified analysis');

    // Calculate overall completion percentage for current paths
    const totalPaths = learningProgress.length;
    const averageCompletion = totalPaths > 0 
      ? learningProgress.reduce((sum, progress) => sum + progress.completionPercentage, 0) / totalPaths 
      : 0;

    const dashboardData = {
      stats: {
        totalResumes: resumeCount,
        totalLearningPaths: totalPaths,
        averagePathCompletion: Math.round(averageCompletion),
        totalInterviewQuestions: interviewStats.totalPracticed,
        averageInterviewConfidence: Math.round(interviewStats.averageConfidence * 20), // Convert 1-5 to percentage
        totalTimeSpent: Math.round((learningProgress.reduce((sum, p) => sum + p.totalTimeSpent, 0) + interviewStats.totalTimeSpent / 60) / 60) // in hours
      },
      recentActivity: {
        learningProgress: learningProgress.slice(0, 3),
        recentResumes,
        needsMorePractice: interviewStats.needsMorePractice
      },
      recommendations: generateRecommendations(req.user, {
        resumeCount,
        averageCompletion,
        interviewStats
      })
    };

    res.json(dashboardData);

  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      message: 'Failed to load dashboard',
      error: 'DASHBOARD_ERROR'
    });
  }
});

// Get detailed user statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Learning statistics
    const learningStats = await UserProgress.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalPaths: { $sum: 1 },
          completedPaths: { $sum: { $cond: [{ $eq: ['$isCompleted', true] }, 1, 0] } },
          totalTimeSpent: { $sum: '$totalTimeSpent' },
          averageCompletion: { $avg: '$completionPercentage' }
        }
      }
    ]);

    // Interview statistics by category
    const interviewStatsByCategory = await UserInterviewProgress.getCategoryProgress(userId);

    // Resume statistics
    const resumeStats = await Resume.aggregate([
      { $match: { userId } },
      {
        $group: {
          _id: null,
          totalResumes: { $sum: 1 },
          averageScore: { $avg: '$analysis.score' },
          totalDownloads: { $sum: '$downloadCount' },
          templates: { $addToSet: '$template' }
        }
      }
    ]);

    // Monthly activity (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyActivity = await UserProgress.aggregate([
      { 
        $match: { 
          userId,
          lastAccessedAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$lastAccessedAt' },
            month: { $month: '$lastAccessedAt' }
          },
          sessions: { $sum: 1 },
          timeSpent: { $sum: '$totalTimeSpent' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      learning: learningStats[0] || {
        totalPaths: 0,
        completedPaths: 0,
        totalTimeSpent: 0,
        averageCompletion: 0
      },
      interview: {
        byCategory: interviewStatsByCategory,
        overall: await UserInterviewProgress.getUserStats(userId)
      },
      resume: resumeStats[0] || {
        totalResumes: 0,
        averageScore: 0,
        totalDownloads: 0,
        templates: []
      },
      activity: {
        monthly: monthlyActivity
      }
    });

  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      message: 'Failed to load statistics',
      error: 'STATS_ERROR'
    });
  }
});

// Update user preferences
router.put('/preferences', authenticateToken, async (req, res) => {
  try {
    const { preferences } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { preferences },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Preferences updated successfully',
      preferences: user.preferences
    });

  } catch (error) {
    console.error('Preferences update error:', error);
    res.status(500).json({
      message: 'Failed to update preferences',
      error: 'PREFERENCES_ERROR'
    });
  }
});

// Helper function to generate personalized recommendations
function generateRecommendations(user, stats) {
  const recommendations = [];

  // Resume recommendations
  if (stats.resumeCount === 0) {
    recommendations.push({
      type: 'resume',
      title: 'Create Your First Resume',
      description: 'Start building your professional resume with our guided builder',
      action: 'Create Resume',
      priority: 'high'
    });
  } else if (stats.resumeCount === 1) {
    recommendations.push({
      type: 'resume',
      title: 'Create Multiple Resume Versions',
      description: 'Tailor different resumes for different job types',
      action: 'Create Another Resume',
      priority: 'medium'
    });
  }

  // Learning path recommendations
  if (stats.averageCompletion < 50) {
    recommendations.push({
      type: 'learning',
      title: 'Continue Your Learning Path',
      description: 'Complete your current learning milestones to advance your career',
      action: 'Continue Learning',
      priority: 'high'
    });
  }

  // Interview practice recommendations
  if (stats.interviewStats.totalPracticed < 5) {
    recommendations.push({
      type: 'interview',
      title: 'Practice Interview Questions',
      description: 'Build confidence with behavioral and technical questions',
      action: 'Start Practicing',
      priority: 'medium'
    });
  }

  if (stats.interviewStats.averageConfidence < 3) {
    recommendations.push({
      type: 'interview',
      title: 'Improve Interview Confidence',
      description: 'Focus on questions where you need more practice',
      action: 'Practice Weak Areas',
      priority: 'high'
    });
  }

  return recommendations.slice(0, 3); // Return top 3 recommendations
}

module.exports = router;