import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Descriptions, Tag, Button, Space, Typography, Image, Spin, Modal, message, Timeline, Empty, Form, Input, Alert } from 'antd';
import { ArrowLeftOutlined, CloseCircleOutlined, CarOutlined, CheckCircleOutlined, PayCircleOutlined, ExclamationCircleOutlined, WarningOutlined, StarOutlined } from '@ant-design/icons';
import { getOrder, cancelOrder, payOrder, shipOrder, confirmOrder, applyRefund, approveRefund, rejectRefund, applyDispute } from '../services/order';
import { checkReview } from '../services/review';
import type { Order } from '../services/order';
import './OrderDetailPage.css';
import ReviewForm from './ReviewFormPage';

const { Title, Text } = Typography;

// 订单状态映射
const STATUS_MAP: Record<string, { color: string; text: string }> = {
  PENDING: { color: 'orange', text: '待支付' },
  PAID: { color: 'blue', text: '已支付' },
  SHIPPED: { color: 'cyan', text: '已发货' },
  COMPLETED: { color: 'green', text: '已完成' },
  CANCELLED: { color: 'red', text: '已取消' },
};

const REFUND_STATUS_MAP: Record<string, { color: string; text: string }> = {
  NONE: { color: 'default', text: '无退款' },
  APPLYING: { color: 'orange', text: '退款申请中' },
  APPROVED: { color: 'green', text: '已退款' },
  REJECTED: { color: 'red', text: '退款被拒绝' },
};

