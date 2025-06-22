import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Lightbulb, 
  Target,
  DollarSign,
  Shield,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { mlService } from '@/services/mlService';
import toast from 'react-hot-toast';

interface AIInsight {
  id: string;
  type: 'prediction' | 'alert' | 'recommendation' | 'trend';
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  data?: any;
}

const AIInsights: React.FC = () => {
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null);

  useEffect(() => {
    generateAIInsights();
  }, []);

  const generateAIInsights = async () => {
    try {
      setLoading(true);
      
      // Simulate ML service calls
      const mockInsights: AIInsight[] = [
        {
          id: '1',
          type: 'prediction',
          title: 'Spending Prediction',
          description: 'Based on your patterns, you\'re likely to spend $2,847 this month, 12% higher than last month.',
          icon: TrendingUp,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50',
          priority: 'high',
          timestamp: new Date().toISOString(),
          data: { predictedAmount: 2847, confidence: 0.87, trend: 'increasing' }
        },
        {
          id: '2',
          type: 'alert',
          title: 'Fraud Risk Detected',
          description: 'Unusual transaction pattern detected. Review recent activity for suspicious charges.',
          icon: AlertTriangle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          priority: 'high',
          timestamp: new Date().toISOString(),
          data: { riskLevel: 'medium', confidence: 0.92 }
        },
        {
          id: '3',
          type: 'recommendation',
          title: 'Savings Opportunity',
          description: 'You could save $156/month by switching to a different credit card with better rewards.',
          icon: Lightbulb,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          priority: 'medium',
          timestamp: new Date().toISOString(),
          data: { potentialSavings: 156, recommendation: 'credit_card_switch' }
        },
        {
          id: '4',
          type: 'trend',
          title: 'Investment Trend',
          description: 'Your crypto portfolio is performing 23% better than the market average this month.',
          icon: TrendingUp,
          color: 'text-green-600',
          bgColor: 'bg-green-50',
          priority: 'medium',
          timestamp: new Date().toISOString(),
          data: { performance: 23, benchmark: 'market_average' }
        },
        {
          id: '5',
          type: 'recommendation',
          title: 'Budget Optimization',
          description: 'Consider reducing dining out expenses by 15% to meet your savings goal faster.',
          icon: Target,
          color: 'text-purple-600',
          bgColor: 'bg-purple-50',
          priority: 'low',
          timestamp: new Date().toISOString(),
          data: { category: 'dining', reduction: 15, impact: 'savings_goal' }
        }
      ];

      setInsights(mockInsights);
    } catch (error) {
      console.error('Error generating AI insights:', error);
      toast.error('Failed to load AI insights');
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-yellow-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  const handleInsightClick = (insight: AIInsight) => {
    setSelectedInsight(insight);
  };

  const handleAction = (insight: AIInsight) => {
    switch (insight.type) {
      case 'alert':
        toast.success('Fraud alert acknowledged');
        break;
      case 'recommendation':
        toast.success('Recommendation applied');
        break;
      default:
        toast.success('Action completed');
    }
  };

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center space-x-3 mb-4">
          <div className="animate-pulse bg-gray-200 rounded-full h-8 w-8"></div>
          <div className="animate-pulse bg-gray-200 rounded h-6 w-32"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded h-16"></div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Widget */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
              <p className="text-sm text-gray-500">Powered by machine learning</p>
            </div>
          </div>
          <button
            onClick={generateAIInsights}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Sparkles className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <AnimatePresence>
            {insights.slice(0, 3).map((insight, index) => (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border-l-4 ${getPriorityColor(insight.priority)} bg-gray-50 hover:bg-gray-100 transition-all cursor-pointer group`}
                onClick={() => handleInsightClick(insight)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 rounded-lg ${insight.bgColor}`}>
                      <insight.icon className={`h-5 w-5 ${insight.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                        {insight.title}
                      </h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {insight.description}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-xs text-gray-400">
                          {new Date(insight.timestamp).toLocaleTimeString()}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          insight.priority === 'high' ? 'bg-red-100 text-red-600' :
                          insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                          'bg-green-100 text-green-600'
                        }`}>
                          {insight.priority} priority
                        </span>
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={() => toast.success('Viewing all insights')}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            View all insights →
          </button>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg text-white text-center hover:from-blue-600 hover:to-blue-700 transition-all"
          onClick={() => toast.success('Fraud detection enabled')}
        >
          <Shield className="h-6 w-6 mx-auto mb-2" />
          <div className="text-sm font-medium">Enable Fraud Detection</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 bg-gradient-to-r from-green-500 to-green-600 rounded-lg text-white text-center hover:from-green-600 hover:to-green-700 transition-all"
          onClick={() => toast.success('Budget optimization applied')}
        >
          <Target className="h-6 w-6 mx-auto mb-2" />
          <div className="text-sm font-medium">Optimize Budget</div>
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg text-white text-center hover:from-purple-600 hover:to-purple-700 transition-all"
          onClick={() => toast.success('Investment analysis generated')}
        >
          <TrendingUp className="h-6 w-6 mx-auto mb-2" />
          <div className="text-sm font-medium">Analyze Investments</div>
        </motion.button>
      </motion.div>

      {/* Insight Detail Modal */}
      <AnimatePresence>
        {selectedInsight && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => setSelectedInsight(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl p-6 max-w-md w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center space-x-3 mb-4">
                <div className={`p-3 rounded-lg ${selectedInsight.bgColor}`}>
                  <selectedInsight.icon className={`h-6 w-6 ${selectedInsight.color}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedInsight.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {selectedInsight.type} • {selectedInsight.priority} priority
                  </p>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">
                {selectedInsight.description}
              </p>

              {selectedInsight.data && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Details</h4>
                  <pre className="text-xs text-gray-600">
                    {JSON.stringify(selectedInsight.data, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => handleAction(selectedInsight)}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Take Action
                </button>
                <button
                  onClick={() => setSelectedInsight(null)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIInsights; 