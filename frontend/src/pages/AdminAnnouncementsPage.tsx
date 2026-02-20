import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Space, Tag, Input, Modal, Form, message, Popconfirm,
  Select, Statistic, Row, Col
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getAnnouncementList, createAnnouncement, updateAnnouncement,
  deleteAnnouncement, publishAnnouncement, getAnnouncementStats,
  type Announcement, type AnnouncementStats
} from '../services/admin';

const { TextArea } = Input;

const typeMap: Record<string, { color: string; text: string }> = {
  NOTICE: { color: 'blue', text: '通知' },
  ACTIVITY: { color: 'green', text: '活动' },
  SYSTEM: { color: 'red', text: '系统' },
};

const statusMap: Record<string, { color: string; text: string }> = {
  DRAFT: { color: 'default', text: '草稿' },
  PUBLISHED: { color: 'green', text: '已发布' },
  ARCHIVED: { color: 'gray', text: '已归档' },
};

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState<AnnouncementStats | null>(null);
  const [filterParams, setFilterParams] = useState<{ keyword?: string; status?: string; type?: string }>({});

  const loadAnnouncements = async () => {
    setLoading(true);
    try {
      const data = await getAnnouncementList({ page, pageSize, ...filterParams });
      setAnnouncements(data?.records || []);
      setTotal(data?.total || 0);
    } catch (error) {
      message.error('加载公告失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getAnnouncementStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadAnnouncements();
  }, [page, pageSize, filterParams]);

  useEffect(() => {
    loadStats();
  }, []);

  const handleAdd = () => {
    setEditingAnnouncement(null);
    form.resetFields();
    form.setFieldsValue({ type: 'NOTICE', priority: 0, status: 'DRAFT' });
    setModalVisible(true);
  };

  const handleEdit = (record: Announcement) => {
    setEditingAnnouncement(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAnnouncement(id);
      message.success('删除成功');
      loadAnnouncements();
      loadStats();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await publishAnnouncement(id);
      message.success('发布成功');
      loadAnnouncements();
      loadStats();
    } catch (error) {
      message.error('发布失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, values);
        message.success('更新成功');
      } else {
        await createAnnouncement(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadAnnouncements();
      loadStats();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleSearch = (values: { keyword?: string; status?: string; type?: string }) => {
    setFilterParams(values);
    setPage(1);
  };

  const columns: ColumnsType<Announcement> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'type',
      width: 80,
      render: (type) => {
        const info = typeMap[type] || { color: 'default', text: type };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 80,
      render: (status) => {
        const info = statusMap[status] || { color: 'default', text: status };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 170,
      render: (text) => text ? new Date(text).toLocaleString() : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          {record.status !== 'PUBLISHED' && (
            <Button type="link" icon={<SendOutlined />} onClick={() => handlePublish(record.id)}>
              发布
            </Button>
          )}
          <Popconfirm
            title="确定删除此公告?"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card>
            <Statistic title="总公告数" value={stats?.total || 0} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已发布" value={stats?.published || 0} valueStyle={{ color: '#3f8600' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="草稿" value={stats?.draft || 0} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic title="已归档" value={stats?.archived || 0} />
          </Card>
        </Col>
      </Row>

      <Card
        title="公告管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增公告
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="搜索标题/内容"
            onSearch={(keyword) => handleSearch({ ...filterParams, keyword })}
            style={{ width: 200 }}
            allowClear
          />
          <Select
            placeholder="状态"
            style={{ width: 120 }}
            allowClear
            onChange={(status) => handleSearch({ ...filterParams, status })}
          >
            <Select.Option value="DRAFT">草稿</Select.Option>
            <Select.Option value="PUBLISHED">已发布</Select.Option>
            <Select.Option value="ARCHIVED">已归档</Select.Option>
          </Select>
          <Select
            placeholder="类型"
            style={{ width: 120 }}
            allowClear
            onChange={(type) => handleSearch({ ...filterParams, type })}
          >
            <Select.Option value="NOTICE">通知</Select.Option>
            <Select.Option value="ACTIVITY">活动</Select.Option>
            <Select.Option value="SYSTEM">系统</Select.Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={announcements}
          rowKey="id"
          loading={loading}
          pagination={{
            current: page,
            pageSize,
            total,
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
          }}
        />
      </Card>

      <Modal
        title={editingAnnouncement ? '编辑公告' : '新增公告'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入公告标题' }]}
          >
            <Input placeholder="请输入公告标题" />
          </Form.Item>
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入公告内容' }]}
          >
            <TextArea rows={6} placeholder="请输入公告内容" />
          </Form.Item>
          <Form.Item name="type" label="类型" initialValue="NOTICE">
            <Select>
              <Select.Option value="NOTICE">通知</Select.Option>
              <Select.Option value="ACTIVITY">活动</Select.Option>
              <Select.Option value="SYSTEM">系统</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="priority" label="优先级" initialValue={0}>
            <Input type="number" placeholder="数字越大越靠前" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="DRAFT">
            <Select>
              <Select.Option value="DRAFT">草稿</Select.Option>
              <Select.Option value="PUBLISHED">已发布</Select.Option>
              <Select.Option value="ARCHIVED">已归档</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
