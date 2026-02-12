import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PublishPage from './pages/PublishPage';
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
          <Route path="/" element={
            <AuthRoute>
              <div style={{ padding: 24 }}>
                <h1>Campus Exchange - 首页</h1>
                <p>欢迎来到校园二手交易平台！（开发中）</p>
              </div>
            </AuthRoute>
          } />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
