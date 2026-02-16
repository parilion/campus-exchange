import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, Table, Tag, Button, Space, Typography, Spin, message, Modal } from 'antd';
import { ArrowLeftOutlined, CheckOutlined, CloseOutlined, StopOutlined } from '@ant-design/icons';
import { getUserBargains, acceptBargain, rejectBargain, cancelBargain, type Bargain, type PageResponse } from '../services/bargain';
import './BargainsPage.css';

const { Title, Text } = Typography;

const STATUS_MAP: Record<string, { color: string; text: string }> = {
  PENDING: { color: 'orange', text: '待处理' },
  ACCEPTED: { color: 'green', text: '已接受' },
  REJECTED: { color: 'red', text: '已拒绝' },
  CANCELLED: { color: 'default', text: '已取消' },
};

export default function BargainsPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bargains, setBargains] = useState<Bargain[]>([]);
  const [total, setTotal] = useState(0);
  const [current, setCurrent] = useState(1);
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

  const loadBargains = async (page: number = 1) => {
    setLoading(true);
    try {
      const res = await getUserBargains(page, 10);
      const data = res.data as unknown as PageResponse<Bargain>;
      setBargains(data.records);
      setTotal(data.total);
      setCurrent(data.current);
    } catch (error) {
      console.error('Failed to load bargains:', error);
      message.error('加载议价记录失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBargains();
  }, []);

  const handleAccept = async (bargain: Bargain) => {
    try {
      await acceptBargain(bargain.id);
      message.success('已接受议价');
      loadBargains(current);
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const handleReject = async (bargain: Bargain) => {
    try {
      await rejectBargain(bargain.id);
      message.success('已拒绝议价');
      loadBargains(current);
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const handleCancel = async (bargain: Bargain) => {
    Modal.confirm({
      title: '确认取消议价',
      content: '确定要取消此议价吗？',
      onOk: async () => {
        try {
          await cancelBargain(bargain.id);
          message.success('已取消议价');
          loadBargains(current);
        } catch (error: any) {
          message.error(error.message || '操作失败');
        }
      },
    });
  };

  const columns = [
    {
      title: '商品',
      dataIndex: 'productTitle',
      key: 'productTitle',
      render: (title: string, record: Bargain) => (
        <div className="product-cell">
          <img
            src={record.productImage || 'https://via.placeholder.com/60x60?text=No+Image'}
            alt={title}
            className="product-image"
          />
          <Text ellipsis={{ tooltip: title }} style={{ maxWidth: 150 }}>{title}</Text>
        </div>
      ),
    },
    {
      title: '价格',
      key: 'price',
      render: (_: any, record: Bargain) => (
        <div>
          <Text delete>¥{record.originalPrice.toFixed(2)}</Text>
          <br />
          <Text strong type="success">¥{record.proposedPrice.toFixed(2)}</Text>
        </div>
      ),
    },
    {
      title: '角色',
      key: 'role',
      render: (_: any, record: Bargain) => {
        const isBargainer = record.bargainerId === currentUserId;
        return (
          <Tag color={isBargainer ? 'blue' : 'purple'}>
            {isBargainer ? '我发起' : '我收到'}
          </Tag>
        );
      },
    },
    {
      title: '对方',
      key: 'targetUser',
      render: (_: any, record: Bargain) => {
        const isBargainer = record.bargainerId === currentUserId;
        return isBargainer ? record.targetUserNickname : record.bargainerNickname;
      },
    },
    {
      title: '留言',
      dataIndex: 'message',
      key: 'message',
      render: (message: string) => message || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={STATUS_MAP[status]?.color}>
          {STATUS_MAP[status]?.text}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Bargain) => {
        const isBargainer = record.bargainerId === currentUserId;
        const isPending = record.status === 'PENDING';

        if (isPending && !isBargainer) {
          // 卖家可以接受或拒绝
          return (
            <Space>
              <Button
                type="primary"
                size="small"
                icon={<CheckOutlined />}
                onClick={() => handleAccept(record)}
              >
                接受
              </Button>
              <Button
                danger
                size="small"
                icon={<CloseOutlined />}
                onClick={() => handleReject(record)}
              >
                拒绝
              </Button>
            </Space>
          );
        }

        if (isPending && isBargainer) {
          // 买家可以取消
          return (
            <Button
              size="small"
              icon={<StopOutlined />}
              onClick={() => handleCancel(record)}
            >
              取消
            </Button>
          );
        }

        return null;
      },
    },
  ];

  return (
    <div className="bargains-page">
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/')} className="back-button">
        返回首页
      </Button>

      <Card>
        <Title level={4}>我的议价</Title>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            dataSource={bargains}
            columns={columns}
            rowKey="id"
            pagination={{
              current,
              total,
              pageSize: 10,
              onChange: loadBargains,
            }}
            locale={{ emptyText: '暂无议价记录' }}
          />
        )}
      </Card>
    </div>
  );
}
