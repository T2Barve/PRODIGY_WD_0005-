# Career Preparation Platform

A comprehensive full-stack web application designed to help users advance their careers through personalized learning paths, resume building, and interview preparation.

## 🚀 Features

### ✅ Core MVP Features

#### 1. **User Authentication & Profile**
- Email/password registration and login
- Google OAuth integration (ready for implementation)
- User dashboard with profile management
- Career goal selection and tracking
- Profile pictures and education details

#### 2. **Personalized Learning Paths**
- 2-3 career tracks (Full Stack Developer, Data Scientist, UX/UI Designer)
- Each path includes 5+ structured milestones
- Rich content with text, videos, and external resources
- Progress tracking and completion certificates
- Estimated time and difficulty levels

#### 3. **Resume Builder (Core Feature)**
- Form-based resume creator with real-time preview
- Comprehensive sections: Personal Info, Education, Experience, Projects, Skills
- Multiple resume templates (Modern, Classic, Creative, Minimal, Professional)
- PDF download functionality
- Save multiple resume versions
- Resume completion tracking

#### 4. **AI Resume Analyzer**
- Upload and analyze existing resumes
- Grammar and content suggestions
- ATS compatibility scoring
- Keyword matching for specific job roles
- Strengths and improvement recommendations

#### 5. **Behavioral Interview Question Bank**
- 20+ categorized questions (HR, Behavioral, Situational, Technical, Leadership)
- Sample answers with detailed explanations
- Practice tracking and confidence levels
- Personalized recommendations based on weak areas
- Time limits and follow-up questions

#### 6. **Admin Panel**
- User management and role assignment
- Learning path creation and management
- Interview question bank management
- Platform analytics and statistics
- Bulk import functionality

### 🎯 Additional Features

- **Dashboard Analytics**: Personal progress tracking with charts and statistics
- **Responsive Design**: Beautiful, modern UI that works on all devices
- **Security**: JWT authentication, password hashing, rate limiting
- **Performance**: Optimized database queries and caching
- **Scalability**: Modular architecture ready for growth

## 🛠 Technology Stack

### Backend
- **Node.js** with Express.js framework
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **express-validator** for input validation
- **multer** for file uploads
- **OpenAI API** integration (for enhanced resume analysis)

### Frontend
- **React 18** with TypeScript
- **Material-UI (MUI)** for components and theming
- **React Router** for navigation
- **Axios** for API calls
- **React Hook Form** with Yup validation
- **React PDF** for resume generation
- **Recharts** for data visualization

### Database Schema
- **Users**: Authentication, profiles, preferences
- **LearningPaths**: Course content and structure
- **UserProgress**: Learning advancement tracking
- **Resumes**: Resume data and analysis
- **InterviewQuestions**: Question bank with metadata
- **UserInterviewProgress**: Practice session tracking

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone <repository-url>
cd career-prep-platform
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client
npm install
cd ..
```

### 3. Environment Setup
Create a `.env` file in the root directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/career-prep-platform

# JWT Secret (change in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# OpenAI API (optional, for enhanced resume analysis)
OPENAI_API_KEY=your-openai-api-key-here

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Email Configuration (optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Environment
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 4. Start MongoDB
```bash
# If using local MongoDB
sudo systemctl start mongod

# Or start MongoDB service on macOS
brew services start mongodb-community
```

### 5. Seed the Database
```bash
node scripts/seedData.js
```

This creates sample data including:
- Admin user: `admin@careerprep.com` / `admin123`
- Regular user: `user@example.com` / `user123`
- 3 learning paths with detailed content
- 20+ interview questions across different categories

### 6. Start the Development Servers
```bash
# Terminal 1: Start backend server
npm run server

# Terminal 2: Start frontend development server
npm run client

# Or start both concurrently
npm run dev
```

### 7. Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/api/health

## 🎯 Usage Guide

### For Users

1. **Getting Started**
   - Register with email or use sample account
   - Complete profile setup with career goals
   - Explore the dashboard for personalized recommendations

2. **Learning Paths**
   - Browse available career tracks
   - Enroll in relevant learning paths
   - Track progress through milestones
   - Access rich content and resources

3. **Resume Building**
   - Create new resumes with guided forms
   - Choose from multiple templates
   - Preview and download as PDF
   - Analyze resume for improvements

4. **Interview Practice**
   - Practice with categorized questions
   - Record confidence levels and notes
   - Track progress over time
   - Focus on weak areas

### For Administrators

1. **User Management**
   - View and manage all users
   - Assign admin roles
   - Monitor user activity

2. **Content Management**
   - Create and edit learning paths
   - Add interview questions
   - Bulk import content
   - Monitor platform statistics

## 🏗 Project Structure

```
career-prep-platform/
├── client/                    # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── contexts/         # React contexts
│   │   ├── pages/           # Page components
│   │   ├── services/        # API service functions
│   │   └── utils/           # Utility functions
│   └── package.json
├── models/                   # MongoDB schemas
├── routes/                   # Express.js routes
├── middleware/              # Custom middleware
├── scripts/                 # Database scripts
├── uploads/                 # File upload directory
├── server.js               # Main server file
├── package.json
└── README.md
```

## 🔒 Security Features

- **Password Security**: bcryptjs hashing with salt rounds
- **JWT Authentication**: Secure token-based auth with expiration
- **Rate Limiting**: Prevent abuse with configurable limits
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Configured for secure cross-origin requests
- **Helmet**: Security headers for production deployment

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGODB_URI=your-production-mongodb-uri
JWT_SECRET=your-production-jwt-secret
CLIENT_URL=https://your-domain.com
```

### Build Commands
```bash
# Build frontend for production
cd client && npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Learning Endpoints
- `GET /api/learning` - Get all learning paths
- `POST /api/learning/:id/enroll` - Enroll in path
- `GET /api/learning/progress/me` - Get user progress

### Resume Endpoints
- `GET /api/resumes` - Get user resumes
- `POST /api/resumes` - Create new resume
- `PUT /api/resumes/:id` - Update resume
- `POST /api/resumes/:id/analyze` - Analyze resume

### Interview Endpoints
- `GET /api/interviews/questions` - Get questions
- `POST /api/interviews/questions/:id/practice` - Record practice
- `GET /api/interviews/stats` - Get practice statistics

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Check if MongoDB is running
   sudo systemctl status mongod
   
   # Start MongoDB
   sudo systemctl start mongod
   ```

2. **Port Already in Use**
   ```bash
   # Find and kill process using port 5000
   lsof -ti:5000 | xargs kill -9
   ```

3. **Module Not Found Errors**
   ```bash
   # Clear npm cache and reinstall
   npm cache clean --force
   rm -rf node_modules package-lock.json
   npm install
   ```

## 📊 Validation Metrics

The platform validates the following aspects:

### User Interest in Career Prep Tools
- **User registration and engagement rates**
- **Time spent on learning paths**
- **Feature adoption across different modules**

### Resume Builder Usefulness
- **Resume creation completion rates**
- **PDF download frequency**
- **Resume analysis feature usage**
- **Multiple resume version creation**

### Interview Question Engagement
- **Practice session frequency**
- **Confidence level improvements over time**
- **Question difficulty progression**
- **Category-wise practice distribution**

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Material-UI team for the excellent component library
- MongoDB for the flexible database solution
- All open-source contributors who made this project possible

---

**Built with ❤️ for career advancement and professional growth**

For questions or support, please open an issue in the repository.
