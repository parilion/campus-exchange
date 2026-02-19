import React from 'react';
import { Card, Typography, Space, Button, Divider } from 'antd';
import { FileTextOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Text } = Typography;

const UserAgreementPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px' }}>
      <Card
        title={
          <Space>
            <FileTextOutlined />
            <span>用户协议与隐私政策</span>
          </Space>
        }
        extra={<Button onClick={() => navigate(-1)}>返回</Button>}
      >
        <Typography>
          <Title level={3}>Campus Exchange 用户服务协议</Title>
          <Paragraph type="secondary">
            更新日期：2026年1月1日 | 生效日期：2026年1月1日
          </Paragraph>

          <Paragraph>
            欢迎使用 Campus Exchange 校园二手交易平台（以下简称"本平台"）。
            在使用本平台前，请您仔细阅读以下服务协议（以下简称"本协议"）。
          </Paragraph>

          <Divider />

          <Title level={4}>一、服务说明</Title>
          <Paragraph>
            本平台是专为在校大学生提供的二手物品交易平台，提供商品发布、搜索、沟通、交易等功能。
            本平台仅提供信息展示和交流服务，不参与用户间的具体交易行为。
          </Paragraph>

          <Title level={4}>二、用户注册与账号</Title>
          <Paragraph>
            <Text strong>2.1</Text> 用户须使用真实、准确的信息进行注册，不得冒充他人或使用虚假信息。
          </Paragraph>
          <Paragraph>
            <Text strong>2.2</Text> 每个用户只能注册一个账号，禁止出售、转让、出借账号。
          </Paragraph>
          <Paragraph>
            <Text strong>2.3</Text> 建议用户完成学生认证，以提高交易可信度。
          </Paragraph>
          <Paragraph>
            <Text strong>2.4</Text> 用户须妥善保管账号密码，因密码泄露导致的损失由用户自行承担。
          </Paragraph>

          <Title level={4}>三、平台规则</Title>
          <Paragraph>
            <Text strong>3.1 禁止发布内容：</Text>
          </Paragraph>
          <ul>
            <li>违禁物品（管制刀具、违禁药品等）</li>
            <li>涉及色情、暴力、违法的内容</li>
            <li>虚假商品信息或欺骗性描述</li>
            <li>盗版软件、未经授权的复制品</li>
            <li>侵犯他人知识产权的商品</li>
          </ul>
          <Paragraph>
            <Text strong>3.2 交易规范：</Text>
          </Paragraph>
          <ul>
            <li>商品描述应真实、准确，不得隐瞒重大缺陷</li>
            <li>价格应合理，不得哄抬物价</li>
            <li>双方应友好协商，诚信交易</li>
            <li>建议在校园内安全场所进行当面交易</li>
          </ul>

          <Title level={4}>四、隐私保护</Title>
          <Paragraph>
            <Text strong>4.1</Text> 本平台严格保护用户隐私信息，不会向第三方出售或泄露您的个人信息。
          </Paragraph>
          <Paragraph>
            <Text strong>4.2</Text> 我们收集的信息仅用于提供和改善服务，包括：用户名、邮箱、学号（用于认证）、交易记录等。
          </Paragraph>
          <Paragraph>
            <Text strong>4.3</Text> 用户的联系方式（手机号等）仅在交易双方之间共享，不会公开展示。
          </Paragraph>
          <Paragraph>
            <Text strong>4.4</Text> 您可以在账号设置中查看、修改或删除您的个人信息。
          </Paragraph>

          <Title level={4}>五、免责声明</Title>
          <Paragraph>
            <Text strong>5.1</Text> 本平台不对用户间的交易结果承担责任，用户应自行核实商品真实性。
          </Paragraph>
          <Paragraph>
            <Text strong>5.2</Text> 因不可抗力或技术故障导致的服务中断，本平台不承担责任。
          </Paragraph>
          <Paragraph>
            <Text strong>5.3</Text> 如发现违规行为，请通过举报功能向平台反映。
          </Paragraph>

          <Title level={4}>六、违规处理</Title>
          <Paragraph>
            对于违反本协议的用户，本平台有权采取以下措施：
          </Paragraph>
          <ul>
            <li>警告提示</li>
            <li>删除违规内容</li>
            <li>限制账号功能</li>
            <li>永久封禁账号</li>
          </ul>

          <Title level={4}>七、协议修改</Title>
          <Paragraph>
            本平台有权根据实际情况修改本协议，修改后的协议将在平台上公布。
            继续使用平台即表示您同意修改后的协议。
          </Paragraph>

          <Divider />

          <Paragraph type="secondary" style={{ textAlign: 'center' }}>
            如有疑问，请联系平台管理员 | Campus Exchange Team
          </Paragraph>
        </Typography>
      </Card>
    </div>
  );
};

export default UserAgreementPage;