const DISPUTE_STATUS_MAP: Record<string, { color: string; text: string }> = {
  NONE: { color: 'default', text: '无纠纷' },
  APPLYING: { color: 'orange', text: '纠纷申诉中' },
  PROCESSING: { color: 'blue', text: '纠纷处理中' },
  RESOLVED: { color: 'green', text: '纠纷已解决' },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<Order | null>(null);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [disputeModalVisible, setDisputeModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [refundForm] = Form.useForm();
  const [disputeForm] = Form.useForm();
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

  // 加载订单详情
  const loadOrder = async () => {
    setLoading(true);
    try {
      const data = await getOrder(Number(id));
      setOrder(data);

      // 检查是否已评价（仅对已完成订单）
      if (data.status === 'COMPLETED' && currentUserId) {
        try {
          const reviewRes = await checkReview(data.id);
          setHasReviewed(reviewRes.data);
        } catch (error) {
          console.error('检查评价状态失败', error);
        }
      }
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

  // 申请退款
  const handleApplyRefund = async (values: { reason: string }) => {
    if (!order) return;
    try {
      await applyRefund(order.id, values.reason);
      message.success('退款申请已提交');
      setRefundModalVisible(false);
      refundForm.resetFields();
      loadOrder();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  // 同意退款
  const handleApproveRefund = async () => {
    if (!order) return;
    Modal.confirm({
      title: '确认退款',
      content: '确定要同意此退款申请吗？退款后订单将被取消。',
      onOk: async () => {
        try {
          await approveRefund(order.id);
          message.success('已同意退款');
          loadOrder();
        } catch (error: any) {
          message.error(error.message || '操作失败');
        }
      },
    });
  };

  // 拒绝退款
  const handleRejectRefund = async () => {
    if (!order) return;
    Modal.confirm({
      title: '拒绝退款',
      content: '确定要拒绝此退款申请吗？',
      onOk: async () => {
        try {
          await rejectRefund(order.id);
          message.success('已拒绝退款');
          loadOrder();
        } catch (error: any) {
          message.error(error.message || '操作失败');
        }
      },
    });
  };

  // 发起纠纷
  const handleApplyDispute = async (values: { reason: string; evidence: string }) => {
    if (!order) return;
    try {
      await applyDispute(order.id, values.reason, values.evidence);
      message.success('纠纷申诉已提交');
      setDisputeModalVisible(false);
      disputeForm.resetFields();
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

    // 已支付/已发货 - 买家可申请退款和纠纷
    if ((order.status === 'PAID' || order.status === 'SHIPPED') && order.buyerId === currentUserId) {
      if (!order.refundStatus || order.refundStatus === 'NONE' || order.refundStatus === 'REJECTED') {
        actions.push(
          <Button key="refund" size="large" icon={<ExclamationCircleOutlined />} onClick={() => setRefundModalVisible(true)}>
            申请退款
          </Button>
        );
      }
      if (!order.disputeStatus || order.disputeStatus === 'NONE' || order.disputeStatus === 'RESOLVED') {
        actions.push(
          <Button key="dispute" danger size="large" icon={<WarningOutlined />} onClick={() => setDisputeModalVisible(true)}>
            发起纠纷
          </Button>
        );
      }
    }

    // 已支付/已发货 - 卖家可处理退款
    if ((order.status === 'PAID' || order.status === 'SHIPPED') && order.sellerId === currentUserId) {
      if (order.refundStatus === 'APPLYING') {
        actions.push(
          <Button key="approveRefund" type="primary" size="large" icon={<CheckCircleOutlined />} onClick={handleApproveRefund}>
            同意退款
          </Button>,
          <Button key="rejectRefund" danger size="large" icon={<CloseCircleOutlined />} onClick={handleRejectRefund}>
            拒绝退款
          </Button>
        );
      }
    }

    // 已完成订单 - 买家可发起纠纷
    if (order.status === 'COMPLETED' && order.buyerId === currentUserId) {
      if (!order.disputeStatus || order.disputeStatus === 'NONE' || order.disputeStatus === 'RESOLVED') {
        actions.push(
          <Button key="dispute" danger size="large" icon={<WarningOutlined />} onClick={() => setDisputeModalVisible(true)}>
            发起纠纷
          </Button>
        );
      }
    }

    // 已完成订单 - 买卖双方都可评价
    if (order.status === 'COMPLETED' && currentUserId) {
      if (!hasReviewed) {
        actions.push(
          <Button key="review" type="primary" size="large" icon={<StarOutlined />} onClick={() => setReviewModalVisible(true)}>
            评价
          </Button>
        );
      } else {
        // 已评价，可以查看评价
        actions.push(
          <Button key="viewReview" size="large" icon={<StarOutlined />} onClick={() => navigate(`/user/${order.sellerId === currentUserId ? order.buyerId : order.sellerId}/reviews`)}>
            查看评价
          </Button>
        );
      }
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

      {/* 退款状态 */}
      {order.refundStatus && order.refundStatus !== 'NONE' && (
        <Card className="order-refund-card" title="退款信息">
          <Alert
            message={`退款状态: ${REFUND_STATUS_MAP[order.refundStatus]?.text || '未知'}`}
            description={order.refundReason ? `退款原因: ${order.refundReason}` : undefined}
            type={order.refundStatus === 'APPROVED' ? 'success' : order.refundStatus === 'REJECTED' ? 'error' : 'warning'}
            showIcon
          />
          {order.refundTime && (
            <p style={{ marginTop: 12, color: '#888' }}>退款时间: {new Date(order.refundTime).toLocaleString()}</p>
          )}
        </Card>
      )}

      {/* 纠纷状态 */}
      {order.disputeStatus && order.disputeStatus !== 'NONE' && (
        <Card className="order-dispute-card" title="纠纷信息">
          <Alert
            message={`纠纷状态: ${DISPUTE_STATUS_MAP[order.disputeStatus]?.text || '未知'}`}
            description={
              <>
                {order.disputeReason && <p>纠纷原因: {order.disputeReason}</p>}
                {order.disputeEvidence && <p>纠纷证据: {order.disputeEvidence}</p>}
                {order.disputeResult && <p>处理结果: {order.disputeResult}</p>}
              </>
            }
            type={order.disputeStatus === 'RESOLVED' ? 'success' : 'error'}
            showIcon
          />
          {order.disputeTime && (
            <p style={{ marginTop: 12, color: '#888' }}>申诉时间: {new Date(order.disputeTime).toLocaleString()}</p>
          )}
          {order.resolveTime && (
            <p style={{ color: '#888' }}>解决时间: {new Date(order.resolveTime).toLocaleString()}</p>
          )}
        </Card>
      )}

      {/* 退款申请弹窗 */}
      <Modal
        title="申请退款"
        open={refundModalVisible}
        onCancel={() => {
          setRefundModalVisible(false);
          refundForm.resetFields();
        }}
        footer={null}
      >
        <Form form={refundForm} onFinish={handleApplyRefund} layout="vertical">
          <Form.Item
            name="reason"
            label="退款原因"
            rules={[{ required: true, message: '请输入退款原因' }]}
          >
            <Input.TextArea rows={4} placeholder="请详细描述退款原因..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交退款申请
              </Button>
              <Button onClick={() => setRefundModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 纠纷申请弹窗 */}
      <Modal
        title="发起纠纷"
        open={disputeModalVisible}
        onCancel={() => {
          setDisputeModalVisible(false);
          disputeForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form form={disputeForm} onFinish={handleApplyDispute} layout="vertical">
          <Form.Item
            name="reason"
            label="纠纷原因"
            rules={[{ required: true, message: '请输入纠纷原因' }]}
          >
            <Input.TextArea rows={3} placeholder="请详细描述纠纷原因..." />
          </Form.Item>
          <Form.Item
            name="evidence"
            label="证据描述"
            rules={[{ required: true, message: '请描述您的证据' }]}
          >
            <Input.TextArea rows={3} placeholder="请描述您掌握的证据..." />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                提交纠纷申诉
              </Button>
              <Button onClick={() => setDisputeModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* 评价弹窗 */}
      <ReviewForm
        orderId={order?.id || 0}
        visible={reviewModalVisible}
        onClose={() => setReviewModalVisible(false)}
        onSuccess={() => {
          loadOrder();
        }}
      />
    </div>
  );
}
