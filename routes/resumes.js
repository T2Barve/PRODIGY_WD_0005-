const express = require('express');
const { authenticateToken, checkResourceOwnership } = require('../middleware/auth');
const Resume = require('../models/Resume');
const User = require('../models/User');

const router = express.Router();

// Get user's resumes
router.get('/', authenticateToken, async (req, res) => {
  try {
    const resumes = await Resume.find({ userId: req.user._id })
      .sort({ lastModified: -1 })
      .select('-__v');

    res.json(resumes);
  } catch (error) {
    console.error('Resumes fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch resumes' });
  }
});

// Get specific resume
router.get('/:id', authenticateToken, checkResourceOwnership(Resume), async (req, res) => {
  try {
    res.json(req.resource);
  } catch (error) {
    console.error('Resume fetch error:', error);
    res.status(500).json({ message: 'Failed to fetch resume' });
  }
});

// Create new resume
router.post('/', authenticateToken, async (req, res) => {
  try {
    const resumeData = {
      ...req.body,
      userId: req.user._id,
      personalInfo: {
        ...req.body.personalInfo,
        fullName: req.body.personalInfo?.fullName || req.user.name,
        email: req.body.personalInfo?.email || req.user.email
      }
    };

    const resume = new Resume(resumeData);
    await resume.save();

    // Update user's resume count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalResumes': 1 }
    });

    res.status(201).json(resume);
  } catch (error) {
    console.error('Resume creation error:', error);
    res.status(500).json({ message: 'Failed to create resume' });
  }
});

// Update resume
router.put('/:id', authenticateToken, checkResourceOwnership(Resume), async (req, res) => {
  try {
    const updatedResume = await Resume.findByIdAndUpdate(
      req.params.id,
      { ...req.body, lastModified: new Date() },
      { new: true, runValidators: true }
    );

    res.json(updatedResume);
  } catch (error) {
    console.error('Resume update error:', error);
    res.status(500).json({ message: 'Failed to update resume' });
  }
});

// Delete resume
router.delete('/:id', authenticateToken, checkResourceOwnership(Resume), async (req, res) => {
  try {
    await Resume.findByIdAndDelete(req.params.id);

    // Update user's resume count
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { 'stats.totalResumes': -1 }
    });

    res.json({ message: 'Resume deleted successfully' });
  } catch (error) {
    console.error('Resume deletion error:', error);
    res.status(500).json({ message: 'Failed to delete resume' });
  }
});

// Analyze resume
router.post('/:id/analyze', authenticateToken, checkResourceOwnership(Resume), async (req, res) => {
  try {
    const resume = req.resource;
    const { jobTitle } = req.body;

    // Simple analysis (can be enhanced with OpenAI API)
    const analysis = analyzeResume(resume, jobTitle);

    // Update resume with analysis
    resume.analysis = {
      ...analysis,
      lastAnalyzed: new Date()
    };

    await resume.save();

    res.json({ analysis });
  } catch (error) {
    console.error('Resume analysis error:', error);
    res.status(500).json({ message: 'Failed to analyze resume' });
  }
});

// Download resume as PDF
router.get('/:id/download', authenticateToken, checkResourceOwnership(Resume), async (req, res) => {
  try {
    const resume = req.resource;

    // Increment download count
    resume.downloadCount += 1;
    await resume.save();

    // Generate PDF (simplified - would use react-pdf in production)
    const pdfBuffer = await generateResumePDF(resume);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${resume.title}.pdf"`);
    res.send(pdfBuffer);

  } catch (error) {
    console.error('Resume download error:', error);
    res.status(500).json({ message: 'Failed to generate PDF' });
  }
});

