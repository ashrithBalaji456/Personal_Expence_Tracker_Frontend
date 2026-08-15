import api from './axios';

export const trackerApi = {
  // Auth Operations
  register: async (username, email, password) => {
    const response = await api.post('/auth/register', { username, email, password });
    return response.data;
  },

  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data;
  },

  // Expenses CRUD
  createExpense: async (expenseData) => {
    const response = await api.post('/expenses', expenseData);
    return response.data;
  },

  getAllExpenses: async () => {
    const response = await api.get('/expenses');
    return response.data;
  },

  getExpenseById: async (id) => {
    const response = await api.get(`/expenses/${id}`);
    return response.data;
  },

  updateExpense: async (id, expenseData) => {
    const response = await api.put(`/expenses/${id}`, expenseData);
    return response.data;
  },

  deleteExpense: async (id) => {
    const response = await api.delete(`/expenses/${id}`);
    return response.data;
  },

  // Expenses Filters
  getExpensesByCategory: async (category) => {
    const response = await api.get(`/expenses/category/${category}`);
    return response.data;
  },

  getExpensesByDate: async (date) => {
    const response = await api.get(`/expenses/date/${date}`);
    return response.data;
  },

  getExpensesInRange: async (startDate, endDate) => {
    const response = await api.get(`/expenses/range?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  getExpensesHistory: async (page = 0, size = 20) => {
    const response = await api.get(`/expenses/history?page=${page}&size=${size}`);
    return response.data;
  },

  // Dashboard API
  getDashboardData: async () => {
    const response = await api.get('/dashboard');
    return response.data;
  },

  // Analytics APIs
  getSpendingBetweenDates: async (startDate, endDate) => {
    const response = await api.get(`/analytics/spending?startDate=${startDate}&endDate=${endDate}`);
    return response.data;
  },

  getLast3DaysSpending: async () => {
    const response = await api.get('/analytics/last-3-days');
    return response.data;
  },

  getWeeklySpending: async () => {
    const response = await api.get('/analytics/weekly');
    return response.data;
  },

  getMonthlySpending: async () => {
    const response = await api.get('/analytics/monthly');
    return response.data;
  },

  comparePeriods: async (firstStart, firstEnd, secondStart, secondEnd) => {
    const response = await api.get(`/analytics/compare?firstStart=${firstStart}&firstEnd=${firstEnd}&secondStart=${secondStart}&secondEnd=${secondEnd}`);
    return response.data;
  },
};
export default trackerApi;
