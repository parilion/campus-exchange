import React from 'react';
import { Card, List, Button, Space, Typography, Tag } from 'antd';
import {
  LockOutlined, SafetyCertificateOutlined, ClockCircleOutlined,
  ArrowRightOutlined, CheckCircleOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

const { Title, Text } = Typography;

const AccountSecurityPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useUserStore();

  const securityItems = [
    {
      key: 'password',
      icon: <LockOutlined style={{ fontSize: 24, color: '#1890ff' }} />,
      title: '登录密码',
      description: '定期修改密码可以保护账号安全',
      status: <Tag color="green"><CheckCircleOutlined /> 已设置</Tag>,
      action: (
        <Button type="link" icon={<ArrowRightOutlined />} onClick={() => navigate('/change-password')}>
          修改密码
        </Button>
      ),
    },
    {
      key: 'student-auth',
      icon: <SafetyCertificateOutlined style={{ fontSize: 24, color: user?.verified ? '#52c41a' : '#faad14' }} />,
      title: '实名认证',
      description: '通过学号认证可提升账号可信度，并获得更多权限',
      status: user?.verified
        ? <Tag color="green"><CheckCircleOutlined /> 已认证</Tag>
        : <Tag color="orange">未认证</Tag>,
      action: (
        <Button
          type="link"
          icon={<ArrowRightOutlined />}
          onClick={() => navigate('/student-auth')}
          disabled={user?.verified}
        >
          {user?.verified ? '已完成' : '立即认证'}
        </Button>
      ),
    },
    {
      key: 'login-record',
      icon: <ClockCircleOutlined style={{ fontSize: 24, color: '#722ed1' }} />,
      title: '账号信息',
      description: `账号注册时间：${user?.createdAt ? new Date(user.createdAt).toLocaleDateString('zh-CN') : '-'}`,
      status: <Tag color="blue">活跃</Tag>,
      action: null,
    },
  ];

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px' }}>
      <Card
        title={
          <Space>
            <SafetyCertificateOutlined />
            <span>账号安全设置</span>
          </Space>
        }
        extra={<Button onClick={() => navigate(-1)}>返回</Button>}
      >
        <div style={{ marginBottom: 16, padding: '12px 16px', background: '#f6ffed', borderRadius: 8, border: '1px solid #b7eb8f' }}>
          <Text type="success">
            <CheckCircleOutlined /> 当前账号安全状态良好，建议定期修改密码以保护账号安全
          </Text>
        </div>

        <List
          dataSource={securityItems}
          renderItem={(item) => (
            <List.Item
              key={item.key}
              actions={item.action ? [item.action] : []}
              style={{ padding: '16px 0' }}
            >
              <List.Item.Meta
                avatar={<div style={{ padding: '8px' }}>{item.icon}</div>}
                title={
                  <Space>
                    <Text strong>{item.title}</Text>
                    {item.status}
                  </Space>
                }
                description={<Text type="secondary">{item.description}</Text>}
              />
            </List.Item>
          )}
        />

        <div style={{ marginTop: 24, padding: '16px', background: '#fff7e6', borderRadius: 8, border: '1px solid #ffd591' }}>
          <Title level={5} style={{ color: '#d46b08', marginBottom: 8 }}>安全建议</Title>
          <ul style={{ paddingLeft: 20, margin: 0, color: '#8c6d3f' }}>
            <li>定期更换密码，建议每3个月更换一次</li>
            <li>密码应包含大小写字母、数字和特殊字符</li>
            <li>不要在多个平台使用同一个密码</li>
            <li>如果发现账号异常，请立即修改密码</li>
            <li>完成学生认证以提高账号可信度</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default AccountSecurityPage;
