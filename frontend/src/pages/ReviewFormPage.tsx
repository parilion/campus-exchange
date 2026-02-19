import React, { useState, useEffect } from 'react';
import { Modal, Form, Rate, Input, Upload, Button, message, Card, Tag, Space } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { createReview, checkReview } from '../services/review';
import type { CreateReviewRequest } from '../services/review';
import { uploadImage } from '../services/image';

const { TextArea } = Input;

// 预设评价标签
const REVIEW_TAGS = ['货真价实', '物美价廉', '发货快', '包装好', '态度好', '性价比高', '推荐购买', '不符合描述'];

interface ReviewFormProps {
  orderId: number;
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ orderId, visible, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [imageList, setImageList] = useState<any[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  useEffect(() => {
    if (visible && orderId) {
      checkReviewStatus();
    }
  }, [visible, orderId]);

  const checkReviewStatus = async () => {
    try {
      const res = await checkReview(orderId);
      setHasReviewed(res.data);
    } catch (error) {
      console.error('检查评价状态失败', error);
    }
  };

  const handleSubmit = async (values: { rating: number; content: string; anonymous: boolean }) => {
    if (hasReviewed) {
      message.warning('您已经评价过此订单');
      return;
    }

    setLoading(true);
    try {
      // 先上传图片
      const imageUrls: string[] = [];
      for (const file of imageList) {
        if (file.url) {
          imageUrls.push(file.url);
        } else if (file.originFileObj) {
          const uploadRes = await uploadImage(file.originFileObj);
          imageUrls.push(uploadRes.data);
        }
      }

      const request: CreateReviewRequest = {
        orderId,
        rating: values.rating,
        content: values.content,
        images: imageUrls.length > 0 ? imageUrls : undefined,
        anonymous: values.anonymous ? 1 : 0,
        tags: selectedTags.length > 0 ? selectedTags : undefined,
      };

      await createReview(request);
      message.success('评价成功');
      form.resetFields();
      setImageList([]);
      setSelectedTags([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      message.error(error.message || '评价失败');
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    listType: 'picture-card' as const,
    fileList: imageList,
    beforeUpload: (file: File) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过5MB');
        return false;
      }
      return false;
    },
    onChange: ({ fileList }: any) => {
      setImageList(fileList);
    },
    onRemove: () => {
      setImageList([]);
    },
  };

  return (
    <Modal
      title="发表评价"
      open={visible}
      onCancel={onClose}
      footer={null}
      width={600}
    >
      {hasReviewed ? (
        <Card>
          <p style={{ textAlign: 'center', color: '#999' }}>
            您已经评价过此订单
          </p>
        </Card>
      ) : (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{ rating: 5, anonymous: false }}
        >
          <Form.Item
            name="rating"
            label="评分"
            rules={[{ required: true, message: '请选择评分' }]}
          >
            <Rate />
          </Form.Item>

          <Form.Item
            name="content"
            label="评价内容"
            rules={[{ required: true, message: '请输入评价内容' }]}
          >
            <TextArea
              rows={4}
              placeholder="分享你的购物体验..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item label="上传图片">
            <Upload {...uploadProps}>
              {imageList.length < 4 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>上传</div>
                </div>
              )}
            </Upload>
            <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
              最多上传4张图片，每张不超过5MB
            </div>
          </Form.Item>

          <Form.Item name="anonymous" valuePropName="checked">
            <span>
              <input type="checkbox" style={{ marginRight: 8 }} />
              匿名评价
            </span>
          </Form.Item>

          <Form.Item label="评价标签">
            <Space wrap>
              {REVIEW_TAGS.map((tag) => (
                <Tag
                  key={tag}
                  color={selectedTags.includes(tag) ? 'blue' : 'default'}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    if (selectedTags.includes(tag)) {
                      setSelectedTags(selectedTags.filter((t) => t !== tag));
                    } else if (selectedTags.length < 4) {
                      setSelectedTags([...selectedTags, tag]);
                    } else {
                      message.warning('最多选择4个标签');
                    }
                  }}
                >
                  {tag}
                </Tag>
              ))}
            </Space>
            <div style={{ color: '#999', fontSize: 12, marginTop: 4 }}>
              选择1-4个标签（可选）
            </div>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              提交评价
            </Button>
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
};

export default ReviewForm;
