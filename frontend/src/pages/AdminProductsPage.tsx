import React, { useState, useEffect, useCallback } from 'react';
import {
  Table, Card, Button, Space, Tag, Input, Select, Modal, Form,
  message, Statistic, Row, Col, Popconfirm, Image, Tabs, Checkbox, Typography
} from 'antd';
import {
  SearchOutlined, CheckCircleOutlined, CloseCircleOutlined,
  VerticalAlignBottomOutlined, DeleteOutlined, ExclamationCircleOutlined
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  getAdminProductList, getProductStats, auditProduct, forceOfflineProduct,
  deleteAdminProduct, getReportList, getReportStats, handleReport,
  type AdminProduct, type ProductReport, type ProductStats, type ReportStats
} from '../services/admin';

const { Option } = Select;
const { Text } = Typography;

// 审核状态标签
const auditStatusTag = (status: string) => {
  const map: Record<string, { color: string; text: string }> = {
    PENDING: { color: 'orange', text: '待审核' },
    APPROVED: { color: 'green', text: '已通过' },
    REJECTED: { color: 'red', text: '已拒绝' },
  };
  const info = map[status] || { color: 'default', text: status };
  return <Tag color={info.color}>{info.text}</Tag>;
};

// 商品状态标签
const productStatusTag = (status: string) => {
  const map: Record<string, { color: string; text: string }> = {
    ON_SALE: { color: 'green', text: '在售' },
    SOLD: { color: 'blue', text: '已售' },
    OFF_SHELF: { color: 'default', text: '已下架' },
  };
  const info = map[status] || { color: 'default', text: status };
  return <Tag color={info.color}>{info.text}</Tag>;
};

// 举报原因映射
const reasonMap: Record<string, string> = {
  FAKE: '虚假商品',
  PROHIBITED: '违禁物品',
  PRICE_FRAUD: '价格欺诈',
  SPAM: '垃圾广告',
  OTHER: '其他',
};

// 举报状态标签
const reportStatusTag = (status: string) => {
  const map: Record<string, { color: string; text: string }> = {
    PENDING: { color: 'orange', text: '待处理' },
    RESOLVED: { color: 'green', text: '已处理' },
    IGNORED: { color: 'default', text: '已忽略' },
  };
  const info = map[status] || { color: 'default', text: status };
  return <Tag color={info.color}>{info.text}</Tag>;
};

// 解析图片URL（取第一张）
function firstImage(images?: string): string | undefined {
  if (!images) return undefined;
  try {
    const arr = JSON.parse(images);
    if (Array.isArray(arr) && arr.length > 0) {
      const url = arr[0];
      return url.startsWith('http') ? url : `http://localhost:8080${url}`;
    }
  } catch {
    return undefined;
  }
}

