const mongoose = require('mongoose');

const userInterviewProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InterviewQuestion',
    required: true
  },
  practiceCount: {
    type: Number,
    default: 1
  },
  lastPracticedAt: {
    type: Date,
    default: Date.now
  },
  userAnswer: String, // User's practice answer
  confidenceLevel: {
    type: Number,
    min: 1,
    max: 5,
    required: true
  },
  timeSpent: {
    type: Number, // in seconds
    default: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  },
  notes: String, // User's personal notes
  needsMorePractice: {
    type: Boolean,
    default: false
  },
  tags: [String] // Personal tags for organization
}, {
  timestamps: true
});

// Compound index for efficient queries
userInterviewProgressSchema.index({ userId: 1, questionId: 1 }, { unique: true });
userInterviewProgressSchema.index({ userId: 1, lastPracticedAt: -1 });
userInterviewProgressSchema.index({ userId: 1, confidenceLevel: 1 });
userInterviewProgressSchema.index({ userId: 1, needsMorePractice: 1 });

// Method to update practice session
userInterviewProgressSchema.methods.updatePractice = function(answer, confidenceLevel, timeSpent, rating = null, notes = '') {
  this.userAnswer = answer;
  this.confidenceLevel = confidenceLevel;
  this.timeSpent = timeSpent;
  this.lastPracticedAt = new Date();
  this.practiceCount += 1;
  
  if (rating) this.rating = rating;
  if (notes) this.notes = notes;
  
  // Automatically mark for more practice if confidence is low
  this.needsMorePractice = confidenceLevel <= 2;
  
  return this.save();
};

// Static method to get user's practice statistics
userInterviewProgressSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: null,
        totalPracticed: { $sum: 1 },
        totalSessions: { $sum: '$practiceCount' },
        averageConfidence: { $avg: '$confidenceLevel' },
        totalTimeSpent: { $sum: '$timeSpent' },
        needsMorePractice: {
          $sum: { $cond: [{ $eq: ['$needsMorePractice', true] }, 1, 0] }
        }
      }
    }
  ]);

  return stats.length > 0 ? stats[0] : {
    totalPracticed: 0,
    totalSessions: 0,
    averageConfidence: 0,
    totalTimeSpent: 0,
    needsMorePractice: 0
  };
};

// Static method to get practice history by category
userInterviewProgressSchema.statics.getCategoryProgress = async function(userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $lookup: {
        from: 'interviewquestions',
        localField: 'questionId',
        foreignField: '_id',
        as: 'question'
      }
    },
    { $unwind: '$question' },
    {
      $group: {
        _id: '$question.category',
        practiced: { $sum: 1 },
        averageConfidence: { $avg: '$confidenceLevel' },
        totalTimeSpent: { $sum: '$timeSpent' },
        needsMorePractice: {
          $sum: { $cond: [{ $eq: ['$needsMorePractice', true] }, 1, 0] }
        }
      }
    },
    { $sort: { practiced: -1 } }
  ]);
};

module.exports = mongoose.model('UserInterviewProgress', userInterviewProgressSchema);