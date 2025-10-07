// Competitions.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  List,
  Tag,
  Button,
  Typography,
  Row,
  Col,
  Space,
  Statistic,
  Divider,
  Empty,
  message,
  Modal,
  Spin,
  Dropdown,
  Menu,
  Avatar,
  Table,
  Alert,
} from 'antd';
import {
  TrophyOutlined,
  TeamOutlined,
  CalendarOutlined,
  ArrowLeftOutlined,
  CrownOutlined,
  FireOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../services/api';

const { Title, Text } = Typography;

/*
  Notes for adaptions:
  - api.competitions.getCompetitions() -> should return array of competitions
  - api.competitions.joinCompetition(competitionId) -> POST join
  - api.competitions.leaveCompetition(competitionId) -> POST/DELETE leave
  - api.competitions.getCompetitionById(id) -> returns single competition details
  - api.analytics.getLeaderboard('weekly') -> overall weekly leaderboard across competitions
  - api.analytics.getCompetitionLeaderboard(competitionId) -> leaderboard for a specific competition
  - If your backend returns different fields, adjust mapping accordingly below.
*/

const Competitions = () => {
  const navigate = useNavigate();

  const [competitions, setCompetitions] = useState([]);
  const [loadingCompetitions, setLoadingCompetitions] = useState(true);

  // overall weekly leaderboard (right sidebar)
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(true);
  const [userRankOverall, setUserRankOverall] = useState(null);
  const [userScoreOverall, setUserScoreOverall] = useState(null);
  const [totalParticipantsOverall, setTotalParticipantsOverall] = useState(0);

  // joined competition ids for quick UI toggling
  const [joinedCompetitionIds, setJoinedCompetitionIds] = useState(new Set());

  // message hook (avoid static message warnings and support dynamic theme)
  const [messageApi, contextHolder] = message.useMessage();

  // Modal state for "View Details"
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [selectedCompetitionLeaderboard, setSelectedCompetitionLeaderboard] = useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // general action loading map by competition id to control button spinners
  const [actionLoadingIds, setActionLoadingIds] = useState(new Set());

  // fetch competitions list
  const fetchCompetitions = useCallback(async () => {
    setLoadingCompetitions(true);
    try {
      const res = await api.competitions.getCompetitions();
      const comps = res.data || [];
      setCompetitions(comps);

      // build joined ids set from response if API supplies membership info
      const joinedSet = new Set();
      // try to infer current user id from localStorage
      const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      const currentUserId = currentUser._id || currentUser.id || currentUser.userId || null;

      comps.forEach((c) => {
        const compId = String(c._id || c.id);
        if (c.isJoined === true || c.joined === true) {
          joinedSet.add(compId);
          return;
        }

        // If participants is an array of userIds or objects
        if (Array.isArray(c.participants) && currentUserId) {
          // case: array of ids
          if (c.participants.includes && c.participants.includes(currentUserId)) {
            joinedSet.add(compId);
            return;
          }
          // case: array of objects [{ userId: '...' }]
          const found = c.participants.find && c.participants.find((p) => {
            if (!p) return false;
            return p.userId === currentUserId || p._id === currentUserId || p.id === currentUserId;
          });
          if (found) {
            joinedSet.add(compId);
            return;
          }
        }
      });
      setJoinedCompetitionIds(joinedSet);
    } catch (err) {
      console.error('Error fetching competitions:', err);
      messageApi.error('Failed to load competitions.');
    } finally {
      setLoadingCompetitions(false);
    }
  }, []);

  // fetch weekly overall leaderboard
  const fetchWeeklyLeaderboard = useCallback(async () => {
    setWeeklyLoading(true);
    try {
      // Attempt to request leaderboard with current user's id so backend can return yourRank
      let currentUser = JSON.parse(localStorage.getItem('user') || '{}');
      let currentUserId = currentUser._id || currentUser.id || currentUser.userId || null;

      // If currentUserId not found in localStorage try to fetch profile
      if (!currentUserId) {
        try {
          const profileRes = await api.auth.getProfile();
          const profile = profileRes.data || profileRes;
          currentUserId = profile._id || profile.id || profile.userId || null;
        } catch (e) {
          // ignore profile fetch failure; we'll continue without userId
        }
      }

      const params = { period: 'weekly' };
      if (currentUserId) params.userId = currentUserId;

      const res = await api.analytics.getLeaderboard(params);
      const data = res.data || [];

      // Annotate items with isCurrentUser for UI convenience
      const annotated = data.map((it) => ({
        ...it,
        isCurrentUser: !!(
          currentUserId && (it.userId === currentUserId || it._id === currentUserId || it.id === currentUserId)
        ),
      }));

  setWeeklyLeaderboard(annotated);

  // capture possible user score/value from metadata for placeholder display
  setUserScoreOverall(res.dataMeta?.yourScore ?? res.dataMeta?.yourValue ?? null);

  // derive total participants from metadata when available
  const totalFromMeta = res.dataMeta && (res.dataMeta.totalParticipants || res.dataMeta.total || null);
  setTotalParticipantsOverall(totalFromMeta ?? annotated.length ?? 0);

      // Determine user's rank: prefer metadata.yourRank else detect in list
      let foundRank = null;
      if (res.dataMeta && typeof res.dataMeta.yourRank === 'number') {
        foundRank = res.dataMeta.yourRank;
      } else {
        for (let i = 0; i < annotated.length; i++) {
          if (annotated[i].isCurrentUser) {
            foundRank = i + 1;
            break;
          }
        }
      }

      setUserRankOverall(foundRank);
    } catch (err) {
      console.error('Error fetching weekly leaderboard:', err);
      messageApi.error('Failed to load weekly leaderboard.');
    } finally {
      setWeeklyLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompetitions();
    fetchWeeklyLeaderboard();
  }, [fetchCompetitions, fetchWeeklyLeaderboard]);

  // Helper: set loading flag for a particular competition action
  const toggleActionLoading = (competitionId, on = true) => {
    setActionLoadingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(competitionId);
      else next.delete(competitionId);
      return next;
    });
  };

  // Join competition (optimistic UI)
  const joinCompetition = async (competitionId) => {
    const id = String(competitionId).trim();
    // Prevent joining more than once
    if (joinedCompetitionIds.has(id)) {
      messageApi.info('You have already joined this competition.');
      return;
    }

    toggleActionLoading(id, true);

    // optimistic UI: mark as joined immediately
    setJoinedCompetitionIds((prev) => new Set(prev).add(id));

    try {
      await api.competitions.joinCompetition(id);
  // exact required success message
  messageApi.success('You have successfully joined the competition!');
      // refresh competitions and weekly leaderboard to reflect new participant if necessary
      fetchCompetitions();
      fetchWeeklyLeaderboard();
    } catch (err) {
      console.error('Join failed:', err);
      // rollback optimistic change
      setJoinedCompetitionIds((prev) => {
        const s = new Set(prev);
        s.delete(id);
        return s;
      });
      messageApi.error('Failed to join competition.');
    } finally {
      toggleActionLoading(id, false);
    }
  };

  // Leave competition
  const leaveCompetition = async (competitionId) => {
    const id = String(competitionId).trim();
    toggleActionLoading(id, true);

    // optimistic: remove from joined set
    setJoinedCompetitionIds((prev) => {
      const s = new Set(prev);
      s.delete(id);
      return s;
    });

    try {
      await api.competitions.leaveCompetition(id);
      messageApi.success('You left the competition.');
      fetchCompetitions();
      fetchWeeklyLeaderboard();
    } catch (err) {
      console.error('Leave failed:', err);
      // rollback removal
      setJoinedCompetitionIds((prev) => new Set(prev).add(id));
      messageApi.error('Failed to leave competition.');
    } finally {
      toggleActionLoading(id, false);
    }
  };

  // open details modal and fetch competition-specific leaderboard (top 5)
  const openDetails = async (competitionId) => {
    setDetailsLoading(true);
    setDetailsModalVisible(true);
    setSelectedCompetition(null);
    setSelectedCompetitionLeaderboard([]);

    try {
      const [competitionRes, leaderboardRes] = await Promise.all([
        api.competitions.getCompetitionById(competitionId),
        api.competitions.getCompetitionLeaderboard(competitionId), // expects array sorted desc
      ]);
      setSelectedCompetition(competitionRes.data || competitionRes);
      const lb = (leaderboardRes.data || []).slice(0, 5);
      setSelectedCompetitionLeaderboard(lb);
    } catch (err) {
      console.error('Error loading competition details:', err);
      messageApi.error('Failed to load competition details.');
      setDetailsModalVisible(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeDetails = () => {
    setDetailsModalVisible(false);
    setSelectedCompetition(null);
    setSelectedCompetitionLeaderboard([]);
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
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} remaining`;
    const hours = end.diff(now, 'hour');
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
    const minutes = end.diff(now, 'minute');
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  };

  // render actions: Join / Joined(with Dropdown)
  const renderActionForCompetition = (competition) => {
    const id = String(competition._id || competition.id);
    const status = getCompetitionStatus(competition);
    const isJoined = joinedCompetitionIds.has(id);
    const loading = actionLoadingIds.has(id);

    if (status.status !== 'active') {
      return (
        <Button size="small" disabled>
          {status.text}
        </Button>
      );
    }

    if (!isJoined) {
      return (
        <Button
          type="primary"
          size="small"
          loading={loading}
          onClick={() => joinCompetition(id)}
        >
          Join Competition
        </Button>
      );
    }

    // if joined -> show "Joined" and a separate "Leave Competition" button
    return (
      <Space>
        <Button type="default" size="small" loading={loading} disabled>
          Joined
        </Button>
        <Button type="link" danger size="small" loading={loading} onClick={() => leaveCompetition(id)}>
          Leave Competition
        </Button>
      </Space>
    );
  };

  // leaderboard table columns for modal (top 5)
  const modalColumns = [
    {
      title: '#',
      dataIndex: 'rank',
      key: 'rank',
      render: (_, __, idx) => {
        const r = idx + 1;
        if (r === 1) return '🥇';
        if (r === 2) return '🥈';
        if (r === 3) return '🥉';
        return r;
      },
      width: 50,
    },
    {
      title: 'Agent',
      dataIndex: 'name',
      key: 'name',
      render: (name, record) => (
        <Space>
          <Avatar src={record.avatar} size="small">
            {(!record.avatar && name && name[0]) || 'A'}
          </Avatar>
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Sales',
      dataIndex: 'value',
      key: 'value',
      render: (val) => <Text strong>{val}</Text>,
    },
  ];

  // overall leaderboard list item rendering for sidebar
  const renderWeeklyListItem = (item, index) => {
    return {
      title: (
        <Space>
          <Text strong>{item.name || item.username || item.agent || 'Unknown'}</Text>
          <Text type="secondary">· {item.team || item.teamName || ''}</Text>
        </Space>
      ),
      description: (
        <Space>
          <Text strong>{item.value ?? item.score ?? item.points ?? '-'}</Text>
          <Text type="secondary">units</Text>
        </Space>
      ),
      avatar: (
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            fontSize: 14,
            background:
              index === 0 ? '#ffd666' : index === 1 ? '#d9d9d9' : index === 2 ? '#ff9c6e' : '#f0f0f0',
          }}
        >
          {index + 1}
        </div>
      ),
      extra: index === 0 ? <FireOutlined style={{ color: '#ff4d4f' }} /> : null,
    };
  };

  // Split active, past, and upcoming competitions using pure JS
const now = new Date();

const activeCompetitions = competitions.filter((c) => {
  const start = new Date(c.startDate);
  const end = new Date(c.endDate);
  return now >= start && now <= end;
});

const pastCompetitions = competitions.filter((c) => {
  const end = new Date(c.endDate);
  return now > end;
});

const upcomingCompetitions = competitions.filter((c) => {
  const start = new Date(c.startDate);
  return now < start;
});

  // Build sidebar items (top 5) and include current user if not in top5 but has a rank
  const sidebarItems = (() => {
    const items = (weeklyLeaderboard || []).slice(0, 5).map((it, idx) => ({ ...it, _sidebarIndex: idx }));
    // If user has a rank but is not in the top slice, append a placeholder entry
    if (userRankOverall && userRankOverall > 5) {
      // try to find user entry in the data (maybe not in first page)
      const found = (weeklyLeaderboard || []).find((it) => it.isCurrentUser);
      if (found) {
        // ensure top list contains found (it might already be present)
        // if not present, append it
        const present = items.find((x) => x.userId === found.userId || x._id === found._id || x.id === found.id);
        if (!present) items.push({ ...found, _sidebarIndex: userRankOverall - 1 });
      } else {
        // no entry in current page, but we may have metadata with yourScore
        items.push({ userId: 'you', name: 'You', value: userScoreOverall ?? '-', isCurrentUser: true, _sidebarIndex: userRankOverall - 1 });
      }
    }
    return items;
  })();

  return (
    <div>
      {contextHolder}
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
          <Text type="secondary">Participate in sales competitions and climb the leaderboard</Text>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Competitions List Area */}
        <Col xs={24} lg={16}>
          <Card title="Active Competitions" loading={loadingCompetitions}>
            {activeCompetitions.length > 0 ? (
              <List
                dataSource={activeCompetitions}
                renderItem={(competition) => {
                  const status = getCompetitionStatus(competition);
                  const timeRemaining = getTimeRemaining(competition.endDate);
                  const id = String(competition._id || competition.id);

                  return (
                    <List.Item
                      key={id}
                      actions={[
                        renderActionForCompetition(competition),
                        <Button
                          type="link"
                          size="small"
                          onClick={() => openDetails(id)}
                          key={`view-${id}`}
                        >
                          View Details
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<TrophyOutlined style={{ fontSize: 24, color: '#faad14' }} />}
                        title={
                          <Space>
                            <Text strong>{competition.name}</Text>
                            <Tag color={status.color}>{status.text}</Tag>
                          </Space>
                        }
                        description={
                          <Space direction="vertical" size={0}>
                            <Text type="secondary" ellipsis={{ tooltip: competition.description }}>
                              {competition.description}
                            </Text>
                            <Text type="secondary">
                              <CalendarOutlined /> {timeRemaining}
                            </Text>
                            <Text type="secondary">Prize: {competition.prize || 'Bonus & Recognition'}</Text>
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
                <Button type="primary" onClick={fetchCompetitions}>
                  Check Again
                </Button>
              </Empty>
            )}
          </Card>

          <Card title="Upcoming Competitions" style={{ marginTop: 24 }}>
            {upcomingCompetitions.length > 0 ? (
              <List
                dataSource={upcomingCompetitions}
                renderItem={(competition) => {
                  const start = dayjs(competition.startDate).format('MMM D, YYYY');
                  const id = String(competition._id || competition.id);
                  return (
                    <List.Item
                      key={id}
                      actions={[
                        <Button type="link" size="small" onClick={() => openDetails(id)} key={`view-up-${id}`}>
                          View Details
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<CalendarOutlined style={{ fontSize: 20 }} />}
                        title={<Text strong>{competition.name}</Text>}
                        description={<Text type="secondary">Starts on {start}</Text>}
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="No upcoming competitions" />
            )}
          </Card>

          {/* Past Competitions */}
          <Card title="Past Competitions" style={{ marginTop: 24 }}>
            {pastCompetitions.length > 0 ? (
              <List
                dataSource={pastCompetitions}
                renderItem={(competition) => {
                  const end = dayjs(competition.endDate).format('MMM D, YYYY');
                  const id = String(competition._id || competition.id);
                  return (
                    <List.Item
                      key={id}
                      actions={[
                        <Button type="link" size="small" onClick={() => openDetails(id)} key={`view-past-${id}`}>
                          View Details
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<TeamOutlined style={{ fontSize: 20 }} />}
                        title={<Text strong>{competition.name}</Text>}
                        description={<Text type="secondary">Ended on {end}</Text>}
                      />
                    </List.Item>
                  );
                }}
              />
            ) : (
              <Empty description="No past competitions to display" />
            )}
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
            {weeklyLoading ? (
              <Spin />
            ) : (
              <>
                <Alert
                  type="info"
                  showIcon
                  message={
                    userRankOverall
                      ? `Your Position: #${userRankOverall}`
                      : 'Your Position: -'
                  }
                  style={{ marginBottom: 12 }}
                />
                {/* Top 5 in sidebar (or fewer) */}
                <List
                  itemLayout="horizontal"
                  dataSource={sidebarItems}
                  renderItem={(item, index) => {
                    const itm = renderWeeklyListItem(item, index);
                    const itmKey = item.userId || item.id || item._id || `leader-${index}`;
                    const isYou = item.isCurrentUser === true || item.userId === 'you';
                    return (
                      <List.Item key={itmKey} extra={itm.extra} style={isYou ? { background: '#f6ffed', borderRadius: 6 } : {}}>
                        <List.Item.Meta avatar={itm.avatar} title={itm.title} description={itm.description} />
                      </List.Item>
                    );
                  }}
                  locale={{ emptyText: 'No leaderboard data available' }}
                />

                <Divider />

                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Your Position"
                      value={userRankOverall || '-'}
                      prefix="#"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Total Participants"
                      value={totalParticipantsOverall}
                      valueStyle={{ color: '#52c41a' }}
                    />
                  </Col>
                </Row>

                <Button type="link" style={{ width: '100%', marginTop: 16 }} onClick={() => navigate('/leaderboard')}>
                  View Full Leaderboard
                </Button>
              </>
            )}
          </Card>

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

      {/* Details Modal */}
      <Modal
        title={selectedCompetition ? selectedCompetition.name : 'Competition Details'}
        open={detailsModalVisible}
        onCancel={closeDetails}
        footer={[
          <Button key="close" onClick={closeDetails}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {detailsLoading || !selectedCompetition ? (
          <Spin />
        ) : (
          <>
            <Row gutter={16}>
              <Col span={16}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text strong style={{ fontSize: 16 }}>{selectedCompetition.name}</Text>
                    {(() => {
                      const st = getCompetitionStatus(selectedCompetition);
                      return <Tag color={st.color}>{st.text}</Tag>;
                    })()}
                  </div>
                  <Text type="secondary">{selectedCompetition.description}</Text>
                  <div>
                    <Text>
                      <CalendarOutlined /> {dayjs(selectedCompetition.startDate).format('MMM D, YYYY')} -{' '}
                      {dayjs(selectedCompetition.endDate).format('MMM D, YYYY')}
                    </Text>
                  </div>
                  <div>
                    <Text>Prize: {selectedCompetition.prize || 'Bonus & Recognition'}</Text>
                  </div>
                  <Divider />
                  <Text strong>Top 5 Leaderboard</Text>
                  <Table
                    dataSource={selectedCompetitionLeaderboard}
                    columns={modalColumns}
                    rowKey={(r, idx) => r.userId || r.id || r._id || `row-${idx}`}
                    pagination={false}
                    style={{ marginTop: 12 }}
                  />
                </Space>
              </Col>

              <Col span={8}>
                <Card size="small" title="Competition Stats">
                  <Statistic
                    title="Participants"
                    value={selectedCompetition.participantsCount || selectedCompetition.participants?.length || '-'}
                  />
                  <Divider />
                  <Statistic
                    title="Your Status"
                    value={joinedCompetitionIds.has(String(selectedCompetition._id || selectedCompetition.id)) ? 'Joined' : 'Not Joined'}
                  />
                </Card>

                <Space direction="vertical" style={{ marginTop: 12 }}>
                  {(() => {
                    const compId = String(selectedCompetition._id || selectedCompetition.id);
                    const isJoined = joinedCompetitionIds.has(compId);
                    const st = getCompetitionStatus(selectedCompetition);

                    if (isJoined) {
                      return <Button onClick={() => leaveCompetition(compId)}>Leave Competition</Button>;
                    }

                    // Do not allow joining if competition not active
                    return (
                      <Button type="primary" disabled={st.status !== 'active'} onClick={() => joinCompetition(compId)}>
                        Join Competition
                      </Button>
                    );
                  })()}
                </Space>
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Competitions;
