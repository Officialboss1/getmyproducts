import React, { useState, useEffect } from 'react';
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
  Tabs,
  Table,
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  TeamOutlined,
  TrophyOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useReferralSettings } from '../../hooks/useReferralSettings';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ReferralSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [enableReferralSystem, setEnableReferralSystem] = useState(true);
  const [activeTab, setActiveTab] = useState('settings');

  const {
    settings,
    loading: settingsLoading,
    error,
    updateSettings,
  } = useReferralSettings();

  // Mock data
  const referralSettings = {
    enabled: true,
    requiredReferrals: 3,
    requiredSalesPerReferral: 5,
    teamHeadBonus: 500,
    referralBonus: 50,
    maxReferralBonus: 1000,
    autoPromotion: true,
    notificationEnabled: true,
  };

  const referralStats = {
    totalReferrals: 89,
    activeReferrals: 67,
    teamHeads: 23,
    totalBonuses: 12500,
    pendingPromotions: 8,
    thisMonthBonuses: 2450,
  };

  const referralHistory = [
    {
      id: 1,
      referrer: 'John Doe',
      referred: 'Mike Johnson',
      date: '2025-09-15',
      status: 'active',
      sales: 12,
      bonus: 50,
    },
    {
      id: 2,
      referrer: 'Sarah Wilson',
      referred: 'Emily Davis',
      date: '2025-09-20',
      status: 'active',
      sales: 8,
      bonus: 50,
    },
    {
      id: 3,
      referrer: 'David Brown',
      referred: 'Chris Taylor',
      date: '2025-10-01',
      status: 'pending',
      sales: 0,
      bonus: 0,
    },
  ];

  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings);
      setEnableReferralSystem(settings.enabled);
    }
  }, [settings, form]);

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

  const referralColumns = [
    {
      title: 'Referrer',
      dataIndex: 'referrer',
      key: 'referrer',
    },
    {
      title: 'Referred',
      dataIndex: 'referred',
      key: 'referred',
    },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Sales',
      dataIndex: 'sales',
      key: 'sales',
      align: 'center',
    },
    {
      title: 'Bonus',
      dataIndex: 'bonus',
      key: 'bonus',
      render: (bonus) => `$${bonus}`,
      align: 'right',
    },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <SettingOutlined /> Referral System
          </Title>
          <Text type="secondary">
            Configure referral program and track team growth
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

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="Settings" key="settings">
          <Row gutter={[24, 24]}>
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

            <Col xs={24} lg={8}>
              <Card title="Program Statistics" style={{ marginBottom: 24 }}>
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Statistic
                    title="Total Referrals"
                    value={referralStats.totalReferrals}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <Statistic
                    title="Active Referrals"
                    value={referralStats.activeReferrals}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Statistic
                    title="Team Heads Created"
                    value={referralStats.teamHeads}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                  <Statistic
                    title="Total Bonuses Paid"
                    value={referralStats.totalBonuses}
                    prefix="$"
                    valueStyle={{ color: '#722ed1' }}
                  />
                </Space>
              </Card>

              <Card title="Quick Actions">
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Button type="dashed" block>
                    View All Referrals
                  </Button>
                  <Button type="dashed" block>
                    Export Referral Report
                  </Button>
                  <Button type="dashed" block>
                    Send Program Update
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>

        <TabPane tab="Referral History" key="history">
          <Card>
            <Table
              columns={referralColumns}
              dataSource={referralHistory}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) => 
                  `${range[0]}-${range[1]} of ${total} referrals`,
              }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Team Progress" key="progress">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <Card title="Promotion Progress">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <div>
                    <Text strong>Eligible for Promotion: </Text>
                    <Text>{referralStats.pendingPromotions} salespersons</Text>
                    <Progress
                      percent={Math.round((referralStats.pendingPromotions / 45) * 100)}
                      style={{ marginTop: 8 }}
                    />
                  </div>
                  <div>
                    <Text strong>Team Head Conversion Rate: </Text>
                    <Text>51%</Text>
                    <Progress
                      percent={51}
                      status="active"
                      style={{ marginTop: 8 }}
                    />
                  </div>
                </Space>
              </Card>
            </Col>
            <Col xs={24} sm={12}>
              <Card title="Monthly Overview">
                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                  <Statistic
                    title="This Month's Bonuses"
                    value={referralStats.thisMonthBonuses}
                    prefix="$"
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Statistic
                    title="New Referrals"
                    value={12}
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <Statistic
                    title="New Team Heads"
                    value={3}
                    valueStyle={{ color: '#faad14' }}
                  />
                </Space>
              </Card>
            </Col>
          </Row>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReferralSettings;