import { useState, useEffect } from 'react';
import { Table, Card, Select, Input, Button, DatePicker, Space, Tag, Modal, message, Statistic, Row, Col } from 'antd';
import { DeleteOutlined, ExportOutlined, ReloadOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getOrderList, getOrderStats, cancelOrder, exportOrders } from '../services/admin';
import type { AdminOrder } from '../services/admin';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminOrdersPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminOrder[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stats, setStats] = useState<any>({});
  const [filters, setFilters] = useState({
    status: '',
    keyword: '',
    startDate: '',
    endDate: '',
  });
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getOrderList({
        page,
        pageSize,
        status: filters.status || undefined,
        keyword: filters.keyword || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setData(res.records);
      setTotal(res.total);
    } catch (error) {
      console.error('获取订单列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getOrderStats();
      setStats(res);
    } catch (error) {
      console.error('获取订单统计失败:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [page, pageSize]);

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleCancel = async () => {
    if (!selectedOrder || !cancelReason) {
      message.warning('请输入取消原因');
      return;
    }
    try {
      await cancelOrder(selectedOrder.id, cancelReason);
      message.success('订单已取消');
      setCancelModalVisible(false);
      setCancelReason('');
      setSelectedOrder(null);
      fetchData();
      fetchStats();
    } catch (error) {
      message.error('取消失败');
    }
  };

  const openCancelModal = (order: AdminOrder) => {
    setSelectedOrder(order);
    setCancelModalVisible(true);
  };

  const statusMap: Record<string, { color: string; text: string }> = {
    PENDING: { color: 'orange', text: '待支付' },
    PAID: { color: 'blue', text: '已支付' },
    SHIPPED: { color: 'cyan', text: '已发货' },
    COMPLETED: { color: 'green', text: '已完成' },
    CANCELLED: { color: 'red', text: '已取消' },
  };

  const columns: ColumnsType<AdminOrder> = [
    {
      title: '订单号',
      dataIndex: 'orderNo',
      key: 'orderNo',
      width: 180,
    },
    {
      title: '商品ID',
      dataIndex: 'productId',
      key: 'productId',
      width: 100,
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      render: (price: number) => `¥${price}`,
    },
    {
      title: '买家ID',
      dataIndex: 'buyerId',
      key: 'buyerId',
      width: 100,
    },
    {
      title: '卖家ID',
      dataIndex: 'sellerId',
      key: 'sellerId',
      width: 100,
    },
    {
      title: '交易方式',
      dataIndex: 'tradeType',
      key: 'tradeType',
      width: 100,
      render: (type: string) => type === 'ONLINE' ? '线上' : '线下',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const info = statusMap[status] || { color: 'default', text: status };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '退款状态',
      dataIndex: 'refundStatus',
      key: 'refundStatus',
      width: 100,
      render: (status: string) => {
        if (!status || status === 'NONE') return '-';
        const map: Record<string, string> = {
          APPLYING: '申请中',
          APPROVED: '已退款',
          REJECTED: '已拒绝',
        };
        return <Tag color="orange">{map[status] || status}</Tag>;
      },
    },
    {
      title: '纠纷状态',
      dataIndex: 'disputeStatus',
      key: 'disputeStatus',
      width: 100,
      render: (status: string) => {
        if (!status || status === 'NONE') return '-';
        const map: Record<string, string> = {
          APPLYING: '申诉中',
          PROCESSING: '处理中',
          RESOLVED: '已解决',
        };
        return <Tag color="red">{map[status] || status}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          {record.status !== 'CANCELLED' && record.status !== 'COMPLETED' && (
            <Button
              type="link"
              danger
              size="small"
              onClick={() => openCancelModal(record)}
            >
              取消
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card>
            <Statistic title="总订单" value={stats.total || 0} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="待支付" value={stats.pending || 0} valueStyle={{ color: 'orange' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="已支付" value={stats.paid || 0} valueStyle={{ color: 'blue' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="已完成" value={stats.completed || 0} valueStyle={{ color: 'green' }} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic title="已取消" value={stats.cancelled || 0} valueStyle={{ color: 'red' }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            placeholder="搜索订单号"
            style={{ width: 200 }}
            value={filters.keyword}
            onChange={e => handleFilterChange('keyword', e.target.value)}
            onSearch={handleSearch}
            enterButton
          />
          <Select
            placeholder="订单状态"
            style={{ width: 120 }}
            value={filters.status}
            onChange={value => handleFilterChange('status', value)}
            allowClear
          >
            <Option value="PENDING">待支付</Option>
            <Option value="PAID">已支付</Option>
            <Option value="SHIPPED">已发货</Option>
            <Option value="COMPLETED">已完成</Option>
            <Option value="CANCELLED">已取消</Option>
          </Select>
          <RangePicker
            onChange={(dates) => {
              handleFilterChange('startDate', dates?.[0]?.format('YYYY-MM-DD') || '');
              handleFilterChange('endDate', dates?.[1]?.format('YYYY-MM-DD') || '');
            }}
          />
          <Button icon={<ReloadOutlined />} onClick={handleSearch}>查询</Button>
          <Button icon={<ExportOutlined />} onClick={() => exportOrders({
            status: filters.status || undefined,
            startDate: filters.startDate || undefined,
            endDate: filters.endDate || undefined,
          })}>
            导出
          </Button>
        </Space>
      </Card>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
        scroll={{ x: 1200 }}
      />

      <Modal
        title="取消订单"
        open={cancelModalVisible}
        onOk={handleCancel}
        onCancel={() => {
          setCancelModalVisible(false);
          setCancelReason('');
        }}
      >
        <p>订单号: {selectedOrder?.orderNo}</p>
        <Input.TextArea
          placeholder="请输入取消原因"
          rows={3}
          value={cancelReason}
          onChange={e => setCancelReason(e.target.value)}
        />
      </Modal>
    </div>
  );
};

export default AdminOrdersPage;
