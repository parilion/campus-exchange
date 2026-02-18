import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout, Menu, Button, Space, Avatar, Dropdown } from 'antd';
import { UserOutlined, HeartOutlined, FileTextOutlined, ShoppingOutlined, MessageOutlined, LogoutOutlined, LoginOutlined, LockOutlined, CheckCircleOutlined, SettingOutlined } from '@ant-design/icons';
import { useUserStore } from '../stores/userStore';

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useUserStore();
  const isAuthenticated = !!user;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <SettingOutlined />,
      label: '个人资料',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'my-products',
      icon: <FileTextOutlined />,
      label: '我的发布',
      onClick: () => navigate('/my-products'),
    },
    {
      key: 'favorites',
      icon: <HeartOutlined />,
      label: '我的收藏',
      onClick: () => navigate('/favorites'),
    },
    {
      key: 'orders',
      icon: <ShoppingOutlined />,
      label: '我的订单',
      onClick: () => navigate('/orders'),
    },
    {
      key: 'bargains',
      icon: <ShoppingOutlined />,
      label: '议价记录',
      onClick: () => navigate('/bargains'),
    },
    {
      key: 'messages',
      icon: <MessageOutlined />,
      label: '消息中心',
      onClick: () => navigate('/messages'),
    },
    {
      type: 'divider' as const,
    },
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: '修改密码',
      onClick: () => navigate('/change-password'),
    },
    {
      key: 'student-auth',
      icon: user?.verified ? <CheckCircleOutlined /> : <UserOutlined />,
      label: user?.verified ? '已认证' : '学生认证',
      onClick: () => navigate('/student-auth'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
      onClick: handleLogout,
    },
  ];

  return (
    <Header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      background: '#fff',
      padding: '0 24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <Link to="/" style={{ marginRight: '32px' }}>
          <h1 style={{ margin: 0, fontSize: '20px', color: '#1890ff', fontWeight: 'bold' }}>
            校园二手交易
          </h1>
        </Link>
        <Menu
          mode="horizontal"
          selectedKeys={[]}
          items={[
            {
              key: 'home',
              label: <Link to="/">首页</Link>,
            },
            {
              key: 'products',
              label: <Link to="/products">商品列表</Link>,
            },
          ]}
          style={{ border: 'none', flex: 1 }}
        />
      </div>

      <Space>
        <Button type="primary" onClick={() => navigate('/publish')}>
          发布商品
        </Button>

        {isAuthenticated && user ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <Space style={{ cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} src={user.avatar} />
              <span>{user.nickname || user.username}</span>
            </Space>
          </Dropdown>
        ) : (
          <Space>
            <Button icon={<LoginOutlined />} onClick={() => navigate('/login')}>
              登录
            </Button>
            <Button type="primary" ghost onClick={() => navigate('/register')}>
              注册
            </Button>
          </Space>
        )}
      </Space>
    </Header>
  );
};

export default AppHeader;
