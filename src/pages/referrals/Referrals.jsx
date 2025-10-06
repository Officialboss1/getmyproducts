import React, { useState, useEffect } from "react";
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
} from "antd";
import {
  UserAddOutlined,
  DollarOutlined,
  LinkOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import { referralsAPI } from '../../services/api';

const { Title, Text } = Typography;

const Referrals = () => {
  const [loading, setLoading] = useState(false);
  const [referrals, setReferrals] = useState([]);
  const [referralStats, setReferralStats] = useState(null);
  const [referralLink, setReferralLink] = useState("");

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
      console.error("Error fetching referral data:", error);
      message.error("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  };

  // Generate referral link
  const generateReferralLink = async () => {
    try {
      const { data } = await referralsAPI.getReferralLink();
      setReferralLink(data.referralLink);
      console.log("Generated referral link:", data.referralLink);
      message.success("Referral link generated successfully!");
    } catch (error) {
      message.error("Failed to generate referral link");
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  // Table Columns
  const columns = [
    {
      title: "Customer",
      dataIndex: "name",
      key: "name",
      render: (text) => <Text strong>{text}</Text>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
      render: (date) =>
        new Date(date).toLocaleDateString("en-GB", {
          year: "numeric",
          month: "short",
          day: "numeric",
        }),
    },
    {
      title: "Sales",
      dataIndex: "salesCount",
      key: "salesCount",
      render: (count) => <Tag color="blue">{count}</Tag>,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "completed" ? "green" : "orange"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <Row gutter={[16, 16]}>
        {/* Stats Overview */}
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Referrals"
              value={referralStats?.totalReferrals || 0}
              prefix={<UserAddOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Active Referrals"
              value={referralStats?.activeReferrals || 0}
              prefix={<TrophyOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Sales"
              value={referralStats?.totalSales || 0}
              prefix={<DollarOutlined />}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Bonus Earned"
              value={referralStats?.yourBonus?.toFixed(2) || 0}
              prefix="$"
              precision={2}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Progress Section */}
      {referralStats && (
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Card title="Referral Progress">
              <Space direction="vertical" style={{ width: "100%" }}>
                <Text>Referrals Progress</Text>
                <Progress
                  percent={
                    Math.round(
                      Math.min(
                      100,
                      (referralStats.progress?.referrals?.current /
                        referralStats.progress?.referrals?.target) *
                        100
                    ) || 0
                    )
                  }
                />
                <Text>Sales Progress</Text>
                <Progress
                  percent={
                   Math.round(
                     Math.min(
                      100,
                      (referralStats.progress?.sales?.current /
                        referralStats.progress?.sales?.target) *
                        100
                    ) || 0
                   )
                  }
                  status="active"
                />
              </Space>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card title="Team Head Qualification">
              <Statistic
                title="Progress Toward Promotion"
                value={referralStats.teamHeadProgress || 0}
                precision={0}
                suffix="%"
              />
              <Progress
                percent={referralStats.teamHeadProgress || 0}
                status={
                  referralStats.teamHeadProgress >= 100 ? "success" : "active"
                }
              />
            </Card>
          </Col>
        </Row>
      )}

      <Divider />

      {/* Referral Link Section */}
      <Card
        title="Your Referral Link"
        extra={
          <Button
            icon={<LinkOutlined />}
            onClick={generateReferralLink}
            type="primary"
          >
            Generate Link
          </Button>
        }
      >
        {referralLink ? (
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text copyable>{referralLink}</Text>
            <Text type="secondary">
              Share this link to invite new customers!
            </Text>
          </Space>
        ) : (
          <Text type="secondary">Click “Generate Link” to get started.</Text>
        )}
      </Card>

      <Divider />

      {/* Referrals Table */}
      <Card title="My Referrals">
        {loading ? (
          <div style={{ textAlign: "center", padding: 20 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={referrals}
            rowKey="_id"
            pagination={{ pageSize: 5 }}
          />
        )}
      </Card>
    </div>
  );
};

export default Referrals;
