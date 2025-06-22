import axios from 'axios';
import { ApiResponse } from '@/types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL + '/crypto',
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

export const cryptoService = {
  async getPrice(symbol: string) {
    const response = await api.get<ApiResponse<any>>(`/price/${symbol}`);
    return response.data.data;
  },
  async getPrices(symbols: string[]) {
    const response = await api.post<ApiResponse<any>>('/prices', { symbols });
    return response.data.data;
  },
  async getWalletBalance(address: string, network: string) {
    const response = await api.get<ApiResponse<any>>(`/wallet/${address}/${network}`);
    return response.data.data;
  },
  async getTokenBalance(address: string, tokenAddress: string, network: string) {
    const response = await api.get<ApiResponse<any>>(`/token/${address}/${tokenAddress}/${network}`);
    return response.data.data;
  },
  async getTransactionHistory(address: string, network: string, limit = 50) {
    const response = await api.get<ApiResponse<any>>(`/transactions/${address}/${network}?limit=${limit}`);
    return response.data.data;
  },
  async getGasPrice(network: string) {
    const response = await api.get<ApiResponse<any>>(`/gas/${network}`);
    return response.data.data;
  },
  async sendTransaction(data: any) {
    const response = await api.post<ApiResponse<any>>('/send', data);
    return response.data.data;
  },
  async getMarketData(symbol: string) {
    const response = await api.get<ApiResponse<any>>(`/market/${symbol}`);
    return response.data.data;
  },
  async getPortfolioValue(wallets: any[]) {
    const response = await api.post<ApiResponse<any>>('/portfolio', { wallets });
    return response.data.data;
  },
  async getSupportedNetworks() {
    const response = await api.get<ApiResponse<any>>('/networks');
    return response.data.data;
  },
  async getSupportedTokens(network: string) {
    const response = await api.get<ApiResponse<any>>(`/tokens/${network}`);
    return response.data.data;
  },
  async getNews(limit = 10, category = 'cryptocurrency') {
    const response = await api.get<ApiResponse<any>>(`/news?limit=${limit}&category=${category}`);
    return response.data.data;
  },
  async getAlerts() {
    const response = await api.get<ApiResponse<any>>('/alerts');
    return response.data.data;
  },
  async createAlert(data: any) {
    const response = await api.post<ApiResponse<any>>('/alerts', data);
    return response.data.data;
  },
  async deleteAlert(alertId: string) {
    const response = await api.delete<ApiResponse<any>>(`/alerts/${alertId}`);
    return response.data;
  },
  async getMarketOverview() {
    const response = await api.get<ApiResponse<any>>('/market-overview');
    return response.data.data;
  },
}; 