import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { AnimatedBackground } from './components/AnimatedBackground';
import { Link } from 'react-router-dom';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Award, 
  BookOpen, 
  Zap, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  Calendar,
  Users,
  Trophy,
  Target,
  Sparkles,
  Rocket,
  Star,
  ChevronRight,
  Download,
  Eye,
  Clock,
  Building,
  Code,
  Palette,
  TrendingUp,
  Heart,
  Globe,
  Moon,
  Sun,
  Linkedin,
  MessageSquare
} from 'lucide-react';

export default function App() {
  const [activeSection, setActiveSection] = React.useState('overview');
  
  // Initialize dark mode from localStorage, default to true (dark mode)
  const [isDarkMode, setIsDarkMode] = React.useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : true; // Default to dark mode
  });

  // Apply dark mode on mount and persist changes
  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Modern Hero Section - Dynamic Horizontal Layout */}
      <header className="relative border-b border-border bg-gradient-to-br from-background via-background to-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
          {/* Compact Header Bar with Dark Mode Toggle */}
          <div className="flex items-center justify-between mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/5 rounded-lg flex items-center justify-center border border-primary/20">
                <Briefcase size={20} className="text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Portfolio</h3>
                <p className="text-xs text-muted-foreground">Md Misbahul Islam</p>
              </div>
            </div>
            <button
              onClick={toggleDarkMode}
              className="p-2.5 rounded-lg hover:bg-muted transition-all duration-200 border border-border hover:border-primary/30 group"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              ) : (
                <Moon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              )}
            </button>
          </div>

          {/* Hero Content - Asymmetrical Split Layout */}
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column - Profile Card */}
            <div className="lg:col-span-4 animate-fade-in-left">
              <Card className="border border-border bg-card/50 backdrop-blur-sm overflow-hidden group hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-0">
                  {/* Profile Header */}
                  <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-8 border-b border-border">
                    <div className="w-32 h-32 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl flex items-center justify-center border border-primary/20 mb-6 group-hover:scale-105 transition-transform duration-300 overflow-hidden p-2">
                      <img 
                        src="/profile.jpg" 
                        alt="Md Misbahul Islam" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="space-y-2">
                      <h1 className="text-2xl font-semibold tracking-tight">
                        Md Misbahul Islam
                      </h1>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        Product & Project Manager | Quality Assurance Professional
                      </p>
                    </div>
                  </div>
                  
                  {/* Contact Info */}
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-3 text-sm group/item hover:text-primary transition-colors">
                      <div className="bg-muted rounded-lg p-2 group-hover/item:bg-primary/10 transition-colors">
                        <Phone className="h-4 w-4" />
                      </div>
                      <span className="font-mono">+8801601802857</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm group/item hover:text-primary transition-colors">
                      <div className="bg-muted rounded-lg p-2 group-hover/item:bg-primary/10 transition-colors">
                        <Mail className="h-4 w-4" />
                      </div>
                      <span>Misbahsakin1@gmail.com</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm group/item hover:text-primary transition-colors">
                      <div className="bg-muted rounded-lg p-2 group-hover/item:bg-primary/10 transition-colors">
                        <MapPin className="h-4 w-4" />
                      </div>
                      <span>Dhaka, Bangladesh</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Main Content */}
            <div className="lg:col-span-8 space-y-6">
              {/* Intro Text */}
              <div className="animate-fade-in-right stagger-1">
                <div className="inline-block mb-4">
                  <Badge variant="secondary" className="text-xs px-3 py-1 bg-primary/10 text-primary border-primary/20 font-mono">
                    Available for Opportunities
                  </Badge>
                </div>
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text">
                  Building Products That Matter
                </h2>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
                  Product Manager with experience in B2B, fintech, and consumer-facing applications, bringing a strong background in QA and cross-functional collaboration. Skilled at bridging product, QA, and engineering teams to drive efficient Agile delivery, leverage data for decision-making, and align stakeholders. Proven track record of reducing delivery times by 30%, improving accuracy by 15%, and delivering measurable product impact.</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-right stagger-2">
                {[
                  { value: '2+', label: 'Years Experience', icon: Clock },
                  { value: '15+', label: 'Projects Completed', icon: Rocket },
                  { value: '30+', label: 'Team Members Led', icon: Users },
                  { value: '40%', label: 'User Growth', icon: TrendingUp },
                ].map((stat, index) => (
                  <Card 
                    key={index} 
                    className="border border-border bg-card/50 backdrop-blur-sm hover:bg-card transition-all duration-300 hover:border-primary/30 group"
                  >
                    <CardContent className="p-4">
                      <stat.icon className="h-5 w-5 text-primary mb-3 group-hover:scale-110 transition-transform" />
                      <div className="text-3xl font-bold mb-1">{stat.value}</div>
                      <div className="text-xs text-muted-foreground leading-tight">{stat.label}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 animate-fade-in-right stagger-3">
                <Link to="/contact">
                  <Button 
                    size="lg" 
                    className="bg-primary hover:bg-primary/90 text-primary-foreground group shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-6"
                  >
                    <Mail className="mr-2 h-5 w-5 group-hover:scale-105 transition-transform" />
                    Contact Me
                  </Button>
                </Link>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-border hover:border-primary/50 group"
                  onClick={() => window.open('https://drive.google.com/file/d/1Yl1A1TrHsxdUDfN9YKd0TDZNtoNHwxIF/view?usp=drivesdk', '_blank')}
                >
                  <Download className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                  Download Resume
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-border hover:border-primary/50 group"
                  onClick={() => window.open('https://linkedin.com/in/misbahsakin', '_blank')}
                >
                  <div className="bg-[#0077b5]/10 p-1 rounded-sm mr-2 group-hover:scale-110 transition-transform">
                    <Linkedin className="h-4 w-4 text-[#0077b5]" />
                  </div>
                  LinkedIn
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-4 animate-fade-in-left stagger-1">
              <Card className="border border-border bg-card">
                <CardContent className="p-6">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Navigation</h3>
                  <nav className="space-y-1">
                    {[
                      { id: 'overview', label: 'Overview', icon: Eye },
                      { id: 'experience', label: 'Experience', icon: Briefcase },
                      { id: 'skills', label: 'Skills', icon: Zap },
                      { id: 'education', label: 'Education', icon: GraduationCap },
                      { id: 'training', label: 'Training', icon: BookOpen },
                      { id: 'achievements', label: 'Achievements', icon: Trophy },
                      { id: 'activities', label: 'Activities', icon: Users },
                    ].map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveSection(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left text-sm font-medium transition-all group ${
                          activeSection === item.id
                            ? 'bg-primary text-primary-foreground shadow-md'
                            : 'text-foreground hover:bg-muted hover:text-primary'
                        }`}
                      >
                        <item.icon className={`h-4 w-4 transition-transform ${activeSection !== item.id && 'group-hover:scale-110'}`} />
                        <span className="flex-1">{item.label}</span>
                        {activeSection === item.id && <ChevronRight className="h-4 w-4" />}
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
              
              {/* Quick Contact Card */}
              <Card className="border border-border bg-card overflow-hidden group hover:border-primary/30 transition-all duration-300">
                <CardContent className="p-6 text-center">
                  <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Heart className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="font-semibold mb-2">Let's Work Together</h4>
                  <p className="text-sm text-muted-foreground mb-4">Ready for your next project?</p>
                  <Link to="/contact" className="block">
                    <Button
                      size="default"
                      className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md transition-all rounded-xl"
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Get In Touch
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-8">
            {activeSection === 'overview' && (
              <div className="space-y-8">
                {/* Overview Dashboard */}
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: Target,
                      title: 'Product Success',
                      description: 'Successfully launched 10+ Features.',
                      progress: 60,
                      detail: '60% DAM and MAM Increased.',
                      accent: TrendingUp
                    },
                    {
                      icon: Award,
                      title: 'Quality Excellence',
                      description: 'Reduced defect rates by 70% and Smooth User Experience',
                      progress: 70,
                      detail: 'Hundreds of bugs resolved, Reduced third party dependencies.',
                      accent: Zap
                    },
                    {
                      icon: Users,
                      title: 'Team Leadership',
                      description: 'Successfully managed 7+ cross-functional team members.',
                      progress: 95,
                      detail: 'Mobile App Developer, Software Engineer and UI/UX Engineer.',
                      accent: Heart
                    },
                    {
                      icon: Clock,
                      title: 'Process Optimization',
                      description: 'Optimized Sprint Deliveries, Sprint wise planning and execution.',
                      progress: 75,
                      detail: '75% Time Reduction',
                      accent: Rocket
                    }
                  ].map((item, index) => (
                    <Card 
                      key={index} 
                      className={`border border-border bg-card card-hover animate-fade-in stagger-${index + 1} group`}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="bg-primary/10 p-3 rounded-lg group-hover:bg-primary/20 transition-colors">
                            <item.icon className="h-6 w-6 text-primary" />
                          </div>
                          <item.accent className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <h3 className="font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
                        <div className="bg-muted rounded-full h-2 mb-2 overflow-hidden">
                          <div 
                            className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out" 
                            style={{width: `${item.progress}%`}}
                          ></div>
                        </div>
                        <span className="text-xs text-muted-foreground">{item.detail}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Skills Preview */}
                <Card className="border border-border bg-card animate-fade-in stagger-5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Core Competencies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-4">
                      {[
                        { icon: Target, title: 'Product Management', subtitle: 'Strategy & Execution' },
                        { icon: Users, title: 'Project Management', subtitle: 'Leadership & Delivery' },
                        { icon: Award, title: 'Quality Assurance', subtitle: 'Testing & Fixing' }
                      ].map((competency, index) => (
                        <div 
                          key={index} 
                          className="text-center p-6 bg-muted/50 rounded-lg border border-border hover:border-primary/30 hover:bg-muted transition-all duration-300 group"
                        >
                          <competency.icon className="h-8 w-8 text-primary mx-auto mb-3 group-hover:scale-110 transition-transform" />
                          <h4 className="font-semibold mb-1">{competency.title}</h4>
                          <p className="text-sm text-muted-foreground">{competency.subtitle}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeSection === 'experience' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8 animate-fade-in">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Briefcase className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Professional Experience</h2>
                    <p className="text-muted-foreground">My career journey and key accomplishments</p>
                  </div>
                </div>
                
                {/* Timeline Layout */}
                <div className="relative">
                  <div className="absolute left-8 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-primary/50 to-transparent"></div>
                  
                  <div className="space-y-8">
                    {[
                      {
                        title: "Product Manager (B2B)",
                        company: "Riseup Labs",
                        period: "December 2025 - Present",
                        icon: BookOpen,
                        description: "Led B2B product strategy and execution, delivering scalable digital solutions for enterprise clients while driving measurable business growth and user adoption.",
                        achievements: [
                          "Owned end-to-end product lifecycle from discovery to launch, aligning client requirements with business objectives",
                          "Defined and executed product roadmaps, reducing delivery timelines by 30% through Agile frameworks",
                          "Collaborated with engineering, QA, and stakeholders to deliver high-quality releases, improving solution accuracy by 15%",
                          "Partnered with enterprise clients to gather requirements and translate them into scalable product features"
                        ],
                        skills: ["B2B Product Strategy", "Roadmapping", "Agile Delivery", "Stakeholder Management", "Client Collaboration", "Data-Driven Decision Making"]
                      },
                      {
                        title: "Product Manager",
                        company: "Sheba Platform Limited",
                        period: "October 2024 - November 2025",
                        icon: Palette,
                        description: "Leading cross-functional teams to deliver high-impact product features, increasing user engagement by 40% across fintech and consumer platforms.",
                        achievements: [
                          "Owned product roadmap and execution, reducing delivery timelines by 30% through Agile best practices",
                          "Partnered closely with engineering and QA to implement scalable solutions, improving product accuracy by 15%",
                          "Drove cross-functional collaboration across fintech initiatives, increasing overall project success rates by 10%"
                        ],
                        skills: ["Product Strategy", "Roadmapping", "Agile Delivery", "Stakeholder Management", "Data-Driven Decision Making"]
                      },
                      {
                        title: "Associate Product Manager",
                        company: "Sheba Platform Limited",
                        period: "April 2024 - September 2024",
                        icon: Target,
                        description: "Led cross-functional teams to deliver product features, increasing user engagement by 40%",
                        achievements: [
                          "Managed project timelines, reducing delivery times by 30% using Agile methodologies",
                          "Spearheaded the adoption of cutting-edge engineering software, improving project accuracy by 15%",
                          "Collaborated with cross-functional teams, fintech products and enhancing project success rates by 10%."
                        ],
                        skills: ["Product Strategy", "Agile", "User Research", "Roadmapping", "Product Planning"]
                      },
                    
                      {
                        title: "Trainee QA",
                        company: "RiseUp Labs",
                        period: "May 2023",
                        icon: BookOpen,
                        description: "Completed intensive 6-month QA training program",
                        achievements: [
                          "Gained hands-on experience in Software Development Life Cycle (SDLC) and Software Testing Life Cycle (STLC) processes, including requirement analysis, test planning, test execution, and defect management",
                          "Worked on real-world projects under senior QA guidance",
                          "Developed expertise in various testing tools and frameworks"
                        ],
                        skills: ["Manual Testing", "Test Case Design", "JIRA", "SQL"]
                      },
                      {
                        title: "Motion Graphics and Video Editor",
                        company: "aTech (Remote)",
                        period: "2022 - 2023",
                        icon: Palette,
                        description: "Edited promotional videos and documentaries for various clients",
                        achievements: [
                          "Collaborated with creative teams to produce engaging content",
                          "Managed multiple projects simultaneously while meeting tight deadlines",
                          "Created motion graphics and visual effects for enhanced storytelling"
                        ],
                        skills: ["Adobe Premiere Pro", "After Effects", "Color Grading", "Motion Graphics"]
                      }
                    ].map((job, index) => (
                      <div key={index} className={`relative flex items-start gap-6 animate-fade-in stagger-${index + 1}`}>
                        <div className="bg-primary p-3 rounded-full z-10 border-4 border-background shadow-lg group-hover:scale-110 transition-transform">
                          <job.icon className="h-6 w-6 text-primary-foreground" />
                        </div>
                        
                        <Card className="flex-1 card-hover border-l-4 border-l-primary bg-card group">
                          <CardHeader>
                            <div className="flex justify-between items-start flex-wrap gap-4">
                              <div>
                                <CardTitle className="text-lg group-hover:text-primary transition-colors">{job.title}</CardTitle>
                                <p className="text-muted-foreground flex items-center gap-2 mt-1">
                                  <Building className="h-4 w-4" />
                                  {job.company}
                                </p>
                              </div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1 bg-muted px-3 py-1 rounded-full font-mono">
                                <Calendar className="h-4 w-4" />
                                {job.period}
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="text-muted-foreground mb-4">{job.description}</p>
                            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground mb-4">
                              {job.achievements.map((achievement, i) => (
                                <li key={i}>{achievement}</li>
                              ))}
                            </ul>
                            <div className="flex flex-wrap gap-2">
                              {job.skills.map((skill, i) => (
                                <Badge key={i} variant="secondary" className="skill-badge">{skill}</Badge>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            {activeSection === 'skills' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8 animate-fade-in">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Zap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Skills & Expertise</h2>
                    <p className="text-muted-foreground">Technical and professional competencies</p>
                  </div>
                </div>
                
                {/* Skills Grid with Progress Bars */}
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: Target,
                      title: 'Product Management',
                      skills: [
                        { skill: "Product Strategy", level: 95 },
                        { skill: "Roadmapping", level: 90 },
                        { skill: "User Research", level: 85 },
                        { skill: "Market Analysis", level: 80 },
                        { skill: "Agile/Scrum", level: 92 }
                      ]
                    },
                    {
                      icon: Award,
                      title: 'Quality Assurance',
                      skills: [
                        { skill: "Manual Testing", level: 98 },
                        { skill: "Documentation- QAT - UAT", level: 88 },
                        { skill: "API Testing", level: 85 },
                        { skill: "Selenium", level: 30 },
                        { skill: "Performance Testing", level: 80 }
                      ]
                    },
                    {
                      icon: Users,
                      title: 'Project Management',
                      skills: [
                        { skill: "Project Planning", level: 92 },
                        { skill: "Risk Management", level: 87 },
                        { skill: "Team Leadership", level: 95 },
                        { skill: "Resource Allocation", level: 85 },
                        { skill: "Budget Management", level: 82 }
                      ]
                    },
                    {
                      icon: Palette,
                      title: 'Creative & Technical',
                      skills: [
                        { skill: "JIRA", level: 95 },
                        { skill: "Figma", level: 80 },
                        { skill: "MIRO", level: 76 },
                        { skill: "Slack", level: 80 },
                        { skill: "PowerBI and Superset", level: 70 }
                      ]
                    }
                  ].map((category, index) => (
                    <Card key={index} className={`card-hover border border-border bg-card animate-fade-in stagger-${index + 1}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <category.icon className="h-5 w-5 text-primary" />
                          {category.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {category.skills.map((item, idx) => (
                            <div key={idx}>
                              <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium">{item.skill}</span>
                                <span className="text-sm text-muted-foreground font-mono">{item.level}%</span>
                              </div>
                              <div className="bg-muted rounded-full h-2 overflow-hidden">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all duration-1000 ease-out"
                                  style={{width: `${item.level}%`}}
                                ></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {/* Technical Proficiencies */}
                <Card className="border border-border bg-card animate-fade-in stagger-5">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5 text-primary" />
                      Technical Proficiencies
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      {[
                        {
                          title: 'Tools & Platforms',
                          items: ['JIRA', 'MIRO', 'Figma', 'Slack', 'Trello', 'GitHub']
                        },
                        {
                          title: 'Testing Frameworks',
                          items: ['Selenium', 'Postman', 'Manual Testing', 'JMeter']
                        },
                        {
                          title: 'Creative Software',
                          items: ['Premiere Pro', 'After Effects', 'Photoshop', 'Illustrator', 'DaVinci', 'Final Cut']
                        }
                      ].map((group, index) => (
                        <div key={index}>
                          <h4 className="font-semibold mb-3">{group.title}</h4>
                          <div className="flex flex-wrap gap-2">
                            {group.items.map((item, idx) => (
                              <Badge key={idx} variant="secondary" className="skill-badge">{item}</Badge>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {activeSection === 'activities' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8 animate-fade-in">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Extracurricular Activities</h2>
                    <p className="text-muted-foreground">Club involvement and professional development</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="card-hover border border-border bg-card md:col-span-2 animate-fade-in stagger-1">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        Professional Communities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {[
                          {
                            icon: Target,
                            title: 'Graphics Design & Video Editor',
                            period: '2016- 2022',
                            items: [
                              'HTM Records, Bangladesh • 2019-2022',
                              'Graphics Design Director, CUET Model United Nations Club • 2021'
                            ]
                          },
                          {
                            icon: Target,
                            title: 'Event Management & Coordination',
                            period: '2016- 2022',
                            items: [
                              'Chief Coordinator • Pitha Utshab 2022, Bangladesh Navy',
                              'Coordinator, Alpona Utshab 1426, Rangpur, Bangladesh • 2019',
                              'Project Coordinator, Project Notun Jama, Spriha (Non-Government Organization), Rangpur, Bangladesh • 2017- 2019'
                            ]
                          },
                          {
                            icon: Award,
                            title: 'Campus Leadership & Volunteer Roles',
                            period: 'Volunteer Organizer • 2021 - Present',
                            items: [
                              'Campus Ambassador, Applink (Banglalink)',
                              'IT Secretary, HULT Prize Competition',
                              'Design Coordinator, IEEE Face the Case 2.0',
                              'Organizing Secretary, Joyoddhoney, CUET'
                            ]
                          }
                        ].map((activity, index) => (
                          <div key={index} className="bg-muted/50 p-4 rounded-lg border border-border hover:border-primary/30 transition-all duration-300 group">
                            <div className="flex items-start gap-3">
                              <div className="bg-primary p-2 rounded-lg group-hover:scale-110 transition-transform">
                                <activity.icon className="h-5 w-5 text-primary-foreground" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-semibold mb-1">{activity.title}</h4>
                                <p className="text-sm text-muted-foreground mb-2 font-mono">{activity.period}</p>
                                <div className="text-sm text-muted-foreground">
                                  <ul className="list-disc list-inside space-y-1">
                                    {activity.items.map((item, idx) => (
                                      <li key={idx}>{item}</li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Volunteer Impact */}
                <Card className="border border-border bg-card animate-fade-in stagger-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Heart className="h-5 w-5 text-primary" />
                      Volunteer Impact
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="text-center p-6 bg-muted/50 rounded-lg border border-border hover:border-primary/30 transition-all duration-300 group">
                        <div className="text-4xl font-semibold text-primary mb-2 group-hover:scale-110 transition-transform">500+</div>
                        <p className="text-sm text-muted-foreground">People Mentored</p>
                      </div>
                      <div className="text-center p-6 bg-muted/50 rounded-lg border border-border hover:border-primary/30 transition-all duration-300 group">
                        <div className="text-4xl font-semibold text-primary mb-2 group-hover:scale-110 transition-transform">15+</div>
                        <p className="text-sm text-muted-foreground">Voluntary Projects</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="border border-border bg-card animate-fade-in stagger-3">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      Achievements & Awards
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-3 gap-6">
                      {[
                        { title: 'UNFPA Award', subtitle: 'UNFPA "Save the children" Award' },
                        { title: 'Best Feature Film', subtitle: 'ANIMATIBA 2021 ( Festival Internacional de Anima ̧c ̃ao de Curitiba,Brazil) 2021' },
                        { title: 'Official Selection', subtitle: 'International Children\'s Film Festival 2018-2019' }
                      ].map((award, index) => (
                        <div key={index} className="text-center p-4 bg-muted/50 rounded-lg border border-border hover:border-primary/30 transition-all duration-300 group">
                          <div className="text-xl font-semibold text-primary mb-2 group-hover:scale-110 transition-transform inline-block">{award.title}</div>
                          <p className="text-sm text-muted-foreground">{award.subtitle}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
            
            
            {activeSection === 'education' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8 animate-fade-in">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Academic Qualifications</h2>
                    <p className="text-muted-foreground">Educational background and certifications</p>
                  </div>
                </div>
                
                <div className="grid gap-6">
                  {[
                    {
                      icon: GraduationCap,
                      title: 'B.Sc. Electronics and Telecommunication Engineering',
                      institution: 'Chittagong University of Engineering & Technology',
                      year: '2019-2024',
                      description: 'Graduated with a B.Sc. in Electronics and Telecommunication Engineering, majoring in Telecommunication with a thesis on Antenna Design.',
                      badges: ['Telecommunication', 'Networking', 'Software Development', 'GPA: 3.19/4.0']
                    },
                    {
                      icon: Award,
                      title: 'Higher Secondary Certificate',
                      institution: 'Cantonment Public School and College, Rangpur',
                      year: '2018',
                      description: null,
                      badges: ['Science', 'IoT Projects', 'GPA 5.00/5.00']
                    },
                    {
                      icon: Award,
                      title: 'Secondary School Certificate',
                      institution: 'Police Lines School and College, Rangpur',
                      year: '2016',
                      description: null,
                      badges: ['Science', 'Club & ECA Activities', 'GPA 5.00/5.00']
                    }
                  ].map((edu, index) => (
                    <Card key={index} className={`card-hover border border-border bg-card animate-fade-in stagger-${index + 1}`}>
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <div className="flex items-start gap-4">
                            <div className="bg-primary p-3 rounded-lg group-hover:scale-110 transition-transform">
                              <edu.icon className="h-6 w-6 text-primary-foreground" />
                            </div>
                            <div>
                              <CardTitle className="text-lg">{edu.title}</CardTitle>
                              <p className="text-muted-foreground mt-1">{edu.institution}</p>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground bg-muted px-3 py-1 rounded-full font-mono">{edu.year}</div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {edu.description && (
                          <p className="text-muted-foreground mb-3">{edu.description}</p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {edu.badges.map((badge, i) => (
                            <Badge key={i} variant="secondary" className="skill-badge">{badge}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {activeSection === 'training' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8 animate-fade-in">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <BookOpen className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Training & Workshops</h2>
                    <p className="text-muted-foreground">Continuous learning and professional development</p>
                  </div>
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      icon: Rocket,
                      title: 'Professional Development',
                      courses: [
                        {
                          title: "Professional Diploma in Digital Products Management",
                          org: "MTF Institute of Management, Technology & Finance",
                          year: "2025"
                        },
                        {
                          title: "Product Owner Certification",
                          org: "Agile Enterprise Coach London",
                          year: "2025"
                        },
                        {
                          title: "Six Sigma: Lean Six Sigma Yellow Belt (Accredited)",
                          org: "OPEXLEADER",
                          year: "2025 - Ongoing"
                        }
                      ]
                    },
                    {
                      icon: Code,
                      title: 'Technical Training',
                      courses: [
                        {
                          title: "Power BI Essential Training:",
                          org: "Career Club",
                          year: "2024"
                        },
                        {
                          title: "Training on SDLC and STLC",
                          org: "QA Academy",
                          year: "2023"
                        },
                        {
                          title: "Basic API Implementation",
                          org: "AppLink",
                          year: "2022"
                        }
                      ]
                    }
                  ].map((category, index) => (
                    <Card key={index} className={`card-hover border border-border bg-card animate-fade-in stagger-${index + 1}`}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-base">
                          <category.icon className="h-5 w-5 text-primary" />
                          {category.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {category.courses.map((course, idx) => (
                            <div key={idx} className="bg-muted/50 p-4 rounded-lg border border-border hover:border-primary/30 transition-all duration-300 group">
                              <div className="flex items-start gap-3">
                                <div className="bg-primary p-2 rounded-lg group-hover:scale-110 transition-transform">
                                  <BookOpen className="h-4 w-4 text-primary-foreground" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-semibold mb-1">{course.title}</h4>
                                  <p className="text-sm text-muted-foreground">{course.org} • {course.year}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {activeSection === 'achievements' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8 animate-fade-in">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Key Achievements</h2>
                    <p className="text-muted-foreground">Notable accomplishments and recognitions</p>
                  </div>
                </div>
                
                <div className="grid gap-6">
                  {[
                    {
                      title: "Increased Product Adoption, DAU,MAU by 40%",
                      description: "Led product strategy initiatives that resulted in significant user growth and engagement improvements.",
                      icon: Target,
                      metric: "40%",
                      metricLabel: "User Growth"
                    },
                    {
                      title: "Excellence in Quality Assurance",
                      description: "Implementing testing solutions that reduced defect rates by 60%.",
                      icon: Award,
                      metric: "60%",
                      metricLabel: "Defect Reduction"
                    },
                    {
                      title: "Team Leadership Recognition",
                      description: "Successfully managed cross-functional teams of 7+ members across multiple projects.",
                      icon: Users,
                      metric: "7+",
                      metricLabel: "Team Members"
                    },
                    {
                      title: "Process Optimization",
                      description: "Streamlined QA processes, reducing testing cycles from 2 weeks to 5 days while maintaining quality standards.",
                      icon: Zap,
                      metric: "75%",
                      metricLabel: "Time Saved"
                    }
                  ].map((achievement, index) => (
                    <Card key={index} className={`card-hover border border-border bg-card animate-fade-in stagger-${index + 1} group`}>
                      <CardContent className="p-6">
                        <div className="flex items-start gap-6">
                          <div className="bg-primary p-4 rounded-lg group-hover:scale-110 transition-transform">
                            <achievement.icon className="h-8 w-8 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold mb-2">{achievement.title}</h4>
                            <p className="text-muted-foreground mb-4">{achievement.description}</p>
                            <div className="bg-muted rounded-lg p-3 inline-block">
                              <div className="text-2xl font-semibold text-primary mb-1">{achievement.metric}</div>
                              <div className="text-sm text-muted-foreground">{achievement.metricLabel}</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
            
            {activeSection === 'projects' && (
              <div className="space-y-6">
                <div className="flex items-center gap-3 mb-8 animate-fade-in">
                  <div className="bg-primary/10 p-3 rounded-lg">
                    <Rocket className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Notable Projects</h2>
                    <p className="text-muted-foreground">Key projects and technical implementations</p>
                  </div>
                </div>
                
                <div className="grid gap-6">
                  {[
                    {
                      icon: Globe,
                      title: 'E-commerce Platform Redesign',
                      role: 'Product Management & QA Lead',
                      year: '2023',
                      description: 'Led the complete redesign of a major e-commerce platform, coordinating between design, development, and QA teams to deliver a seamless user experience.',
                      contributions: [
                        'Conducted user research and competitive analysis',
                        'Developed comprehensive test strategy and execution plan',
                        'Managed stakeholder communications and project timeline',
                        'Achieved 99.9% uptime during migration'
                      ],
                      skills: ['React', 'Node.js', 'Selenium', 'Agile']
                    },
                    {
                      icon: Code,
                      title: 'Automated Testing Framework',
                      role: 'SQA Engineer',
                      year: '2022',
                      description: 'Designed and implemented a comprehensive automated testing framework that reduced testing time by 60% while improving test coverage.',
                      contributions: [
                        'Built reusable test components and utilities',
                        'Integrated with CI/CD pipeline for continuous testing',
                        'Created detailed reporting and analytics dashboard',
                        'Trained team members on framework usage'
                      ],
                      skills: ['Selenium WebDriver', 'TestNG', 'Jenkins', 'Java']
                    }
                  ].map((project, index) => (
                    <Card key={index} className={`card-hover border border-border bg-card animate-fade-in stagger-${index + 1}`}>
                      <CardHeader>
                        <div className="flex items-start gap-4">
                          <div className="bg-primary p-3 rounded-lg group-hover:scale-110 transition-transform">
                            <project.icon className="h-6 w-6 text-primary-foreground" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <p className="text-muted-foreground mt-1">{project.role}</p>
                          </div>
                          <Badge variant="secondary" className="skill-badge">{project.year}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-muted-foreground mb-4">{project.description}</p>
                        <div className="mb-4">
                          <h4 className="font-semibold mb-2">{index === 0 ? 'Key Contributions:' : 'Technical Achievements:'}</h4>
                          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                            {project.contributions.map((item, idx) => (
                              <li key={idx}>{item}</li>
                            ))}
                          </ul>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {project.skills.map((skill, idx) => (
                            <Badge key={idx} variant="secondary" className="skill-badge">{skill}</Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <section className="mt-16 bg-gradient-to-br from-muted/50 via-background to-muted/30 rounded-2xl p-8 lg:p-12 border border-border animate-fade-in">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <Sparkles className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-3xl font-semibold mb-3">
              Let's Connect
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              I'm always interested in discussing new opportunities, collaborating on projects, 
              or sharing insights about product management and quality assurance.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Mail, title: 'Email', value: 'Misbahsakin1@gmail.com' },
              { icon: ExternalLink, title: 'LinkedIn', value: 'linkedin.com/in/misbahsakin' },
              { icon: Phone, title: 'Phone', value: '+8801601802857' }
            ].map((contact, index) => (
              <Card 
                key={index} 
                className={`text-center card-hover border border-border bg-card animate-fade-in stagger-${index + 1} group`}
              >
                <CardContent className="pt-6">
                  <div className="bg-primary w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <contact.icon className="h-8 w-8 text-primary-foreground" />
                  </div>
                  <h3 className="font-semibold mb-2">{contact.title}</h3>
                  <p className="text-sm text-muted-foreground">{contact.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <div className="text-center" style={{ marginTop: '20px' }}>
            <Link to="/contact">
              <Button
                size="default"
                className="h-12 rounded-xl px-20 bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-lg hover:shadow-xl transition-all duration-300 group"
              >
                <MessageSquare className="mr-10 h-4 w-4 group-hover:scale-105 transition-transform" />
                Get In Touch
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-12 mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center items-center mb-4">
              <Star className="h-5 w-5 text-primary mr-2" />
              <p className="text-muted-foreground">Misbah Sakin</p>
              <Star className="h-5 w-5 text-primary ml-2" />
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Misbah Sakin. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
