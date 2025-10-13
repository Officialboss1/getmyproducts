import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  InputNumber,
  Button,
  Typography,
  Space,
  Alert,
  Spin,
  Tooltip,
  Divider,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  DollarOutlined,
  SaveOutlined,
  SyncOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useBonusSettings } from '../hooks/useBonusSettings';
import { useUser } from '../contexts/App';

const { Title, Text } = Typography;

const BonusSettings = ({
  title = "Bonus Configuration",
  showStats = true,
  compact = false,
  onSettingsChange,
}) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const { user } = useUser();

  const {
    settings,
    loading,
    error,
    updateSettings,
    refetch,
    formatCurrency: formatCurrencyFromHook,
    isStale,
  } = useBonusSettings();

  const isSuperAdmin = user?.role === 'super_admin';

  // Validate bonus relationships
  const validateBonusValues = (_, value) => {
    const referralBonus = form.getFieldValue('referralBonus') || 0;
    const teamHeadBonus = form.getFieldValue('teamHeadBonus') || 0;
    const maxReferralBonus = form.getFieldValue('maxReferralBonus') || 0;

    if (value < 0) {
      return Promise.reject('Bonus amount cannot be negative');
    }

    // Team head bonus should be higher than referral bonus
    if (_ === 'teamHeadBonus' && value <= referralBonus && referralBonus > 0) {
      return Promise.reject('Team head bonus should be higher than referral bonus');
    }

    // Max referral bonus should be reasonable
    if (_ === 'maxReferralBonus' && value < teamHeadBonus && teamHeadBonus > 0) {
      return Promise.reject('Maximum referral bonus should be at least equal to team head bonus');
    }

    return Promise.resolve();
  };

  useEffect(() => {
    if (settings) {
      form.setFieldsValue({
        referralBonus: settings.referralBonus || 0,
        teamHeadBonus: settings.teamHeadBonus || 0,
        maxReferralBonus: settings.maxReferralBonus || 0,
      });

      // Notify parent component of settings change
      if (onSettingsChange) {
        onSettingsChange(settings);
      }
    }
  }, [settings, form, onSettingsChange]);

  const handleSave = async (values) => {
    if (!isSuperAdmin) {
      message.error('You do not have permission to modify bonus settings');
      return;
    }

    setSaving(true);
    try {
      const updatedSettings = {
        ...settings,
        ...values,
      };

      await updateSettings(updatedSettings);
      message.success({
        content: 'Bonus settings updated successfully!',
        icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
      });
    } catch (err) {
      message.error(err?.message || 'Failed to update bonus settings');
    } finally {
      setSaving(false);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      await refetch();
      message.success('Bonus settings synchronized');
    } catch (err) {
      message.error('Failed to sync settings');
    } finally {
      setSyncing(false);
    }
  };

  if (loading && !settings) {
    return (
      <Card>
        <div className="flex justify-center items-center h-32">
          <Spin size="large" tip="Loading bonus settings..." />
        </div>
      </Card>
    );
  }

  if (error && !settings) {
    return (
      <Alert
        type="error"
        message="Error loading bonus settings"
        description={error.message}
        showIcon
      />
    );
  }

  const bonusStats = settings?.stats || {};

  return (
    <Card
      title={
        <Space>
          <DollarOutlined />
          <span>{title}</span>
          {syncing && <Spin size="small" />}
        </Space>
      }
      extra={
        isSuperAdmin && (
          <Space>
            <Tooltip title="Sync latest settings">
              <Button
                icon={<SyncOutlined spin={syncing} />}
                onClick={handleSync}
                loading={syncing}
                size="small"
              >
                Sync
              </Button>
            </Tooltip>
          </Space>
        )
      }
    >
      {showStats && (
        <>
          <Row gutter={[16, 16]} className="mb-6">
            <Col xs={24} sm={8}>
              <Statistic
                title="Referral Bonus"
                value={settings?.referralBonus || 0}
                prefix="$"
                valueStyle={{ color: '#1890ff' }}
                formatter={(value) => formatCurrencyFromHook(value)}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Team Head Bonus"
                value={settings?.teamHeadBonus || 0}
                prefix="$"
                valueStyle={{ color: '#52c41a' }}
                formatter={(value) => formatCurrencyFromHook(value)}
              />
            </Col>
            <Col xs={24} sm={8}>
              <Statistic
                title="Max Referral Bonus"
                value={settings?.maxReferralBonus || 0}
                prefix="$"
                valueStyle={{ color: '#faad14' }}
                formatter={(value) => formatCurrencyFromHook(value)}
              />
            </Col>
          </Row>
          <Divider />
        </>
      )}

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSave}
        disabled={!isSuperAdmin}
      >
        <Title level={4} className="text-sm sm:text-base md:text-lg mb-4">
          Bonus Amounts
          <Tooltip title="Configure bonus amounts for referrals and team achievements">
            <InfoCircleOutlined className="ml-2 text-gray-400" />
          </Tooltip>
        </Title>

        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <Space>
                  <span>Referral Bonus</span>
                  <Text type="secondary" className="text-xs">
                    (per successful referral)
                  </Text>
                </Space>
              }
              name="referralBonus"
              rules={[
                { required: true, message: 'Please enter referral bonus amount' },
                { validator: validateBonusValues },
              ]}
            >
              <InputNumber
                min={0}
                max={1000}
                step={10}
                precision={2}
                prefix="$"
                style={{ width: '100%' }}
                className="text-sm sm:text-base"
                placeholder="0.00"
              />
            </Form.Item>
          </Col>

          <Col xs={24} sm={12}>
            <Form.Item
              label={
                <Space>
                  <span>Team Head Bonus</span>
                  <Text type="secondary" className="text-xs">
                    (for achieving team head status)
                  </Text>
                </Space>
              }
              name="teamHeadBonus"
              rules={[
                { required: true, message: 'Please enter team head bonus amount' },
                { validator: validateBonusValues },
              ]}
            >
              <InputNumber
                min={0}
                max={5000}
                step={50}
                precision={2}
                prefix="$"
                style={{ width: '100%' }}
                className="text-sm sm:text-base"
                placeholder="0.00"
              />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label={
            <Space>
              <span>Maximum Referral Bonus</span>
              <Text type="secondary" className="text-xs">
                (cap on total referral earnings)
              </Text>
            </Space>
          }
          name="maxReferralBonus"
          rules={[
            { required: true, message: 'Please enter maximum referral bonus' },
            { validator: validateBonusValues },
          ]}
        >
          <InputNumber
            min={0}
            max={10000}
            step={100}
            precision={2}
            prefix="$"
            style={{ width: '100%' }}
            className="text-sm sm:text-base"
            placeholder="0.00"
          />
        </Form.Item>

        <Alert
          message="Bonus Validation Rules"
          description={
            <ul className="mb-0 text-xs">
              <li>• Team head bonus must be higher than referral bonus</li>
              <li>• Maximum referral bonus must be at least equal to team head bonus</li>
              <li>• All bonus amounts must be non-negative</li>
            </ul>
          }
          type="info"
          showIcon
          className="mb-4"
        />

        {isSuperAdmin && (
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={saving}
              className="text-sm sm:text-base"
            >
              {saving ? 'Saving...' : 'Save Bonus Settings'}
            </Button>
          </Form.Item>
        )}
      </Form>
    </Card>
  );
};

export default BonusSettings;