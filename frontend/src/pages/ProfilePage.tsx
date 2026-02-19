import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, Upload, message, Space, Typography, Divider, List } from 'antd';
import {
  UserOutlined, UploadOutlined, MailOutlined, PhoneOutlined, IdcardOutlined,
  CheckCircleOutlined, HomeOutlined, SafetyCertificateOutlined, FileTextOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { getProfile, updateProfile, uploadAvatar, type UserProfile } from '../services/user';
import { useUserStore } from '../stores/userStore';

const { Title, Text } = Typography;

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { user, setUser } = useUserStore();

  useEffect(() => {
    loadProfile();
  }, []);

  // 监听用户资料更新，更新表单
  useEffect(() => {
    if (userProfile) {
      form.setFieldsValue({
        nickname: userProfile.nickname || '',
        email: userProfile.email || '',
        phone: userProfile.phone || '',
        username: userProfile.username || '',
      });
    }
  }, [userProfile, form]);

  const loadProfile = async () => {
    try {
      const res = await getProfile();
      setUserProfile(res.data);
      form.setFieldsValue({
        nickname: res.data.nickname,
        email: res.data.email,
        phone: res.data.phone,
        username: res.data.username,
      });
    } catch (error) {
      message.error('加载用户资料失败');
    }
  };

  const handleSubmit = async (values: any) => {
    setLoading(true);
    try {
      await updateProfile({
        nickname: values.nickname,
        phone: values.phone,
        email: values.email,
      });
      message.success('资料更新成功');
      // 更新本地store中的用户信息
      if (setUser && user) {
        setUser({
          ...user,
          nickname: values.nickname,
          email: values.email,
          phone: values.phone,
        });
      }
      loadProfile();
    } catch (error: any) {
      message.error(error.message || '更新失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (file: File) => {
    setAvatarLoading(true);
    try {
      const res = await uploadAvatar(file);
      message.success('头像上传成功');
      // 更新本地store中的用户信息
      if (setUser && user) {
        setUser({
          ...user,
          avatar: res.data,
        });
      }
      loadProfile();
    } catch (error: any) {
      message.error(error.message || '头像上传失败');
    } finally {
      setAvatarLoading(false);
    }
    return false; // 阻止默认上传行为
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3}>个人资料</Title>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 32 }}>
          <Upload
            showUploadList={false}
            beforeUpload={handleAvatarUpload}
            accept="image/*"
          >
            <div style={{ cursor: 'pointer', position: 'relative' }}>
              <Avatar
                size={120}
                src={userProfile?.avatar ? `http://localhost:8080${userProfile.avatar}` : undefined}
                icon={<UserOutlined />}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  padding: '4px 0',
                  borderRadius: '0 0 60px 60px',
                  fontSize: 12,
                }}
              >
                <UploadOutlined /> 更换头像
              </div>
            </div>
          </Upload>
        </div>

        <Divider />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={userProfile || {}}
        >
          <Form.Item
            name="username"
            label="用户名"
          >
            <Input prefix={<UserOutlined />} disabled />
          </Form.Item>

          <Form.Item
            name="nickname"
            label="昵称"
            rules={[
              { required: true, message: '请输入昵称' },
              { min: 2, max: 20, message: '昵称长度必须在2-20个字符之间' },
            ]}
          >
            <Input prefix={<IdcardOutlined />} placeholder="请输入昵称" />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入正确的邮箱格式' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { len: 11, message: '手机号必须为11位' },
            ]}
          >
            <Input prefix={<PhoneOutlined />} placeholder="请输入手机号（可选）" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                保存修改
              </Button>
              <Button onClick={() => navigate(-1)}>
                返回
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <Divider />

        <div style={{ background: '#f5f5f5', padding: 16, borderRadius: 8 }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">学号认证状态：</Text>
              {userProfile?.verified ? (
                <span style={{ color: '#52c41a' }}>
                  <CheckCircleOutlined /> 已认证 ({userProfile.studentId})
                </span>
              ) : (
                <Button size="small" type="link" onClick={() => navigate('/student-auth')}>
                  立即认证
                </Button>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text type="secondary">账号注册时间：</Text>
              <Text>{userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString() : '-'}</Text>
            </div>
          </Space>
        </div>

        <Divider />

        {/* 快捷入口 */}
        <List
          size="small"
          dataSource={[
            {
              key: 'address',
              icon: <HomeOutlined style={{ color: '#1890ff' }} />,
              title: '收货地址管理',
              desc: '管理您的收货地址',
              path: '/addresses',
            },
            {
              key: 'security',
              icon: <SafetyCertificateOutlined style={{ color: '#52c41a' }} />,
              title: '账号安全设置',
              desc: '修改密码、实名认证等',
              path: '/account-security',
            },
            {
              key: 'agreement',
              icon: <FileTextOutlined style={{ color: '#722ed1' }} />,
              title: '用户协议与隐私政策',
              desc: '查看平台服务条款',
              path: '/agreement',
            },
          ]}
          renderItem={(item) => (
            <List.Item
              key={item.key}
              style={{ cursor: 'pointer', padding: '10px 0' }}
              onClick={() => navigate(item.path)}
              extra={<ArrowRightOutlined style={{ color: '#999' }} />}
            >
              <List.Item.Meta
                avatar={item.icon}
                title={<Text strong style={{ fontSize: 14 }}>{item.title}</Text>}
                description={<Text type="secondary" style={{ fontSize: 12 }}>{item.desc}</Text>}
              />
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default ProfilePage;
