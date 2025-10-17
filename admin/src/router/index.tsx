import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from '@/components/Layout';
import ProtectedRoute from './ProtectedRoute';

// Lazy load pages
const Login = React.lazy(() => import('@/pages/Auth/Login'));
const Dashboard = React.lazy(() => import('@/pages/Dashboard'));
const ProductList = React.lazy(() => import('@/pages/Products/ProductList'));
const ProductForm = React.lazy(() => import('@/pages/Products/ProductForm'));
const OrderList = React.lazy(() => import('@/pages/Orders/OrderList'));
const OrderDetail = React.lazy(() => import('@/pages/Orders/OrderDetail'));
const UserList = React.lazy(() => import('@/pages/Users/UserList'));
const WalletList = React.lazy(() => import('@/pages/Wallets/WalletList'));
const NotFound = React.lazy(() => import('@/pages/NotFound'));

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <MainLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <Dashboard />,
      },
      {
        path: 'products',
        element: <ProductList />,
      },
      {
        path: 'products/new',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <ProductForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'products/:id/edit',
        element: (
          <ProtectedRoute allowedRoles={['admin', 'manager']}>
            <ProductForm />
          </ProtectedRoute>
        ),
      },
      {
        path: 'orders',
        element: <OrderList />,
      },
      {
        path: 'orders/:id',
        element: <OrderDetail />,
      },
      {
        path: 'users',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <UserList />
          </ProtectedRoute>
        ),
      },
      {
        path: 'wallets',
        element: (
          <ProtectedRoute allowedRoles={['admin']}>
            <WalletList />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;
