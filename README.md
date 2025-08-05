# LearnLift - AI-Powered Learning Platform

<div align="center">
  <img src="public/placeholder.svg" alt="LearnLift Logo" width="200"/>
  
  [![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.5.3-blue.svg)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-5.4.1-purple.svg)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.11-38B2AC.svg)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-2.53.0-green.svg)](https://supabase.com/)
  
  **Transform any document into AI-powered study materials**
</div>

## 🚀 Overview

LearnLift is a modern, AI-powered learning platform that transforms educational documents into comprehensive study materials. Upload your PDFs, DOCX files, or text documents, and instantly receive AI-generated notes, interactive flashcards, and adaptive quizzes tailored to your learning style.

### ✨ Key Features

- **🤖 AI-Powered Document Processing** - Intelligent analysis of educational content
- **📝 Smart Notes Generation** - Automatic extraction of key concepts and summaries
- **🧠 Interactive Flashcards** - Spaced repetition system for optimal retention
- **🎯 Adaptive Quizzes** - Personalized practice tests with instant feedback
- **📊 Progress Tracking** - Visual analytics and learning insights
- **🔐 Secure Authentication** - Google OAuth integration with Supabase
- **📱 Responsive Design** - Works seamlessly on all devices
- **🌙 Dark/Light Mode** - Customizable theme preferences

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Beautiful, accessible component library
- **React Router** - Client-side routing
- **React Dropzone** - File upload functionality

### Backend & Services
- **Supabase** - Backend-as-a-Service (Auth, Database, Storage)
- **Google OAuth** - Secure authentication
- **Edge Functions** - Serverless API endpoints

### Development Tools
- **ESLint** - Code linting and formatting
- **PostCSS** - CSS processing
- **Autoprefixer** - CSS vendor prefixing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher)
- **npm** or **bun** package manager
- **Git** for version control

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/gh-link-pal.git
cd gh-link-pal
```

### 2. Install Dependencies

```bash
# Using npm
npm install

# Or using bun (recommended)
bun install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Start Development Server

```bash
# Using npm
npm run dev

# Or using bun
bun dev
```

The application will be available at `http://localhost:8080`

## 🏗️ Project Structure

```
gh-link-pal/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Shadcn/ui components
│   │   ├── Header.tsx      # Navigation header
│   │   ├── HeroSection.tsx # Landing page hero
│   │   ├── DocumentUpload.tsx # File upload component
│   │   ├── StudyTools.tsx  # Study materials display
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Landing page
│   │   ├── Dashboard.tsx   # User dashboard
│   │   ├── AuthCallback.tsx # OAuth callback
│   │   └── NotFound.tsx    # 404 page
│   ├── lib/                # Utility functions
│   │   ├── auth.tsx        # Authentication logic
│   │   ├── supabase.ts     # Supabase client
│   │   └── utils.ts        # Helper functions
│   ├── hooks/              # Custom React hooks
│   ├── assets/             # Static assets
│   └── main.tsx            # Application entry point
├── supabase/               # Supabase configuration
│   ├── functions/          # Edge functions
│   └── migrations/         # Database migrations
├── public/                 # Public assets
└── package.json            # Dependencies and scripts
```

## 🎯 Core Features

### 1. Document Upload & Processing

- **Supported Formats**: PDF, DOCX, TXT, CSV
- **File Size Limit**: 50MB per file
- **Drag & Drop**: Intuitive file upload interface
- **Progress Tracking**: Real-time upload and processing status
- **Batch Processing**: Upload multiple files simultaneously

### 2. AI-Generated Study Materials

#### Smart Notes
- Automatic key concept extraction
- Structured summaries with bullet points
- Important terminology highlighting
- Contextual explanations

#### Interactive Flashcards
- Spaced repetition algorithm
- Adaptive difficulty adjustment
- Progress tracking per card
- Export functionality

#### Practice Quizzes
- Multiple choice questions
- Instant feedback and explanations
- Performance analytics
- Difficulty progression

### 3. User Dashboard

- **Document Management**: View and organize uploaded files
- **Study Statistics**: Track learning progress
- **Quick Actions**: Easy access to study tools
- **Recent Activity**: Monitor study sessions

### 4. Authentication & Security

- **Google OAuth**: Secure single sign-on
- **Supabase Auth**: Enterprise-grade authentication
- **Protected Routes**: Secure access to user content
- **Session Management**: Automatic login state handling

## 🎨 UI/UX Features

### Design System
- **Modern Interface**: Clean, professional design
- **Responsive Layout**: Mobile-first approach
- **Accessibility**: WCAG 2.1 compliant components
- **Theme Support**: Dark and light mode toggle

### Interactive Elements
- **Hover Effects**: Smooth transitions and animations
- **Loading States**: Progress indicators and skeletons
- **Toast Notifications**: User feedback and alerts
- **Modal Dialogs**: Contextual information display

## 🔧 Configuration

### Supabase Setup

1. Create a new Supabase project
2. Configure Google OAuth provider
3. Set up database tables for user data
4. Configure storage buckets for file uploads
5. Deploy edge functions for AI processing

### Environment Variables

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Analytics
VITE_ANALYTICS_ID=your_analytics_id

# Optional: Feature Flags
VITE_ENABLE_BETA_FEATURES=false
```

## 📱 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # TypeScript type checking

# Database
npm run db:migrate   # Run database migrations
npm run db:reset     # Reset database (development)
```

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main branch

### Netlify

1. Build the project: `npm run build`
2. Upload the `dist` folder to Netlify
3. Configure environment variables

### Manual Deployment

```bash
# Build the project
npm run build

# Serve the built files
npm run preview
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commit messages
- Write meaningful component documentation
- Ensure responsive design compatibility
- Test on multiple browsers and devices

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/ui** for the beautiful component library
- **Supabase** for the backend infrastructure
- **Vite** for the fast development experience
- **Tailwind CSS** for the utility-first styling approach

## 📞 Support

- **Documentation**: [docs.learnlift.com](https://docs.learnlift.com)
- **Issues**: [GitHub Issues](https://github.com/yourusername/gh-link-pal/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/gh-link-pal/discussions)
- **Email**: support@learnlift.com

## 🔮 Roadmap

### Upcoming Features
- [ ] AI Tutor Chat Interface
- [ ] Collaborative Study Groups
- [ ] Advanced Analytics Dashboard
- [ ] Mobile App (React Native)
- [ ] Integration with Learning Management Systems
- [ ] Voice-to-Text Document Processing
- [ ] Multi-language Support
- [ ] Advanced Spaced Repetition Algorithms

### Performance Improvements
- [ ] Server-side rendering (SSR)
- [ ] Progressive Web App (PWA) features
- [ ] Advanced caching strategies
- [ ] CDN optimization

---

<div align="center">
  Made with ❤️ by the LearnLift Team
  
  [Website](https://learnlift.com) • [Twitter](https://twitter.com/learnlift) • [LinkedIn](https://linkedin.com/company/learnlift)
</div>
