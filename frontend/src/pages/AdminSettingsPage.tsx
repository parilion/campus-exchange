import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Tag, Popconfirm, Select } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons';
import { getConfigList, createConfig, updateConfig, deleteConfig, type SystemConfig } from '../services/admin';

const SystemConfigPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SystemConfig[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getConfigList({ page, pageSize, keyword });
      if (result) {
        setData(result.records || []);
        setTotal(result.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch config list:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [page, pageSize]);

  const handleSearch = () => {
    setPage(1);
    fetchData();
  };

  const handleAdd = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: SystemConfig) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteConfig(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingId) {
        await updateConfig(editingId, values);
        message.success('更新成功');
      } else {
        await createConfig(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: '配置名称',
      dataIndex: 'configName',
      width: 150,
    },
    {
      title: '配置键',
      dataIndex: 'configKey',
      width: 150,
    },
    {
      title: '配置值',
      dataIndex: 'configValue',
      ellipsis: true,
    },
    {
      title: '类型',
      dataIndex: 'configType',
      width: 100,
      render: (type: string) => (
        <Tag color={type === 'BOOLEAN' ? 'blue' : type === 'NUMBER' ? 'green' : 'default'}>
          {type}
        </Tag>
      ),
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: SystemConfig) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此配置?" onConfirm={() => handleDelete(record.id)}>
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
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Space>
          <Input.Search
            placeholder="搜索配置键/名称"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 250 }}
            enterButton
          />
          <Button icon={<ReloadOutlined />} onClick={handleSearch}>刷新</Button>
        </Space>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          新增配置
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: (p, ps) => {
            setPage(p);
            setPageSize(ps);
          },
        }}
      />

      <Modal
        title={editingId ? '编辑配置' : '新增配置'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="configName" label="配置名称" rules={[{ required: true, message: '请输入配置名称' }]}>
            <Input placeholder="例如：网站名称" />
          </Form.Item>
          <Form.Item name="configKey" label="配置键" rules={[{ required: true, message: '请输入配置键' }]}>
            <Input placeholder="例如：site_name" disabled={!!editingId} />
          </Form.Item>
          <Form.Item name="configValue" label="配置值">
            <Input.TextArea placeholder="配置值" rows={3} />
          </Form.Item>
          <Form.Item name="configType" label="配置类型" initialValue="STRING">
            <Select>
              <Select.Option value="STRING">字符串</Select.Option>
              <Select.Option value="NUMBER">数字</Select.Option>
              <Select.Option value="BOOLEAN">布尔值</Select.Option>
              <Select.Option value="JSON">JSON</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="description" label="描述">
            <Input.TextArea placeholder="配置描述" rows={2} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SystemConfigPage;
