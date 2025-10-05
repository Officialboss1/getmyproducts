import React, { useState } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Button,
  Typography,
  Row,
  Col,
  Statistic,
  Divider,
  Alert,
  Switch,
  Space,
  Tag,
  Progress,
  message,
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  TeamOutlined,
  TrophyOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { useReferralSettings } from '../../hooks/useReferralSettings';

const { Title, Text } = Typography;

const ReferralSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [enableReferralSystem, setEnableReferralSystem] = useState(true);

  const {
    settings,
    loading: settingsLoading,
    error,
    updateSettings,
  } = useReferralSettings();

  // Mock data - replace with actual API data
  const referralSettings = {
    enabled: true,
    requiredReferrals: 3,
    requiredSalesPerReferral: 5,
    teamHeadBonus: 500,
    referralBonus: 50,
    maxReferralBonus: 1000,
    autoPromotion: true,
    notificationEnabled: true,
    stats: {
      totalReferrals: 245,
      activeReferrals: 189,
      teamHeads: 45,
      totalBonuses: 12500,
    }
  };

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const updatedSettings = {
        ...values,
        enabled: enableReferralSystem,
      };
      await updateSettings(updatedSettings);
      message.success('Referral settings updated successfully!');
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnableChange = (checked) => {
    setEnableReferralSystem(checked);
    if (!checked) {
      message.warning('Referral system has been disabled');
    } else {
      message.success('Referral system has been enabled');
    }
  };

  const stats = referralSettings.stats;

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <SettingOutlined /> Referral System Settings
          </Title>
          <Text type="secondary">
            Configure referral thresholds, bonuses, and team promotion rules
          </Text>
        </Col>
        <Col>
          <Space>
            <Text>Referral System:</Text>
            <Switch
              checked={enableReferralSystem}
              onChange={handleEnableChange}
              checkedChildren="Enabled"
              unCheckedChildren="Disabled"
            />
          </Space>
        </Col>
      </Row>

      {!enableReferralSystem && (
        <Alert
          message="Referral System Disabled"
          description="The referral system is currently disabled. No new referrals can be made and existing referrals are paused."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Referrals"
              value={stats.totalReferrals}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Active Referrals"
              value={stats.activeReferrals}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Team Heads"
              value={stats.teamHeads}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card>
            <Statistic
              title="Total Bonuses"
              value={stats.totalBonuses}
              prefix="$"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Settings Form */}
        <Col xs={24} lg={16}>
          <Card 
            title="Referral Configuration"
            loading={settingsLoading}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              initialValues={referralSettings}
              disabled={!enableReferralSystem}
            >
              <Title level={4}>Promotion Requirements</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Required Referrals"
                    name="requiredReferrals"
                    tooltip="Number of referrals needed to become Team Head"
                    rules={[{ required: true, message: 'Please enter required referrals' }]}
                  >
                    <InputNumber
                      min={1}
                      max={20}
                      style={{ width: '100%' }}
                      placeholder="e.g., 3"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Sales per Referral"
                    name="requiredSalesPerReferral"
                    tooltip="Minimum sales each referral must make"
                    rules={[{ required: true, message: 'Please enter required sales' }]}
                  >
                    <InputNumber
                      min={1}
                      max={100}
                      style={{ width: '100%' }}
                      placeholder="e.g., 5"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Divider />

              <Title level={4}>Bonus Configuration</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Referral Bonus"
                    name="referralBonus"
                    tooltip="Bonus amount for each successful referral"
                    rules={[{ required: true, message: 'Please enter referral bonus' }]}
                  >
                    <InputNumber
                      min={0}
                      max={1000}
                      prefix="$"
                      style={{ width: '100%' }}
                      placeholder="e.g., 50"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Team Head Bonus"
                    name="teamHeadBonus"
                    tooltip="One-time bonus when promoted to Team Head"
                    rules={[{ required: true, message: 'Please enter team head bonus' }]}
                  >
                    <InputNumber
                      min={0}
                      max={5000}
                      prefix="$"
                      style={{ width: '100%' }}
                      placeholder="e.g., 500"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                label="Maximum Referral Bonus"
                name="maxReferralBonus"
                tooltip="Maximum total bonus a user can earn from referrals"
              >
                <InputNumber
                  min={0}
                  max={10000}
                  prefix="$"
                  style={{ width: '100%' }}
                  placeholder="e.g., 1000"
                />
              </Form.Item>

              <Divider />

              <Title level={4}>System Settings</Title>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    label="Auto Promotion"
                    name="autoPromotion"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="Auto"
                      unCheckedChildren="Manual"
                    />
                  </Form.Item>
                  <Text type="secondary">
                    Automatically promote to Team Head when requirements are met
                  </Text>
                </Col>
                <Col span={12}>
                  <Form.Item
                    label="Notifications"
                    name="notificationEnabled"
                    valuePropName="checked"
                  >
                    <Switch
                      checkedChildren="On"
                      unCheckedChildren="Off"
                    />
                  </Form.Item>
                  <Text type="secondary">
                    Send notifications for referral activities
                  </Text>
                </Col>
              </Row>

              <Form.Item style={{ marginTop: 24 }}>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                  loading={loading}
                  disabled={!enableReferralSystem}
                >
                  Save Settings
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </Col>

        {/* Guidelines & Information */}
        <Col xs={24} lg={8}>
          <Card title="System Overview" style={{ marginBottom: 24 }}>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <div>
                <Text strong>Current Status:</Text>
                <br />
                <Tag color={enableReferralSystem ? "green" : "red"} style={{ marginTop: 4 }}>
                  {enableReferralSystem ? "ACTIVE" : "DISABLED"}
                </Tag>
              </div>
              
              <div>
                <Text strong>Team Head Progress:</Text>
                <Progress
                  percent={65}
                  status="active"
                  style={{ marginTop: 8 }}
                />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  45 of 70 eligible salespersons
                </Text>
              </div>

              <Divider />

              <Text strong>Quick Stats:</Text>
              <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Row justify="space-between">
                  <Text>Pending Promotions:</Text>
                  <Text strong>12</Text>
                </Row>
                <Row justify="space-between">
                  <Text>This Month's Bonuses:</Text>
                  <Text strong>$2,450</Text>
                </Row>
                <Row justify="space-between">
                  <Text>Avg Referral Time:</Text>
                  <Text strong>7 days</Text>
                </Row>
              </Space>
            </Space>
          </Card>

          <Card title="Best Practices">
            <Space direction="vertical" size="middle">
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <Text>Set achievable but challenging targets</Text>
              </div>
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <Text>Balance bonus amounts with budget constraints</Text>
              </div>
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <Text>Monitor referral quality, not just quantity</Text>
              </div>
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <Text>Regularly review and adjust thresholds</Text>
              </div>
              <div>
                <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                <Text>Communicate changes to all users</Text>
              </div>
            </Space>
          </Card>

          <Card title="Impact Analysis" style={{ marginTop: 24 }}>
            <Alert
              message="Settings Change Impact"
              description="Changing these settings will affect all current and future referrals. Existing Team Heads will not be demoted."
              type="info"
              showIcon
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ReferralSettings;