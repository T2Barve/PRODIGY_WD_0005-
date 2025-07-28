const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Password required only if not Google OAuth
    },
    minlength: 6
  },
  googleId: {
    type: String,
    sparse: true // Allows multiple null values
  },
  profilePicture: {
    type: String,
    default: ''
  },
  education: {
    degree: String,
    institution: String,
    graduationYear: Number,
    major: String
  },
  careerGoal: {
    type: String,
    enum: ['Full Stack Developer', 'Data Scientist', 'Product Manager', 'UX/UI Designer', 'DevOps Engineer', 'Mobile Developer'],
    default: 'Full Stack Developer'
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  passwordResetToken: String,
  passwordResetExpires: Date,
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      newContent: { type: Boolean, default: true },
      reminders: { type: Boolean, default: true }
    },
    theme: {
      type: String,
      enum: ['light', 'dark'],
      default: 'light'
    }
  },
  stats: {
    totalResumes: { type: Number, default: 0 },
    completedLessons: { type: Number, default: 0 },
    practicedQuestions: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now }
  }
}, {
  timestamps: true
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate auth token payload
userSchema.methods.getAuthTokenPayload = function() {
  return {
    userId: this._id,
    email: this.email,
    role: this.role
  };
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return this.name;
});

// Ensure virtual fields are serialized
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.password;
    delete ret.emailVerificationToken;
    delete ret.passwordResetToken;
    delete ret.passwordResetExpires;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);