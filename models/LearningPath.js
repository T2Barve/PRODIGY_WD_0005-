const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  order: {
    type: Number,
    required: true
  },
  content: {
    type: String, // Can be text, HTML, or markdown
    required: true
  },
  resources: [{
    type: {
      type: String,
      enum: ['video', 'article', 'pdf', 'external_link'],
      required: true
    },
    title: String,
    url: String,
    description: String,
    duration: String // For videos
  }],
  estimatedTime: String, // e.g., "2 hours", "1 week"
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  isActive: {
    type: Boolean,
    default: true
  }
});

const learningPathSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['Full Stack Developer', 'Data Scientist', 'Product Manager', 'UX/UI Designer', 'DevOps Engineer', 'Mobile Developer'],
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedDuration: {
    type: String,
    required: true // e.g., "4-6 weeks", "3 months"
  },
  prerequisites: [String],
  skills: [String], // Skills that will be learned
  milestones: [milestoneSchema],
  totalEnrollments: {
    type: Number,
    default: 0
  },
  rating: {
    average: { type: Number, default: 0 },
    count: { type: Number, default: 0 }
  },
  tags: [String],
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for better search performance
learningPathSchema.index({ category: 1, isActive: 1 });
learningPathSchema.index({ tags: 1 });
learningPathSchema.index({ 'rating.average': -1 });

// Virtual for milestone count
learningPathSchema.virtual('milestoneCount').get(function() {
  return this.milestones ? this.milestones.length : 0;
});

// Method to get active milestones in order
learningPathSchema.methods.getActiveMilestones = function() {
  return this.milestones
    .filter(milestone => milestone.isActive)
    .sort((a, b) => a.order - b.order);
};

// Method to update rating
learningPathSchema.methods.updateRating = function(newRating) {
  const currentTotal = this.rating.average * this.rating.count;
  this.rating.count += 1;
  this.rating.average = (currentTotal + newRating) / this.rating.count;
  return this.save();
};

learningPathSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('LearningPath', learningPathSchema);