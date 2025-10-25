'use client';

import { useEffect, useState } from 'react';
import { getDashboardAnalytics } from '../lib/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';

interface DashboardData {
  totalSessions: number;
  completedSessions: number;
  completionRate: number;
  avgSessionTime: number;
  parentMetrics: any;
  teacherMetrics: any;
  psychologistMetrics: any;
}

export default function StatsPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'parents' | 'teachers' | 'psychologists'>('parents');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await getDashboardAnalytics();
        if (response.success) {
          setData(response);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center bg-card/80 backdrop-blur-md shadow-2xl">
          <CardContent className="pt-12 pb-12">
            <div className="text-7xl sm:text-8xl mb-8 animate-float">📊</div>
            <CardTitle className="text-2xl sm:text-3xl font-black text-foreground mb-4">
              Loading Analytics
            </CardTitle>
            <div className="space-y-3 max-w-xs mx-auto">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4 mx-auto" />
              <Skeleton className="h-4 w-5/6 mx-auto" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center bg-card/80 backdrop-blur-md shadow-2xl">
          <CardContent className="pt-12 pb-12">
            <div className="text-7xl sm:text-8xl mb-6">❌</div>
            <CardTitle className="text-2xl sm:text-3xl font-black text-foreground mb-4">
              No Data Available
            </CardTitle>
            <p className="text-muted-foreground mb-8 text-base">
              No analytics data has been collected yet. Start an adventure first!
            </p>
            <Button size="lg" asChild className="shadow-lg">
              <a href="/">
                🏠 Go to Home
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-950 dark:via-purple-950 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-7xl">
        {/* Header */}
        <div className="mb-8 sm:mb-12">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-6 mb-6">
            <div className="inline-block animate-float">
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-transparent bg-clip-text tracking-tight text-center sm:text-left">
                📊 Analytics Dashboard
              </h1>
            </div>
            <Button size="lg" variant="outline" asChild className="shadow-md hover:shadow-lg">
              <a href="/" className="flex items-center gap-2">
                🏠 Home
              </a>
            </Button>
          </div>
          <p className="text-muted-foreground text-base sm:text-lg text-center sm:text-left max-w-2xl">
            ✨ Insights for parents, teachers, and child psychologists
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-10 sm:mb-12">
          <Card className="bg-card/80 backdrop-blur-md border-2 border-blue-400/20 hover:border-blue-400/40 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="text-4xl sm:text-5xl mb-4 animate-float">📚</div>
              <div className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-blue-600 to-purple-600 text-transparent bg-clip-text">
                {data.totalSessions}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Total Adventures</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-md border-2 border-green-400/20 hover:border-green-400/40 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="text-4xl sm:text-5xl mb-4 animate-float" style={{ animationDelay: '0.2s' }}>✅</div>
              <div className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-green-600 to-emerald-600 text-transparent bg-clip-text">
                {data.completedSessions}
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Completed</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-md border-2 border-yellow-400/20 hover:border-yellow-400/40 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="text-4xl sm:text-5xl mb-4 animate-float" style={{ animationDelay: '0.4s' }}>📈</div>
              <div className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-yellow-600 to-orange-600 text-transparent bg-clip-text">
                {(parseFloat(data.completionRate) * 100).toFixed(0)}%
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Completion Rate</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-md border-2 border-purple-400/20 hover:border-purple-400/40 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl">
            <CardContent className="pt-6 pb-6 text-center">
              <div className="text-4xl sm:text-5xl mb-4 animate-float" style={{ animationDelay: '0.6s' }}>⏱️</div>
              <div className="text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r from-purple-600 to-pink-600 text-transparent bg-clip-text">
                {Math.round(data.avgSessionTime / 60)}min
              </div>
              <div className="text-sm font-semibold text-muted-foreground">Avg Duration</div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="glass-dark flex flex-col md:flex-row gap-3 p-3 rounded-2xl mb-8 shadow-xl">
          <button
            onClick={() => setActiveTab('parents')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 transform ${
              activeTab === 'parents'
                ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg scale-105'
                : 'text-gray-300 hover:bg-white/10 hover:scale-105'
            }`}
          >
            👪 For Parents
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 transform ${
              activeTab === 'teachers'
                ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-lg scale-105'
                : 'text-gray-300 hover:bg-white/10 hover:scale-105'
            }`}
          >
            👨‍🏫 For Teachers
          </button>
          <button
            onClick={() => setActiveTab('psychologists')}
            className={`flex-1 py-4 px-6 rounded-xl font-bold transition-all duration-300 transform ${
              activeTab === 'psychologists'
                ? 'bg-gradient-to-r from-purple-600 to-purple-500 text-white shadow-lg scale-105'
                : 'text-gray-300 hover:bg-white/10 hover:scale-105'
            }`}
          >
            🧠 For Psychologists
          </button>
        </div>

        {/* Parents Tab */}
        {activeTab === 'parents' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-4">Parent Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Engagement Level */}
              <div className="bg-gradient-to-br from-blue-800/50 to-purple-800/50 rounded-2xl p-6 backdrop-blur-sm border border-blue-400/30">
                <h3 className="text-xl font-semibold mb-4">Engagement Level</h3>
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {data.parentMetrics?.engagementLevel === 'High' ? '🔥' :
                     data.parentMetrics?.engagementLevel === 'Medium' ? '👍' : '💭'}
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {data.parentMetrics?.engagementLevel || 'N/A'}
                  </div>
                  <div className="text-gray-300">
                    Based on response times and interaction frequency
                  </div>
                </div>
              </div>

              {/* Average Response Time */}
              <div className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 rounded-2xl p-6 backdrop-blur-sm border border-purple-400/30">
                <h3 className="text-xl font-semibold mb-4">Avg Response Time</h3>
                <div className="text-center">
                  <div className="text-6xl mb-4">⚡</div>
                  <div className="text-3xl font-bold mb-2">
                    {data.parentMetrics?.avgResponseTime 
                      ? `${(data.parentMetrics.avgResponseTime / 1000).toFixed(1)}s`
                      : 'N/A'}
                  </div>
                  <div className="text-gray-300">
                    How quickly kids respond
                  </div>
                </div>
              </div>
            </div>

            {/* Favorite Choices */}
            {data.parentMetrics?.favoriteChoices?.length > 0 && (
              <div className="bg-gradient-to-br from-blue-800/50 to-purple-800/50 rounded-2xl p-6 backdrop-blur-sm border border-blue-400/30">
                <h3 className="text-xl font-semibold mb-4">🌟 Favorite Choices</h3>
                <div className="space-y-2">
                  {data.parentMetrics.favoriteChoices.map((choice: any, idx: number) => (
                    <div
                      key={idx}
                      className="flex justify-between items-center bg-white/10 rounded-lg p-3"
                    >
                      <span className="font-semibold">{choice.choice}</span>
                      <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                        {choice.count} times
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Teachers Tab */}
        {activeTab === 'teachers' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-4">Teacher Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Vocabulary Level */}
              <div className="bg-gradient-to-br from-green-800/50 to-blue-800/50 rounded-2xl p-6 backdrop-blur-sm border border-green-400/30">
                <h3 className="text-xl font-semibold mb-4">Vocabulary Level</h3>
                <div className="text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <div className="text-3xl font-bold mb-2">
                    {data.teacherMetrics?.vocabularyLevel || 'N/A'}
                  </div>
                  <div className="text-gray-300">
                    Avg {data.teacherMetrics?.avgWordCount || '0'} words per response
                  </div>
                </div>
              </div>

              {/* Total Responses */}
              <div className="bg-gradient-to-br from-blue-800/50 to-green-800/50 rounded-2xl p-6 backdrop-blur-sm border border-blue-400/30">
                <h3 className="text-xl font-semibold mb-4">Language Interaction</h3>
                <div className="text-center">
                  <div className="text-6xl mb-4">💬</div>
                  <div className="text-3xl font-bold mb-2">
                    {data.teacherMetrics?.totalResponses || 0}
                  </div>
                  <div className="text-gray-300">
                    Voice responses collected
                  </div>
                </div>
              </div>
            </div>

            {/* Educational Concept Coverage */}
            {data.teacherMetrics?.conceptCoverage && (
              <div className="bg-gradient-to-br from-green-800/50 to-blue-800/50 rounded-2xl p-6 backdrop-blur-sm border border-green-400/30">
                <h3 className="text-xl font-semibold mb-4">🎓 Educational Concept Coverage</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span>🪐 Solar System (8 planets)</span>
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                      {data.teacherMetrics.conceptCoverage.solar_system_planets || 0} sessions
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>☀️ Sun is a Star</span>
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                      {data.teacherMetrics.conceptCoverage.sun_is_a_star || 0} sessions
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>🌍 Gravity</span>
                    <span className="bg-yellow-400 text-black px-3 py-1 rounded-full text-sm font-bold">
                      {data.teacherMetrics.conceptCoverage.gravity || 0} sessions
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Psychologists Tab */}
        {activeTab === 'psychologists' && (
          <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-4">Child Psychology Insights</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Decision Pattern */}
              <div className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 rounded-2xl p-6 backdrop-blur-sm border border-purple-400/30">
                <h3 className="text-xl font-semibold mb-4">Decision Pattern</h3>
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {data.psychologistMetrics?.decisionPattern === 'Adventurous' ? '🚀' :
                     data.psychologistMetrics?.decisionPattern === 'Balanced' ? '⚖️' : '🛡️'}
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {data.psychologistMetrics?.decisionPattern || 'N/A'}
                  </div>
                  <div className="text-gray-300 text-sm">
                    Overall decision-making style
                  </div>
                </div>
              </div>

              {/* Confidence Level */}
              <div className="bg-gradient-to-br from-pink-800/50 to-purple-800/50 rounded-2xl p-6 backdrop-blur-sm border border-pink-400/30">
                <h3 className="text-xl font-semibold mb-4">Confidence Level</h3>
                <div className="text-center">
                  <div className="text-6xl mb-4">
                    {data.psychologistMetrics?.confidenceLevel === 'High' ? '💪' :
                     data.psychologistMetrics?.confidenceLevel === 'Medium' ? '👌' : '🤔'}
                  </div>
                  <div className="text-3xl font-bold mb-2">
                    {data.psychologistMetrics?.confidenceLevel || 'N/A'}
                  </div>
                  <div className="text-gray-300 text-sm">
                    Based on hesitation patterns
                  </div>
                </div>
              </div>

              {/* Silence Periods */}
              <div className="bg-gradient-to-br from-purple-800/50 to-blue-800/50 rounded-2xl p-6 backdrop-blur-sm border border-purple-400/30">
                <h3 className="text-xl font-semibold mb-4">Hesitation Rate</h3>
                <div className="text-center">
                  <div className="text-6xl mb-4">⏸️</div>
                  <div className="text-3xl font-bold mb-2">
                    {data.psychologistMetrics?.hesitationRate
                      ? `${(parseFloat(data.psychologistMetrics.hesitationRate) * 100).toFixed(0)}%`
                      : 'N/A'}
                  </div>
                  <div className="text-gray-300 text-sm">
                    {data.psychologistMetrics?.silencePeriods || 0} silence periods
                  </div>
                </div>
              </div>
            </div>

            {/* Choice Breakdown */}
            <div className="bg-gradient-to-br from-purple-800/50 to-pink-800/50 rounded-2xl p-6 backdrop-blur-sm border border-purple-400/30">
              <h3 className="text-xl font-semibold mb-4">🎯 Choice Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="text-5xl mb-3">🌟</div>
                  <div className="text-4xl font-bold mb-2">
                    {data.psychologistMetrics?.creativeChoices || 0}
                  </div>
                  <div className="text-gray-300">Creative / Suggested Choices</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl mb-3">⏱️</div>
                  <div className="text-4xl font-bold mb-2">
                    {data.psychologistMetrics?.defaultChoices || 0}
                  </div>
                  <div className="text-gray-300">Timeout / Default Choices</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Data is anonymized and aggregated across all sessions</p>
          <p className="mt-2">Hey Verne! Analytics Dashboard v1.0</p>
        </div>
      </div>
    </div>
  );
}

