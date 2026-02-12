import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';

function App() {
  return (
    <ConfigProvider locale={zhCN}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<div>Campus Exchange - 首页（开发中）</div>} />
          <Route path="/login" element={<div>登录页面（开发中）</div>} />
          <Route path="/register" element={<div>注册页面（开发中）</div>} />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}

export default App;
