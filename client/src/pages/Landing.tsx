import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Chip,
  Stack,
  Avatar,
  Rating,
} from '@mui/material';
import {
  School,
  Description,
  Psychology,
  AdminPanelSettings,
  TrendingUp,
  People,
  CheckCircle,
  Star,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <School sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: 'Personalized Learning Paths',
      description: 'Follow structured career tracks designed by industry experts. From Full Stack Development to Data Science and UX/UI Design.',
      benefits: ['3+ Career Tracks', '5+ Milestones per Path', 'Rich Content & Resources', 'Progress Tracking']
    },
    {
      icon: <Description sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: 'AI-Powered Resume Builder',
      description: 'Create professional resumes with our guided builder. Get AI-powered analysis and suggestions to make your resume stand out.',
      benefits: ['Multiple Templates', 'Real-time Preview', 'ATS Compatibility', 'PDF Download']
    },
    {
      icon: <Psychology sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: 'Interview Practice Hub',
      description: 'Master behavioral and technical interviews with our comprehensive question bank and practice tracking.',
      benefits: ['20+ Question Categories', 'Sample Answers', 'Confidence Tracking', 'Personalized Recommendations']
    },
    {
      icon: <AdminPanelSettings sx={{ fontSize: 40, color: 'error.main' }} />,
      title: 'Admin Dashboard',
      description: 'Complete content management system for administrators to create learning paths and manage the platform.',
      benefits: ['User Management', 'Content Creation', 'Analytics', 'Bulk Import Tools']
    }
  ];

  const stats = [
    { label: 'Learning Paths', value: '3+', icon: <School /> },
    { label: 'Interview Questions', value: '25+', icon: <Psychology /> },
    { label: 'Resume Templates', value: '5', icon: <Description /> },
    { label: 'Features', value: '15+', icon: <CheckCircle /> },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Software Engineer',
      company: 'Tech Corp',
      avatar: 'SJ',
      rating: 5,
      text: 'The resume builder helped me land my dream job! The AI analysis gave me insights I never would have considered.'
    },
    {
      name: 'Mike Chen',
      role: 'Data Scientist',
      company: 'Analytics Inc',
      avatar: 'MC',
      rating: 5,
      text: 'The learning paths are comprehensive and well-structured. I went from beginner to job-ready in 3 months.'
    },
    {
      name: 'Emily Rodriguez',
      role: 'UX Designer',
      company: 'Design Studio',
      avatar: 'ER',
      rating: 5,
      text: 'Interview practice gave me the confidence I needed. The sample answers were incredibly helpful.'
    }
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 12,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h1" gutterBottom fontWeight="bold">
                Advance Your Career with
                <Typography
                  component="span"
                  variant="h1"
                  sx={{ color: 'secondary.light', display: 'block' }}
                >
                  Confidence
                </Typography>
              </Typography>
              <Typography variant="h5" paragraph sx={{ opacity: 0.9, mb: 4 }}>
                Master new skills, build professional resumes, and ace interviews with our comprehensive career preparation platform.
              </Typography>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleGetStarted}
                  sx={{
                    backgroundColor: 'secondary.main',
                    '&:hover': { backgroundColor: 'secondary.dark' },
                    px: 4,
                    py: 1.5,
                  }}
                >
                  {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => navigate('/login')}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    '&:hover': { borderColor: 'secondary.light', backgroundColor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Sign In
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 400,
                }}
              >
                <Box
                  sx={{
                    width: 300,
                    height: 300,
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backdropFilter: 'blur(10px)',
                  }}
                >
                  <TrendingUp sx={{ fontSize: 120, opacity: 0.8 }} />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Grid container spacing={4}>
          {stats.map((stat, index) => (
            <Grid item xs={6} md={3} key={index}>
              <Card sx={{ textAlign: 'center', p: 3, height: '100%' }}>
                <Box sx={{ color: 'primary.main', mb: 2 }}>
                  {stat.icon}
                </Box>
                <Typography variant="h3" fontWeight="bold" color="primary">
                  {stat.value}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {stat.label}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Features Section */}
      <Box sx={{ backgroundColor: 'background.default', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h2" textAlign="center" gutterBottom>
            Everything You Need to
            <Typography component="span" variant="h2" color="primary" sx={{ ml: 1 }}>
              Succeed
            </Typography>
          </Typography>
          <Typography variant="h6" textAlign="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
            Comprehensive tools and resources to accelerate your career growth
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card sx={{ height: '100%', p: 3, transition: 'transform 0.3s', '&:hover': { transform: 'translateY(-4px)' } }}>
                  <CardContent>
                    <Box sx={{ mb: 2 }}>
                      {feature.icon}
                    </Box>
                    <Typography variant="h5" gutterBottom fontWeight="600">
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" paragraph>
                      {feature.description}
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {feature.benefits.map((benefit, idx) => (
                        <Chip
                          key={idx}
                          label={benefit}
                          size="small"
                          variant="outlined"
                          sx={{ mb: 1 }}
                        />
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h2" textAlign="center" gutterBottom>
          What Our Users Say
        </Typography>
        <Typography variant="h6" textAlign="center" color="text.secondary" paragraph sx={{ mb: 6 }}>
          Join thousands of professionals who have advanced their careers with our platform
        </Typography>

        <Grid container spacing={4}>
          {testimonials.map((testimonial, index) => (
            <Grid item xs={12} md={4} key={index}>
              <Card sx={{ height: '100%', p: 3 }}>
                <CardContent>
                  <Stack spacing={2}>
                    <Rating value={testimonial.rating} readOnly />
                    <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                      "{testimonial.text}"
                    </Typography>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar sx={{ backgroundColor: 'primary.main' }}>
                        {testimonial.avatar}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle1" fontWeight="600">
                          {testimonial.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testimonial.role} at {testimonial.company}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box
        sx={{
          backgroundColor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h3" gutterBottom fontWeight="600">
            Ready to Transform Your Career?
          </Typography>
          <Typography variant="h6" paragraph sx={{ opacity: 0.9, mb: 4 }}>
            Join our platform today and take the first step towards your dream job.
            Start with our comprehensive learning paths and powerful resume builder.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{
              backgroundColor: 'secondary.main',
              '&:hover': { backgroundColor: 'secondary.dark' },
              px: 6,
              py: 2,
              fontSize: '1.1rem',
            }}
          >
            {isAuthenticated ? 'Continue Learning' : 'Start Your Journey'}
          </Button>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;