import React, { useState, useEffect } from 'react';
import {
  Card, List, Button, Modal, Form, Input, Switch, Space, Typography, Tag,
  Popconfirm, message, Empty, Select
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, HomeOutlined, StarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import {
  getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress,
  type Address
} from '../services/user';

const { Title, Text } = Typography;
const { Option } = Select;

// 省份数据（简化版）
const PROVINCES = ['北京市', '上海市', '广东省', '浙江省', '江苏省', '湖北省', '四川省', '陕西省', '山东省', '河南省', '湖南省', '福建省', '安徽省', '江西省', '重庆市', '天津市', '辽宁省', '吉林省', '黑龙江省', '云南省', '贵州省', '广西壮族自治区', '内蒙古自治区', '新疆维吾尔自治区', '西藏自治区', '海南省', '山西省', '河北省', '甘肃省', '宁夏回族自治区', '青海省'];

const AddressPage: React.FC = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadAddresses();
  }, []);

  const loadAddresses = async () => {
    setLoading(true);
    try {
      const res = await getAddresses();
      setAddresses(res.data.data || []);
    } catch {
      message.error('加载地址失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingAddress(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (addr: Address) => {
    setEditingAddress(addr);
    form.setFieldsValue({
      name: addr.name,
      phone: addr.phone,
      province: addr.province,
      city: addr.city,
      district: addr.district,
      detail: addr.detail,
      isDefault: addr.isDefault,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAddress(id);
      message.success('删除成功');
      loadAddresses();
    } catch {
      message.error('删除失败');
    }
  };

  const handleSetDefault = async (id: number) => {
    try {
      await setDefaultAddress(id);
      message.success('已设为默认地址');
      loadAddresses();
    } catch {
      message.error('操作失败');
    }
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      const addressData: Address = {
        name: values.name,
        phone: values.phone,
        province: values.province,
        city: values.city,
        district: values.district,
        detail: values.detail,
        isDefault: values.isDefault || false,
      };
      if (editingAddress?.id) {
        await updateAddress(editingAddress.id, addressData);
        message.success('地址更新成功');
      } else {
        await addAddress(addressData);
        message.success('地址添加成功');
      }
      setModalVisible(false);
      loadAddresses();
    } catch (err: any) {
      message.error(err?.message || '操作失败');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '24px' }}>
      <Card
        title={
          <Space>
            <HomeOutlined />
            <span>收货地址管理</span>
          </Space>
        }
        extra={
          <Space>
            <Button onClick={() => navigate(-1)}>返回</Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
              添加地址
            </Button>
          </Space>
        }
        loading={loading}
      >
        {addresses.length === 0 ? (
          <Empty description="暂无收货地址，请添加" />
        ) : (
          <List
            dataSource={addresses}
            renderItem={(addr) => (
              <List.Item
                key={addr.id}
                actions={[
                  addr.isDefault ? null : (
                    <Button
                      key="default"
                      size="small"
                      icon={<StarOutlined />}
                      onClick={() => handleSetDefault(addr.id!)}
                    >
                      设为默认
                    </Button>
                  ),
                  <Button
                    key="edit"
                    size="small"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(addr)}
                  >
                    编辑
                  </Button>,
                  <Popconfirm
                    key="delete"
                    title="确定要删除这个地址吗？"
                    onConfirm={() => handleDelete(addr.id!)}
                    okText="删除"
                    cancelText="取消"
                  >
                    <Button size="small" danger icon={<DeleteOutlined />}>
                      删除
                    </Button>
                  </Popconfirm>,
                ].filter(Boolean)}
                style={{
                  border: addr.isDefault ? '1px solid #1890ff' : '1px solid #f0f0f0',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 12,
                  background: addr.isDefault ? '#f0f8ff' : '#fff',
                }}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong>{addr.name}</Text>
                      <Text type="secondary">{addr.phone}</Text>
                      {addr.isDefault && <Tag color="blue">默认</Tag>}
                    </Space>
                  }
                  description={
                    <Text type="secondary">
                      {addr.province} {addr.city} {addr.district} {addr.detail}
                    </Text>
                  }
                />
              </List.Item>
            )}
          />
        )}
      </Card>

      {/* 新增/编辑地址弹窗 */}
      <Modal
        title={editingAddress ? '编辑地址' : '添加地址'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="收件人姓名"
            rules={[
              { required: true, message: '请输入收件人姓名' },
              { max: 20, message: '姓名不超过20个字符' },
            ]}
          >
            <Input placeholder="请输入收件人姓名" />
          </Form.Item>

          <Form.Item
            name="phone"
            label="手机号"
            rules={[
              { required: true, message: '请输入手机号' },
              { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号' },
            ]}
          >
            <Input placeholder="请输入手机号" maxLength={11} />
          </Form.Item>

          <Form.Item
            name="province"
            label="省份"
            rules={[{ required: true, message: '请选择省份' }]}
          >
            <Select placeholder="请选择省份" showSearch>
              {PROVINCES.map((p) => (
                <Option key={p} value={p}>{p}</Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="city"
            label="城市"
            rules={[{ required: true, message: '请输入城市' }]}
          >
            <Input placeholder="请输入城市" />
          </Form.Item>

          <Form.Item
            name="district"
            label="区/县"
            rules={[{ required: true, message: '请输入区/县' }]}
          >
            <Input placeholder="请输入区/县" />
          </Form.Item>

          <Form.Item
            name="detail"
            label="详细地址"
            rules={[
              { required: true, message: '请输入详细地址' },
              { max: 200, message: '详细地址不超过200个字符' },
            ]}
          >
            <Input.TextArea rows={2} placeholder="请输入详细地址（街道、门牌号等）" />
          </Form.Item>

          <Form.Item name="isDefault" label="设为默认地址" valuePropName="checked">
            <Switch />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting}>
                {editingAddress ? '保存修改' : '添加地址'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>取消</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AddressPage;
