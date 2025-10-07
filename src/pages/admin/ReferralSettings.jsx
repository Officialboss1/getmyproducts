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
  Spin,
} from 'antd';
import {
  SettingOutlined,
  SaveOutlined,
  TeamOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { useReferralSettings } from '../../hooks/useReferralSettings';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ReferralSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [enableReferralSystem, setEnableReferralSystem] = useState(true);
  const [activeTab, setActiveTab] = useState('settings');

  const { settings, loading: settingsLoading, error, updateSettings } = useReferralSettings();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings);
      setEnableReferralSystem(settings.enabled ?? true);
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
    } catch (err) {
      message.error(err?.message || 'Failed to update settings');
    } finally {
      setLoading(false);
    }
  };

  const handleEnableChange = (checked) => {
    setEnableReferralSystem(checked);
    message.info(`Referral system ${checked ? 'enabled' : 'disabled'}`);
  };

  if (settingsLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <Spin size="large" tip="Loading referral settings..." />
      </div>
    );
  }

  if (error) {
    return <Alert type="error" message="Error loading referral settings" description={error.message} />;
  }

  const referralStats = settings?.stats || {};
  const referralHistory = settings?.history || [];

  const referralColumns = [
    { title: 'Referrer', dataIndex: 'referrer', key: 'referrer' },
    { title: 'Referred', dataIndex: 'referred', key: 'referred' },
    { title: 'Date', dataIndex: 'date', key: 'date', render: (d) => new Date(d).toLocaleDateString() },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>{status.toUpperCase()}</Tag>
      ),
    },
    { title: 'Sales', dataIndex: 'sales', key: 'sales', align: 'center' },
    { title: 'Bonus', dataIndex: 'bonus', key: 'bonus', render: (b) => `$${b}`, align: 'right' },
  ];

  return (
    <div>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>
            <SettingOutlined /> Referral System
          </Title>
          <Text type="secondary">Configure referral program and track team growth</Text>
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
              <Card title="Referral Configuration">
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={onFinish}
                  disabled={!enableReferralSystem}
                >
                  <Title level={4}>Promotion Requirements</Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Required Referrals"
                        name="requiredReferrals"
                        rules={[{ required: true, message: 'Enter required referrals' }]}
                      >
                        <InputNumber min={1} max={20} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Sales per Referral"
                        name="requiredSalesPerReferral"
                        rules={[{ required: true, message: 'Enter sales per referral' }]}
                      >
                        <InputNumber min={1} max={100} style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider />
                  <Title level={4}>Bonus Configuration</Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Referral Bonus" name="referralBonus">
                        <InputNumber min={0} max={1000} prefix="$" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Team Head Bonus" name="teamHeadBonus">
                        <InputNumber min={0} max={5000} prefix="$" style={{ width: '100%' }} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="Maximum Referral Bonus" name="maxReferralBonus">
                    <InputNumber min={0} max={10000} prefix="$" style={{ width: '100%' }} />
                  </Form.Item>

                  <Divider />
                  <Title level={4}>System Settings</Title>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="Auto Promotion" name="autoPromotion" valuePropName="checked">
                        <Switch checkedChildren="Auto" unCheckedChildren="Manual" />
                      </Form.Item>
                      <Text type="secondary">
                        Automatically promote to Team Head when requirements are met
                      </Text>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Notifications" name="notificationEnabled" valuePropName="checked">
                        <Switch checkedChildren="On" unCheckedChildren="Off" />
                      </Form.Item>
                      <Text type="secondary">Send notifications for referral activities</Text>
                    </Col>
                  </Row>

                  <Form.Item style={{ marginTop: 24 }}>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={loading}>
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
                    value={referralStats.totalReferrals ?? 0}
                    prefix={<TeamOutlined />}
                    valueStyle={{ color: '#1890ff' }}
                  />
                  <Statistic
                    title="Active Referrals"
                    value={referralStats.activeReferrals ?? 0}
                    valueStyle={{ color: '#52c41a' }}
                  />
                  <Statistic
                    title="Team Heads Created"
                    value={referralStats.teamHeads ?? 0}
                    prefix={<TrophyOutlined />}
                    valueStyle={{ color: '#faad14' }}
                  />
                  <Statistic
                    title="Total Bonuses Paid"
                    value={referralStats.totalBonuses ?? 0}
                    prefix="$"
                    valueStyle={{ color: '#722ed1' }}
                  />
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
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} referrals`,
              }}
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReferralSettings;
