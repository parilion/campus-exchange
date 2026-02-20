import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';

interface ErrorPageProps {
  error?: Error;
  onReset?: () => void;
}

export default function ErrorPage({ error, onReset }: ErrorPageProps) {
  const navigate = useNavigate();

  const handleReset = () => {
    if (onReset) {
      onReset();
    } else {
      navigate('/');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
      <Result
        status="500"
        title="页面出错了"
        subTitle={error?.message || '服务器开小差了，请稍后再试'}
        extra={[
          <Button type="primary" key="retry" onClick={handleReset}>
            {onReset ? '重试' : '返回首页'}
          </Button>,
          <Button key="reload" onClick={() => window.location.reload()}>
            刷新页面
          </Button>,
        ]}
      />
    </div>
  );
}
