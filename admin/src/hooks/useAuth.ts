import { useAuthStore } from '@/store';
import { authService } from '@/services';
import { message } from 'antd';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, setAuth, logout: logoutStore, hasPermission } = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login({ email, password });
      setAuth(response.user, response.token);
      message.success('Login successful');
      navigate('/dashboard');
    } catch (error) {
      message.error('Login failed');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      logoutStore();
      navigate('/login');
      message.success('Logout successful');
    } catch (error) {
      console.error('Logout failed', error);
      message.warning('Session expired. Please log in again.');
      logoutStore();
      navigate('/login');
    }
  };

  const checkPermission = (allowedRoles: string[]) => {
    return hasPermission(allowedRoles);
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    hasPermission: checkPermission,
  };
};
