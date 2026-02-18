import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Space, Typography, Tabs, Empty, Image, Modal, message } from 'antd';
import { EyeOutlined, CloseCircleOutlined, CarOutlined, CheckCircleOutlined, ExclamationCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { getOrderList, cancelOrder, payOrder, shipOrder, confirmOrder } from '../services/order';
import type { Order, OrderPageResponse } from '../services/order';
import './OrdersPage.css';

const { Title, Text } = Typography;

// 订单状态映射
const STATUS_MAP: Record<string, { color: string; text: string }> = {
  PENDING: { color: 'orange', text: '待支付' },
  PAID: { color: 'blue', text: '已支付' },
  SHIPPED: { color: 'cyan', text: '已发货' },
  COMPLETED: { color: 'green', text: '已完成' },
  CANCELLED: { color: 'red', text: '已取消' },
};

// 退款状态映射
const REFUND_STATUS_MAP: Record<string, { color: string; text: string }> = {
  NONE: { color: 'default', text: '无退款' },
  APPLYING: { color: 'orange', text: '退款中' },
  APPROVED: { color: 'green', text: '已退款' },
  REJECTED: { color: 'red', text: '退款被拒' },
};

// 纠纷状态映射
const DISPUTE_STATUS_MAP: Record<string, { color: string; text: string }> = {
  NONE: { color: 'default', text: '无纠纷' },
  APPLYING: { color: 'orange', text: '纠纷中' },
  PROCESSING: { color: 'blue', text: '处理中' },
  RESOLVED: { color: 'green', text: '已解决' },
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    total: 0,
    totalPages: 0,
  });
  const [activeTab, setActiveTab] = useState('all');
  const [currentUserId] = useState<number | null>(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return Number(payload.userId);
      } catch {
        return null;
      }
    }
    return null;
  });

  // 加载订单列表
  const loadOrders = async () => {
    setLoading(true);
    try {
      const params: any = { page: pagination.page, pageSize: pagination.pageSize };
      if (activeTab !== 'all') {
        params.status = activeTab;
      }
      const data: OrderPageResponse = await getOrderList(params);
      setOrders(data.list);
      setPagination(prev => ({
        ...prev,
        total: data.total,
        totalPages: data.totalPages,
      }));
    } catch (error) {
      console.error('Failed to load orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [pagination.page, activeTab]);

  // 处理订单操作
  const handleCancel = async (order: Order) => {
    Modal.confirm({
      title: '确认取消',
      content: '确定要取消此订单吗？',
      onOk: async () => {
        try {
          await cancelOrder(order.id);
          message.success('订单已取消');
          loadOrders();
        } catch (error: any) {
          message.error(error.message || '操作失败');
        }
      },
    });
  };

  const handlePay = async (order: Order) => {
    try {
      await payOrder(order.id);
      message.success('支付成功');
      loadOrders();
    } catch (error: any) {
      message.error(error.message || '支付失败');
    }
  };

  const handleShip = async (order: Order) => {
    try {
      await shipOrder(order.id);
      message.success('发货成功');
      loadOrders();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const handleConfirm = async (order: Order) => {
    try {
      await confirmOrder(order.id);
      message.success('确认收货成功');
      loadOrders();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  // 获取订单操作按钮
  const getOrderActions = (order: Order) => {
    const actions: React.ReactNode[] = [];

    // 查看详情
    actions.push(
      <Button key="view" type="link" icon={<EyeOutlined />} onClick={() => navigate(`/orders/${order.id}`)}>
        查看
      </Button>
    );

    // 待支付 - 买家操作
    if (order.status === 'PENDING' && order.buyerId === currentUserId) {
      actions.push(
        <Button key="pay" type="primary" onClick={() => handlePay(order)}>
          支付
        </Button>,
        <Button key="cancel" danger onClick={() => handleCancel(order)}>
          取消
        </Button>
      );
    }

    // 已支付 - 卖家操作
    if (order.status === 'PAID' && order.sellerId === currentUserId) {
      actions.push(
        <Button key="ship" type="primary" icon={<CarOutlined />} onClick={() => handleShip(order)}>
          发货
        </Button>
      );
    }

    // 已发货 - 买家操作
    if (order.status === 'SHIPPED' && order.buyerId === currentUserId) {
      actions.push(
        <Button key="confirm" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleConfirm(order)}>
          确认收货
        </Button>
      );
    }

    // 待支付 - 卖家可取消
    if (order.status === 'PENDING' && order.sellerId === currentUserId) {
      actions.push(
        <Button key="cancel" danger icon={<CloseCircleOutlined />} onClick={() => handleCancel(order)}>
          取消
        </Button>
      );
    }

    return actions;
  };

  // 表格列定义
  const columns = [
    {
      title: '商品信息',
      dataIndex: 'productTitle',
      key: 'productTitle',
      render: (title: string, record: Order) => (
        <div className="order-product">
          <Image
            src={record.productImage || 'https://via.placeholder.com/80x80?text=No+Image'}
            width={60}
            height={60}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="https://via.placeholder.com/80x80?text=Error"
          />
          <Text ellipsis style={{ marginLeft: 12, maxWidth: 200 }}>{title}</Text>
        </div>
      ),
    },
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => <Text strong>¥{price.toFixed(2)}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string, record: Order) => (
        <Space direction="vertical" size={0}>
          <Tag color={STATUS_MAP[status]?.color || 'default'}>
            {STATUS_MAP[status]?.text || status}
          </Tag>
          {record.refundStatus && record.refundStatus !== 'NONE' && (
            <Tag color={REFUND_STATUS_MAP[record.refundStatus]?.color || 'default'} style={{ fontSize: 10 }}>
              {REFUND_STATUS_MAP[record.refundStatus]?.text}
            </Tag>
          )}
          {record.disputeStatus && record.disputeStatus !== 'NONE' && (
            <Tag color={DISPUTE_STATUS_MAP[record.disputeStatus]?.color || 'default'} style={{ fontSize: 10 }}>
              {DISPUTE_STATUS_MAP[record.disputeStatus]?.text}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '交易方式',
      dataIndex: 'tradeType',
      key: 'tradeType',
      width: 100,
      render: (type: string) => type === 'ONLINE' ? '线上交易' : '线下交易',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Order) => (
        <Space size="small">{getOrderActions(record)}</Space>
      ),
    },
  ];

  const tabItems = [
    { key: 'all', label: '全部订单' },
    { key: 'PENDING', label: '待支付' },
    { key: 'PAID', label: '已支付' },
    { key: 'SHIPPED', label: '待收货' },
    { key: 'COMPLETED', label: '已完成' },
    { key: 'CANCELLED', label: '已取消' },
    { key: 'REFUNDING', label: <><ExclamationCircleOutlined /> 退款中</> },
    { key: 'DISPUTING', label: <><WarningOutlined /> 纠纷中</> },
  ];

  return (
    <div className="orders-page">
      <div className="page-header">
        <Title level={2}>我的订单</Title>
        <Text type="secondary">查看和管理您的订单</Text>
      </div>

      <Card className="orders-card">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={tabItems}
        />

        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={loading}
          locale={{
            emptyText: <Empty description="暂无订单" />,
          }}
          pagination={{
            current: pagination.page,
            pageSize: pagination.pageSize,
            total: pagination.total,
            onChange: (page) => setPagination(prev => ({ ...prev, page })),
            showTotal: (total) => `共 ${total} 条订单`,
          }}
        />
      </Card>
    </div>
  );
}
