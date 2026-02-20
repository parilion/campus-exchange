import React, { useState, useEffect } from 'react';
import {
  Table, Card, Button, Space, Tag, Input, Modal, Form, message, Popconfirm,
  Select, Statistic, Row, Col, Image
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SendOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getCarouselList, createCarousel, updateCarousel,
  deleteCarousel, publishCarousel, getCarouselStats,
  type Carousel, type CarouselStats
} from '../services/admin';

const linkTypeMap: Record<string, string> = {
  PRODUCT: '商品',
  CATEGORY: '分类',
  URL: '外部链接',
  NONE: '不跳转',
};

const positionMap: Record<string, { color: string; text: string }> = {
  HOME: { color: 'blue', text: '首页' },
  PRODUCT_LIST: { color: 'green', text: '商品列表' },
  ALL: { color: 'purple', text: '全局' },
};

const statusMap: Record<string, { color: string; text: string }> = {
  DRAFT: { color: 'default', text: '草稿' },
  PUBLISHED: { color: 'green', text: '已发布' },
  DISABLED: { color: 'red', text: '已禁用' },
};

export default function AdminCarouselsPage() {
  const [carousels, setCarousels] = useState<Carousel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCarousel, setEditingCarousel] = useState<Carousel | null>(null);
  const [form] = Form.useForm();
  const [stats, setStats] = useState<CarouselStats | null>(null);
  const [filterParams, setFilterParams] = useState<{ keyword?: string; status?: string; position?: string }>({});

  const loadCarousels = async () => {
    setLoading(true);
    try {
      const data = await getCarouselList({ page, pageSize, ...filterParams });
      setCarousels(data?.records || []);
      setTotal(data?.total || 0);
    } catch (error) {
      message.error('加载轮播图失败');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const data = await getCarouselStats();
      setStats(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadCarousels();
  }, [page, pageSize, filterParams]);

  useEffect(() => {
    loadStats();
  }, []);

  const handleAdd = () => {
    setEditingCarousel(null);
    form.resetFields();
    form.setFieldsValue({ position: 'HOME', sort: 0, status: 'DRAFT', linkType: 'NONE' });
    setModalVisible(true);
  };

  const handleEdit = (record: Carousel) => {
    setEditingCarousel(record);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCarousel(id);
      message.success('删除成功');
      loadCarousels();
      loadStats();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handlePublish = async (id: number) => {
    try {
      await publishCarousel(id);
      message.success('发布成功');
      loadCarousels();
      loadStats();
    } catch (error) {
      message.error('发布失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingCarousel) {
        await updateCarousel(editingCarousel.id, values);
        message.success('更新成功');
      } else {
        await createCarousel(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      loadCarousels();
      loadStats();
    } catch (error) {
      message.error('操作失败');
    }
  };

  const handleSearch = (values: { keyword?: string; status?: string; position?: string }) => {
    setFilterParams(values);
    setPage(1);
  };

  const columns: ColumnsType<Carousel> = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: '图片',
      dataIndex: 'imageUrl',
      width: 100,
      render: (url) => url ? (
        <Image
          src={url.startsWith('http') ? url : `http://localhost:8080${url}`}
          width={60}
          height={40}
          style={{ objectFit: 'cover' }}
        />
      ) : '-',
    },
    {
      title: '标题',
      dataIndex: 'title',
      ellipsis: true,
    },
    {
      title: '展示位置',
      dataIndex: 'position',
      width: 100,
      render: (position) => {
        const info = positionMap[position] || { color: 'default', text: position };
        return <Tag color={info.color}>{info.text}</Tag>;
      },
    },
    {
      title: '跳转类型',
      dataIndex: 'linkType',
      width: 100,
      render: (type) => linkTypeMap[type] || '-',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      width: 60,
    },
    {
      title: '点击量',
      dataIndex: 'clickCount',
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
            title="确定删除此轮播图?"
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
            <Statistic title="总轮播图" value={stats?.total || 0} />
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
            <Statistic title="已禁用" value={stats?.disabled || 0} />
          </Card>
        </Col>
      </Row>

      <Card
        title="轮播图管理"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增轮播图
          </Button>
        }
      >
        <Space style={{ marginBottom: 16 }}>
          <Input.Search
            placeholder="搜索标题"
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
            <Select.Option value="DISABLED">已禁用</Select.Option>
          </Select>
          <Select
            placeholder="展示位置"
            style={{ width: 120 }}
            allowClear
            onChange={(position) => handleSearch({ ...filterParams, position })}
          >
            <Select.Option value="HOME">首页</Select.Option>
            <Select.Option value="PRODUCT_LIST">商品列表</Select.Option>
            <Select.Option value="ALL">全局</Select.Option>
          </Select>
        </Space>

        <Table
          columns={columns}
          dataSource={carousels}
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
        title={editingCarousel ? '编辑轮播图' : '新增轮播图'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="title"
            label="标题"
            rules={[{ required: true, message: '请输入轮播图标题' }]}
          >
            <Input placeholder="请输入轮播图标题" />
          </Form.Item>
          <Form.Item
            name="imageUrl"
            label="图片URL"
            rules={[{ required: true, message: '请输入图片URL' }]}
          >
            <Input placeholder="请输入图片URL，或使用完整URL" />
          </Form.Item>
          <Form.Item name="linkType" label="跳转类型" initialValue="NONE">
            <Select>
              <Select.Option value="NONE">不跳转</Select.Option>
              <Select.Option value="PRODUCT">商品</Select.Option>
              <Select.Option value="CATEGORY">分类</Select.Option>
              <Select.Option value="URL">外部链接</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="linkUrl" label="跳转链接">
            <Input placeholder="请输入跳转链接" />
          </Form.Item>
          <Form.Item name="position" label="展示位置" initialValue="HOME">
            <Select>
              <Select.Option value="HOME">首页</Select.Option>
              <Select.Option value="PRODUCT_LIST">商品列表</Select.Option>
              <Select.Option value="ALL">全局</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="sort" label="排序" initialValue={0}>
            <Input type="number" placeholder="数字越大越靠前" />
          </Form.Item>
          <Form.Item name="status" label="状态" initialValue="DRAFT">
            <Select>
              <Select.Option value="DRAFT">草稿</Select.Option>
              <Select.Option value="PUBLISHED">已发布</Select.Option>
              <Select.Option value="DISABLED">已禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
