import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Typography, Image, Spin, Modal, message, Timeline } from 'antd';
import { ArrowLeftOutlined, CloseCircleOutlined, CarOutlined, CheckCircleOutlined, PayCircleOutlined } from '@ant-design/icons';
import { getOrder, cancelOrder, payOrder, shipOrder, confirmOrder } from '../services/order';
import type { Order } from '../services/order';
import './OrderDetailPage.css';

const { Title, Text } = Typography;

// 订单状态映射
const STATUS_MAP: Record<string, { color: string; text: string }> = {
  PENDING: { color: 'orange', text: '待支付' },
  PAID: { color: 'blue', text: '已支付' },
  SHIPPED: { color: 'cyan', text: '已发货' },
  COMPLETED: { color: 'green', text: '已完成' },
  CANCELLED: { color: 'red', text: '已取消' },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [currentUserId] = useState(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.userId;
      } catch {
        return null;
      }
    }
    return null;
  });

  // 加载订单详情
  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await getOrder(Number(id));
      setOrder(data);
    } catch (error) {
      console.error('Failed to load order:', error);
      message.error('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrder();
  }, [id]);

  // 处理订单操作
  const handleCancel = async () => {
    if (!order) return;
    Modal.confirm({
      title: '确认取消',
      content: '确定要取消此订单吗？',
      onOk: async () => {
        try {
          await cancelOrder(order.id);
          message.success('订单已取消');
          loadOrder();
        } catch (error: any) {
          message.error(error.message || '操作失败');
        }
      },
    });
  };

  const handlePay = async () => {
    if (!order) return;
    try {
      await payOrder(order.id);
      message.success('支付成功');
      loadOrder();
    } catch (error: any) {
      message.error(error.message || '支付失败');
    }
  };

  const handleShip = async () => {
    if (!order) return;
    try {
      await shipOrder(order.id);
      message.success('发货成功');
      loadOrder();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const handleConfirm = async () => {
    if (!order) return;
    try {
      await confirmOrder(order.id);
      message.success('确认收货成功');
      loadOrder();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  // 获取订单操作按钮
  const getActions = () => {
    if (!order) return [];

    const actions: React.ReactNode[] = [];

    // 待支付 - 买家操作
    if (order.status === 'PENDING' && order.buyerId === currentUserId) {
      actions.push(
        <Button key="pay" type="primary" size="large" icon={<PayCircleOutlined />} onClick={handlePay}>
          立即支付
        </Button>,
        <Button key="cancel" danger size="large" icon={<CloseCircleOutlined />} onClick={handleCancel}>
          取消订单
        </Button>
      );
    }

    // 已支付 - 卖家操作
    if (order.status === 'PAID' && order.sellerId === currentUserId) {
      actions.push(
        <Button key="ship" type="primary" size="large" icon={<CarOutlined />} onClick={handleShip}>
          发货
        </Button>
      );
    }

    // 已发货 - 买家操作
    if (order.status === 'SHIPPED' && order.buyerId === currentUserId) {
      actions.push(
        <Button key="confirm" type="primary" size="large" icon={<CheckCircleOutlined />} onClick={handleConfirm}>
          确认收货
        </Button>
      );
    }

    // 待支付 - 卖家可取消
    if (order.status === 'PENDING' && order.sellerId === currentUserId) {
      actions.push(
        <Button key="cancel" danger size="large" icon={<CloseCircleOutlined />} onClick={handleCancel}>
          取消订单
        </Button>
      );
    }

    return actions;
  };

  // 订单状态时间线
  const getTimelineItems = () => {
    if (!order) return [];

    const items = [
      { status: '创建订单', time: order.createdAt, dot: '📝' },
    ];

    if (order.status === 'PAID' || order.status === 'SHIPPED' || order.status === 'COMPLETED') {
      items.push({ status: '已支付', time: order.updatedAt, dot: '💰' });
    }

    if (order.status === 'SHIPPED' || order.status === 'COMPLETED') {
      items.push({ status: '已发货', time: order.updatedAt, dot: '📦' });
    }

    if (order.status === 'COMPLETED') {
      items.push({ status: '已完成', time: order.updatedAt, dot: '✅' });
    }

    if (order.status === 'CANCELLED') {
      items.push({ status: '已取消', time: order.updatedAt, dot: '❌' });
    }

    return items;
  };

  if (loading) {
    return (
      <div className="order-detail-loading">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="order-detail-page">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')}>
          返回订单列表
        </Button>
        <Empty description="订单不存在" style={{ marginTop: 40 }} />
      </div>
    );
  }

  const isBuyer = order.buyerId === currentUserId;
  const isSeller = order.sellerId === currentUserId;

  return (
    <div className="order-detail-page">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/orders')} className="back-button">
        返回订单列表
      </Button>

      <Card className="order-info-card">
        <div className="order-header">
          <div>
            <Title level={3}>订单详情</Title>
            <Text type="secondary">订单号：{order.orderNo}</Text>
          </div>
          <Tag color={STATUS_MAP[order.status]?.color} className="status-tag">
            {STATUS_MAP[order.status]?.text}
          </Tag>
        </div>

        <Descriptions bordered column={2} className="order-descriptions">
          <Descriptions.Item label="商品信息" span={2}>
            <div className="product-info">
              <Image
                src={order.productImage || 'https://via.placeholder.com/80x80?text=No+Image'}
                width={80}
                height={80}
                style={{ objectFit: 'cover', borderRadius: 4 }}
                fallback="https://via.placeholder.com/80x80?text=Error"
              />
              <Text strong style={{ marginLeft: 12 }}>{order.productTitle}</Text>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="商品价格">
            <Text strong className="price">¥{order.price.toFixed(2)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="交易方式">
            {order.tradeType === 'ONLINE' ? '线上交易' : '线下交易'}
          </Descriptions.Item>
          <Descriptions.Item label="交易地点">
            {order.tradeLocation || '未填写'}
          </Descriptions.Item>
          <Descriptions.Item label="买家">
            {order.buyerNickname}
          </Descriptions.Item>
          <Descriptions.Item label="卖家">
            {order.sellerNickname}
          </Descriptions.Item>
          <Descriptions.Item label="下单时间">
            {new Date(order.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            {new Date(order.updatedAt).toLocaleString()}
          </Descriptions.Item>
          {order.remark && (
            <Descriptions.Item label="备注" span={2}>
              {order.remark}
            </Descriptions.Item>
          )}
        </Descriptions>

        <div className="order-actions">
          <Space>{getActions()}</Space>
        </div>
      </Card>

      <Card className="order-timeline-card" title="订单流程">
        <Timeline items={getTimelineItems()} />
      </Card>
    </div>
  );
}
