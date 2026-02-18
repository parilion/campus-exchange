import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography, Steps } from 'antd';
import { MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { sendPasswordResetCode, resetPassword } from '../services/auth';

const { Title, Text } = Typography;

export default function ForgotPasswordPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  // 发送验证码
  const handleSendCode = async (values: { email: string }) => {
    setLoading(true);
    try {
      await sendPasswordResetCode(values.email);
      setEmail(values.email);
      message.success('验证码已发送到您的邮箱（控制台查看）');
      setCurrentStep(1);
      // 开始倒计时
      setCountdown(60);
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '发送失败';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 验证验证码并重置密码
  const handleResetPassword = async (values: { code: string; newPassword: string }) => {
    setLoading(true);
    try {
      await resetPassword(email, values.code, values.newPassword);
      message.success('密码重置成功，请使用新密码登录');
      navigate('/login');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '重置失败';
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
      <Card style={{ width: 450 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ marginBottom: 4 }}>找回密码</Title>
          <Text type="secondary">通过邮箱验证码重置密码</Text>
        </div>

        <Steps
          current={currentStep}
          items={[
            { title: '输入邮箱' },
            { title: '验证重置' },
          ]}
          style={{ marginBottom: 24 }}
        />

        {currentStep === 0 && (
          <Form form={form} onFinish={handleSendCode} size="large">
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入注册邮箱' },
                { type: 'email', message: '请输入有效的邮箱地址' },
              ]}
            >
              <Input prefix={<MailOutlined />} placeholder="注册邮箱" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                disabled={countdown > 0}
              >
                {countdown > 0 ? `${countdown}秒后可重新发送` : '发送验证码'}
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Text>想起密码了？</Text>
              <Link to="/login">立即登录</Link>
            </div>
          </Form>
        )}

        {currentStep === 1 && (
          <Form onFinish={handleResetPassword} size="large">
            <div style={{ marginBottom: 16, textAlign: 'center' }}>
              <Text type="secondary">
                验证码已发送到 <Text strong>{email}</Text>
              </Text>
            </div>

            <Form.Item
              name="code"
              rules={[
                { required: true, message: '请输入6位验证码' },
                { len: 6, message: '验证码为6位数字' },
              ]}
            >
              <Input prefix={<SafetyOutlined />} placeholder="6位验证码" maxLength={6} />
            </Form.Item>

            <Form.Item
              name="newPassword"
              rules={[
                { required: true, message: '请输入新密码' },
                { min: 6, message: '密码至少6位' },
                { max: 20, message: '密码最多20位' },
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="新密码（6-20位）" />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              dependencies={['newPassword']}
              rules={[
                { required: true, message: '请确认新密码' },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('newPassword') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('两次输入的密码不一致'));
                  },
                }),
              ]}
            >
              <Input.Password prefix={<LockOutlined />} placeholder="确认新密码" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                重置密码
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center' }}>
              <Button type="link" onClick={() => setCurrentStep(0)}>
                重新发送验证码
              </Button>
            </div>
          </Form>
        )}
      </Card>
    </div>
  );
}
