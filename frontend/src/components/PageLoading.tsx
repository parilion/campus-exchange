import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface PageLoadingProps {
  tip?: string;
}

/**
 * 全页面加载组件
 */
const PageLoading = ({ tip = '加载中...' }: PageLoadingProps) => (
  <div
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      flexDirection: 'column',
      gap: 16,
    }}
  >
    <Spin indicator={<LoadingOutlined style={{ fontSize: 36, color: '#1890ff' }} spin />} />
    <span style={{ color: '#8c8c8c', fontSize: 14 }}>{tip}</span>
  </div>
);

export default PageLoading;
