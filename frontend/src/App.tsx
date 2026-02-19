import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider, Layout } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminLayout from './pages/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import PublishPage from './pages/PublishPage';
import EditProductPage from './pages/EditProductPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import MyProductsPage from './pages/MyProductsPage';
import OrdersPage from './pages/OrdersPage';
import OrderDetailPage from './pages/OrderDetailPage';
import BargainsPage from './pages/BargainsPage';
import MessagesPage from './pages/MessagesPage';
import ChatPage from './pages/ChatPage';
import FavoritesPage from './pages/FavoritesPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import StudentAuthPage from './pages/StudentAuthPage';
import ProfilePage from './pages/ProfilePage';
import UserProfilePage from './pages/UserProfilePage';
import HomePage from './pages/HomePage';
import BrowseHistoryPage from './pages/BrowseHistoryPage';
import AddressPage from './pages/AddressPage';
import AccountSecurityPage from './pages/AccountSecurityPage';
import UserAgreementPage from './pages/UserAgreementPage';
import SystemMessagesPage from './pages/SystemMessagesPage';
import MyReviewsPage from './pages/MyReviewsPage';
import AuthRoute from './components/AuthRoute';
import AppHeader from './components/AppHeader';

const { Content } = Layout;

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Layout style={{ minHeight: '100vh' }}>
          <AppHeader />
          <Content>
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
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/admin/*" element={
                <AdminLayout>
                  <AdminDashboardPage />
                </AdminLayout>
              } />
            </Routes>
          </Content>
        </Layout>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
