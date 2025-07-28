const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const LearningPath = require('../models/LearningPath');
const InterviewQuestion = require('../models/InterviewQuestion');

// Sample data
const sampleLearningPaths = [
  {
    title: "Full Stack Developer Bootcamp",
    description: "Master both frontend and backend development with this comprehensive path",
    category: "Full Stack Developer",
    difficulty: "beginner",
    estimatedDuration: "12-16 weeks",
    prerequisites: ["Basic programming knowledge"],
    skills: ["HTML", "CSS", "JavaScript", "React", "Node.js", "MongoDB", "Express"],
    tags: ["web development", "javascript", "react", "node"],
    milestones: [
      {
        title: "HTML & CSS Fundamentals",
        description: "Learn the building blocks of web development",
        order: 1,
        content: `
# HTML & CSS Fundamentals

## Overview
Master the foundation of web development with HTML structure and CSS styling.

## Learning Objectives
- Understand HTML document structure
- Create semantic markup
- Style elements with CSS
- Build responsive layouts

## Resources Included
- Interactive coding exercises
- Real-world projects
- Video tutorials
        `,
        resources: [
          {
            type: "video",
            title: "HTML Crash Course",
            url: "https://youtube.com/watch?v=example1",
            description: "Complete HTML tutorial for beginners",
            duration: "2 hours"
          },
          {
            type: "article",
            title: "CSS Grid vs Flexbox",
            url: "https://css-tricks.com/example",
            description: "Understanding modern CSS layout methods"
          }
        ],
        estimatedTime: "1 week",
        difficulty: "beginner"
      },
      {
        title: "JavaScript Fundamentals",
        description: "Learn the programming language that powers the web",
        order: 2,
        content: `
# JavaScript Fundamentals

## What You'll Learn
- Variables and data types
- Functions and scope
- DOM manipulation
- Event handling
- Async programming

## Hands-on Projects
- Interactive calculator
- Todo list application
- Simple games
        `,
        resources: [
          {
            type: "video",
            title: "JavaScript for Beginners",
            url: "https://youtube.com/watch?v=example2",
            duration: "3 hours"
          }
        ],
        estimatedTime: "2 weeks",
        difficulty: "beginner"
      },
      {
        title: "React Development",
        description: "Build modern user interfaces with React",
        order: 3,
        content: `
# React Development

## Core Concepts
- Components and JSX
- State and props
- Event handling
- Hooks and lifecycle
- State management

## Projects
- Portfolio website
- E-commerce store
- Social media app
        `,
        resources: [
          {
            type: "video",
            title: "React Complete Guide",
            url: "https://youtube.com/watch?v=example3",
            duration: "4 hours"
          }
        ],
        estimatedTime: "3 weeks",
        difficulty: "intermediate"
      },
      {
        title: "Backend with Node.js",
        description: "Create server-side applications",
        order: 4,
        content: `
# Backend Development with Node.js

## Topics Covered
- Express.js framework
- RESTful APIs
- Database integration
- Authentication
- Deployment

## Real-world Application
Build a complete backend for your portfolio projects
        `,
        estimatedTime: "3 weeks",
        difficulty: "intermediate"
      },
      {
        title: "Database Design & MongoDB",
        description: "Master database concepts and MongoDB",
        order: 5,
        content: `
# Database Design & MongoDB

## Learning Goals
- Database design principles
- MongoDB operations
- Data modeling
- Aggregation pipeline
- Performance optimization
        `,
        estimatedTime: "2 weeks",
        difficulty: "intermediate"
      }
    ]
  },
  {
    title: "Data Science Fundamentals",
    description: "Learn data analysis, visualization, and machine learning basics",
    category: "Data Scientist",
    difficulty: "beginner",
    estimatedDuration: "10-12 weeks",
    prerequisites: ["Basic statistics", "Python basics"],
    skills: ["Python", "Pandas", "NumPy", "Matplotlib", "Scikit-learn", "SQL"],
    tags: ["data science", "python", "machine learning", "statistics"],
    milestones: [
      {
        title: "Python for Data Science",
        description: "Master Python libraries essential for data science",
        order: 1,
        content: `
# Python for Data Science

## Key Libraries
- NumPy for numerical computing
- Pandas for data manipulation
- Matplotlib/Seaborn for visualization

## Practical Skills
- Data cleaning and preprocessing
- Exploratory data analysis
- Statistical analysis
        `,
        estimatedTime: "3 weeks",
        difficulty: "beginner"
      },
      {
        title: "Machine Learning Basics",
        description: "Introduction to machine learning concepts and algorithms",
        order: 2,
        content: `
# Machine Learning Fundamentals

## Core Concepts
- Supervised vs Unsupervised learning
- Model training and evaluation
- Feature engineering
- Cross-validation

## Algorithms Covered
- Linear regression
- Classification algorithms
- Clustering methods
        `,
        estimatedTime: "4 weeks",
        difficulty: "intermediate"
      }
    ]
  },
  {
    title: "UX/UI Design Mastery",
    description: "Design intuitive and beautiful user experiences",
    category: "UX/UI Designer",
    difficulty: "beginner",
    estimatedDuration: "8-10 weeks",
    prerequisites: ["Basic design sense", "Creativity"],
    skills: ["Figma", "Adobe XD", "User Research", "Prototyping", "Design Systems"],
    tags: ["design", "ui", "ux", "figma", "prototyping"],
    milestones: [
      {
        title: "Design Principles",
        description: "Learn fundamental design principles and theory",
        order: 1,
        content: `
# Design Principles

## Core Principles
- Typography and layout
- Color theory
- Visual hierarchy
- Composition rules

## Design Process
- User research methods
- Wireframing and prototyping
- Design systems creation
        `,
        estimatedTime: "2 weeks",
        difficulty: "beginner"
      },
      {
        title: "Figma Mastery",
        description: "Master the industry-standard design tool",
        order: 2,
        content: `
# Figma Mastery

## Advanced Features
- Component systems
- Auto-layout
- Prototyping and animations
- Collaboration workflows

## Real Projects
- Mobile app design
- Web application interface
- Design system creation
        `,
        estimatedTime: "3 weeks",
        difficulty: "intermediate"
      }
    ]
  }
];

