import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, message, Radio } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '../services/auth';
import { useUserStore } from '../stores/userStore';

const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser, setToken } = useUserStore();
  const [loading, setLoading] = useState(false);

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const response = await login(values);
      if (response.role !== 'ADMIN') {
        message.error('您没有管理员权限');
        return;
      }
      setToken(response.token);
      setUser({
        id: response.userId,
        username: response.username,
        nickname: response.nickname,
        email: '',
        avatar: response.avatar,
        role: response.role as 'USER' | 'ADMIN',
        verified: false,
        createdAt: '',
      });
      message.success('管理员登录成功');
      navigate('/admin/dashboard');
    } catch (error: any) {
      message.error(error.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)',
    }}>
      <Card
        style={{ width: 400, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}
        bordered={false}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h1 style={{ fontSize: 24, color: '#1890ff', marginBottom: 8 }}>校园二手交易平台</h1>
          <h2 style={{ fontSize: 18, color: '#666' }}>管理员登录</h2>
        </div>
        <Form
          name="admin_login"
          onFinish={onFinish}
          autoComplete="off"
          size="large"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="管理员账号"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <a href="/login">返回用户登录</a>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default AdminLoginPage;
