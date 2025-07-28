const mongoose = require('mongoose');

const interviewQuestionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    unique: true
  },
  category: {
    type: String,
    enum: ['HR', 'Behavioral', 'Situational', 'Technical', 'Leadership', 'Problem Solving'],
    required: true
  },
  subcategory: String, // e.g., "Teamwork", "Conflict Resolution", "Time Management"
  difficulty: {
    type: String,
    enum: ['entry', 'mid', 'senior'],
    default: 'entry'
  },
  sampleAnswer: {
    type: String,
    required: true
  },
  tips: [String], // Additional tips for answering
  keywords: [String], // Keywords to look for in answers
  followUpQuestions: [String],
  timeLimit: {
    type: Number, // in minutes
    default: 2
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  practiceCount: {
    type: Number,
    default: 0
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  ratingCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for efficient querying
interviewQuestionSchema.index({ category: 1, isActive: 1 });
interviewQuestionSchema.index({ difficulty: 1, category: 1 });
interviewQuestionSchema.index({ tags: 1 });
interviewQuestionSchema.index({ practiceCount: -1 });

// Method to update rating
interviewQuestionSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.averageRating * this.ratingCount;
  this.ratingCount += 1;
  this.averageRating = (currentTotal + newRating) / this.ratingCount;
  return this.save();
};

// Method to increment practice count
interviewQuestionSchema.methods.incrementPracticeCount = function() {
  this.practiceCount += 1;
  return this.save();
};

// Static method to get questions by category
interviewQuestionSchema.statics.getByCategory = function(category, limit = null) {
  const query = this.find({ category, isActive: true }).sort({ practiceCount: 1 });
  return limit ? query.limit(limit) : query;
};

// Static method to get random questions
interviewQuestionSchema.statics.getRandomQuestions = function(count = 5, categories = null, difficulty = null) {
  const matchConditions = { isActive: true };
  
  if (categories) {
    matchConditions.category = { $in: categories };
  }
  
  if (difficulty) {
    matchConditions.difficulty = difficulty;
  }

  return this.aggregate([
    { $match: matchConditions },
    { $sample: { size: count } }
  ]);
};

module.exports = mongoose.model('InterviewQuestion', interviewQuestionSchema);