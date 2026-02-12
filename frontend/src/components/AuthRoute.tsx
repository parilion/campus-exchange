import { Navigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

/**
 * 路由守卫组件：未登录时跳转到登录页
 */
export default function AuthRoute({ children }: { children: React.ReactNode }) {
  const token = useUserStore((state) => state.token);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
