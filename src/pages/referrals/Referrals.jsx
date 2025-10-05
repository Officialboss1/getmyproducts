import React, { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Typography,
  Row,
  Col,
  Statistic,
  Progress,
  Tag,
  Space,
  Alert,
  Input,
  message,
  Divider,
  List,
  Empty,
  Modal,
  Steps,
  Tooltip,
  Badge,
} from 'antd';
import {
  TeamOutlined,
  UserAddOutlined,
  ShareAltOutlined,
  CopyOutlined,
  ArrowLeftOutlined,
  TrophyOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  StarOutlined,
  CrownOutlined,
  DollarOutlined,
  RocketOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Step } = Steps;

const Referrals = () => {
  const navigate = useNavigate();
  const [referrals, setReferrals] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [referralLink, setReferralLink] = useState('');
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);
  const [activePromotionStep, setActivePromotionStep] = useState(0);

  useEffect(() => {
    fetchReferralData();
    generateReferralLink();
    calculatePromotionProgress();
  }, []);

  const fetchReferralData = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual endpoints when available
      // const response = await api.referrals.getMyReferrals();
      // const stats = await api.referrals.getReferralStats();
      
      // Mock data for demonstration
      const mockReferrals = [
        {
          id: '1',
          name: 'John Smith',
          email: 'john@example.com',
          joinDate: '2025-09-15',
          status: 'active',
          salesCount: 15,
          totalRevenue: 3000,
          performance: 'excellent',
          lastSale: '2025-10-01',
        },
        {
          id: '2',
          name: 'Sarah Johnson',
          email: 'sarah@example.com',
          joinDate: '2025-09-20',
          status: 'active',
          salesCount: 8,
          totalRevenue: 1600,
          performance: 'good',
          lastSale: '2025-09-28',
        },
        {
          id: '3',
          name: 'Mike Brown',
          email: 'mike@example.com',
          joinDate: '2025-10-01',
          status: 'pending',
          salesCount: 0,
          totalRevenue: 0,
          performance: 'pending',
          lastSale: null,
        },
        {
          id: '4',
          name: 'Emily Davis',
          email: 'emily@example.com',
          joinDate: '2025-09-10',
          status: 'active',
          salesCount: 22,
          totalRevenue: 4400,
          performance: 'excellent',
          lastSale: '2025-10-02',
        },
      ];

      const mockStats = {
        totalReferrals: 4,
        activeReferrals: 3,
        pendingReferrals: 1,
        totalSales: 45,
        totalRevenue: 9000,
        yourBonus: 450,
        progress: {
          referrals: { current: 3, target: 5 },
          sales: { current: 45, target: 75 },
        },
        isTeamHead: false,
        teamHeadProgress: 66, // 66% towards team head
      };

      setReferrals(mockReferrals);
      setReferralStats(mockStats);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      message.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  const generateReferralLink = () => {
    // TODO: Generate actual referral link from backend
    const baseUrl = window.location.origin;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const referralCode = `REF-${user._id?.substr(-6) || '123456'}`;
    setReferralLink(`${baseUrl}/register?ref=${referralCode}`);
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralLink);
    message.success('Referral link copied to clipboard!');
  };

  const shareReferralLink = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Join Our Sales Team!',
        text: 'Use my referral link to join our amazing sales team and start earning!',
        url: referralLink,
      });
    } else {
      setIsShareModalVisible(true);
    }
  };

  const calculatePromotionProgress = () => {
    // Calculate which step is currently active
    const progress = referralStats?.teamHeadProgress || 0;
    if (progress >= 100) {
      setActivePromotionStep(3); // Promoted
    } else if (progress >= 66) {
      setActivePromotionStep(2); // Almost there
    } else if (progress >= 33) {
      setActivePromotionStep(1); // In progress
    } else {
      setActivePromotionStep(0); // Just started
    }
  };

  const getPerformanceTag = (performance) => {
    const performanceConfig = {
      excellent: { color: 'green', text: 'Excellent', icon: <StarOutlined /> },
      good: { color: 'blue', text: 'Good', icon: <CheckCircleOutlined /> },
      average: { color: 'orange', text: 'Average', icon: <ClockCircleOutlined /> },
      poor: { color: 'red', text: 'Needs Help', icon: <ClockCircleOutlined /> },
      pending: { color: 'default', text: 'Pending', icon: <ClockCircleOutlined /> },
    };
    
    const config = performanceConfig[performance] || performanceConfig.pending;
    return (
      <Tag color={config.color} icon={config.icon}>
        {config.text}
      </Tag>
    );
  };

  const getStatusTag = (status) => {
    return status === 'active' ? (
      <Tag color="green" icon={<CheckCircleOutlined />}>Active</Tag>
    ) : (
      <Tag color="orange" icon={<ClockCircleOutlined />}>Pending</Tag>
    );
  };

  const columns = [
    {
      title: 'Referral',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text}</Text>
          <Text type="secondary" style={{ fontSize: '12px' }}>{record.email}</Text>
        </Space>
      ),
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date) => (
        <Text>{new Date(date).toLocaleDateString()}</Text>
      ),
      sorter: (a, b) => new Date(a.joinDate) - new Date(b.joinDate),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusTag(status),
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Pending', value: 'pending' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Performance',
      dataIndex: 'performance',
      key: 'performance',
      render: (performance) => getPerformanceTag(performance),
    },
    {
      title: 'Sales',
      dataIndex: 'salesCount',
      key: 'sales',
      align: 'center',
      render: (count) => (
        <Badge 
          count={count} 
          showZero 
          style={{ backgroundColor: count > 0 ? '#52c41a' : '#d9d9d9' }} 
        />
      ),
      sorter: (a, b) => a.salesCount - b.salesCount,
    },
    {
      title: 'Revenue',
      dataIndex: 'totalRevenue',
      key: 'revenue',
      align: 'right',
      render: (revenue) => (
        <Text strong style={{ color: revenue > 0 ? '#52c41a' : '#d9d9d9' }}>
          ${revenue?.toLocaleString()}
        </Text>
      ),
      sorter: (a, b) => a.totalRevenue - b.totalRevenue,
    },
    {
      title: 'Last Sale',
      dataIndex: 'lastSale',
      key: 'lastSale',
      render: (date) => (
        date ? (
          <Text type="secondary" style={{ fontSize: '12px' }}>
            {new Date(date).toLocaleDateString()}
          </Text>
        ) : (
          <Text type="secondary" style={{ fontSize: '12px' }}>No sales yet</Text>
        )
      ),
    },
  ];

  const promotionRequirements = [
    {
      title: 'Referral Count',
      description: 'Refer 5 salespersons',
      current: referralStats?.progress.referrals.current || 0,
      target: 5,
      icon: <TeamOutlined />,
    },
    {
      title: 'Team Sales',
      description: 'Team makes 75+ total sales',
      current: referralStats?.progress.sales.current || 0,
      target: 75,
      icon: <DollarOutlined />,
    },
    {
      title: 'Success Rate',
      description: 'Maintain 80% active referral rate',
      current: 75, // Mock data
      target: 80,
      icon: <CheckCircleOutlined />,
    },
  ];

  const shareOptions = [
    {
      name: 'Email',
      icon: '📧',
      action: () => {
        const subject = 'Join Our Sales Team!';
        const body = `Hi! I think you'd be a great addition to our sales team. Use my referral link to join: ${referralLink}`;
        window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
      },
    },
    {
      name: 'WhatsApp',
      icon: '💬',
      action: () => {
        const text = `Join our amazing sales team! Use my referral link: ${referralLink}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
      },
    },
    {
      name: 'LinkedIn',
      icon: '💼',
      action: () => {
        const text = `Check out this opportunity to join our sales team! ${referralLink}`;
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`);
      },
    },
    {
      name: 'SMS',
      icon: '📱',
      action: () => {
        const text = `Join our sales team! Referral link: ${referralLink}`;
        window.open(`sms:?body=${encodeURIComponent(text)}`);
      },
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Button 
            type="text" 
            icon={<ArrowLeftOutlined />} 
            onClick={() => navigate('/dashboard')}
            style={{ marginBottom: 16 }}
          >
            Back to Dashboard
          </Button>
          <Title level={2} style={{ margin: 0 }}>
            <TeamOutlined /> Referral Program
          </Title>
          <Text type="secondary">
            Grow your team, earn bonuses, and unlock Team Head benefits
          </Text>
        </Col>
      </Row>

      {/* Team Head Promotion Alert */}
      {!referralStats?.isTeamHead && (
        <Alert
          message="Team Head Promotion Progress"
          description={`You're ${referralStats?.teamHeadProgress || 0}% towards becoming a Team Head! Refer more salespersons to unlock team management features and higher bonuses.`}
          type="info"
          showIcon
          icon={<RocketOutlined />}
          style={{ marginBottom: 24 }}
          action={
            <Button size="small" type="primary">
              Learn More
            </Button>
          }
        />
      )}

      {/* Referral Stats */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Referrals"
              value={referralStats?.totalReferrals || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Referrals"
              value={referralStats?.activeReferrals || 0}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Team Sales"
              value={referralStats?.totalSales || 0}
              suffix="units"
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Your Bonus"
              value={referralStats?.yourBonus || 0}
              prefix="$"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Referral Link Section */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <UserAddOutlined />
                Invite New Team Members
              </Space>
            }
            extra={
              <Button 
                type="primary" 
                icon={<ShareAltOutlined />}
                onClick={shareReferralLink}
              >
                Share Referral
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Text strong>Your Personal Referral Link:</Text>
              <Space.Compact style={{ width: '100%' }}>
                <TextArea
                  value={referralLink}
                  rows={2}
                  readOnly
                  style={{ resize: 'none' }}
                  placeholder="Generating referral link..."
                />
                <Button 
                  icon={<CopyOutlined />}
                  onClick={copyReferralLink}
                  style={{ height: 'auto' }}
                >
                  Copy
                </Button>
              </Space.Compact>
              
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Share this link with potential salespersons. When they join using your link, 
                they become part of your referral network and you earn bonuses from their sales.
              </Text>
            </Space>
            
            <Divider />

            {/* Promotion Progress */}
            <Title level={5}>Team Head Promotion Progress</Title>
            <Steps
              current={activePromotionStep}
              size="small"
              items={[
                {
                  title: 'Getting Started',
                  description: 'Make your first referral',
                },
                {
                  title: 'Building Team',
                  description: 'Refer 2+ salespersons',
                },
                {
                  title: 'Almost There',
                  description: 'Meet most requirements',
                },
                {
                  title: 'Team Head',
                  description: 'Unlock all features',
                },
              ]}
            />

            <Divider />

            {/* Benefits Section */}
            <Title level={5}>Referral Benefits</Title>
            <List
              size="small"
              dataSource={[
                '5% bonus on all your referrals\' sales',
                'Team performance dashboard access',
                'Team Head badge and recognition',
                'Higher commission rates',
                'Team management tools',
                'Leadership bonuses',
              ]}
              renderItem={(item) => (
                <List.Item>
                  <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                  {item}
                </List.Item>
              )}
            />
          </Card>
        </Col>

        {/* Team Head Requirements */}
        <Col xs={24} lg={12}>
          <Card 
            title={
              <Space>
                <CrownOutlined />
                Team Head Requirements
              </Space>
            }
            extra={
              referralStats?.isTeamHead ? (
                <Tag color="gold" icon={<CrownOutlined />}>Team Head</Tag>
              ) : (
                <Text type="secondary">{referralStats?.teamHeadProgress || 0}% Complete</Text>
              )
            }
          >
            {referralStats?.isTeamHead ? (
              <Alert
                message="Congratulations! You're a Team Head"
                description="You've unlocked all team management features and higher bonus rates."
                type="success"
                showIcon
                icon={<CrownOutlined />}
              />
            ) : (
              <Space direction="vertical" style={{ width: '100%' }} size="middle">
                {promotionRequirements.map((req, index) => (
                  <Card key={index} size="small" style={{ background: '#fafafa' }}>
                    <Row align="middle" gutter={16}>
                      <Col>
                        <div style={{ fontSize: '20px' }}>{req.icon}</div>
                      </Col>
                      <Col flex="1">
                        <Text strong>{req.title}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                          {req.description}
                        </Text>
                      </Col>
                      <Col>
                        <Progress
                          type="circle"
                          percent={Math.min(100, (req.current / req.target) * 100)}
                          size={60}
                          format={() => `${req.current}/${req.target}`}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
              </Space>
            )}

            <Divider />

            {/* Quick Stats */}
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Referral Progress"
                  value={referralStats?.progress.referrals.current || 0}
                  suffix={`/ ${referralStats?.progress.referrals.target || 5}`}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Sales Progress"
                  value={referralStats?.progress.sales.current || 0}
                  suffix={`/ ${referralStats?.progress.sales.target || 75}`}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      {/* Referrals Table */}
      <Card
        title={
          <Space>
            <TeamOutlined />
            Your Referral Network
            <Tag>{referrals.length} people</Tag>
          </Space>
        }
        style={{ marginTop: 24 }}
        loading={loading}
        extra={
          <Button 
            icon={<UserAddOutlined />}
            onClick={shareReferralLink}
          >
            Invite More
          </Button>
        }
      >
        {referrals.length > 0 ? (
          <Table
            columns={columns}
            dataSource={referrals}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) => 
                `${range[0]}-${range[1]} of ${total} referrals`,
            }}
            scroll={{ x: 800 }}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No referrals yet"
          >
            <Button type="primary" onClick={shareReferralLink}>
              Make Your First Referral
            </Button>
          </Empty>
        )}
      </Card>

      {/* Share Modal */}
      <Modal
        title="Share Referral Link"
        open={isShareModalVisible}
        onCancel={() => setIsShareModalVisible(false)}
        footer={[
          <Button key="copy" icon={<CopyOutlined />} onClick={copyReferralLink}>
            Copy Link
          </Button>,
          <Button key="cancel" onClick={() => setIsShareModalVisible(false)}>
            Close
          </Button>,
        ]}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Text strong>Choose how you want to share:</Text>
          
          <Row gutter={[16, 16]}>
            {shareOptions.map((option, index) => (
              <Col xs={12} sm={8} key={index}>
                <Card
                  hoverable
                  style={{ textAlign: 'center' }}
                  bodyStyle={{ padding: '16px 8px' }}
                  onClick={option.action}
                >
                  <div style={{ fontSize: '24px', marginBottom: 8 }}>
                    {option.icon}
                  </div>
                  <Text>{option.name}</Text>
                </Card>
              </Col>
            ))}
          </Row>

          <Divider />

          <Text strong>Or copy the link directly:</Text>
          <Space.Compact style={{ width: '100%' }}>
            <Input value={referralLink} readOnly />
            <Button 
              icon={<CopyOutlined />}
              onClick={copyReferralLink}
            >
              Copy
            </Button>
          </Space.Compact>
        </Space>
      </Modal>
    </div>
  );
};

export default Referrals;