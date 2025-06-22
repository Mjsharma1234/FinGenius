import axios from 'axios';
import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL + '/ml',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth-storage');
    if (token) {
      try {
        const parsedToken = JSON.parse(token);
        if (parsedToken.state?.token) {
          config.headers.Authorization = `Bearer ${parsedToken.state.token}`;
        }
      } catch (error) {
        console.error('Error parsing auth token:', error);
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const mlService = {
  async fraudDetection(transaction: any) {
    const response = await api.post<ApiResponse<any>>('/fraud-detection', transaction);
    return response.data.data;
  },
  async spendingPrediction(historicalData: any[], predictionDays = 7) {
    const response = await api.post<ApiResponse<any>>('/spending-prediction', { historicalData, predictionDays });
    return response.data.data;
  },
  async sentimentAnalysis(text: string) {
    const response = await api.post<ApiResponse<any>>('/sentiment-analysis', { text });
    return response.data.data;
  },
  async anomalyDetection(dataPoints: any[], metric: string) {
    const response = await api.post<ApiResponse<any>>('/anomaly-detection', { dataPoints, metric });
    return response.data.data;
  },
  async insights(transactions: any[], timeframe = '30d') {
    const response = await api.post<ApiResponse<any>>('/insights', { transactions, timeframe });
    return response.data.data;
  },
  async status() {
    const response = await api.get<ApiResponse<any>>('/status');
    return response.data.data;
  },
}; 