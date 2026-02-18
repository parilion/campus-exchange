import { useState } from 'react';
import { Form, Input, Button, Card, message, Typography } from 'antd';
import { useNavigate } from 'react-router-dom';
import { studentAuth } from '../services/auth';
import { useUserStore } from '../stores/userStore';

const { Title, Text } = Typography;

export default function StudentAuthPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user, setUser } = useUserStore();

  const onFinish = async (values: {
    studentId: string;
    realName?: string;
    department?: string;
  }) => {
    setLoading(true);
    try {
      await studentAuth(values);
      message.success('学生认证成功');
      // 更新用户状态
      if (user) {
        setUser({ ...user, verified: true, studentId: values.studentId });
      }
      navigate('/');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '认证失败';
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
          <Title level={3} style={{ marginBottom: 4 }}>学生身份认证</Title>
          <Text type="secondary">认证后享受更多权益</Text>
        </div>

        <Form onFinish={onFinish} size="large">
          <Form.Item
            name="studentId"
            rules={[
              { required: true, message: '请输入学号' },
              { pattern: /^[0-9]{8,12}$/, message: '学号格式不正确（8-12位数字）' },
            ]}
          >
            <Input placeholder="学号（8-12位数字）" />
          </Form.Item>

          <Form.Item
            name="realName"
          >
            <Input placeholder="真实姓名（选填）" />
          </Form.Item>

          <Form.Item
            name="department"
          >
            <Input placeholder="院系/专业（选填）" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              提交认证
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Button type="link" onClick={() => navigate('/')}>
              暂不认证
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
