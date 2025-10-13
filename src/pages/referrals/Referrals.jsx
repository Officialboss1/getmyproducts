import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Progress,
  Table,
  Typography,
  Button,
  message,
  Space,
  Tag,
  Divider,
  Spin,
} from 'antd';
import {
  UserAddOutlined,
  DollarOutlined,
  LinkOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { referralsAPI } from '../../api/services/api';
import { useBonusValues } from '../../hooks/useBonusSettings';

const { Title, Text } = Typography;

const Referrals = () => {
  const [loading, setLoading] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [referralLink, setReferralLink] = useState('');

  // Get dynamic bonus settings from admin/superadmin configuration
  const { referralBonus, teamHeadBonus, formatCurrency, hasSettings } = useBonusValues();

  // Fetch referrals and stats from backend
  const fetchReferralData = async () => {
    setLoading(true);
    try {
      const [referralsRes, statsRes] = await Promise.all([
        referralsAPI.getMyReferrals(),
        referralsAPI.getReferralStats(),
      ]);

      setReferrals(referralsRes.data || []);
      setReferralStats(statsRes.data || {});
    } catch (error) {
      console.error('Error fetching referral data:', error);
      message.error('Failed to load referral data');
    } finally {
      setLoading(false);
    }
  };

  // Generate referral link
  const generateReferralLink = async () => {
    try {
      const { data } = await referralsAPI.getReferralLink();
      setReferralLink(data.referralLink);
      console.log('Generated referral link:', data.referralLink);
      message.success('Referral link generated successfully!');
    } catch (error) {
      message.error('Failed to generate referral link');
    }
  };


  useEffect(() => {
    fetchReferralData();
  }, []);

  // Table Columns
  const columns = [
    {
      title: 'Customer',
      dataIndex: 'name',
      key: 'customer',
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date) =>
        new Date(date).toLocaleDateString('en-GB', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
    },
    {
      title: 'Sales',
      dataIndex: 'salesCount',
      key: 'sales',
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: 'Bonus Earned',
      key: 'bonusEarned',
      render: (_, record) => (
        <Text strong style={{ color: '#52c41a' }}>
          {hasSettings ? formatCurrency(record.salesCount * referralBonus) : '$0.00'}
        </Text>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'completed' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <UserAddOutlined /> My Referrals
          </Title>
          <Text type="secondary">
            Track your referral progress and earnings
          </Text>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Total Referrals"
              value={referralStats?.totalReferrals || 0}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Active Referrals"
              value={referralStats?.activeReferrals || 0}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Total Sales"
              value={referralStats?.totalSales || 0}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>

        <Col span={6}>
          <Card size="small">
            <Statistic
              title="Bonus Earned"
              value={
                hasSettings && referralStats?.totalReferrals
                  ? (referralStats.totalReferrals * referralBonus).toFixed(2)
                  : '0.00'
              }
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      {/* Referral Link Section */}
      <Card
        className="border-0 shadow-sm"
        bodyStyle={{ padding: '20px 16px' }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
          <div>
            <Title level={4} className="text-base sm:text-lg md:text-xl m-0 mb-1 flex items-center gap-2">
              <LinkOutlined className="text-blue-600" />
              Your Referral Link
            </Title>
            <Text type="secondary" className="text-sm">
              Generate and share your unique referral link
            </Text>
          </div>

          <div className="flex-shrink-0">
            <Button
              icon={<LinkOutlined />}
              onClick={generateReferralLink}
              type="primary"
              size="small"
              className="text-sm"
            >
              Generate Link
            </Button>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          {referralLink ? (
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex-1">
                  <Text
                    copyable={{
                      text: referralLink,
                      onCopy: () => message.success('Link copied to clipboard!')
                    }}
                    className="text-sm sm:text-base font-mono bg-white px-3 py-2 rounded border break-all"
                    style={{ wordBreak: 'break-all' }}
                  >
                    {referralLink}
                  </Text>
                </div>
                <Button
                  type="link"
                  icon={<LinkOutlined />}
                  onClick={() => {
                    navigator.share?.({
                      title: 'Join Sales Tracker',
                      text: 'Check out this amazing sales tracking platform!',
                      url: referralLink
                    }).catch(() => {
                      // Fallback for browsers without Web Share API
                      const textArea = document.createElement('textarea');
                      textArea.value = referralLink;
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      message.success('Link copied to clipboard!');
                    });
                  }}
                  className="text-blue-600 hover:text-blue-700 whitespace-nowrap"
                >
                  Share Link
                </Button>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 pt-2 border-t border-gray-200">
                <Text type="secondary" className="text-sm">
                  <span className="font-medium text-green-600">💡 Tip:</span> Share this link with potential customers to earn referral bonuses!
                </Text>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <LinkOutlined className="text-4xl text-gray-300 mb-3" />
              <div>
                <Text type="secondary" className="text-sm block mb-3">
                  No referral link generated yet
                </Text>
                <Button
                  icon={<LinkOutlined />}
                  onClick={generateReferralLink}
                  type="primary"
                  size="small"
                >
                  Generate Your Link
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Divider />

      {/* Referrals Table */}
      <Card title="My Referrals">
        {loading ? (
          <div style={{ textAlign: 'center', padding: 20 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={referrals}
            rowKey={(record) =>
              record._id ||
              record.id ||
              record.email ||
              `referral-${Math.random()}`
            }
            pagination={{ pageSize: 5 }}
            scroll={{ x: 600 }}
            size="small"
          />
        )}
      </Card>
    </div>
  );
};

export default Referrals;


