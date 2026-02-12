import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/auth';
import { useUserStore } from '../stores/userStore';

const { Title, Text } = Typography;

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUser } = useUserStore();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const data = await login(values);
      setToken(data.token);
      setUser({
        id: data.userId,
        username: data.username,
        nickname: data.nickname,
        avatar: data.avatar,
        role: data.role as 'USER' | 'ADMIN',
        email: '',
        verified: false,
        createdAt: '',
      });
      message.success('登录成功');
      navigate('/');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '登录失败';
      message.error(errorMsg);
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
      background: '#f0f2f5',
    }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4 }}>校园二手交易平台</Title>
          <Text type="secondary">登录你的账号</Text>
        </div>

        <Form onFinish={onFinish} size="large">
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              登录
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>还没有账号？</Text>
            <Link to="/register">立即注册</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
