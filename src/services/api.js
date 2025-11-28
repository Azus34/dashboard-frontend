import axios from 'axios';

const API_BASE_URL = 'https://dashboard-backend-ntax.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const transactionsAPI = {
  getAll: () => api.get('/transactions'),
  getById: (id) => api.get(`/transactions/${id}`),
  getByUser: (userId) => api.get(`/transactions/user/${userId}`),
};

export const financesAPI = {
  getRecharges: () => api.get('/finances/recharges'),
  getWithdrawals: () => api.get('/finances/withdrawals'),
  getStats: () => api.get('/finances/stats/summary'),
};

export const earningsAPI = {
  getTotal: () => api.get('/earnings/total'),
  getByPeriod: () => api.get('/earnings/by-period'),
  getByDriver: () => api.get('/earnings/by-driver'),
};

export const routesAPI = {
  getAll: () => api.get('/routes'),
  getById: (id) => api.get(`/routes/${id}`),
  getByDriver: (driverId) => api.get(`/routes/driver/${driverId}`),
  getActive: () => api.get('/routes/status/active'),
};

export const usersAPI = {
  getDrivers: () => api.get('/users/drivers'),
  getDriver: (id) => api.get(`/users/drivers/${id}`),
  getCustomers: () => api.get('/users/customers'),
  getCustomer: (id) => api.get(`/users/customers/${id}`),
};

export const reservationsAPI = {
  getAll: () => api.get('/reservations'),
  getByRoute: (routeId) => api.get(`/reservations/route/${routeId}`),
};

export const analyticsAPI = {
  getDailyActiveUsers: () => api.get('/analytics/daily-active-users'),
  getRetention: () => api.get('/analytics/retention'),
};

export const aiAPI = {
  query: (data) => api.post('/ai/query', data),
};

export default api;
