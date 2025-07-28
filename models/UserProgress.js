const mongoose = require('mongoose');

const milestoneProgressSchema = new mongoose.Schema({
  milestoneId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  completedAt: Date,
  timeSpent: {
    type: Number, // in minutes
    default: 0
  },
  notes: String,
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
});

const userProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  learningPathId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningPath',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  currentMilestone: {
    type: Number,
    default: 0 // Index of current milestone
  },
  completedMilestones: [milestoneProgressSchema],
  totalTimeSpent: {
    type: Number, // in minutes
    default: 0
  },
  completionPercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  isCompleted: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  lastAccessedAt: {
    type: Date,
    default: Date.now
  },
  pathRating: {
    type: Number,
    min: 1,
    max: 5
  },
  pathReview: String,
  certificate: {
    issued: { type: Boolean, default: false },
    issuedAt: Date,
    certificateId: String
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
userProgressSchema.index({ userId: 1, learningPathId: 1 }, { unique: true });
userProgressSchema.index({ userId: 1, isCompleted: 1 });
userProgressSchema.index({ learningPathId: 1, completionPercentage: -1 });

// Method to mark milestone as completed
userProgressSchema.methods.completeMilestone = async function(milestoneId, timeSpent = 0, notes = '', rating = null) {
  // Check if milestone already completed
  const existingProgress = this.completedMilestones.find(
    progress => progress.milestoneId.toString() === milestoneId.toString()
  );

  if (!existingProgress) {
    this.completedMilestones.push({
      milestoneId,
      completedAt: new Date(),
      timeSpent,
      notes,
      rating
    });

    this.totalTimeSpent += timeSpent;
    this.currentMilestone = Math.max(this.currentMilestone, this.completedMilestones.length);
    
    // Update completion percentage
    await this.updateCompletionPercentage();
    
    this.lastAccessedAt = new Date();
    return this.save();
  }
  
  return this;
};

// Method to update completion percentage
userProgressSchema.methods.updateCompletionPercentage = async function() {
  try {
    const LearningPath = mongoose.model('LearningPath');
    const learningPath = await LearningPath.findById(this.learningPathId);
    
    if (learningPath) {
      const totalMilestones = learningPath.milestones.filter(m => m.isActive).length;
      if (totalMilestones > 0) {
        this.completionPercentage = Math.round((this.completedMilestones.length / totalMilestones) * 100);
        
        // Check if path is completed
        if (this.completionPercentage >= 100 && !this.isCompleted) {
          this.isCompleted = true;
          this.completedAt = new Date();
          
          // Generate certificate ID
          this.certificate.certificateId = `CERT-${this.userId}-${this.learningPathId}-${Date.now()}`;
        }
      }
    }
  } catch (error) {
    console.error('Error updating completion percentage:', error);
  }
};

// Method to get next milestone
userProgressSchema.methods.getNextMilestone = async function() {
  try {
    const LearningPath = mongoose.model('LearningPath');
    const learningPath = await LearningPath.findById(this.learningPathId);
    
    if (learningPath) {
      const activeMilestones = learningPath.getActiveMilestones();
      const nextIndex = this.completedMilestones.length;
      
      return nextIndex < activeMilestones.length ? activeMilestones[nextIndex] : null;
    }
    
    return null;
  } catch (error) {
    console.error('Error getting next milestone:', error);
    return null;
  }
};

// Method to calculate estimated completion time
userProgressSchema.methods.getEstimatedCompletionTime = async function() {
  try {
    const LearningPath = mongoose.model('LearningPath');
    const learningPath = await LearningPath.findById(this.learningPathId);
    
    if (learningPath && this.totalTimeSpent > 0 && this.completionPercentage > 0) {
      const averageTimePerPercent = this.totalTimeSpent / this.completionPercentage;
      const remainingPercentage = 100 - this.completionPercentage;
      const estimatedRemainingTime = Math.round(averageTimePerPercent * remainingPercentage);
      
      return estimatedRemainingTime; // in minutes
    }
    
    return null;
  } catch (error) {
    console.error('Error calculating estimated completion time:', error);
    return null;
  }
};

// Virtual for completed milestone count
userProgressSchema.virtual('completedMilestoneCount').get(function() {
  return this.completedMilestones.length;
});

userProgressSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('UserProgress', userProgressSchema);