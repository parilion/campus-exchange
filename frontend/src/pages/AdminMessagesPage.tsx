import { useState, useEffect } from 'react';
import { Table, Card, Select, Input, Button, Space, Tag, Modal, message, Tabs, Form } from 'antd';
import { SendOutlined, ReloadOutlined, UserOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { getMessageHistory, pushMessage, getAllUsers } from '../services/admin';
import type { SystemMessage } from '../services/admin';
import type { User } from '../types';

const { Option } = Select;
const { TextArea } = Input;

const AdminMessagesPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SystemMessage[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [users, setUsers] = useState<User[]>([]);
  const [pushModalVisible, setPushModalVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await getMessageHistory({ page, pageSize });
      setData(res.records);
      setTotal(res.total);
    } catch (error) {
      console.error('获取消息历史失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res);
    } catch (error) {
      console.error('获取用户列表失败:', error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchUsers();
  }, [page, pageSize]);

  const handlePush = async () => {
    try {
      const values = await form.validateFields();
      await pushMessage(values);
      message.success('消息推送成功');
      setPushModalVisible(false);
      form.resetFields();
      fetchData();
    } catch (error) {
      message.error('推送失败');
    }
  };

  const typeMap: Record<string, { color: string; text: string }> = {
    ORDER_NOTIFY: { color: 'blue', text: '订单通知' },
    SYSTEM_NOTIFY: { color: 'green', text: '系统通知' },
    ACTIVITY_NOTIFY: { color: 'purple', text: '活动通知' },
    ADMIN_PUSH: { color: 'orange', text: '管理员推送' },
    ADMIN_BROADCAST: { color: 'red', text: '群发消息' },
  };

  const columns: ColumnsType<SystemMessage> = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 70,
    },
    {
      title: '用户ID',
      dataIndex: 'userId',
      key: 'userId',
      width: 100,
    },
    {
      title: '标题',
      dataIndex: 'title',
      key: 'title',
      ellipsis: true,
    },
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string) => {
        const info = typeMap[type] || { color: 'default', text: type };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '已读',
      dataIndex: 'read',
      key: 'read',
      width: 80,
      render: (read: boolean) => read ? <Tag>已读</Tag> : <Tag color="red">未读</Tag>,
    },
    {
      title: '发送时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
    },
  ];

  const items = [
    {
      key: 'push',
      label: (
        <span>
          <SendOutlined /> 推送消息
        </span>
      ),
      children: (
        <Card>
          <Form form={form} layout="vertical">
            <Form.Item
              name="userId"
              label="接收用户"
              tooltip="不选择用户则为群发消息"
            >
              <Select
                placeholder="选择用户（留空则群发）"
                allowClear
                showSearch
                optionFilterProp="children"
                style={{ width: 300 }}
              >
                {users.map(user => (
                  <Option key={user.id} value={user.id}>
                    {user.nickname || user.username} ({user.email})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            <Form.Item
              name="title"
              label="消息标题"
              rules={[{ required: true, message: '请输入消息标题' }]}
            >
              <Input placeholder="请输入消息标题" style={{ width: 400 }} />
            </Form.Item>
            <Form.Item
              name="content"
              label="消息内容"
              rules={[{ required: true, message: '请输入消息内容' }]}
            >
              <TextArea rows={4} placeholder="请输入消息内容" style={{ width: 400 }} />
            </Form.Item>
            <Form.Item>
              <Button type="primary" icon={<SendOutlined />} onClick={handlePush}>
                发送消息
              </Button>
            </Form.Item>
          </Form>
        </Card>
      ),
    },
    {
      key: 'history',
      label: (
        <span>
          <ReloadOutlined /> 推送历史
        </span>
      ),
      children: (
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
          scroll={{ x: 900 }}
        />
      ),
    },
  ];

  return (
    <div>
      <Tabs items={items} />
    </div>
  );
};

export default AdminMessagesPage;
