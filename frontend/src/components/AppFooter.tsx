import { Row, Col, Typography, Space, Divider } from 'antd';
import { Link } from 'react-router-dom';
import {
  GithubOutlined,
  MailOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import './AppFooter.css';

const { Text, Title } = Typography;

const AppFooter = () => (
  <footer className="app-footer">
    <div className="footer-main">
      <Row gutter={[32, 32]} justify="space-between">
        {/* 品牌介绍 */}
        <Col xs={24} sm={24} md={8}>
          <Title level={5} className="footer-brand">🎓 校园二手交易</Title>
          <Text type="secondary" className="footer-desc">
            让闲置物品找到新主人，让校园交易更便捷、更安全、更环保。
          </Text>
          <div className="footer-social">
            <Space>
              <a href="mailto:support@campus-exchange.com" aria-label="邮件联系">
                <MailOutlined />
              </a>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                <GithubOutlined />
              </a>
              <SafetyCertificateOutlined title="安全认证" />
            </Space>
          </div>
        </Col>

        {/* 快速链接 */}
        <Col xs={12} sm={8} md={4}>
          <Title level={5} className="footer-title">快速入口</Title>
          <ul className="footer-links">
            <li><Link to="/">首页</Link></li>
            <li><Link to="/products">商品列表</Link></li>
            <li><Link to="/publish">发布商品</Link></li>
            <li><Link to="/orders">我的订单</Link></li>
          </ul>
        </Col>

        {/* 帮助中心 */}
        <Col xs={12} sm={8} md={4}>
          <Title level={5} className="footer-title">帮助中心</Title>
          <ul className="footer-links">
            <li><Link to="/user-agreement">用户协议</Link></li>
            <li><Link to="/account-security">账号安全</Link></li>
            <li><Link to="/student-auth">学生认证</Link></li>
            <li><a href="mailto:support@campus-exchange.com">联系我们</a></li>
          </ul>
        </Col>

        {/* 平台特色 */}
        <Col xs={24} sm={8} md={6}>
          <Title level={5} className="footer-title">平台保障</Title>
          <div className="footer-badges">
            <div className="footer-badge">💰 省钱环保</div>
            <div className="footer-badge">🔒 实名认证</div>
            <div className="footer-badge">📱 随时交易</div>
            <div className="footer-badge">⭐ 评价体系</div>
          </div>
        </Col>
      </Row>
    </div>

    <Divider style={{ margin: '0' }} />

    <div className="footer-bottom">
      <Text type="secondary" className="footer-copyright">
        © 2026 校园二手交易平台 · 仅供学习交流使用
      </Text>
    </div>
  </footer>
);

export default AppFooter;
