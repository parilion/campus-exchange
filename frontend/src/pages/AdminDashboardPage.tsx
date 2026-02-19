import { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, List, Avatar, Tag, Button, Space } from 'antd';
import {
  UserOutlined,
  ShoppingOutlined,
  FileTextOutlined,
  DollarOutlined,
  RiseOutlined,
  WarningOutlined,
} from '@ant-design/icons';

interface DashboardData {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  recentOrders: Array<{
    id: number;
    orderNo: string;
    productName: string;
    amount: number;
    status: string;
    createdAt: string;
  }>;
  pendingProducts: number;
  pendingReports: number;
}

const AdminDashboardPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<DashboardData>({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    recentOrders: [],
    pendingProducts: 0,
    pendingReports: 0,
  });

  useEffect(() => {
    // 模拟数据，实际应该从 API 获取
    setData({
      totalUsers: 1256,
      totalProducts: 3420,
      totalOrders: 1856,
      totalRevenue: 268500,
      recentOrders: [
        { id: 1, orderNo: 'ORD20260220001', productName: 'iPhone 14 Pro', amount: 5999, status: 'PAID', createdAt: '2026-02-20 10:30' },
        { id: 2, orderNo: 'ORD20260220002', productName: 'MacBook Air', amount: 7999, status: 'PENDING', createdAt: '2026-02-20 09:15' },
        { id: 3, orderNo: 'ORD20260219003', productName: 'AirPods Pro', amount: 1999, status: 'SHIPPED', createdAt: '2026-02-19 16:45' },
        { id: 4, orderNo: 'ORD20260219004', productName: 'iPad Mini', amount: 3599, status: 'COMPLETED', createdAt: '2026-02-19 14:20' },
        { id: 5, orderNo: 'ORD20260219005', productName: '小米手环', amount: 299, status: 'COMPLETED', createdAt: '2026-02-19 11:00' },
      ],
      pendingProducts: 12,
      pendingReports: 3,
    });
  }, []);

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      PENDING: { color: 'orange', text: '待支付' },
      PAID: { color: 'blue', text: '已支付' },
      SHIPPED: { color: 'cyan', text: '已发货' },
      COMPLETED: { color: 'green', text: '已完成' },
      CANCELLED: { color: 'red', text: '已取消' },
    };
    const config = statusMap[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>仪表盘</h1>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={data.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="商品总数"
              value={data.totalProducts}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="订单总数"
              value={data.totalOrders}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总收入"
              value={data.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 待处理事项 */}
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col xs={24} sm={12}>
          <Card
            title="待处理事项"
            extra={<Button type="link" onClick={() => {}}>查看全部</Button>}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#fff7e6',
                borderRadius: 4,
                border: '1px solid #ffd591',
              }}>
                <div>
                  <WarningOutlined style={{ color: '#fa8c16', marginRight: 8 }} />
                  <span>待审核商品</span>
                </div>
                <Tag color="orange">{data.pendingProducts} 条</Tag>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 16px',
                background: '#fff1f0',
                borderRadius: 4,
                border: '1px solid #ffa39e',
              }}>
                <div>
                  <WarningOutlined style={{ color: '#f5222d', marginRight: 8 }} />
                  <span>待处理举报</span>
                </div>
                <Tag color="red">{data.pendingReports} 条</Tag>
              </div>
            </Space>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card
            title="数据趋势"
            extra={<Button type="link" onClick={() => {}}>查看详情</Button>}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <span>今日新增用户: <strong>12</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <span>今日新增商品: <strong>28</strong></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <RiseOutlined style={{ color: '#52c41a' }} />
                <span>今日成交订单: <strong>15</strong></span>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* 最近订单 */}
      <Card
        title="最近订单"
        style={{ marginTop: 24 }}
        extra={<Button type="link" onClick={() => {}}>查看全部</Button>}
      >
        <List
          itemLayout="horizontal"
          dataSource={data.recentOrders}
          renderItem={(item) => (
            <List.Item
              actions={[
                <Button type="link" size="small" key="detail">查看详情</Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar style={{ background: '#1890ff' }}>
                    {item.productName.charAt(0)}
                  </Avatar>
                }
                title={
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span>{item.productName}</span>
                    <span style={{ color: '#999', fontSize: 12 }}>{item.orderNo}</span>
                  </div>
                }
                description={
                  <div>
                    <span style={{ marginRight: 8 }}>¥{item.amount}</span>
                    <span style={{ color: '#999', fontSize: 12 }}>{item.createdAt}</span>
                  </div>
                }
              />
              {getStatusTag(item.status)}
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
