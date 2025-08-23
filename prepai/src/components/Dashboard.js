import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Legend
} from 'recharts';
import {
  Calendar, 
  Clock, 
  PlusCircle, 
  Star, 
  Award, 
  TrendingUp, 
  Check, 
  X, 
  BookOpen, 
  Activity,
  Coffee,
  Cpu,
  Database,
  FileCode,
  Globe,
  Layout,
  Server,
  Settings
} from 'lucide-react';

function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalInterviews: 0,
    averageScore: 0,
    skillGaps: [],
    upcomingSession: null,
    completedByWeek: []
  });
  
  useEffect(() => {
    // Simulate loading data from an API
    const fetchData = async () => {
      setLoading(true);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Mock data for now
      const mockInterviews = [
        {
          id: 1,
          date: '2025-04-22',
          jobRole: 'Frontend Developer',
          techStack: 'React',
          experience: '3',
          questionCount: 5,
          score: 4.2,
          strengthAreas: ['State Management', 'Component Design'],
          improvementAreas: ['React Hooks', 'Performance Optimization']
        },
        {
          id: 2,
          date: '2025-04-15',
          jobRole: 'Backend Developer',
          techStack: 'Python',
          experience: '4',
          questionCount: 5,
          score: 3.8,
          strengthAreas: ['API Design', 'Database Knowledge'],
          improvementAreas: ['Concurrency Patterns', 'Memory Management']
        },
        {
          id: 3,
          date: '2025-04-10',
          jobRole: 'Full Stack Engineer',
          techStack: 'JavaScript',
          experience: '2',
          questionCount: 5,
          score: 3.5,
          strengthAreas: ['DOM Manipulation', 'Event Handling'],
          improvementAreas: ['Promises', 'Async/Await', 'Error Handling']
        },
        {
          id: 4,
          date: '2025-04-05',
          jobRole: 'DevOps Engineer',
          techStack: 'Docker',
          experience: '5',
          questionCount: 5,
          score: 4.5,
          strengthAreas: ['Container Orchestration', 'CI/CD Pipelines'],
          improvementAreas: ['Kubernetes Networking']
        }
      ];
      
      const mockStats = {
        totalInterviews: mockInterviews.length,
        averageScore: mockInterviews.reduce((acc, interview) => acc + interview.score, 0) / mockInterviews.length,
        skillGaps: [
          { name: 'React Hooks', value: 2 },
          { name: 'Performance', value: 3 },
          { name: 'Async/Await', value: 2 },
          { name: 'Error Handling', value: 1 },
          { name: 'Kubernetes', value: 1 }
        ],
        upcomingSession: {
          date: '2025-04-28',
          jobRole: 'Senior Full Stack Developer',
          company: 'TechCorp Inc.',
          time: '2:00 PM'
        },
        completedByWeek: [
          { week: 'Week 1', completed: 1 },
          { week: 'Week 2', completed: 1 },
          { week: 'Week 3', completed: 0 },
          { week: 'Week 4', completed: 2 }
        ],
        progressByTech: [
          { name: 'React', initial: 2.8, current: 4.2 },
          { name: 'Python', initial: 3.2, current: 3.8 },
          { name: 'JavaScript', initial: 2.9, current: 3.5 },
          { name: 'Docker', initial: 3.8, current: 4.5 }
        ],
        recentScores: [
          { id: 1, score: 4.2 },
          { id: 2, score: 3.8 },
          { id: 3, score: 3.5 },
          { id: 4, score: 4.5 }
        ]
      };
      
      setInterviews(mockInterviews);
      setStats(mockStats);
      setLoading(false);
    };
    
    fetchData();
  }, []);

  const handleNewInterview = () => {
    navigate('/create');
  };
  
  const handleViewInterview = (id) => {
    // In a real app, you would navigate to the interview details page
    console.log(`Viewing interview ${id}`);
    navigate(`/validation?id=${id}`);
  };
  
  const getScoreColor = (score) => {
    if (score >= 4.5) return '#22c55e'; // green
    if (score >= 4.0) return '#10b981'; // green-teal
    if (score >= 3.5) return '#3b82f6'; // blue
    if (score >= 3.0) return '#6366f1'; // indigo
    if (score >= 2.5) return '#a855f7'; // purple
    return '#ef4444'; // red
  };
  
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
  
  // Different technology stacks with their icons
  const techStacks = [
    { name: 'React', icon: <Layout size={24} /> },
    { name: 'Python', icon: <FileCode size={24} /> },
    { name: 'Java', icon: <Coffee size={24} /> },
    { name: 'Docker', icon: <Server size={24} /> },
    { name: 'Node.js', icon: <Cpu size={24} /> },
    { name: 'SQL', icon: <Database size={24} /> },
    { name: 'Angular', icon: <Globe size={24} /> },
    { name: 'DevOps', icon: <Settings size={24} /> }
  ];
  
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Loading skeleton
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
        <div className="max-w-7xl mx-auto p-6 pt-20">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-800 rounded w-1/4 mb-8"></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800 rounded-xl p-6 h-32"></div>
              ))}
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800 rounded-xl p-6 h-64 lg:col-span-2"></div>
              <div className="bg-gray-800 rounded-xl p-6 h-64"></div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6 h-96"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white">
      <div className="max-w-7xl mx-auto p-6 pt-20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
              Interview Dashboard
            </h1>
            <p className="text-gray-400">Track your progress and prepare for your next technical interview</p>
          </div>
          
          <button 
            onClick={handleNewInterview}
            className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
          >
            <PlusCircle size={20} />
            New Interview
          </button>
        </div>
        
        {/* Tabs */}
        <div className="mb-8 border-b border-gray-800">
          <div className="flex space-x-8">
            <button
              className={`py-3 px-1 border-b-2 ${
                activeTab === 'overview' 
                  ? 'border-purple-500 text-purple-500' 
                  : 'border-transparent text-gray-400 hover:text-white'
              } transition-colors`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`py-3 px-1 border-b-2 ${
                activeTab === 'history' 
                  ? 'border-purple-500 text-purple-500' 
                  : 'border-transparent text-gray-400 hover:text-white'
              } transition-colors`}
              onClick={() => setActiveTab('history')}
            >
              Interview History
            </button>
            <button
              className={`py-3 px-1 border-b-2 ${
                activeTab === 'practice' 
                  ? 'border-purple-500 text-purple-500' 
                  : 'border-transparent text-gray-400 hover:text-white'
              } transition-colors`}
              onClick={() => setActiveTab('practice')}
            >
              Practice Areas
            </button>
          </div>
        </div>
        
        {activeTab === 'overview' && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400">Total Interviews</h3>
                  <span className="p-2 bg-blue-500/20 text-blue-400 rounded-lg">
                    <Activity size={18} />
                  </span>
                </div>
                <p className="text-4xl font-bold">{stats.totalInterviews}</p>
                <p className="text-gray-400 text-sm mt-2">Practice sessions completed</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400">Average Score</h3>
                  <span className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                    <Star size={18} />
                  </span>
                </div>
                <p className="text-4xl font-bold">{stats.averageScore.toFixed(1)}/5</p>
                <p className="text-gray-400 text-sm mt-2">Your overall performance</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400">Top Skill</h3>
                  <span className="p-2 bg-yellow-500/20 text-yellow-400 rounded-lg">
                    <Award size={18} />
                  </span>
                </div>
                <p className="text-2xl font-bold">Component Design</p>
                <p className="text-gray-400 text-sm mt-2">Your highest rated skill</p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:bg-gray-800 transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-gray-400">Next Session</h3>
                  <span className="p-2 bg-purple-500/20 text-purple-400 rounded-lg">
                    <Calendar size={18} />
                  </span>
                </div>
                {stats.upcomingSession ? (
                  <>
                    <p className="text-xl font-bold">{formatDate(stats.upcomingSession.date)}</p>
                    <p className="text-gray-400 text-sm mt-2">at {stats.upcomingSession.time}</p>
                  </>
                ) : (
                  <>
                    <p className="text-xl font-bold">Not Scheduled</p>
                    <p className="text-gray-400 text-sm mt-2">Set up your next practice</p>
                  </>
                )}
              </div>
            </div>
            
            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Progress Chart */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:bg-gray-800 transition-colors lg:col-span-2">
                <h3 className="text-lg font-semibold mb-4">Progress by Technology</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.progressByTech}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="name" stroke="#9ca3af" />
                      <YAxis stroke="#9ca3af" domain={[0, 5]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          borderColor: '#374151',
                          borderRadius: '0.5rem',
                          color: '#f3f4f6'
                        }} 
                      />
                      <Legend />
                      <Bar name="Initial Score" dataKey="initial" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      <Bar name="Current Score" dataKey="current" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Skill Gap Chart */}
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:bg-gray-800 transition-colors">
                <h3 className="text-lg font-semibold mb-4">Areas For Improvement</h3>
                <div className="h-80 flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={stats.skillGaps}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {stats.skillGaps.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1f2937', 
                          borderColor: '#374151',
                          borderRadius: '0.5rem',
                          color: '#f3f4f6'
                        }}
                        formatter={(value) => [`Frequency: ${value}`, 'Occurrence']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
            
            {/* Recent Interview Performance */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:bg-gray-800 transition-colors mb-8">
              <h3 className="text-lg font-semibold mb-4">Recent Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.recentScores}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="id" name="Interview" stroke="#9ca3af" />
                    <YAxis domain={[0, 5]} stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1f2937', 
                        borderColor: '#374151',
                        borderRadius: '0.5rem',
                        color: '#f3f4f6'
                      }}
                      formatter={(value) => [`${value}/5`, 'Score']}
                      labelFormatter={(value) => `Interview #${value}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#8b5cf6" 
                      strokeWidth={2} 
                      dot={{ stroke: '#8b5cf6', strokeWidth: 2, r: 4, fill: '#1f2937' }}
                      activeDot={{ r: 6, fill: '#a855f7' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Upcoming Interview */}
            {stats.upcomingSession && (
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:bg-gray-800 transition-colors mb-8">
                <h3 className="text-lg font-semibold mb-4">Upcoming Interview Session</h3>
                <div className="bg-gray-900/50 p-6 rounded-lg border border-gray-700">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="text-purple-400" size={20} />
                        <span className="text-lg font-medium">{formatDate(stats.upcomingSession.date)}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="text-blue-400" size={20} />
                        <span>{stats.upcomingSession.time}</span>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold">{stats.upcomingSession.jobRole}</h4>
                        <p className="text-gray-400">{stats.upcomingSession.company}</p>
                      </div>
                    </div>
                    
                    <div className="mt-6 md:mt-0 flex flex-col md:flex-row gap-3">
                      <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                        Reschedule
                      </button>
                      <button className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                        Start Session
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        
        {activeTab === 'history' && (
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-6">Interview History</h3>
            
            {interviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-400 mb-6">You haven't completed any practice interviews yet</p>
                <button 
                  onClick={handleNewInterview}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors mx-auto"
                >
                  <PlusCircle size={20} />
                  Start Your First Interview
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {interviews.map(interview => (
                  <div 
                    key={interview.id} 
                    className="bg-gray-900/50 p-4 md:p-6 rounded-lg border border-gray-700 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                      <div className="space-y-4">
                        <div className="flex gap-3 items-center text-gray-400">
                          <Calendar size={16} />
                          <span>{formatDate(interview.date)}</span>
                          <span className="w-2 h-2 rounded-full bg-gray-600"></span>
                          <span>{interview.questionCount} questions</span>
                        </div>
                        <div>
                          <h4 className="text-xl font-semibold">{interview.jobRole}</h4>
                          <p className="text-gray-400">Technology: {interview.techStack} • Experience: {interview.experience} years</p>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {interview.strengthAreas.map((strength, i) => (
                            <span 
                              key={i} 
                              className="flex items-center px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-sm"
                            >
                              <Check size={14} className="mr-1" />
                              {strength}
                            </span>
                          ))}
                          {interview.improvementAreas.map((area, i) => (
                            <span 
                              key={i} 
                              className="flex items-center px-3 py-1 bg-red-500/10 text-red-400 rounded-full text-sm"
                            >
                              <X size={14} className="mr-1" />
                              {area}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-center mt-6 md:mt-0">
                        <div className="flex items-center">
                          <div className="w-16 h-16 rounded-full bg-gray-700 flex items-center justify-center relative">
                            <div 
                              className="w-16 h-16 rounded-full absolute"
                              style={{
                                background: `conic-gradient(${getScoreColor(interview.score)} ${interview.score * 20}%, transparent 0)`,
                              }}
                            ></div>
                            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center z-10">
                              <span className="text-xl font-bold" style={{ color: getScoreColor(interview.score) }}>
                                {interview.score.toFixed(1)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <button 
                          onClick={() => handleViewInterview(interview.id)}
                          className="mt-4 text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'practice' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 rounded-xl p-6 border border-purple-700 col-span-full">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold mb-2">Personalized Learning Path</h3>
                    <p className="text-gray-300 mb-4">Focus on these areas to improve your interview performance</p>
                    <div className="flex flex-wrap gap-2">
                      {stats.skillGaps.map((skill, i) => (
                        <span 
                          key={i} 
                          className="flex items-center px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                        >
                          <BookOpen size={14} className="mr-1" />
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button className="mt-6 md:mt-0 flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors">
                    <TrendingUp size={18} />
                    Generate Learning Plan
                  </button>
                </div>
              </div>
              
              {/* Tech stacks to practice */}
              {techStacks.map((tech, index) => (
                <div 
                  key={index} 
                  className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 hover:bg-gray-800 cursor-pointer transition-all hover:border-blue-500 group"
                  onClick={() => navigate('/create', { state: { preselectedTech: tech.name } })}
                >
                  <div className="flex items-start justify-between mb-6">
                    <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
                      {tech.icon}
                    </div>
                    <div className="p-2 text-gray-400 group-hover:text-blue-400 transition-colors">
                      <PlusCircle size={20} />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-1">{tech.name}</h3>
                  <p className="text-gray-400 text-sm">Practice {tech.name} interview questions</p>
                </div>
              ))}
            </div>
            
            {/* Suggested Resources */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700 mb-8">
              <h3 className="text-lg font-semibold mb-6">Recommended Resources</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-medium mb-2">React Hooks Deep Dive</h4>
                  <p className="text-gray-400 text-sm mb-4">Master the use of React hooks with practical examples and best practices</p>
                  <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                    View Resource →
                  </button>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-medium mb-2">Asynchronous JavaScript Patterns</h4>
                  <p className="text-gray-400 text-sm mb-4">Learn promises, async/await, and error handling patterns</p>
                  <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                    View Resource →
                  </button>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-medium mb-2">Performance Optimization Techniques</h4>
                  <p className="text-gray-400 text-sm mb-4">Strategies for optimizing web application performance</p>
                  <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                    View Resource →
                  </button>
                </div>
                <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                  <h4 className="font-medium mb-2">Kubernetes Networking Guide</h4>
                  <p className="text-gray-400 text-sm mb-4">Understanding Kubernetes networking concepts and implementation</p>
                  <button className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                    View Resource →
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;