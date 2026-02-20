import { useState, useEffect } from 'react';
import { Table, Button, Space, Input, Select, DatePicker, message, Modal, Drawer } from 'antd';
import { ReloadOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { getOperationLogList, deleteOperationLog, batchDeleteOperationLogs, getOperationLogDetail, type OperationLog } from '../services/admin';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const moduleMap: Record<string, string> = {
  USER: '用户',
  PRODUCT: '商品',
  ORDER: '订单',
  MESSAGE: '消息',
  SYSTEM: '系统',
};

const AdminOperationLogsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<OperationLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [operation, setOperation] = useState('');
  const [module, setModule] = useState<string | undefined>(undefined);
  const [username, setUsername] = useState('');
  const [dateRange, setDateRange] = useState<[string, string] | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailData, setDetailData] = useState<OperationLog | null>(null);
  const [selectedRowKeys, setSelectedRowKeys] = useState<number[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const result = await getOperationLogList({
        page,
        pageSize,
        operation,
        module,
        username,
        startDate: dateRange?.[0],
        endDate: dateRange?.[1],
      });
      if (result) {
        setData(result.records || []);
        setTotal(result.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch operation logs:', error);
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

  const handleView = async (record: OperationLog) => {
    try {
      const detail = await getOperationLogDetail(record.id);
      setDetailData(detail);
      setDetailVisible(true);
    } catch (error) {
      message.error('获取详情失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteOperationLog(id);
      message.success('删除成功');
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) {
      message.warning('请选择要删除的日志');
      return;
    }
    try {
      await batchDeleteOperationLogs(selectedRowKeys);
      message.success('批量删除成功');
      setSelectedRowKeys([]);
      fetchData();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const handleDateChange = (dates: any) => {
    if (dates && dates.length === 2) {
      setDateRange([dates[0].format('YYYY-MM-DD'), dates[1].format('YYYY-MM-DD')]);
    } else {
      setDateRange(null);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 70,
    },
    {
      title: '操作人',
      dataIndex: 'username',
      width: 120,
    },
    {
      title: '操作类型',
      dataIndex: 'operation',
      width: 150,
    },
    {
      title: '模块',
      dataIndex: 'module',
      width: 100,
      render: (mod: string) => moduleMap[mod] || mod,
    },
    {
      title: '请求方法',
      dataIndex: 'requestMethod',
      width: 80,
    },
    {
      title: '请求URL',
      dataIndex: 'requestUrl',
      ellipsis: true,
    },
    {
      title: 'IP',
      dataIndex: 'requestIp',
      width: 130,
    },
    {
      title: '状态',
      dataIndex: 'responseStatus',
      width: 80,
      render: (status: number) => (
        <span style={{ color: status && status < 400 ? '#52c41a' : '#f5222d' }}>
          {status || '-'}
        </span>
      ),
    },
    {
      title: '耗时',
      dataIndex: 'responseTime',
      width: 80,
      render: (time: number) => time ? `${time}ms` : '-',
    },
    {
      title: '操作时间',
      dataIndex: 'createdAt',
      width: 170,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: OperationLog) => (
        <Space>
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>
            详情
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record.id)}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys as number[]),
  };

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <Space wrap>
          <Input.Search
            placeholder="搜索操作类型"
            value={operation}
            onChange={(e) => setOperation(e.target.value)}
            onSearch={handleSearch}
            style={{ width: 180 }}
            enterButton
          />
          <Input
            placeholder="搜索操作人"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            style={{ width: 150 }}
            onPressEnter={handleSearch}
          />
          <Select
            placeholder="选择模块"
            value={module}
            onChange={setModule}
            allowClear
            style={{ width: 120 }}
          >
            {Object.entries(moduleMap).map(([key, value]) => (
              <Select.Option key={key} value={key}>{value}</Select.Option>
            ))}
          </Select>
          <RangePicker onChange={handleDateChange} />
          <Button icon={<ReloadOutlined />} onClick={handleSearch}>搜索</Button>
        </Space>
      </div>

      <div style={{ marginBottom: 16 }}>
        <Button
          danger
          icon={<DeleteOutlined />}
          onClick={handleBatchDelete}
          disabled={selectedRowKeys.length === 0}
        >
          批量删除 ({selectedRowKeys.length})
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        rowSelection={rowSelection}
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

      <Drawer
        title="操作日志详情"
        placement="right"
        width={600}
        open={detailVisible}
        onClose={() => setDetailVisible(false)}
      >
        {detailData && (
          <div>
            <p><strong>操作人：</strong>{detailData.username}</p>
            <p><strong>用户ID：</strong>{detailData.userId || '-'}</p>
            <p><strong>操作类型：</strong>{detailData.operation}</p>
            <p><strong>模块：</strong>{moduleMap[detailData.module || ''] || detailData.module}</p>
            <p><strong>请求方法：</strong>{detailData.requestMethod}</p>
            <p><strong>请求URL：</strong>{detailData.requestUrl}</p>
            <p><strong>请求IP：</strong>{detailData.requestIp}</p>
            <p><strong>响应状态：</strong>{detailData.responseStatus || '-'}</p>
            <p><strong>响应耗时：</strong>{detailData.responseTime ? `${detailData.responseTime}ms` : '-'}</p>
            <p><strong>操作时间：</strong>{detailData.createdAt}</p>
            {detailData.errorMessage && (
              <p><strong style={{ color: '#f5222d' }}>错误信息：</strong>{detailData.errorMessage}</p>
            )}
            {detailData.requestParams && (
              <div>
                <strong>请求参数：</strong>
                <pre style={{ background: '#f5f5f5', padding: 12, marginTop: 8, overflow: 'auto', maxHeight: 300 }}>
                  {JSON.stringify(JSON.parse(detailData.requestParams), null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
};

export default AdminOperationLogsPage;