const sampleInterviewQuestions = [
  // HR Questions
  {
    question: "Tell me about yourself.",
    category: "HR",
    difficulty: "entry",
    sampleAnswer: "I'm a passionate software developer with 3 years of experience building web applications. I specialize in React and Node.js, and I'm particularly interested in creating user-friendly interfaces. In my previous role at XYZ Company, I led the development of a customer portal that increased user engagement by 40%. I'm excited about this opportunity because it would allow me to work on larger-scale applications and contribute to a team focused on innovation.",
    tips: [
      "Keep it concise (2-3 minutes max)",
      "Follow present-past-future structure",
      "Focus on relevant professional experience",
      "End with why you're interested in this role"
    ],
    keywords: ["background", "experience", "skills", "motivation"],
    timeLimit: 3
  },
  {
    question: "Why do you want to work here?",
    category: "HR",
    difficulty: "entry",
    sampleAnswer: "I'm drawn to your company because of your commitment to innovation and your strong reputation in the industry. I've been following your recent product launches, particularly the AI-powered analytics tool, and I'm impressed by how you're solving real problems for customers. The collaborative culture you've built, as evidenced by your employee reviews and team blog posts, aligns perfectly with my values. I believe my background in full-stack development and my passion for user experience would contribute meaningfully to your engineering team.",
    tips: [
      "Research the company thoroughly",
      "Mention specific products, values, or initiatives",
      "Connect your goals with company goals",
      "Show genuine enthusiasm"
    ],
    keywords: ["company research", "values alignment", "contribution"],
    timeLimit: 2
  },
  {
    question: "What are your salary expectations?",
    category: "HR",
    difficulty: "mid",
    sampleAnswer: "Based on my research of industry standards for this role and my experience level, I'm looking for a salary in the range of $80,000 to $95,000. However, I'm more interested in the overall compensation package, including benefits, growth opportunities, and the chance to work on meaningful projects. I'm open to discussing a package that works for both of us.",
    tips: [
      "Research market rates beforehand",
      "Give a range rather than exact number",
      "Mention total compensation, not just salary",
      "Show flexibility and willingness to negotiate"
    ],
    keywords: ["compensation", "market research", "negotiation"],
    timeLimit: 2
  },

  // Behavioral Questions
  {
    question: "Describe a time when you had to work with a difficult team member.",
    category: "Behavioral",
    difficulty: "mid",
    sampleAnswer: "In my previous role, I worked with a colleague who was consistently missing deadlines and not communicating proactively about blockers. Rather than escalating immediately, I scheduled a one-on-one conversation to understand their perspective. I discovered they were overwhelmed with multiple projects and unclear about priorities. Together, we created a shared project board to track tasks and set up brief daily check-ins. I also offered to help with some of their workload during crunch periods. This approach improved our collaboration significantly, and we successfully delivered the project on time. I learned the importance of addressing conflicts directly but with empathy.",
    tips: [
      "Use the STAR method (Situation, Task, Action, Result)",
      "Focus on your actions and problem-solving",
      "Show empathy and professionalism",
      "Highlight positive outcomes and lessons learned"
    ],
    keywords: ["teamwork", "conflict resolution", "communication", "problem-solving"],
    followUpQuestions: [
      "How do you typically handle disagreements in a team setting?",
      "What would you do differently if faced with a similar situation?"
    ],
    timeLimit: 3
  },
  {
    question: "Tell me about a time you failed at something.",
    category: "Behavioral",
    difficulty: "mid",
    sampleAnswer: "Early in my career, I was leading a project to redesign our company's internal tool. I was excited about the technical challenges and focused heavily on implementing cutting-edge features. However, I failed to properly gather requirements from the end users. When we launched, the adoption rate was much lower than expected because the interface was confusing for non-technical users. I took ownership of the mistake, conducted user interviews to understand the issues, and led a simplified redesign that prioritized usability. The second version had 85% adoption within a month. This experience taught me the critical importance of user-centered design and stakeholder involvement throughout the development process.",
    tips: [
      "Choose a real failure, not a disguised strength",
      "Take full ownership without blaming others",
      "Focus on what you learned and how you improved",
      "Show how the experience made you better"
    ],
    keywords: ["failure", "learning", "ownership", "improvement"],
    timeLimit: 3
  },
  {
    question: "Describe a situation where you had to learn something new quickly.",
    category: "Behavioral",
    difficulty: "entry",
    sampleAnswer: "When I joined my current team, they were using GraphQL for their API, which I had no experience with. I had two weeks to get up to speed before starting on a major feature. I created a learning plan: I spent mornings going through official documentation and tutorials, built small practice projects in the afternoons, and scheduled pair programming sessions with experienced team members. I also joined the GraphQL community Slack to ask questions and learn best practices. By the end of two weeks, I was comfortable enough to contribute meaningfully to the project. The feature launched successfully, and I've since become the team's go-to person for GraphQL questions. This experience reinforced my ability to quickly acquire new technical skills when needed.",
    tips: [
      "Show structured approach to learning",
      "Demonstrate resourcefulness and initiative",
      "Mention how you verified your understanding",
      "Highlight successful application of new knowledge"
    ],
    keywords: ["learning agility", "self-motivation", "adaptability"],
    timeLimit: 3
  },

  // Situational Questions
  {
    question: "How would you handle a situation where you disagree with your manager's decision?",
    category: "Situational",
    difficulty: "mid",
    sampleAnswer: "I would first make sure I fully understand the reasoning behind the decision by asking clarifying questions. If I still have concerns, I would request a private meeting to discuss my perspective, presenting my viewpoint with data and specific examples. I'd focus on the impact on the project or team rather than making it personal. If my manager maintains their position after our discussion, I would respect their decision and execute it to the best of my ability, while documenting any risks I've identified. If the decision leads to significant problems, I would use that as a learning opportunity for future discussions. Ultimately, I believe in supporting team decisions once they're made, while also being an advocate for what I believe is best for the project.",
    tips: [
      "Show respect for hierarchy while maintaining integrity",
      "Emphasize communication and understanding",
      "Demonstrate ability to disagree professionally",
      "Show commitment to team success"
    ],
    keywords: ["disagreement", "management", "communication", "professionalism"],
    timeLimit: 2
  },
  {
    question: "What would you do if you realized you made a mistake that could impact the project timeline?",
    category: "Situational",
    difficulty: "entry",
    sampleAnswer: "I would immediately assess the scope and impact of the mistake to understand how it affects the timeline and deliverables. Then I would notify my manager and relevant stakeholders as soon as possible, being transparent about what happened and taking full responsibility. I'd come prepared with potential solutions and revised timelines, showing that I've thought through options for mitigation. I would also propose steps to prevent similar mistakes in the future, such as additional code reviews or testing procedures. Throughout the process, I'd maintain open communication and work extra hours if needed to minimize the impact. The key is to be proactive, honest, and solution-focused rather than trying to hide or minimize the issue.",
    tips: [
      "Emphasize immediate transparency and communication",
      "Show accountability and ownership",
      "Focus on solutions, not just problems",
      "Demonstrate learning and prevention mindset"
    ],
    keywords: ["mistakes", "accountability", "communication", "problem-solving"],
    timeLimit: 2
  },

  // Technical Questions
  {
    question: "How do you stay updated with the latest technology trends?",
    category: "Technical",
    difficulty: "entry",
    sampleAnswer: "I use a multi-faceted approach to stay current with technology trends. I follow key industry publications like TechCrunch and Hacker News, subscribe to newsletters from companies like GitHub and Stack Overflow, and listen to podcasts during my commute. I'm active in several online communities, including Reddit's programming subreddits and specialized Discord servers for my tech stack. I also attend local meetups and conferences when possible - last year I attended React Conf and learned about upcoming features firsthand. Most importantly, I dedicate time each week to hands-on experimentation with new tools and frameworks through personal projects. This combination of passive learning and active practice helps me stay informed while also building practical experience.",
    tips: [
      "Show multiple learning channels and sources",
      "Mention both passive and active learning methods",
      "Include community involvement and networking",
      "Demonstrate practical application of learning"
    ],
    keywords: ["continuous learning", "technology trends", "professional development"],
    timeLimit: 2
  },
  {
    question: "Explain a complex technical concept to someone without a technical background.",
    category: "Technical",
    difficulty: "mid",
    sampleAnswer: "I'll explain APIs using a restaurant analogy. Imagine you're at a restaurant - you don't go directly to the kitchen to tell the chef what you want. Instead, you tell the waiter your order, and they communicate with the kitchen for you. The waiter brings back your food without you needing to know how it was prepared. An API works similarly - it's like the waiter between your app and another system's database. When you want to get information (like weather data), your app makes a request to the API, which goes to the weather service's database, gets the information, and brings it back to your app in a format you can use. This way, your app doesn't need to know the complex details of how the weather service works internally.",
    tips: [
      "Use relatable, everyday analogies",
      "Avoid technical jargon and acronyms",
      "Break down complex ideas into simple steps",
      "Check for understanding and adjust explanation"
    ],
    keywords: ["communication", "technical explanation", "analogies"],
    timeLimit: 2
  },

  // Leadership Questions
  {
    question: "Describe a time when you had to lead a project or team.",
    category: "Leadership",
    difficulty: "senior",
    sampleAnswer: "I led a cross-functional team of 8 people to redesign our company's customer onboarding process. The challenge was coordinating between engineering, design, product, and customer success teams with different priorities and timelines. I started by establishing a shared vision and clear success metrics, then created a project roadmap with defined milestones and responsibilities. I implemented weekly check-ins and used project management tools to maintain visibility across teams. When we encountered a major technical blocker halfway through, I facilitated brainstorming sessions and helped the team pivot to an alternative solution. I also managed stakeholder communication, providing regular updates to leadership and addressing concerns proactively. The project launched on time and reduced customer onboarding time by 60%, leading to a 25% increase in activation rates.",
    tips: [
      "Highlight leadership skills beyond just management",
      "Show how you handled challenges and conflicts",
      "Include metrics and measurable outcomes",
      "Demonstrate cross-functional collaboration"
    ],
    keywords: ["leadership", "project management", "team coordination", "results"],
    timeLimit: 4
  },
  {
    question: "How do you motivate team members who seem disengaged?",
    category: "Leadership",
    difficulty: "senior",
    sampleAnswer: "When I notice team members becoming disengaged, I first try to understand the root cause through one-on-one conversations. Often, disengagement stems from feeling undervalued, unclear about goals, or lacking growth opportunities. I start by listening actively to their concerns and perspectives. Then I work with them to identify what would re-energize them - this might be new challenges, different types of work, skill development opportunities, or clearer connection to the impact of their work. I also ensure they have the resources and support needed to succeed, and I recognize their contributions publicly when appropriate. For example, I had a developer who seemed disengaged until I learned they were interested in mentoring. I paired them with junior developers, which re-energized them and benefited the whole team. The key is personalizing the approach based on individual motivations and circumstances.",
    tips: [
      "Show empathy and active listening skills",
      "Demonstrate understanding of different motivation factors",
      "Provide specific examples of successful interventions",
      "Emphasize individual approach over one-size-fits-all"
    ],
    keywords: ["motivation", "team management", "individual development", "empathy"],
    timeLimit: 3
  },

  // Problem Solving Questions
  {
    question: "Walk me through how you would approach solving a problem you've never encountered before.",
    category: "Problem Solving",
    difficulty: "mid",
    sampleAnswer: "I follow a structured approach when facing unfamiliar problems. First, I define the problem clearly - what exactly needs to be solved, what constraints exist, and what success looks like. Then I break down the problem into smaller, more manageable components. Next, I research existing solutions and best practices, consulting documentation, online resources, and reaching out to colleagues or communities for insights. I create a hypothesis about potential solutions and test them in a low-risk environment when possible. If the first approach doesn't work, I iterate based on what I learned. Throughout the process, I document my findings and decisions for future reference. For example, when I needed to implement real-time notifications in an app for the first time, I researched WebSockets vs Server-Sent Events, built small prototypes of each approach, and chose the solution that best fit our specific requirements and infrastructure.",
    tips: [
      "Show systematic thinking and methodology",
      "Emphasize research and learning from others",
      "Include testing and iteration in your approach",
      "Provide concrete example when possible"
    ],
    keywords: ["problem-solving", "methodology", "research", "iteration"],
    timeLimit: 3
  }
];

