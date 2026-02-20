import { useState, useEffect } from 'react';
import { Table, Card, Select, Input, Button, DatePicker, Space, Tag, Modal, message, Statistic, Row, Col, Rate } from 'antd';
import { DeleteOutlined, ReloadOutlined, StarFilled } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getReviewList, getReviewStats, deleteReview } from '../services/admin';
import type { AdminReview } from '../services/admin';

const { RangePicker } = DatePicker;
const { Option } = Select;

const AdminReviewsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AdminReview[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [stats, setStats] = useState<any>({});
  const [filters, setFilters] = useState({
    rating: undefined as number | undefined,
    keyword: '',
    startDate: '',
    endDate: '',
  });
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<AdminReview | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getReviewList({
        page,
        pageSize,
        rating: filters.rating,
        keyword: filters.keyword || undefined,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
      });
      setData(res.records);
      setTotal(res.total);
    } catch (error) {
      console.error('获取评价列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await getReviewStats();
      setStats(res);
    } catch (error) {
      console.error('获取评价统计失败:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [page, pageSize]);

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleDelete = async () => {
    if (!selectedReview) return;
    try {
      await deleteReview(selectedReview.id);
      message.success('评价已删除');
      setDeleteModalVisible(false);
      setSelectedReview(null);
      fetchData();
      fetchStats();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const openDeleteModal = (review: AdminReview) => {
    setSelectedReview(review);
    setDeleteModalVisible(true);
  };

  const columns: ColumnsType<AdminReview> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: '订单ID',
      dataIndex: 'orderId',
      key: 'orderId',
      width: 100,
    },
    {
      title: '评价人ID',
      dataIndex: 'reviewerId',
      key: 'reviewerId',
      width: 100,
    },
    {
      title: '被评价人ID',
      dataIndex: 'targetUserId',
      key: 'targetUserId',
      width: 110,
    },
    {
      title: '评分',
      dataIndex: 'rating',
      key: 'rating',
      width: 150,
      render: (rating: number) => (
        <span>
          <Rate disabled value={rating} style={{ fontSize: 14 }} />
          <span style={{ marginLeft: 8 }}>{rating}星</span>
        </span>
      ),
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 150,
      render: (tags: string) => {
        if (!tags) return '-';
        const tagList = tags.split(',');
        return (
          <Space wrap>
            {tagList.map((tag, i) => (
              <Tag key={i} color="blue">{tag}</Tag>
            ))}
          </Space>
        );
      },
    },
    {
      title: '回复',
      dataIndex: 'reply',
      key: 'reply',
      width: 150,
      render: (reply: string) => reply || '-',
    },
    {
      title: '匿名',
      dataIndex: 'anonymous',
      key: 'anonymous',
      width: 80,
      render: (anon: number) => anon ? <Tag color="green">是</Tag> : <Tag>否</Tag>,
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Button
          type="link"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => openDeleteModal(record)}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col span={4}>
          <Card>
            <Statistic title="总评价数" value={stats.total || 0} />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="平均评分"
              value={stats.avgRating || 0}
              prefix={<StarFilled style={{ color: '#faad14' }} />}
              suffix="分"
            />
          </Card>
        </Col>
        <Col span={2}>
          <Card>
            <Statistic title="1星" value={stats.star1 || 0} valueStyle={{ color: '#ff4d4f' }} />
          </Card>
        </Col>
        <Col span={2}>
          <Card>
            <Statistic title="2星" value={stats.star2 || 0} valueStyle={{ color: '#ff7a45' }} />
          </Card>
        </Col>
        <Col span={2}>
          <Card>
            <Statistic title="3星" value={stats.star3 || 0} valueStyle={{ color: '#ffa940' }} />
          </Card>
        </Col>
        <Col span={2}>
          <Card>
            <Statistic title="4星" value={stats.star4 || 0} valueStyle={{ color: '#ffc53d' }} />
          </Card>
        </Col>
        <Col span={2}>
          <Card>
            <Statistic title="5星" value={stats.star5 || 0} valueStyle={{ color: '#73d13d' }} />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            placeholder="搜索评价内容"
            style={{ width: 200 }}
            value={filters.keyword}
            onChange={e => handleFilterChange('keyword', e.target.value)}
            onSearch={handleSearch}
            enterButton
          />
          <Select
            placeholder="评分筛选"
            style={{ width: 120 }}
            value={filters.rating}
            onChange={value => handleFilterChange('rating', value)}
            allowClear
          >
            <Option value={1}>1星</Option>
            <Option value={2}>2星</Option>
            <Option value={3}>3星</Option>
            <Option value={4}>4星</Option>
            <Option value={5}>5星</Option>
          </Select>
          <RangePicker
            onChange={(dates) => {
              handleFilterChange('startDate', dates?.[0]?.format('YYYY-MM-DD') || '');
              handleFilterChange('endDate', dates?.[1]?.format('YYYY-MM-DD') || '');
            }}
          />
          <Button icon={<ReloadOutlined />} onClick={handleSearch}>查询</Button>
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
        title="删除评价"
        open={deleteModalVisible}
        onOk={handleDelete}
        onCancel={() => {
          setDeleteModalVisible(false);
          setSelectedReview(null);
        }}
        okText="确认删除"
        okButtonProps={{ danger: true }}
      >
        <p>确定要删除这条评价吗？</p>
        <p>评价内容: {selectedReview?.content}</p>
      </Modal>
    </div>
  );
};

export default AdminReviewsPage;
