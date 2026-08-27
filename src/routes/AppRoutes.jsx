import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './ProtectedRoute';
import AppLayout from '../components/layout/AppLayout';

import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Expenses from '../pages/Expenses';
import AddExpense from '../pages/AddExpense';
import EditExpense from '../pages/EditExpense';
import Analytics from '../pages/Analytics';
import History from '../pages/History';
import Profile from '../pages/Profile';
import { Budget } from '../pages/Budget';
import { AiAdvisor } from '../pages/AiAdvisor';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/expenses/add" element={<AddExpense />} />
          <Route path="/expenses/:id/edit" element={<EditExpense />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/history" element={<History />} />
          <Route path="/budget" element={<Budget />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/ai-advisor" element={<AiAdvisor />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
export default AppRoutes;