async function seedDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/career-prep-platform');
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await LearningPath.deleteMany({});
    await InterviewQuestion.deleteMany({});
    console.log('Cleared existing data');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      name: 'Admin User',
      email: 'admin@careerprep.com',
      password: adminPassword,
      role: 'admin',
      isEmailVerified: true,
      careerGoal: 'Full Stack Developer'
    });
    await adminUser.save();
    console.log('Created admin user');

    // Create sample user
    const userPassword = await bcrypt.hash('user123', 12);
    const sampleUser = new User({
      name: 'John Doe',
      email: 'user@example.com',
      password: userPassword,
      role: 'user',
      isEmailVerified: true,
      careerGoal: 'Full Stack Developer',
      education: {
        degree: 'Bachelor of Science',
        institution: 'University of Technology',
        graduationYear: 2020,
        major: 'Computer Science'
      }
    });
    await sampleUser.save();
    console.log('Created sample user');

    // Create learning paths
    for (const pathData of sampleLearningPaths) {
      const path = new LearningPath({
        ...pathData,
        createdBy: adminUser._id
      });
      await path.save();
    }
    console.log(`Created ${sampleLearningPaths.length} learning paths`);

    // Create interview questions
    for (const questionData of sampleInterviewQuestions) {
      const question = new InterviewQuestion({
        ...questionData,
        createdBy: adminUser._id
      });
      await question.save();
    }
    console.log(`Created ${sampleInterviewQuestions.length} interview questions`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@careerprep.com / admin123');
    console.log('User: user@example.com / user123');
    
  } catch (error) {
    console.error('Seeding error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed function
if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase };