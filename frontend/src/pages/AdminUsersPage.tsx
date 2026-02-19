import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Input,
  Select,
  Tag,
  Space,
  Modal,
  Form,
  message,
  Popconfirm,
  Card,
  Row,
  Col,
  Statistic,
  Avatar,
  DatePicker,
} from 'antd';
import {
  SearchOutlined,
  UserAddOutlined,
  StopOutlined,
  CheckOutlined,
  DeleteOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getUserList, banUser, unbanUser, deleteUser, setUserAsAdmin, removeUserAdmin, getUserStats } from '../services/admin';
import type { User } from '../types';

const { RangePicker } = DatePicker;

const AdminUsersPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<User[]>([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [filters, setFilters] = useState({ keyword: '', role: '', enabled: undefined as boolean | undefined });
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalEnabled: 0,
    totalDisabled: 0,
    totalAdmins: 0,
    totalVerified: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getUserList({
        page: pagination.current,
        pageSize: pagination.pageSize,
        ...filters,
      });
      setData(result.records || []);
      setPagination({ ...pagination, total: result.total || 0 });
    } catch (error: any) {
      message.error(error.message || '获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const result = await getUserStats();
      setStats(result);
    } catch (error) {
      console.error('获取统计数据失败', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    setPagination({ ...pagination, current: 1 });
    fetchData();
  }, [filters]);

  const handleBan = async (userId: number) => {
    try {
      await banUser(userId);
      message.success('用户已封禁');
      fetchData();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const handleUnban = async (userId: number) => {
    try {
      await unbanUser(userId);
      message.success('用户已解封');
      fetchData();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const handleDelete = async (userId: number) => {
    try {
      await deleteUser(userId);
      message.success('用户已删除');
      fetchData();
      fetchStats();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const handleSetAdmin = async (userId: number) => {
    try {
      await setUserAsAdmin(userId);
      message.success('已设置为管理员');
      fetchData();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const handleRemoveAdmin = async (userId: number) => {
    try {
      await removeUserAdmin(userId);
      message.success('已取消管理员权限');
      fetchData();
    } catch (error: any) {
      message.error(error.message || '操作失败');
    }
  };

  const columns: ColumnsType<User> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 70,
      render: (avatar: string) => (
        <Avatar src={avatar} icon={<UserOutlined />} />
      ),
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
      key: 'nickname',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      width: 100,
      render: (role: string) => (
        <Tag color={role === 'ADMIN' ? 'red' : 'blue'}>
          {role === 'ADMIN' ? '管理员' : '用户'}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 80,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'red'}>
          {enabled ? '正常' : '禁用'}
        </Tag>
      ),
    },
    {
      title: '实名认证',
      dataIndex: 'verified',
      key: 'verified',
      width: 100,
      render: (verified: boolean) => (
        <Tag color={verified ? 'green' : 'default'}>
          {verified ? '已认证' : '未认证'}
        </Tag>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
      render: (createdAt: string) => createdAt ? new Date(createdAt).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space size="small">
          {record.enabled ? (
            <Popconfirm
              title="确定要封禁该用户吗？"
              onConfirm={() => handleBan(record.id)}
            >
              <Button type="link" size="small" danger icon={<StopOutlined />}>
                封禁
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确定要解封该用户吗？"
              onConfirm={() => handleUnban(record.id)}
            >
              <Button type="link" size="small" icon={<CheckOutlined />}>
                解封
              </Button>
            </Popconfirm>
          )}
          {record.role === 'USER' ? (
            <Popconfirm
              title="确定要设置该用户为管理员吗？"
              onConfirm={() => handleSetAdmin(record.id)}
            >
              <Button type="link" size="small" icon={<TeamOutlined />}>
                设为管理员
              </Button>
            </Popconfirm>
          ) : (
            <Popconfirm
              title="确定要取消该用户的管理员权限吗？"
              onConfirm={() => handleRemoveAdmin(record.id)}
            >
              <Button type="link" size="small" icon={<UserOutlined />}>
                取消管理员
              </Button>
            </Popconfirm>
          )}
          <Popconfirm
            title="确定要删除该用户吗？此操作不可恢复！"
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ fontSize: 24, marginBottom: 24 }}>用户管理</h1>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="正常用户"
              value={stats.totalEnabled}
              prefix={<CheckOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="已禁用"
              value={stats.totalDisabled}
              prefix={<StopOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="管理员"
              value={stats.totalAdmins}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索筛选 */}
      <Card style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            placeholder="搜索用户名/邮箱/手机号"
            allowClear
            style={{ width: 250 }}
            onSearch={(value) => setFilters({ ...filters, keyword: value })}
          />
          <Select
            placeholder="选择角色"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => setFilters({ ...filters, role: value || '' })}
            options={[
              { label: '用户', value: 'USER' },
              { label: '管理员', value: 'ADMIN' },
            ]}
          />
          <Select
            placeholder="选择状态"
            allowClear
            style={{ width: 120 }}
            onChange={(value) => setFilters({ ...filters, enabled: value })}
            options={[
              { label: '正常', value: true },
              { label: '禁用', value: false },
            ]}
          />
        </Space>
      </Card>

      {/* 用户列表 */}
      <Card>
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            ...pagination,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
            onChange: (page, pageSize) => {
              setPagination({ ...pagination, current: page, pageSize });
            },
          }}
        />
      </Card>
    </div>
  );
};

export default AdminUsersPage;
