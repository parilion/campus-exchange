import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { App as AntApp, ConfigProvider, Layout, theme as antTheme, Spin } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { useThemeStore } from './stores/themeStore';
import { initMessage } from './utils/message';
import AuthRoute from './components/AuthRoute';
import AppHeader from './components/AppHeader';
import AppFooter from './components/AppFooter';
import ErrorBoundary from './components/ErrorBoundary';

// 懒加载所有页面组件，减少首屏加载时间
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const AdminLoginPage = lazy(() => import('./pages/AdminLoginPage'));
const AdminLayout = lazy(() => import('./pages/AdminLayout'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminProductsPage = lazy(() => import('./pages/AdminProductsPage'));
const AdminCategoriesPage = lazy(() => import('./pages/AdminCategoriesPage'));
const AdminAnnouncementsPage = lazy(() => import('./pages/AdminAnnouncementsPage'));
const AdminCarouselsPage = lazy(() => import('./pages/AdminCarouselsPage'));
const AdminOrdersPage = lazy(() => import('./pages/AdminOrdersPage'));
const AdminReviewsPage = lazy(() => import('./pages/AdminReviewsPage'));
const AdminMessagesPage = lazy(() => import('./pages/AdminMessagesPage'));
const AdminSettingsPage = lazy(() => import('./pages/AdminSettingsPage'));
const AdminSensitiveWordsPage = lazy(() => import('./pages/AdminSensitiveWordsPage'));
const AdminOperationLogsPage = lazy(() => import('./pages/AdminOperationLogsPage'));
const PublishPage = lazy(() => import('./pages/PublishPage'));
const EditProductPage = lazy(() => import('./pages/EditProductPage'));
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const MyProductsPage = lazy(() => import('./pages/MyProductsPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const BargainsPage = lazy(() => import('./pages/BargainsPage'));
const MessagesPage = lazy(() => import('./pages/MessagesPage'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const FavoritesPage = lazy(() => import('./pages/FavoritesPage'));
const ChangePasswordPage = lazy(() => import('./pages/ChangePasswordPage'));
const StudentAuthPage = lazy(() => import('./pages/StudentAuthPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const UserProfilePage = lazy(() => import('./pages/UserProfilePage'));
const HomePage = lazy(() => import('./pages/HomePage'));
const BrowseHistoryPage = lazy(() => import('./pages/BrowseHistoryPage'));
const AddressPage = lazy(() => import('./pages/AddressPage'));
const AccountSecurityPage = lazy(() => import('./pages/AccountSecurityPage'));
const UserAgreementPage = lazy(() => import('./pages/UserAgreementPage'));
const SystemMessagesPage = lazy(() => import('./pages/SystemMessagesPage'));
const MyReviewsPage = lazy(() => import('./pages/MyReviewsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const { Content, Footer } = Layout;

// 路由懒加载 fallback
const PageFallback = (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '300px' }}>
    <Spin size="large" />
  </div>
);

function AppContent() {
  const isDark = useThemeStore((s) => s.isDark);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
        token: { colorPrimary: '#1890ff' },
      }}
    >
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <AppHeader />
          <Content>
            <ErrorBoundary>
              <Suspense fallback={PageFallback}>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/publish" element={
                    <AuthRoute>
                      <PublishPage />
                    </AuthRoute>
                  } />
                  <Route path="/products" element={
                    <AuthRoute>
                      <ProductListPage />
                    </AuthRoute>
                  } />
                  <Route path="/" element={
                    <AuthRoute>
                      <HomePage />
                    </AuthRoute>
                  } />
                  <Route path="/products/:id" element={
                    <AuthRoute>
                      <ProductDetailPage />
                    </AuthRoute>
                  } />
                  <Route path="/products/:id/edit" element={
                    <AuthRoute>
                      <EditProductPage />
                    </AuthRoute>
                  } />
                  <Route path="/my-products" element={
                    <AuthRoute>
                      <MyProductsPage />
                    </AuthRoute>
                  } />
                  <Route path="/orders" element={
                    <AuthRoute>
                      <OrdersPage />
                    </AuthRoute>
                  } />
                  <Route path="/orders/:id" element={
                    <AuthRoute>
                      <OrderDetailPage />
                    </AuthRoute>
                  } />
                  <Route path="/bargains" element={
                    <AuthRoute>
                      <BargainsPage />
                    </AuthRoute>
                  } />
                  <Route path="/messages" element={
                    <AuthRoute>
                      <MessagesPage />
                    </AuthRoute>
                  } />
                  <Route path="/chat/:partnerId" element={
                    <AuthRoute>
                      <ChatPage />
                    </AuthRoute>
                  } />
                  <Route path="/favorites" element={
                    <AuthRoute>
                      <FavoritesPage />
                    </AuthRoute>
                  } />
                  <Route path="/browse-history" element={
                    <AuthRoute>
                      <BrowseHistoryPage />
                    </AuthRoute>
                  } />
                  <Route path="/change-password" element={
                    <AuthRoute>
                      <ChangePasswordPage />
                    </AuthRoute>
                  } />
                  <Route path="/student-auth" element={
                    <AuthRoute>
                      <StudentAuthPage />
                    </AuthRoute>
                  } />
                  <Route path="/profile" element={
                    <AuthRoute>
                      <ProfilePage />
                    </AuthRoute>
                  } />
                  <Route path="/user/:userId" element={
                    <AuthRoute>
                      <UserProfilePage />
                    </AuthRoute>
                  } />
                  <Route path="/addresses" element={
                    <AuthRoute>
                      <AddressPage />
                    </AuthRoute>
                  } />
                  <Route path="/account-security" element={
                    <AuthRoute>
                      <AccountSecurityPage />
                    </AuthRoute>
                  } />
                  <Route path="/system-messages" element={
                    <AuthRoute>
                      <SystemMessagesPage />
                    </AuthRoute>
                  } />
                  <Route path="/my-reviews" element={
                    <AuthRoute>
                      <MyReviewsPage />
                    </AuthRoute>
                  } />
                  <Route path="/user/:userId/reviews" element={<MyReviewsPage />} />
                  <Route path="/agreement" element={<UserAgreementPage />} />
                  <Route path="/admin/login" element={<AdminLoginPage />} />
                  <Route path="/admin/dashboard" element={
                    <AdminLayout>
                      <AdminDashboardPage />
                    </AdminLayout>
                  } />
                  <Route path="/admin/users" element={
                    <AdminLayout>
                      <AdminUsersPage />
                    </AdminLayout>
                  } />
                  <Route path="/admin/products" element={
                    <AdminLayout>
                      <AdminProductsPage />
                    </AdminLayout>
                  } />
                  <Route path="/admin/categories" element={
                    <AdminLayout>
                      <AdminCategoriesPage />
                    </AdminLayout>
                  } />
                  <Route path="/admin/announcements" element={
                    <AdminLayout>
                      <AdminAnnouncementsPage />
                    </AdminLayout>
                  } />
                  <Route path="/admin/carousels" element={
                    <AdminLayout>
                      <AdminCarouselsPage />
                    </AdminLayout>
                  } />
                  <Route path="/admin/orders" element={
                    <AdminLayout>
                      <AdminOrdersPage />
                    </AdminLayout>
                  } />
                  <Route path="/admin/reviews" element={
                    <AdminLayout>
                      <AdminReviewsPage />
                    </AdminLayout>
                  } />
                  <Route path="/admin/messages" element={
                    <AdminLayout>
                      <AdminMessagesPage />
                    </AdminLayout>
                  } />
                  <Route path="/admin/sensitive-words" element={
                    <AdminLayout>
                      <AdminSensitiveWordsPage />
                    </AdminLayout>
                  } />
                  <Route path="/admin/operation-logs" element={
                    <AdminLayout>
                      <AdminOperationLogsPage />
                    </AdminLayout>
                  } />
                  <Route path="/admin/settings" element={
                    <AdminLayout>
                      <AdminSettingsPage />
                    </AdminLayout>
                  } />
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/*" element={
                    <AdminLayout>
                      <AdminDashboardPage />
                    </AdminLayout>
                  } />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
          </Content>
          <Footer style={{ padding: 0 }}>
            <AppFooter />
          </Footer>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
}

// 初始化全局 message 实例
const MessageInitializer = () => {
  const { message } = AntApp.useApp();
  useEffect(() => {
    initMessage(message);
  }, [message]);
  return null;
};

export default function App() {
  return (
    <AntApp>
      <MessageInitializer />
      <AppContent />
    </AntApp>
  );
}
