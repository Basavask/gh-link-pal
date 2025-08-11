import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar
} from "recharts";
import { supabase } from '@/lib/supabase';
import { useAuthContext } from '@/lib/auth';
import { Progress as ProgressType, StudySession, Badge as BadgeType } from '@/types';
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Award, 
  BookOpen, 
  Brain, 
  Calendar,
  Star,
  Trophy,
  Zap
} from "lucide-react";

interface ProgressStats {
  totalStudyTime: number;
  totalDocuments: number;
  totalFlashcards: number;
  totalQuizzes: number;
  averageRetention: number;
  studyStreak: number;
  badgesEarned: number;
}

interface ChartData {
  date: string;
  studyTime: number;
  retentionRate: number;
  flashcardsReviewed: number;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export const ProgressDashboard = () => {
  const { user } = useAuthContext();
  const [stats, setStats] = useState<ProgressStats>({
    totalStudyTime: 0,
    totalDocuments: 0,
    totalFlashcards: 0,
    totalQuizzes: 0,
    averageRetention: 0,
    studyStreak: 0,
    badgesEarned: 0
  });
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user]);

  const fetchProgressData = async () => {
    try {
      setLoading(true);

      // Fetch progress data
      const { data: progressData } = await supabase
        .from('progress')
        .select('*')
        .eq('user_id', user?.id);

      // Fetch study sessions
      const { data: sessionsData } = await supabase
        .from('study_sessions')
        .select('*')
        .eq('user_id', user?.id)
        .order('start_time', { ascending: false })
        .limit(10);

      // Fetch badges
      const { data: badgesData } = await supabase
        .from('badges')
        .select('*')
        .eq('user_id', user?.id)
        .order('earned_at', { ascending: false });

      // Fetch documents count
      const { count: documentsCount } = await supabase
        .from('documents')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Fetch flashcards count
      const { count: flashcardsCount } = await supabase
        .from('flashcards')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Fetch quizzes count
      const { count: quizzesCount } = await supabase
        .from('quiz_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id);

      // Calculate stats
      const totalStudyTime = sessionsData?.reduce((sum, session) => sum + session.duration, 0) || 0;
      const averageRetention = progressData?.length > 0 
        ? progressData.reduce((sum, p) => sum + p.retention_rate, 0) / progressData.length 
        : 0;

      // Calculate study streak
      const studyStreak = calculateStudyStreak(sessionsData || []);

      setStats({
        totalStudyTime,
        totalDocuments: documentsCount || 0,
        totalFlashcards: flashcardsCount || 0,
        totalQuizzes: quizzesCount || 0,
        averageRetention: Math.round(averageRetention),
        studyStreak,
        badgesEarned: badgesData?.length || 0
      });

      setRecentSessions(sessionsData || []);
      setBadges(badgesData || []);

      // Prepare chart data
      const chartData = prepareChartData(sessionsData || [], progressData || []);
      setChartData(chartData);

    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStudyStreak = (sessions: StudySession[]): number => {
    if (sessions.length === 0) return 0;

    const today = new Date();
    let streak = 0;
    let currentDate = new Date(today);

    // Check consecutive days backwards from today
    while (true) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const hasSessionOnDate = sessions.some(session => 
        session.start_time.startsWith(dateStr)
      );

      if (hasSessionOnDate) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const prepareChartData = (sessions: StudySession[], progress: ProgressType[]): ChartData[] => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return date.toISOString().split('T')[0];
    }).reverse();

    return last7Days.map(date => {
      const daySessions = sessions.filter(session => 
        session.start_time.startsWith(date)
      );
      const dayProgress = progress.filter(p => 
        p.last_studied.startsWith(date)
      );

      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        studyTime: daySessions.reduce((sum, session) => sum + session.duration, 0),
        retentionRate: dayProgress.length > 0 
          ? dayProgress.reduce((sum, p) => sum + p.retention_rate, 0) / dayProgress.length 
          : 0,
        flashcardsReviewed: dayProgress.reduce((sum, p) => sum + p.flashcards_reviewed, 0)
      };
    });
  };

  const getBadgeIcon = (badgeType: string) => {
    switch (badgeType) {
      case 'first_upload':
        return <BookOpen className="h-4 w-4" />;
      case 'quiz_master':
        return <Target className="h-4 w-4" />;
      case 'flashcard_pro':
        return <Brain className="h-4 w-4" />;
      case 'study_streak':
        return <Zap className="h-4 w-4" />;
      case 'perfect_score':
        return <Star className="h-4 w-4" />;
      default:
        return <Award className="h-4 w-4" />;
    }
  };

  const getBadgeColor = (badgeType: string) => {
    switch (badgeType) {
      case 'first_upload':
        return 'bg-blue-100 text-blue-800';
      case 'quiz_master':
        return 'bg-green-100 text-green-800';
      case 'flashcard_pro':
        return 'bg-purple-100 text-purple-800';
      case 'study_streak':
        return 'bg-orange-100 text-orange-800';
      case 'perfect_score':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(stats.totalStudyTime / 60)}h</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalStudyTime} minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Documents</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Uploaded documents
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Retention Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRetention}%</div>
            <p className="text-xs text-muted-foreground">
              Average retention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Study Streak</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.studyStreak}</div>
            <p className="text-xs text-muted-foreground">
              Consecutive days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Detailed Analytics */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="sessions">Recent Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Study Time Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Study Time (Last 7 Days)</CardTitle>
                <CardDescription>Daily study time in minutes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="studyTime" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Retention Rate Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Retention Rate (Last 7 Days)</CardTitle>
                <CardDescription>Daily retention percentage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="retentionRate" 
                      stroke="#10b981" 
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Distribution</CardTitle>
                <CardDescription>Breakdown of your study activities</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Documents', value: stats.totalDocuments },
                        { name: 'Flashcards', value: stats.totalFlashcards },
                        { name: 'Quizzes', value: stats.totalQuizzes }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {COLORS.map((color, index) => (
                        <Cell key={`cell-${index}`} fill={color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Flashcards Reviewed */}
            <Card>
              <CardHeader>
                <CardTitle>Flashcards Reviewed (Last 7 Days)</CardTitle>
                <CardDescription>Daily flashcard review count</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="flashcardsReviewed" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="badges" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Your Badges</CardTitle>
              <CardDescription>Earned achievements and milestones</CardDescription>
            </CardHeader>
            <CardContent>
              {badges.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No badges earned yet. Keep studying to earn your first badge!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge) => (
                    <div key={badge.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                      <div className={`p-2 rounded-full ${getBadgeColor(badge.type)}`}>
                        {getBadgeIcon(badge.type)}
                      </div>
                      <div>
                        <p className="font-medium capitalize">
                          {badge.type.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(badge.earned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Study Sessions</CardTitle>
              <CardDescription>Your latest study activities</CardDescription>
            </CardHeader>
            <CardContent>
              {recentSessions.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No study sessions yet. Start studying to see your activity!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentSessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          {session.session_type === 'notes' && <BookOpen className="h-5 w-5 text-primary" />}
                          {session.session_type === 'flashcards' && <Brain className="h-5 w-5 text-primary" />}
                          {session.session_type === 'quiz' && <Target className="h-5 w-5 text-primary" />}
                          {session.session_type === 'mixed' && <Zap className="h-5 w-5 text-primary" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">
                            {session.session_type} Session
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(session.start_time).toLocaleDateString()} at{' '}
                            {new Date(session.start_time).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{session.duration} min</p>
                        <Badge variant="secondary" className="text-xs">
                          {session.session_type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}; 