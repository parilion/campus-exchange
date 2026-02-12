import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublishPage from './pages/PublishPage';
import ProductListPage from './pages/ProductListPage';
import AuthRoute from './components/AuthRoute';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
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
              <ProductListPage />
            </AuthRoute>
          } />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
