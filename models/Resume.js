const mongoose = require('mongoose');

const experienceSchema = new mongoose.Schema({
  jobTitle: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true
  },
  location: String,
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date, // null if current job
  isCurrent: {
    type: Boolean,
    default: false
  },
  description: String,
  achievements: [String],
  technologies: [String]
});

const educationSchema = new mongoose.Schema({
  degree: {
    type: String,
    required: true
  },
  institution: {
    type: String,
    required: true
  },
  location: String,
  startDate: Date,
  endDate: Date,
  gpa: String,
  major: String,
  minor: String,
  relevantCoursework: [String],
  honors: [String]
});

const projectSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  technologies: [String],
  startDate: Date,
  endDate: Date,
  githubUrl: String,
  liveUrl: String,
  achievements: [String],
  teamSize: Number
});

const certificationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  issuer: {
    type: String,
    required: true
  },
  issueDate: Date,
  expiryDate: Date,
  credentialId: String,
  credentialUrl: String
});

const resumeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true,
    default: 'My Resume'
  },
  personalInfo: {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    },
    website: String,
    linkedin: String,
    github: String,
    portfolio: String
  },
  professionalSummary: {
    type: String,
    maxlength: 500
  },
  experience: [experienceSchema],
  education: [educationSchema],
  projects: [projectSchema],
  skills: {
    technical: [String],
    soft: [String],
    languages: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['Basic', 'Conversational', 'Fluent', 'Native']
      }
    }]
  },
  certifications: [certificationSchema],
  awards: [{
    title: String,
    issuer: String,
    date: Date,
    description: String
  }],
  volunteer: [{
    organization: String,
    role: String,
    startDate: Date,
    endDate: Date,
    description: String
  }],
  template: {
    type: String,
    enum: ['modern', 'classic', 'creative', 'minimal', 'professional'],
    default: 'modern'
  },
  styling: {
    primaryColor: {
      type: String,
      default: '#2563eb'
    },
    fontSize: {
      type: String,
      enum: ['small', 'medium', 'large'],
      default: 'medium'
    },
    fontFamily: {
      type: String,
      enum: ['Arial', 'Times New Roman', 'Helvetica', 'Georgia', 'Calibri'],
      default: 'Arial'
    }
  },
  analysis: {
    lastAnalyzed: Date,
    score: {
      type: Number,
      min: 0,
      max: 100
    },
    suggestions: [String],
    strengths: [String],
    improvements: [String],
    atsCompatibility: {
      type: Number,
      min: 0,
      max: 100
    },
    keywordMatch: {
      jobTitle: String,
      matchPercentage: Number,
      missingKeywords: [String]
    }
  },
  version: {
    type: Number,
    default: 1
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  downloadCount: {
    type: Number,
    default: 0
  },
  lastModified: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index for efficient queries
resumeSchema.index({ userId: 1, createdAt: -1 });
resumeSchema.index({ userId: 1, title: 1 });
resumeSchema.index({ 'analysis.score': -1 });

// Pre-save middleware to update lastModified
resumeSchema.pre('save', function(next) {
  this.lastModified = new Date();
  next();
});

// Method to calculate completion percentage
resumeSchema.methods.getCompletionPercentage = function() {
  let completed = 0;
  let total = 0;

  // Required fields
  const requiredFields = [
    'personalInfo.fullName',
    'personalInfo.email',
    'professionalSummary'
  ];

  requiredFields.forEach(field => {
    total++;
    const value = field.split('.').reduce((obj, key) => obj && obj[key], this);
    if (value && value.toString().trim()) completed++;
  });

  // Optional but important sections
  const sections = [
    { name: 'experience', weight: 2 },
    { name: 'education', weight: 2 },
    { name: 'skills.technical', weight: 1 },
    { name: 'projects', weight: 1 }
  ];

  sections.forEach(section => {
    total += section.weight;
    const value = section.name.split('.').reduce((obj, key) => obj && obj[key], this);
    if (value && Array.isArray(value) && value.length > 0) {
      completed += section.weight;
    } else if (value && !Array.isArray(value) && value.toString().trim()) {
      completed += section.weight;
    }
  });

  return Math.round((completed / total) * 100);
};

// Method to get word count
resumeSchema.methods.getWordCount = function() {
  let wordCount = 0;
  
  // Count words in professional summary
  if (this.professionalSummary) {
    wordCount += this.professionalSummary.split(/\s+/).length;
  }

  // Count words in experience descriptions
  this.experience.forEach(exp => {
    if (exp.description) {
      wordCount += exp.description.split(/\s+/).length;
    }
    exp.achievements.forEach(achievement => {
      wordCount += achievement.split(/\s+/).length;
    });
  });

  // Count words in project descriptions
  this.projects.forEach(project => {
    if (project.description) {
      wordCount += project.description.split(/\s+/).length;
    }
    project.achievements.forEach(achievement => {
      wordCount += achievement.split(/\s+/).length;
    });
  });

  return wordCount;
};

// Method to extract all skills
resumeSchema.methods.getAllSkills = function() {
  const allSkills = [];
  
  if (this.skills.technical) allSkills.push(...this.skills.technical);
  if (this.skills.soft) allSkills.push(...this.skills.soft);
  
  // Extract skills from experience
  this.experience.forEach(exp => {
    if (exp.technologies) allSkills.push(...exp.technologies);
  });
  
  // Extract skills from projects
  this.projects.forEach(project => {
    if (project.technologies) allSkills.push(...project.technologies);
  });

  // Remove duplicates and return
  return [...new Set(allSkills)];
};

// Virtual for display name
resumeSchema.virtual('displayName').get(function() {
  return `${this.title} (v${this.version})`;
});

resumeSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Resume', resumeSchema);