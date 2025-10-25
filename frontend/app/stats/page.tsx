'use client';

import { useEffect, useState } from 'react';
import { getDashboardAnalytics } from '../lib/api';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

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
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">📊</div>
          <p className="text-xl">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-900 to-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-xl">No data available</p>
          <a href="/" className="text-blue-300 underline mt-4 block">
            Go to Home
          </a>
        </div>
      </div>
    );
  }

  const COLORS = ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4'];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 via-purple-900 to-black text-white">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-4xl md:text-5xl font-bold text-yellow-300">
              📊 Analytics Dashboard
            </h1>
            <a
              href="/"
              className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-purple-500 transition-colors"
            >
              🏠 Home
            </a>
          </div>
          <p className="text-gray-300 text-lg">
            Insights for parents, teachers, and child psychologists
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-blue-600/50 rounded-xl p-6 backdrop-blur-sm border border-blue-400/30">
            <div className="text-3xl mb-2">📚</div>
            <div className="text-3xl font-bold mb-1">{data.totalSessions}</div>
            <div className="text-sm text-gray-200">Total Adventures</div>
          </div>
          
          <div className="bg-green-600/50 rounded-xl p-6 backdrop-blur-sm border border-green-400/30">
            <div className="text-3xl mb-2">✅</div>
            <div className="text-3xl font-bold mb-1">{data.completedSessions}</div>
            <div className="text-sm text-gray-200">Completed</div>
          </div>
          
          <div className="bg-yellow-600/50 rounded-xl p-6 backdrop-blur-sm border border-yellow-400/30">
            <div className="text-3xl mb-2">📈</div>
            <div className="text-3xl font-bold mb-1">{(parseFloat(data.completionRate) * 100).toFixed(0)}%</div>
            <div className="text-sm text-gray-200">Completion Rate</div>
          </div>
          
          <div className="bg-purple-600/50 rounded-xl p-6 backdrop-blur-sm border border-purple-400/30">
            <div className="text-3xl mb-2">⏱️</div>
            <div className="text-3xl font-bold mb-1">{Math.round(data.avgSessionTime / 60)}min</div>
            <div className="text-sm text-gray-200">Avg Duration</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6 bg-gray-800/50 p-2 rounded-xl">
          <button
            onClick={() => setActiveTab('parents')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
              activeTab === 'parents'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            👪 For Parents
          </button>
          <button
            onClick={() => setActiveTab('teachers')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
              activeTab === 'teachers'
                ? 'bg-green-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
            }`}
          >
            👨‍🏫 For Teachers
          </button>
          <button
            onClick={() => setActiveTab('psychologists')}
            className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-colors ${
              activeTab === 'psychologists'
                ? 'bg-purple-600 text-white'
                : 'text-gray-300 hover:bg-gray-700'
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

