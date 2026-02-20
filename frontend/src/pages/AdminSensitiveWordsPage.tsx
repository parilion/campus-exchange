import { useState, useEffect } from 'react';
import { Table, Button, Space, Modal, Form, Input, InputNumber, message, Tag, Popconfirm, Select, Drawer } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, ReloadOutlined, UploadOutlined } from '@ant-design/icons';
import { getSensitiveWordList, createSensitiveWord, updateSensitiveWord, deleteSensitiveWord, batchImportSensitiveWords, type SensitiveWord } from '../services/admin';

const categoryMap: Record<string, string> = {
  GENERAL: '通用',
  AD: '广告',
  POLITICS: '政治',
  PORN: '色情',
  ACADEMIC: '学术',
  WEAPON: '违禁',
  CUSTOM: '自定义',
};

const levelMap: Record<number, string> = {
  1: '低',
  2: '中',
  3: '高',
};

const levelColorMap: Record<number, string> = {
  1: 'green',
  2: 'orange',
  3: 'red',
};

const AdminSensitiveWordsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<SensitiveWord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [isEnabled, setIsEnabled] = useState<boolean | undefined>(undefined);
  const [modalVisible, setModalVisible] = useState(false);
  const [importVisible, setImportVisible] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form] = Form.useForm();
  const [importForm] = Form.useForm();

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getSensitiveWordList({ page, pageSize, keyword, category, isEnabled });
      if (result) {
        setData(result.records || []);
        setTotal(result.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch sensitive words:', error);
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

  const handleEdit = (record: SensitiveWord) => {
    setEditingId(record.id);
    form.setFieldsValue(record);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteSensitiveWord(id);
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
        await updateSensitiveWord(editingId, values);
        message.success('更新成功');
      } else {
        await createSensitiveWord(values);
        message.success('创建成功');
      }
      setModalVisible(false);
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || '操作失败');
    }
  };

  const handleBatchImport = async () => {
    try {
      const values = await importForm.validateFields();
      const words = values.words.split('\n').map(w => w.trim()).filter(w => w);
      const result = await batchImportSensitiveWords(words);
      message.success(`导入成功: ${result.success}条, 失败: ${result.failed}条`);
      setImportVisible(false);
      importForm.resetFields();
      fetchData();
    } catch (error: any) {
      message.error(error.response?.data?.message || '导入失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: '敏感词',
      dataIndex: 'word',
      width: 150,
    },
    {
      title: '分类',
      dataIndex: 'category',
      width: 100,
      render: (cat: string) => categoryMap[cat] || cat,
    },
    {
      title: '级别',
      dataIndex: 'level',
      width: 80,
      render: (level: number) => (
        <Tag color={levelColorMap[level]}>{levelMap[level]}</Tag>
      ),
    },
    {
      title: '替换词',
      dataIndex: 'replaceWord',
      width: 100,
    },
    {
      title: '状态',
      dataIndex: 'isEnabled',
      width: 80,
      render: (enabled: boolean) => (
        <Tag color={enabled ? 'green' : 'default'}>{enabled ? '启用' : '禁用'}</Tag>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: SensitiveWord) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Popconfirm title="确定删除此敏感词?" onConfirm={() => handleDelete(record.id)}>
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
            placeholder="搜索敏感词"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 200 }}
            enterButton
          />
          <Select
            placeholder="选择分类"
            value={category}
            onChange={setCategory}
            allowClear
            style={{ width: 120 }}
          >
            {Object.entries(categoryMap).map(([key, value]) => (
              <Select.Option key={key} value={key}>{value}</Select.Option>
            ))}
          </Select>
          <Select
            placeholder="状态"
            value={isEnabled}
            onChange={setIsEnabled}
            allowClear
            style={{ width: 100 }}
          >
            <Select.Option value={true}>启用</Select.Option>
            <Select.Option value={false}>禁用</Select.Option>
          </Select>
          <Button icon={<ReloadOutlined />} onClick={handleSearch}>刷新</Button>
        </Space>
        <Space>
          <Button icon={<UploadOutlined />} onClick={() => setImportVisible(true)}>
            批量导入
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增敏感词
          </Button>
        </Space>
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
        title={editingId ? '编辑敏感词' : '新增敏感词'}
        open={modalVisible}
        onOk={handleSubmit}
        onCancel={() => setModalVisible(false)}
        width={500}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="word" label="敏感词" rules={[{ required: true, message: '请输入敏感词' }]}>
            <Input placeholder="请输入敏感词" />
          </Form.Item>
          <Form.Item name="category" label="分类" initialValue="GENERAL">
            <Select>
              {Object.entries(categoryMap).map(([key, value]) => (
                <Select.Option key={key} value={key}>{value}</Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item name="level" label="敏感级别" initialValue={1}>
            <InputNumber min={1} max={3} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="replaceWord" label="替换词" initialValue="***">
            <Input placeholder="替换词，默认***" />
          </Form.Item>
          <Form.Item name="isEnabled" label="状态" initialValue={true}>
            <Select>
              <Select.Option value={true}>启用</Select.Option>
              <Select.Option value={false}>禁用</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Drawer
        title="批量导入敏感词"
        placement="right"
        width={500}
        open={importVisible}
        onClose={() => setImportVisible(false)}
      >
        <Form form={importForm} layout="vertical">
          <Form.Item name="words" label="敏感词列表" rules={[{ required: true, message: '请输入敏感词' }]}>
            <Input.TextArea
              placeholder="每行一个敏感词"
              rows={15}
              style={{ fontFamily: 'monospace' }}
            />
          </Form.Item>
          <Button type="primary" onClick={handleBatchImport} block>
            批量导入
          </Button>
        </Form>
      </Drawer>
    </div>
  );
};

export default AdminSensitiveWordsPage;