export default function AdminProductsPage() {
  // 商品 Tab 状态
  const [products, setProducts] = useState<AdminProduct[]>([]);
  const [productTotal, setProductTotal] = useState(0);
  const [productPage, setProductPage] = useState(1);
  const [productLoading, setProductLoading] = useState(false);
  const [productKeyword, setProductKeyword] = useState('');
  const [productAuditStatus, setProductAuditStatus] = useState('');
  const [productStatus, setProductStatus] = useState('');
  const [productStats, setProductStats] = useState<ProductStats | null>(null);

  // 审核弹窗
  const [auditModalVisible, setAuditModalVisible] = useState(false);
  const [auditForm] = Form.useForm();
  const [currentProduct, setCurrentProduct] = useState<AdminProduct | null>(null);
  const [auditAction, setAuditAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');

  // 强制下架弹窗
  const [offlineModalVisible, setOfflineModalVisible] = useState(false);
  const [offlineForm] = Form.useForm();

  // 举报 Tab 状态
  const [reports, setReports] = useState<ProductReport[]>([]);
  const [reportTotal, setReportTotal] = useState(0);
  const [reportPage, setReportPage] = useState(1);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportStatus, setReportStatus] = useState('');
  const [reportStats, setReportStats] = useState<ReportStats | null>(null);

  // 举报处理弹窗
  const [handleModalVisible, setHandleModalVisible] = useState(false);
  const [handleForm] = Form.useForm();
  const [currentReport, setCurrentReport] = useState<ProductReport | null>(null);

  const [activeTab, setActiveTab] = useState('products');

  // 加载商品列表
  const loadProducts = useCallback(async () => {
    setProductLoading(true);
    try {
      const data = await getAdminProductList({
        page: productPage,
        pageSize: 10,
        keyword: productKeyword || undefined,
        auditStatus: productAuditStatus || undefined,
        status: productStatus || undefined,
      });
      if (data) {
        setProducts(data.records);
        setProductTotal(data.total);
      }
    } finally {
      setProductLoading(false);
    }
  }, [productPage, productKeyword, productAuditStatus, productStatus]);

  // 加载商品统计
  const loadProductStats = useCallback(async () => {
    const stats = await getProductStats();
    if (stats) setProductStats(stats);
  }, []);

  // 加载举报列表
  const loadReports = useCallback(async () => {
    setReportLoading(true);
    try {
      const data = await getReportList({
        page: reportPage,
        pageSize: 10,
        status: reportStatus || undefined,
      });
      if (data) {
        setReports(data.records);
        setReportTotal(data.total);
      }
    } finally {
      setReportLoading(false);
    }
  }, [reportPage, reportStatus]);

  // 加载举报统计
  const loadReportStats = useCallback(async () => {
    const stats = await getReportStats();
    if (stats) setReportStats(stats);
  }, []);

  useEffect(() => { loadProducts(); loadProductStats(); }, [loadProducts, loadProductStats]);
  useEffect(() => { if (activeTab === 'reports') { loadReports(); loadReportStats(); } }, [activeTab, loadReports, loadReportStats]);

  // 打开审核弹窗
  const openAuditModal = (product: AdminProduct, action: 'APPROVE' | 'REJECT') => {
    setCurrentProduct(product);
    setAuditAction(action);
    auditForm.resetFields();
    setAuditModalVisible(true);
  };

  // 提交审核
  const submitAudit = async () => {
    try {
      const values = await auditForm.validateFields();
      if (!currentProduct) return;
      await auditProduct(currentProduct.id, auditAction, values.rejectReason);
      message.success(auditAction === 'APPROVE' ? '审核通过' : '已拒绝');
      setAuditModalVisible(false);
      loadProducts();
      loadProductStats();
    } catch {
      // 表单验证失败
    }
  };

  // 打开强制下架弹窗
  const openOfflineModal = (product: AdminProduct) => {
    setCurrentProduct(product);
    offlineForm.resetFields();
    setOfflineModalVisible(true);
  };

  // 提交强制下架
  const submitForceOffline = async () => {
    try {
      const values = await offlineForm.validateFields();
      if (!currentProduct) return;
      await forceOfflineProduct(currentProduct.id, values.reason);
      message.success('已强制下架');
      setOfflineModalVisible(false);
      loadProducts();
      loadProductStats();
    } catch {
      // 表单验证失败
    }
  };

  // 删除商品
  const handleDeleteProduct = async (id: number) => {
    await deleteAdminProduct(id);
    message.success('已删除');
    loadProducts();
    loadProductStats();
  };

  // 打开举报处理弹窗
  const openHandleModal = (report: ProductReport) => {
    setCurrentReport(report);
    handleForm.resetFields();
    setHandleModalVisible(true);
  };

  // 提交举报处理
  const submitHandle = async () => {
    try {
      const values = await handleForm.validateFields();
      if (!currentReport) return;
      await handleReport(currentReport.id, values.action, values.handleResult, values.offlineProduct);
      message.success('处理成功');
      setHandleModalVisible(false);
      loadReports();
      loadReportStats();
    } catch {
      // 表单验证失败
    }
  };

  // 商品表格列
  const productColumns: ColumnsType<AdminProduct> = [
    {
      title: '商品',
      key: 'product',
      width: 240,
      render: (_, record) => (
        <Space>
          <Image
            src={firstImage(record.images)}
            width={48}
            height={48}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />
          <div>
            <div style={{ fontWeight: 500, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {record.title}
            </div>
            <Text type="danger">¥{record.price}</Text>
          </div>
        </Space>
      ),
    },
    {
      title: '审核状态',
      dataIndex: 'auditStatus',
      width: 100,
      render: (status) => auditStatusTag(status || 'APPROVED'),
    },
    {
      title: '商品状态',
      dataIndex: 'status',
      width: 90,
      render: (status) => productStatusTag(status),
    },
    {
      title: '浏览/收藏',
      key: 'stats',
      width: 90,
      render: (_, record) => (
        <span>{record.viewCount} / {record.favoriteCount}</span>
      ),
    },
    {
      title: '发布时间',
      dataIndex: 'createdAt',
      width: 120,
      render: (t) => t ? t.slice(0, 10) : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      render: (_, record) => (
        <Space size={4} wrap>
          {(record.auditStatus === 'PENDING' || !record.auditStatus) && (
            <>
              <Button
                size="small" type="primary" icon={<CheckCircleOutlined />}
                onClick={() => openAuditModal(record, 'APPROVE')}
              >通过</Button>
              <Button
                size="small" danger icon={<CloseCircleOutlined />}
                onClick={() => openAuditModal(record, 'REJECT')}
              >拒绝</Button>
            </>
          )}
          {record.status === 'ON_SALE' && (
            <Button
              size="small" icon={<VerticalAlignBottomOutlined />}
              onClick={() => openOfflineModal(record)}
            >强制下架</Button>
          )}
          <Popconfirm
            title="确认删除该商品？"
            onConfirm={() => handleDeleteProduct(record.id)}
            okText="删除" cancelText="取消"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // 举报表格列
  const reportColumns: ColumnsType<ProductReport> = [
    {
      title: '商品',
      key: 'product',
      width: 200,
      render: (_, record) => (
        <Space>
          <Image
            src={firstImage(record.productImages)}
            width={40}
            height={40}
            style={{ objectFit: 'cover', borderRadius: 4 }}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
          />
          <Text style={{ maxWidth: 130, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block' }}>
            {record.productTitle || `商品#${record.productId}`}
          </Text>
        </Space>
      ),
    },
    {
      title: '举报者',
      dataIndex: 'reporterUsername',
      width: 100,
      render: (name) => name || '-',
    },
    {
      title: '举报原因',
      dataIndex: 'reason',
      width: 100,
      render: (reason) => reasonMap[reason] || reason,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      render: (desc) => desc || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 90,
      render: (status) => reportStatusTag(status),
    },
    {
      title: '举报时间',
      dataIndex: 'createdAt',
      width: 120,
      render: (t) => t ? t.slice(0, 10) : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 100,
      render: (_, record) => (
        record.status === 'PENDING' ? (
          <Button size="small" type="primary" onClick={() => openHandleModal(record)}>
            处理
          </Button>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>{record.handleResult || '已处理'}</Text>
        )
      ),
    },
  ];

  return (
    <div style={{ padding: '0 4px' }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'products',
            label: '商品审核管理',
            children: (
              <>
                {/* 统计卡片 */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic title="商品总数" value={productStats?.total ?? 0} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic title="在售商品" value={productStats?.onSale ?? 0} valueStyle={{ color: '#3f8600' }} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic title="待审核" value={productStats?.pending ?? 0} valueStyle={{ color: '#faad14' }} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic title="已拒绝" value={productStats?.rejected ?? 0} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                  </Col>
                </Row>

                {/* 搜索栏 */}
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Space wrap>
                    <Input
                      prefix={<SearchOutlined />}
                      placeholder="搜索商品标题"
                      value={productKeyword}
                      onChange={(e) => setProductKeyword(e.target.value)}
                      onPressEnter={() => { setProductPage(1); loadProducts(); }}
                      style={{ width: 200 }}
                    />
                    <Select
                      placeholder="审核状态"
                      value={productAuditStatus || undefined}
                      onChange={(v) => { setProductAuditStatus(v || ''); setProductPage(1); }}
                      allowClear
                      style={{ width: 120 }}
                    >
                      <Option value="PENDING">待审核</Option>
                      <Option value="APPROVED">已通过</Option>
                      <Option value="REJECTED">已拒绝</Option>
                    </Select>
                    <Select
                      placeholder="商品状态"
                      value={productStatus || undefined}
                      onChange={(v) => { setProductStatus(v || ''); setProductPage(1); }}
                      allowClear
                      style={{ width: 120 }}
                    >
                      <Option value="ON_SALE">在售</Option>
                      <Option value="SOLD">已售</Option>
                      <Option value="OFF_SHELF">已下架</Option>
                    </Select>
                    <Button type="primary" icon={<SearchOutlined />} onClick={() => { setProductPage(1); loadProducts(); }}>
                      搜索
                    </Button>
                  </Space>
                </Card>

                {/* 商品表格 */}
                <Card size="small">
                  <Table
                    rowKey="id"
                    columns={productColumns}
                    dataSource={products}
                    loading={productLoading}
                    pagination={{
                      current: productPage,
                      total: productTotal,
                      pageSize: 10,
                      showTotal: (t) => `共 ${t} 条`,
                      onChange: (p) => setProductPage(p),
                    }}
                    scroll={{ x: 800 }}
                    size="small"
                  />
                </Card>
              </>
            ),
          },
          {
            key: 'reports',
            label: '举报处理',
            children: (
              <>
                {/* 举报统计 */}
                <Row gutter={16} style={{ marginBottom: 16 }}>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic title="举报总数" value={reportStats?.total ?? 0} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic title="待处理" value={reportStats?.pending ?? 0} valueStyle={{ color: '#faad14' }} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic title="已处理" value={reportStats?.resolved ?? 0} valueStyle={{ color: '#3f8600' }} />
                    </Card>
                  </Col>
                  <Col span={6}>
                    <Card size="small">
                      <Statistic title="已忽略" value={reportStats?.ignored ?? 0} />
                    </Card>
                  </Col>
                </Row>

                {/* 筛选 */}
                <Card size="small" style={{ marginBottom: 16 }}>
                  <Space>
                    <Select
                      placeholder="处理状态"
                      value={reportStatus || undefined}
                      onChange={(v) => { setReportStatus(v || ''); setReportPage(1); }}
                      allowClear
                      style={{ width: 120 }}
                    >
                      <Option value="PENDING">待处理</Option>
                      <Option value="RESOLVED">已处理</Option>
                      <Option value="IGNORED">已忽略</Option>
                    </Select>
                    <Button type="primary" onClick={() => { setReportPage(1); loadReports(); }}>
                      刷新
                    </Button>
                  </Space>
                </Card>

                {/* 举报表格 */}
                <Card size="small">
                  <Table
                    rowKey="id"
                    columns={reportColumns}
                    dataSource={reports}
                    loading={reportLoading}
                    pagination={{
                      current: reportPage,
                      total: reportTotal,
                      pageSize: 10,
                      showTotal: (t) => `共 ${t} 条`,
                      onChange: (p) => setReportPage(p),
                    }}
                    scroll={{ x: 800 }}
                    size="small"
                  />
                </Card>
              </>
            ),
          },
        ]}
      />

      {/* 审核弹窗 */}
      <Modal
        title={auditAction === 'APPROVE' ? '审核通过确认' : '审核拒绝'}
        open={auditModalVisible}
        onOk={submitAudit}
        onCancel={() => setAuditModalVisible(false)}
        okText={auditAction === 'APPROVE' ? '确认通过' : '确认拒绝'}
        okButtonProps={{ danger: auditAction === 'REJECT' }}
      >
        {currentProduct && (
          <p style={{ marginBottom: 12 }}>
            商品：<strong>{currentProduct.title}</strong>
          </p>
        )}
        <Form form={auditForm} layout="vertical">
          {auditAction === 'REJECT' && (
            <Form.Item
              name="rejectReason"
              label="拒绝原因"
              rules={[{ required: true, message: '请输入拒绝原因' }]}
            >
              <Input.TextArea rows={3} placeholder="请输入拒绝原因..." maxLength={200} showCount />
            </Form.Item>
          )}
          {auditAction === 'APPROVE' && (
            <p>确认审核通过该商品，通过后商品将正常展示。</p>
          )}
        </Form>
      </Modal>

      {/* 强制下架弹窗 */}
      <Modal
        title="强制下架"
        open={offlineModalVisible}
        onOk={submitForceOffline}
        onCancel={() => setOfflineModalVisible(false)}
        okText="确认下架"
        okButtonProps={{ danger: true }}
      >
        {currentProduct && (
          <p style={{ marginBottom: 12 }}>
            商品：<strong>{currentProduct.title}</strong>
          </p>
        )}
        <Form form={offlineForm} layout="vertical">
          <Form.Item
            name="reason"
            label="下架原因"
            rules={[{ required: true, message: '请输入下架原因' }]}
          >
            <Input.TextArea rows={3} placeholder="请输入下架原因..." maxLength={200} showCount />
          </Form.Item>
        </Form>
      </Modal>

      {/* 举报处理弹窗 */}
      <Modal
        title="处理举报"
        open={handleModalVisible}
        onOk={submitHandle}
        onCancel={() => setHandleModalVisible(false)}
        okText="确认处理"
      >
        {currentReport && (
          <div style={{ marginBottom: 12 }}>
            <p>商品：<strong>{currentReport.productTitle || `#${currentReport.productId}`}</strong></p>
            <p>举报原因：<strong>{reasonMap[currentReport.reason] || currentReport.reason}</strong></p>
            {currentReport.description && <p>描述：{currentReport.description}</p>}
          </div>
        )}
        <Form form={handleForm} layout="vertical" initialValues={{ action: 'RESOLVE' }}>
          <Form.Item name="action" label="处理方式" rules={[{ required: true }]}>
            <Select>
              <Option value="RESOLVE">处理（违规属实）</Option>
              <Option value="IGNORE">忽略（举报无效）</Option>
            </Select>
          </Form.Item>
          <Form.Item name="handleResult" label="处理说明">
            <Input.TextArea rows={2} placeholder="填写处理说明..." maxLength={200} showCount />
          </Form.Item>
          <Form.Item name="offlineProduct" valuePropName="checked">
            <Checkbox>同时下架该商品</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
