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
  ReloadOutlined,
} from '@ant-design/icons';
import { useReferralSettings } from '../../hooks/useReferralSettings';
import { useUser } from '../../contexts/App';
import BonusSettings from '../../components/BonusSettings';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ReferralSettings = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [enableReferralSystem, setEnableReferralSystem] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const { user } = useUser();

  // Determine user role and permissions
  const isSuperAdmin = user?.role === 'super_admin';
  const isAdmin = user?.role === 'admin';
  const canEditSettings = isSuperAdmin; // Only super admin can edit settings
  const canViewSettings = isSuperAdmin || isAdmin; // Both can view

  const {
    settings,
    loading: settingsLoading,
    error,
    updateSettings,
    refetch,
  } = useReferralSettings();

  useEffect(() => {
    if (settings) {
      form.setFieldsValue(settings);
      setEnableReferralSystem(settings.enabled ?? true);
    }
  }, [settings, form]);

  const onFinish = async (values) => {
    if (!canEditSettings) {
      message.error('You do not have permission to modify referral settings');
      return;
    }

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
    if (!canEditSettings) {
      message.error('You do not have permission to modify referral settings');
      return;
    }

    setEnableReferralSystem(checked);
    message.info(`Referral system ${checked ? 'enabled' : 'disabled'}`);
  };

  const handleRefresh = () => {
    refetch();
    message.info('Data refreshed');
  };

  if (settingsLoading) {
    return (
      <div className="flex justify-center items-center h-[80vh]">
        <Spin size="large" tip="Loading referral settings..." />
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        type="error"
        message="Error loading referral settings"
        description={error.message}
        showIcon
      />
    );
  }

  const referralStats = settings?.stats || {};
  const referralHistory = settings?.history || [];

  const referralColumns = [
    { title: 'Referrer', dataIndex: 'referrer', key: 'referrer' },
    { title: 'Referred', dataIndex: 'referred', key: 'referred' },
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (d) => new Date(d).toLocaleDateString(),
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
    { title: 'Sales', dataIndex: 'sales', key: 'sales', align: 'center' },
    {
      title: 'Bonus',
      dataIndex: 'bonus',
      key: 'bonus',
      render: (b) => `$${b}`,
      align: 'right',
    },
  ];

  return (
    <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <Row justify="space-between" align="middle" gutter={[16, 16]} className="mb-6">
        <Col xs={24} md={16}>
          <Title level={2} className="text-lg font-semibold text-gray-800 dark:text-gray-100 m-0 mb-2">
            <SettingOutlined className="mr-2 text-blue-600" /> Referral System
          </Title>
          <Text className="text-sm text-gray-600 dark:text-gray-400">
            {canEditSettings
              ? 'Configure referral program and track team growth'
              : 'View referral program statistics and history'
            }
          </Text>
        </Col>
        <Col xs={24} md={8}>
          <div className="flex flex-col sm:flex-row gap-4 justify-end items-end sm:items-center">
            <Button
              icon={<ReloadOutlined />}
              onClick={handleRefresh}
              type="default"
              className="border-gray-300 hover:border-gray-400 w-full sm:w-auto"
            >
              Refresh
            </Button>
            {canEditSettings && (
              <div className="flex items-center gap-2 w-full sm:w-auto justify-center sm:justify-start">
                <Text className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">Referral System:</Text>
                <Switch
                  checked={enableReferralSystem}
                  onChange={handleEnableChange}
                  checkedChildren="Enabled"
                  unCheckedChildren="Disabled"
                />
              </div>
            )}
          </div>
        </Col>
      </Row>

      {!enableReferralSystem && canEditSettings && (
        <Alert
          message="Referral System Disabled"
          description="The referral system is currently disabled. No new referrals can be made and existing referrals are paused."
          type="warning"
          showIcon
          className="mb-6 rounded-2xl"
        />
      )}

      <Tabs activeKey={activeTab} onChange={setActiveTab} className="bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-md">
        <TabPane tab="Statistics" key="stats">
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="p-4 rounded-2xl shadow-md text-center bg-white dark:bg-gray-800 border-0">
                <Statistic
                  title={<span className="text-sm text-gray-600 dark:text-gray-400">Total Referrals</span>}
                  value={referralStats.totalReferrals ?? 0}
                  prefix={<TeamOutlined className="text-blue-600" />}
                  valueStyle={{ color: '#1890ff', fontSize: '2rem', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="p-4 rounded-2xl shadow-md text-center bg-white dark:bg-gray-800 border-0">
                <Statistic
                  title={<span className="text-sm text-gray-600 dark:text-gray-400">Active Referrals</span>}
                  value={referralStats.activeReferrals ?? 0}
                  valueStyle={{ color: '#52c41a', fontSize: '2rem', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="p-4 rounded-2xl shadow-md text-center bg-white dark:bg-gray-800 border-0">
                <Statistic
                  title={<span className="text-sm text-gray-600 dark:text-gray-400">Team Heads</span>}
                  value={referralStats.teamHeads ?? 0}
                  prefix={<TrophyOutlined className="text-yellow-600" />}
                  valueStyle={{ color: '#faad14', fontSize: '2rem', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="p-4 rounded-2xl shadow-md text-center bg-white dark:bg-gray-800 border-0">
                <Statistic
                  title={<span className="text-sm text-gray-600 dark:text-gray-400">Total Bonuses</span>}
                  value={referralStats.totalBonuses ?? 0}
                  prefix={<span className="text-green-600 font-bold">$</span>}
                  valueStyle={{ color: '#722ed1', fontSize: '2rem', fontWeight: 'bold' }}
                />
              </Card>
            </Col>
          </Row>
        </TabPane>

        {canViewSettings && (
          <TabPane tab="Settings" key="settings">
            <Row gutter={[24, 24]}>
              <Col xs={24} md={16}>
                <Card className="p-4 rounded-2xl shadow-md bg-white dark:bg-gray-800 border-0">
                  <Title level={3} className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    Referral Configuration
                  </Title>

                  <Form
                    form={form}
                    layout="vertical"
                    onFinish={onFinish}
                    disabled={!enableReferralSystem || !canEditSettings}
                  >
                    <Card className="p-4 rounded-2xl shadow-sm bg-gray-50 dark:bg-gray-700 border-0 mb-4">
                      <Title level={4} className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Promotion Requirements
                      </Title>
                      <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4 block">
                        Set the criteria for team member promotions
                      </Text>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Required Referrals</span>}
                            name="requiredReferrals"
                            rules={[
                              {
                                required: true,
                                message: 'Enter required referrals',
                              },
                            ]}
                          >
                            <InputNumber
                              min={1}
                              max={20}
                              style={{ width: '100%' }}
                              className="rounded-lg"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Sales per Referral</span>}
                            name="requiredSalesPerReferral"
                            rules={[
                              {
                                required: true,
                                message: 'Enter sales per referral',
                              },
                            ]}
                          >
                            <InputNumber
                              min={1}
                              max={100}
                              style={{ width: '100%' }}
                              className="rounded-lg"
                            />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>

                    <Divider className="my-6" />

                    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-4 border-0 mb-4">
                      <Title level={4} className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        Bonus Configuration
                      </Title>
                      <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4 block">
                        Configure bonus amounts for referrals and team achievements
                      </Text>

                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Referral Bonus (%)</span>}
                            name="referralBonus"
                            rules={[
                              { required: true, message: 'Please enter referral bonus percentage' },
                              { type: 'number', min: 0, max: 100, message: 'Bonus must be between 0 and 100%' }
                            ]}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              step={0.1}
                              precision={2}
                              style={{ width: '100%' }}
                              className="rounded-lg"
                              placeholder="2.00"
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Team Head Bonus (%)</span>}
                            name="teamHeadBonus"
                            rules={[
                              { required: true, message: 'Please enter team head bonus percentage' },
                              { type: 'number', min: 0, max: 100, message: 'Bonus must be between 0 and 100%' }
                            ]}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              step={0.1}
                              precision={2}
                              style={{ width: '100%' }}
                              className="rounded-lg"
                              placeholder="5.00"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Form.Item
                        label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Maximum Referral Bonus ($)</span>}
                        name="maxReferralBonus"
                        rules={[
                          { required: true, message: 'Please enter maximum referral bonus' },
                          { type: 'number', min: 0, message: 'Maximum bonus must be positive' }
                        ]}
                      >
                        <InputNumber
                          min={0}
                          step={10}
                          precision={2}
                          style={{ width: '100%' }}
                          className="rounded-lg"
                          placeholder="1000.00"
                        />
                      </Form.Item>
                    </div>

                    <Divider className="my-6" />

                    <Card className="p-4 rounded-2xl shadow-sm bg-gray-50 dark:bg-gray-700 border-0 mb-4">
                      <Title level={4} className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                        System Settings
                      </Title>
                      <Text className="text-sm text-gray-600 dark:text-gray-400 mb-4 block">
                        Configure system behavior and notifications
                      </Text>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto Promotion</span>}
                            name="autoPromotion"
                            valuePropName="checked"
                          >
                            <Switch
                              checkedChildren="Auto"
                              unCheckedChildren="Manual"
                            />
                          </Form.Item>
                          <Text className="text-xs text-gray-600 dark:text-gray-400">
                            Automatically promote to Team Head when requirements are met
                          </Text>
                        </Col>
                        <Col xs={24} sm={12}>
                          <Form.Item
                            label={<span className="text-sm font-medium text-gray-700 dark:text-gray-300">Notifications</span>}
                            name="notificationEnabled"
                            valuePropName="checked"
                          >
                            <Switch checkedChildren="On" unCheckedChildren="Off" />
                          </Form.Item>
                          <Text className="text-xs text-gray-600 dark:text-gray-400">
                            Send notifications for referral activities
                          </Text>
                        </Col>
                      </Row>
                    </Card>

                    {canEditSettings && (
                      <Form.Item style={{ marginTop: 24 }}>
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SaveOutlined />}
                          loading={loading}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6 py-2 rounded-lg"
                        >
                          Save Settings
                        </Button>
                      </Form.Item>
                    )}
                  </Form>
                </Card>
              </Col>

              <Col xs={24} md={8}>
                <Card className="p-4 rounded-2xl shadow-md bg-white dark:bg-gray-800 border-0 sticky top-6">
                  <Title level={4} className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
                    Program Statistics
                  </Title>
                  <Space
                    direction="vertical"
                    style={{ width: '100%' }}
                    size="large"
                  >
                    <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Statistic
                        title={<span className="text-sm text-gray-600 dark:text-gray-400">Total Referrals</span>}
                        value={referralStats.totalReferrals ?? 0}
                        prefix={<TeamOutlined className="text-blue-600" />}
                        valueStyle={{ color: '#1890ff', fontSize: '1.5rem', fontWeight: 'bold' }}
                      />
                    </div>
                    <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <Statistic
                        title={<span className="text-sm text-gray-600 dark:text-gray-400">Active Referrals</span>}
                        value={referralStats.activeReferrals ?? 0}
                        valueStyle={{ color: '#52c41a', fontSize: '1.5rem', fontWeight: 'bold' }}
                      />
                    </div>
                    <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <Statistic
                        title={<span className="text-sm text-gray-600 dark:text-gray-400">Team Heads Created</span>}
                        value={referralStats.teamHeads ?? 0}
                        prefix={<TrophyOutlined className="text-yellow-600" />}
                        valueStyle={{ color: '#faad14', fontSize: '1.5rem', fontWeight: 'bold' }}
                      />
                    </div>
                    <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Statistic
                        title={<span className="text-sm text-gray-600 dark:text-gray-400">Total Bonuses Paid</span>}
                        value={referralStats.totalBonuses ?? 0}
                        prefix={<span className="text-green-600 font-bold">$</span>}
                        valueStyle={{ color: '#722ed1', fontSize: '1.5rem', fontWeight: 'bold' }}
                        formatter={(value) => `$${Number(value).toFixed(2)}`}
                      />
                    </div>
                  </Space>
                </Card>
              </Col>
            </Row>
          </TabPane>
        )}

        <TabPane tab="Referral History" key="history">
          <Card className="p-4 rounded-2xl shadow-md bg-white dark:bg-gray-800 border-0 overflow-hidden">
            <Table
              columns={referralColumns}
              dataSource={referralHistory}
              rowKey="id"
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} referrals`,
                className: "px-4"
              }}
              scroll={{ x: 600 }}
              className="text-sm"
            />
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default ReferralSettings;
