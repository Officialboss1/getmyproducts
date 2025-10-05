import React, { useState, useEffect } from 'react';
import {
  Card,
  List,
  Tag,
  Button,
  Typography,
  Row,
  Col,
  Progress,
  Space,
  Statistic,
  Divider,
  Alert,
  Empty,
} from 'antd';
import {
  TrophyOutlined,
  TeamOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  CrownOutlined,
  FireOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text } = Typography;

const Competitions = () => {
  const navigate = useNavigate();
  const [competitions, setCompetitions] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRank, setUserRank] = useState(null);

  useEffect(() => {
    fetchCompetitions();
    fetchLeaderboard();
  }, []);

  const fetchCompetitions = async () => {
    try {
      const response = await api.competitions.getCompetitions();
      setCompetitions(response.data || []);
    } catch (error) {
      console.error('Error fetching competitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const response = await api.analytics.getLeaderboard({ period: 'weekly' });
      setLeaderboard(response.data || []);
      
      // Find user's rank (mock for now)
      setUserRank(3);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const getCompetitionStatus = (competition) => {
    const now = dayjs();
    const start = dayjs(competition.startDate);
    const end = dayjs(competition.endDate);

    if (now.isBefore(start)) {
      return { status: 'upcoming', color: 'blue', text: 'Starting Soon' };
    } else if (now.isAfter(end)) {
      return { status: 'ended', color: 'default', text: 'Ended' };
    } else {
      return { status: 'active', color: 'green', text: 'Active' };
    }
  };

  const getTimeRemaining = (endDate) => {
    const now = dayjs();
    const end = dayjs(endDate);
    const days = end.diff(now, 'day');
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''} remaining`;
    } else {
      const hours = end.diff(now, 'hour');
      return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    }
  };

  const joinCompetition = async (competitionId) => {
    try {
      await api.competitions.joinCompetition(competitionId);
      message.success('Successfully joined the competition!');
      fetchCompetitions();
    } catch (error) {
      message.error('Failed to join competition');
    }
  };

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
            <TrophyOutlined /> Competitions
          </Title>
          <Text type="secondary">
            Participate in sales competitions and climb the leaderboard
          </Text>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Competitions List */}
        <Col xs={24} lg={16}>
          <Card title="Active Competitions" loading={loading}>
            {competitions.length > 0 ? (
              <List
                dataSource={competitions}
                renderItem={(competition) => {
                  const status = getCompetitionStatus(competition);
                  const timeRemaining = getTimeRemaining(competition.endDate);
                  
                  return (
                    <List.Item
                      actions={[
                        status.status === 'active' && (
                          <Button 
                            type="primary" 
                            size="small"
                            onClick={() => joinCompetition(competition.id)}
                          >
                            Join Competition
                          </Button>
                        ),
                        <Button 
                          type="link" 
                          size="small"
                          onClick={() => navigate(`/competitions/${competition.id}`)}
                        >
                          View Details
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<TrophyOutlined style={{ fontSize: '24px', color: '#faad14' }} />}
                        title={
                          <Space>
                            <Text strong>{competition.name}</Text>
                            <Tag color={status.color}>{status.text}</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary">{competition.description}</Text>
                            <Text type="secondary">
                              <CalendarOutlined /> {timeRemaining}
                            </Text>
                            <Text type="secondary">
                              Prize: {competition.prize || 'Bonus & Recognition'}
                            </Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No active competitions at the moment"
              >
                <Button type="primary">Check Back Later</Button>
              </Empty>
            )}
          </Card>

          {/* Past Competitions */}
          <Card title="Past Competitions" style={{ marginTop: 24 }}>
            <Empty
              description="No past competitions to display"
            />
          </Card>
        </Col>

        {/* Leaderboard Sidebar */}
        <Col xs={24} lg={8}>
          <Card 
            title={
              <Space>
                <CrownOutlined />
                Weekly Leaderboard
              </Space>
            }
          >
            {userRank && (
              <Alert
                message={`Your Current Rank: #${userRank}`}
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <List
              dataSource={leaderboard.slice(0, 5)}
              renderItem={(item, index) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: index === 0 ? '#ffd666' : index === 1 ? '#d9d9d9' : index === 2 ? '#ff9c6e' : '#f0f0f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 'bold',
                        fontSize: '14px',
                      }}>
                        {index + 1}
                      </div>
                    }
                    title={item.name}
                    description={
                      <Space>
                        <Text strong>{item.value}</Text>
                        <Text type="secondary">units</Text>
                      </Space>
                    }
                  />
                  {index === 0 && <FireOutlined style={{ color: '#ff4d4f' }} />}
                </List.Item>
              )}
              locale={{ emptyText: 'No leaderboard data available' }}
            />

            <Divider />

            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="Your Position"
                  value={userRank}
                  prefix="#"
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Total Participants"
                  value={leaderboard.length}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>

            <Button 
              type="link" 
              style={{ width: '100%', marginTop: 16 }}
              onClick={() => navigate('/leaderboard')}
            >
              View Full Leaderboard
            </Button>
          </Card>

          {/* Competition Tips */}
          <Card title="Competition Tips" style={{ marginTop: 16 }}>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <div>
                <Text strong>🏆 Focus on Priority Products</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Some competitions focus on specific products
                </Text>
              </div>
              <div>
                <Text strong>📈 Consistent Performance</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Daily sales contribute to weekly rankings
                </Text>
              </div>
              <div>
                <Text strong>👥 Team Work</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Coordinate with your team for better results
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Competitions;