// Clone resume
router.post('/:id/clone', authenticateToken, checkResourceOwnership(Resume), async (req, res) => {
  try {
    const originalResume = req.resource;
    const { title } = req.body;

    const clonedData = originalResume.toObject();
    delete clonedData._id;
    delete clonedData.createdAt;
    delete clonedData.updatedAt;
    delete clonedData.analysis;
    delete clonedData.downloadCount;

    clonedData.title = title || `${originalResume.title} (Copy)`;
    clonedData.version = 1;
    clonedData.lastModified = new Date();

    const clonedResume = new Resume(clonedData);
    await clonedResume.save();

    res.status(201).json(clonedResume);
  } catch (error) {
    console.error('Resume clone error:', error);
    res.status(500).json({ message: 'Failed to clone resume' });
  }
});

// Helper function for resume analysis
function analyzeResume(resume, jobTitle = '') {
  const analysis = {
    score: 0,
    suggestions: [],
    strengths: [],
    improvements: [],
    atsCompatibility: 0,
    keywordMatch: {
      jobTitle,
      matchPercentage: 0,
      missingKeywords: []
    }
  };

  let score = 0;
  let maxScore = 100;

  // Check completeness
  if (resume.personalInfo.fullName) score += 10;
  else analysis.improvements.push('Add your full name');

  if (resume.personalInfo.email) score += 10;
  else analysis.improvements.push('Add your email address');

  if (resume.professionalSummary) {
    score += 15;
    analysis.strengths.push('Professional summary included');
  } else {
    analysis.improvements.push('Add a professional summary');
  }

  if (resume.experience.length > 0) {
    score += 20;
    analysis.strengths.push('Work experience included');
  } else {
    analysis.improvements.push('Add work experience');
  }

  if (resume.education.length > 0) {
    score += 15;
    analysis.strengths.push('Education information included');
  }

  if (resume.skills.technical.length > 0) {
    score += 15;
    analysis.strengths.push('Technical skills listed');
  } else {
    analysis.improvements.push('Add technical skills');
  }

  if (resume.projects.length > 0) {
    score += 10;
    analysis.strengths.push('Projects included');
  }

  if (resume.personalInfo.linkedin) {
    score += 5;
    analysis.strengths.push('LinkedIn profile included');
  }

  // ATS Compatibility
  let atsScore = 70; // Base score
  if (resume.template === 'modern' || resume.template === 'professional') atsScore += 10;
  if (resume.skills.technical.length >= 5) atsScore += 10;
  if (resume.experience.length >= 2) atsScore += 10;

  analysis.score = Math.min(score, maxScore);
  analysis.atsCompatibility = Math.min(atsScore, 100);

  // General suggestions
  if (analysis.score < 70) {
    analysis.suggestions.push('Complete all sections for a stronger resume');
  }
  if (resume.getWordCount() > 600) {
    analysis.suggestions.push('Consider shortening content for better readability');
  }
  
  analysis.suggestions.push('Use action verbs to describe achievements');
  analysis.suggestions.push('Quantify accomplishments with numbers when possible');

  return analysis;
}

// Helper function to generate PDF (simplified)
async function generateResumePDF(resume) {
  // This is a placeholder - in a real implementation, you'd use react-pdf or similar
  const pdfContent = `
    Resume: ${resume.title}
    
    ${resume.personalInfo.fullName}
    ${resume.personalInfo.email}
    ${resume.personalInfo.phone || ''}
    
    Professional Summary:
    ${resume.professionalSummary || 'Not provided'}
    
    Experience:
    ${resume.experience.map(exp => `
      ${exp.jobTitle} at ${exp.company}
      ${exp.startDate} - ${exp.endDate || 'Present'}
      ${exp.description || ''}
    `).join('\n')}
    
    Education:
    ${resume.education.map(edu => `
      ${edu.degree} - ${edu.institution}
      ${edu.major || ''}
    `).join('\n')}
    
    Skills:
    Technical: ${resume.skills.technical.join(', ')}
    Soft: ${resume.skills.soft.join(', ')}
  `;
  
  return Buffer.from(pdfContent, 'utf8');
}

module.exports = router;