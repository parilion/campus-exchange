import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/auth';
import { useUserStore } from '../stores/userStore';

const { Title, Text } = Typography;

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { setToken, setUser } = useUserStore();

  const onFinish = async (values: {
    username: string;
    password: string;
    email: string;
    nickname?: string;
    studentId?: string;
  }) => {
    setLoading(true);
    try {
      const data = await register(values);
      setToken(data.token);
      setUser({
        id: data.userId,
        username: data.username,
        nickname: data.nickname,
        avatar: data.avatar,
        role: data.role as 'USER' | 'ADMIN',
        email: values.email,
        verified: false,
        createdAt: '',
      });
      message.success('注册成功');
      navigate('/');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '注册失败';
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
          <Text type="secondary">创建新账号</Text>
        </div>

        <Form onFinish={onFinish} size="large">
          <Form.Item
            name="username"
            rules={[
              { required: true, message: '请输入用户名' },
              { min: 3, max: 20, message: '用户名长度为3-20个字符' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="邮箱" />
          </Form.Item>

          <Form.Item
            name="nickname"
          >
            <Input prefix={<UserOutlined />} placeholder="昵称（选填）" />
          </Form.Item>

          <Form.Item
            name="studentId"
            rules={[
              { pattern: /^[0-9]{8,12}$/, message: '学号格式不正确' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="学号（选填，认证后享受更多权益）" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6个字符' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="密码" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: '请确认密码' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('两次输入的密码不一致'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="确认密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              注册
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>已有账号？</Text>
            <Link to="/login">去登录</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
