import { useState } from 'react';
import {
  Form,
  Input,
  Button,
  Card,
  Select,
  InputNumber,
  Upload,
  message,
  Typography,
  Row,
  Col,
  Space,
} from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { createProduct, CreateProductRequest } from '../services/product';

const { Title, Text } = Typography;
const { TextArea } = Input;

// 商品新旧程度选项
const CONDITION_OPTIONS = [
  { value: 'NEW', label: '全新' },
  { value: 'LIKE_NEW', label: '几乎全新' },
  { value: 'GOOD', label: '良好' },
  { value: 'FAIR', label: '一般' },
  { value: 'POOR', label: '较差' },
];

// 分类选项
const CATEGORY_OPTIONS = [
  { value: 1, label: '教材书籍' },
  { value: 2, label: '电子产品' },
  { value: 3, label: '生活用品' },
  { value: 4, label: '服饰鞋帽' },
  { value: 5, label: '运动户外' },
  { value: 6, label: '美妆护肤' },
  { value: 7, label: '食品饮料' },
  { value: 8, label: '其他' },
];

// 交易方式选项
const TRADE_TYPE_OPTIONS = [
  { value: 'OFFLINE', label: '线下交易' },
  { value: 'ONLINE', label: '线上交易' },
];

export default function PublishPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageList, setImageList] = useState<string[]>([]);
  const navigate = useNavigate();

  const onFinish = async (values: CreateProductRequest) => {
    setLoading(true);
    try {
      // 构建请求数据
      const data: CreateProductRequest = {
        title: values.title,
        description: values.description,
        price: values.price,
        originalPrice: values.originalPrice,
        categoryId: values.categoryId,
        condition: values.condition,
        images: imageList.length > 0 ? imageList : undefined,
        tradeType: values.tradeType,
        tradeLocation: values.tradeLocation,
      };

      await createProduct(data);
      message.success('发布成功');
      navigate('/');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : '发布失败';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // 处理图片上传（模拟上传，实际项目中应调用上传接口）
  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImageList((prev) => [...prev, result]);
      }
    };
    reader.readAsDataURL(file);
    return false; // 阻止默认上传行为
  };

  // 移除图片
  const removeImage = (index: number) => {
    setImageList((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#f0f2f5', padding: '24px' }}>
      <Row justify="center">
        <Col xs={20} md={24} sm={16} lg={12}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={4} style={{ marginBottom: 4 }}>发布商品</Title>
              <Text type="secondary">填写商品信息，让更多人看到你的闲置</Text>
            </div>

            <Form form={form} onFinish={onFinish} layout="vertical" size="large">
              {/* 商品标题 */}
              <Form.Item
                name="title"
                label="商品标题"
                rules={[
                  { required: true, message: '请输入商品标题' },
                  { max: 100, message: '标题不能超过100个字符' },
                ]}
              >
                <Input placeholder="请输入商品标题" maxLength={100} showCount />
              </Form.Item>

              {/* 商品价格和原价 */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="price"
                    label="售价"
                    rules={[
                      { required: true, message: '请输入售价' },
                      { type: 'number', min: 0.01, message: '价格必须大于0' },
                    ]}
                  >
                    <InputNumber
                      prefix="¥"
                      style={{ width: '100%' }}
                      min={0.01}
                      precision={2}
                      placeholder="0.00"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="originalPrice" label="原价（选填）">
                    <InputNumber
                      prefix="¥"
                      style={{ width: '100%' }}
                      min={0}
                      precision={2}
                      placeholder="0.00"
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* 分类和新旧程度 */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="categoryId"
                    label="商品分类"
                    rules={[{ required: true, message: '请选择商品分类' }]}
                  >
                    <Select placeholder="请选择分类" options={CATEGORY_OPTIONS} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="condition"
                    label="新旧程度"
                    rules={[{ required: true, message: '请选择新旧程度' }]}
                  >
                    <Select placeholder="请选择" options={CONDITION_OPTIONS} />
                  </Form.Item>
                </Col>
              </Row>

              {/* 商品描述 */}
              <Form.Item
                name="description"
                label="商品描述"
                rules={[
                  { required: true, message: '请输入商品描述' },
                  { max: 2000, message: '描述不能超过2000个字符' },
                ]}
              >
                <TextArea
                  rows={4}
                  placeholder="请详细描述商品的新旧程度、使用情况等..."
                  maxLength={2000}
                  showCount
                />
              </Form.Item>

              {/* 商品图片 */}
              <Form.Item label="商品图片（选填）">
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {imageList.map((img, index) => (
                    <div
                      key={index}
                      style={{
                        position: 'relative',
                        width: 100,
                        height: 100,
                        border: '1px solid #d9d9d9',
                        borderRadius: 4,
                        overflow: 'hidden',
                      }}
                    >
                      <img
                        src={img}
                        alt={`商品图片${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <Button
                        type="text"
                        danger
                        size="small"
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 0,
                          padding: '2px 6px',
                        }}
                        onClick={() => removeImage(index)}
                      >
                        删除
                      </Button>
                    </div>
                  ))}
                  <Upload
                    showUploadList={false}
                    beforeUpload={handleImageUpload}
                    accept="image/*"
                  >
                    <div
                      style={{
                        width: 100,
                        height: 100,
                        border: '1px dashed #d9d9d9',
                        borderRadius: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        cursor: 'pointer',
                        color: '#999',
                      }}
                    >
                      <PlusOutlined style={{ fontSize: 24, marginBottom: 4 }} />
                      <Text type="secondary" style={{ fontSize: 12 }}>
                        上传图片
                      </Text>
                    </div>
                  </Upload>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  建议上传实物图片，支持 jpg、png 格式
                </Text>
              </Form.Item>

              {/* 交易方式 */}
              <Form.Item name="tradeType" label="交易方式（选填）">
                <Select placeholder="请选择交易方式" options={TRADE_TYPE_OPTIONS} allowClear />
              </Form.Item>

              {/* 交易地点 */}
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) =>
                  prevValues.tradeType !== currentValues.tradeType
                }
              >
                {({ getFieldValue }) => {
                  const tradeType = getFieldValue('tradeType');
                  if (tradeType === 'OFFLINE') {
                    return (
                      <Form.Item
                        name="tradeLocation"
                        label="交易地点"
                        rules={[{ required: true, message: '请输入交易地点' }]}
                      >
                        <Input placeholder="请输入期望的交易地点，如：图书馆一楼" />
                      </Form.Item>
                    );
                  }
                  return null;
                }}
              </Form.Item>

              {/* 提交按钮 */}
              <Form.Item>
                <Space style={{ width: '100%', justifyContent: 'center' }}>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    style={{ width: 200 }}
                  >
                    发布商品
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
