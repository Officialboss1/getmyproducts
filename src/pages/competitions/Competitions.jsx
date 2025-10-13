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
import api from '../../api/services/api';

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

  // selected competition for the sidebar leaderboard
  const [selectedCompetitionId, setSelectedCompetitionId] = useState(null);

  // message hook (avoid static message warnings and support dynamic theme)
  const [messageApi, contextHolder] = message.useMessage();

  // Modal state for "View Details"
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [selectedCompetitionLeaderboard, setSelectedCompetitionLeaderboard] =
    useState([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // general action loading map by competition id to control button spinners
  const [actionLoadingIds, setActionLoadingIds] = useState(new Set());

  // fetch competitions list
  const fetchCompetitions = useCallback(
    async (preserveJoinedState = false) => {
      setLoadingCompetitions(true);
      try {
        const res = await api.competitions.getCompetitions();
        const comps = res.data || [];
        setCompetitions(comps);

        // Get current user ID
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentUserId =
          currentUser._id || currentUser.id || currentUser.userId || null;
        console.log('Current user ID for competition check:', currentUserId);

        // Build joined ids set from populated participants data
        const joinedSet = new Set();

        // If preserveJoinedState is true, start with current joined state
        if (preserveJoinedState) {
          setJoinedCompetitionIds((prev) => {
            prev.forEach((id) => joinedSet.add(id));
            return prev;
          });
        }

        comps.forEach((c) => {
          const compId = String(c._id || c.id);

          // Skip if already in joined set (from preserveJoinedState)
          if (joinedSet.has(compId)) return;

          // Debug: log participant data
          console.log(`Competition ${compId} participants:`, c.participants);

          // Check participants array (should be populated with user objects)
          if (Array.isArray(c.participants) && currentUserId) {
            const isJoined = c.participants.some((p) => {
              if (!p) return false;
              // Handle populated user objects
              if (p.user && typeof p.user === 'object') {
                return (
                  p.user._id === currentUserId || p.user.id === currentUserId
                );
              }
              // Handle user ID references
              if (typeof p === 'string') {
                return p === currentUserId;
              }
              // Handle participant objects with user field
              return (
                p.user === currentUserId ||
                p._id === currentUserId ||
                p.id === currentUserId ||
                p.userId === currentUserId
              );
            });

            console.log(
              `User ${currentUserId} joined competition ${compId}:`,
              isJoined
            );

            if (isJoined) {
              joinedSet.add(compId);
            }
          }
        });

        console.log('Final joined competitions:', Array.from(joinedSet));

        // If preserveJoinedState is false, replace the joined state
        // If preserveJoinedState is true, the joinedSet already contains the preserved state
        if (!preserveJoinedState) {
          setJoinedCompetitionIds(joinedSet);
        }
      } catch (err) {
        console.error('Error fetching competitions:', err);
        messageApi.error('Failed to load competitions.');
      } finally {
        setLoadingCompetitions(false);
      }
    },
    [messageApi]
  );

  // fetch leaderboard for selected competition
  const fetchCompetitionLeaderboard = useCallback(
    async (competitionId = selectedCompetitionId) => {
      if (!competitionId) {
        setWeeklyLeaderboard([]);
        setUserRankOverall(null);
        setTotalParticipantsOverall(0);
        setWeeklyLoading(false);
        return;
      }

      setWeeklyLoading(true);
      try {
        let currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        let currentUserId =
          currentUser._id || currentUser.id || currentUser.userId || null;

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

        const res =
          await api.competitions.getCompetitionLeaderboard(competitionId);
        const data = res.data || [];

        // Annotate with user info and rank
        const leaderboardData = data.map((item, index) => ({
          ...item,
          rank: index + 1,
          name:
            item.user?.name ||
            `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.trim() ||
            'Unknown',
          value: item.units || 0,
          isCurrentUser: !!(currentUserId && item.user?._id === currentUserId),
        }));

        // Find user's rank
        const userEntry = leaderboardData.find((item) => item.isCurrentUser);
        const userRank = userEntry ? userEntry.rank : null;

        // Total participants is the number of entries in the leaderboard
        const totalParticipants = leaderboardData.length;

        setWeeklyLeaderboard(leaderboardData);
        setUserRankOverall(userRank);
        setTotalParticipantsOverall(totalParticipants);
      } catch (err) {
        console.error('Error fetching competition leaderboard:', err);
        messageApi.error('Failed to load competition leaderboard.');
        setWeeklyLeaderboard([]);
        setUserRankOverall(null);
        setTotalParticipantsOverall(0);
      } finally {
        setWeeklyLoading(false);
      }
    },
    [selectedCompetitionId, messageApi]
  );

  useEffect(() => {
    const loadData = async () => {
      await fetchCompetitions();
      // Load leaderboard for selected competition (initially none selected)
      await fetchCompetitionLeaderboard();
    };
    loadData();
  }, []); // Empty dependency array to run only once on mount

  // Helper: set loading flag for a particular competition action
  const toggleActionLoading = (competitionId, on = true) => {
    setActionLoadingIds((prev) => {
      const next = new Set(prev);
      if (on) next.add(competitionId);
      else next.delete(competitionId);
      return next;
    });
  };

  // Handle competition selection
  const selectCompetition = async (competitionId) => {
    const id = String(competitionId);
    setSelectedCompetitionId(id);
    await fetchCompetitionLeaderboard(id);
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
      // refresh competitions and selected competition leaderboard
      await fetchCompetitions(true);
      if (selectedCompetitionId) {
        await fetchCompetitionLeaderboard(selectedCompetitionId);
      }
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
      await fetchCompetitions(true);
      if (selectedCompetitionId) {
        await fetchCompetitionLeaderboard(selectedCompetitionId);
      }
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

  // render actions: Join / Leave button
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

    return (
      <Button
        type={isJoined ? 'default' : 'primary'}
        danger={isJoined}
        size="small"
        loading={loading}
        onClick={() => (isJoined ? leaveCompetition(id) : joinCompetition(id))}
      >
        {isJoined ? 'Leave Competition' : 'Join Competition'}
      </Button>
    );
  };

  // leaderboard table columns for modal (top 5)
  const modalColumns = [
    {
      title: '#',
      dataIndex: 'rank',
      key: 'rank',
      render: (rank) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return rank;
      },
      width: 50,
    },
    {
      title: 'Agent',
      dataIndex: 'user',
      key: 'name',
      render: (user) => (
        <Space>
          <Avatar size="small">{(user?.name && user.name[0]) || 'A'}</Avatar>
          <Text>{user?.name || 'Unknown'}</Text>
        </Space>
      ),
    },
    {
      title: 'Sales',
      dataIndex: 'units',
      key: 'value',
      render: (units) => <Text strong>{units || 0}</Text>,
    },
  ];

  // competition leaderboard list item rendering for sidebar
  const renderWeeklyListItem = (item, index) => {
    // Handle both competition leaderboard format and overall leaderboard format
    const name =
      item.user?.name || item.name || item.username || item.agent || 'Unknown';
    const value = item.units || item.value || item.score || item.points || 0;

    return {
      title: (
        <Space>
          <Text strong>{name}</Text>
          <Text type="secondary">· Rank #{item.rank || index + 1}</Text>
        </Space>
      ),
      description: (
        <Space>
          <Text strong>{value}</Text>
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
              index === 0
                ? '#ffd666'
                : index === 1
                  ? '#d9d9d9'
                  : index === 2
                    ? '#ff9c6e'
                    : '#f0f0f0',
          }}
        >
          {item.rank || index + 1}
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
    const items = (weeklyLeaderboard || []).slice(0, 5);
    // If user has a rank but is not in the top slice, append a placeholder entry
    if (userRankOverall && userRankOverall > 5) {
      // try to find user entry in the data
      const found = (weeklyLeaderboard || []).find((it) => it.isCurrentUser);
      if (found) {
        // ensure top list contains found (it might already be present)
        const present = items.find(
          (x) =>
            x.user?._id === found.user?._id ||
            x._id === found._id ||
            x.id === found.id
        );
        if (!present) items.push(found);
      }
    }
    return items;
  })();

  return (
    <div>
      {contextHolder}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24}>
          <Button
            type="text"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/dashboard')}
            style={{ marginBottom: 16 }}
            block
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
                  const isSelected = selectedCompetitionId === id;

                  return (
                    <List.Item
                      key={id}
                      style={{
                        cursor: 'pointer',
                        backgroundColor: isSelected ? '#f6ffed' : 'transparent',
                        border: isSelected
                          ? '1px solid #b7eb8f'
                          : '1px solid transparent',
                        borderRadius: 6,
                        marginBottom: 8,
                        padding: '12px',
                      }}
                      onClick={() => selectCompetition(id)}
                    >
                      <List.Item.Meta
                        avatar={
                          <TrophyOutlined
                            style={{ fontSize: 24, color: '#faad14' }}
                          />
                        }
                        title={
                          <div style={{ marginBottom: 4 }}>
                            <Space wrap>
                              <Text strong style={{ fontSize: '16px' }}>
                                {competition.name}
                              </Text>
                              <Tag color={status.color} size="small">
                                {status.text}
                              </Tag>
                              {isSelected && (
                                <Tag color="green" size="small">
                                  Selected
                                </Tag>
                              )}
                            </Space>
                          </div>
                        }
                        description={
                          <Space
                            direction="vertical"
                            size={2}
                            style={{ width: '100%' }}
                          >
                            <Text
                              type="secondary"
                              style={{ fontSize: '14px', lineHeight: '1.4' }}
                            >
                              {competition.description}
                            </Text>
                            <Space size={8} wrap>
                              <Text
                                type="secondary"
                                style={{ fontSize: '12px' }}
                              >
                                <CalendarOutlined /> {timeRemaining}
                              </Text>
                              <Text
                                type="secondary"
                                style={{ fontSize: '12px' }}
                              >
                                Prize:{' '}
                                {competition.prize || 'Bonus & Recognition'}
                              </Text>
                            </Space>
                          </Space>
                        }
                      />
                      <div style={{ marginTop: 8 }}>
                        <Space
                          direction="vertical"
                          size={4}
                          style={{ width: '100%' }}
                        >
                          {renderActionForCompetition(competition)}
                          <Button
                            type="link"
                            size="small"
                            block
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent triggering competition selection
                              openDetails(id);
                            }}
                            key={`view-${id}`}
                            style={{ padding: 0, height: 'auto' }}
                          >
                            View Details
                          </Button>
                        </Space>
                      </div>
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
                  const start = dayjs(competition.startDate).format(
                    'MMM D, YYYY'
                  );
                  const id = String(competition._id || competition.id);
                  return (
                    <List.Item
                      key={id}
                      actions={[
                        <Button
                          type="link"
                          size="small"
                          onClick={() => openDetails(id)}
                          key={`view-up-${id}`}
                        >
                          View Details
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<CalendarOutlined style={{ fontSize: 20 }} />}
                        title={<Text strong>{competition.name}</Text>}
                        description={
                          <Text type="secondary">Starts on {start}</Text>
                        }
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
                        <Button
                          type="link"
                          size="small"
                          onClick={() => openDetails(id)}
                          key={`view-past-${id}`}
                        >
                          View Details
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        avatar={<TeamOutlined style={{ fontSize: 20 }} />}
                        title={<Text strong>{competition.name}</Text>}
                        description={
                          <Text type="secondary">Ended on {end}</Text>
                        }
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
                {selectedCompetitionId
                  ? competitions.find(
                      (c) => String(c._id || c.id) === selectedCompetitionId
                    )?.name + ' Leaderboard'
                  : 'Competition Leaderboard'}
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
                    const itmKey =
                      item.user?._id ||
                      item.userId ||
                      item.id ||
                      item._id ||
                      `leader-${index}`;
                    const isYou = item.isCurrentUser === true;
                    return (
                      <List.Item
                        key={itmKey}
                        extra={itm.extra}
                        style={
                          isYou
                            ? { background: '#f6ffed', borderRadius: 6 }
                            : {}
                        }
                      >
                        <List.Item.Meta
                          avatar={itm.avatar}
                          title={itm.title}
                          description={itm.description}
                        />
                      </List.Item>
                    );
                  }}
                  locale={{ emptyText: 'No leaderboard data available' }}
                />

                <Divider />

                <Row gutter={[8, 8]}>
                  <Col xs={24} sm={12}>
                    <Statistic
                      title="Your Position"
                      value={userRankOverall || '-'}
                      prefix="#"
                      valueStyle={{ color: '#1890ff' }}
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <Statistic
                      title="Total Participants"
                      value={totalParticipantsOverall}
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
              </>
            )}
          </Card>

          <Card title="Competition Tips" style={{ marginTop: 16 }}>
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
              <div>
                <Text strong style={{ fontSize: '14px' }}>
                  🏆 Focus on Priority Products
                </Text>
                <br />
                <Text
                  type="secondary"
                  style={{ fontSize: '13px', lineHeight: '1.4' }}
                >
                  Some competitions focus on specific products
                </Text>
              </div>
              <div>
                <Text strong style={{ fontSize: '14px' }}>
                  📈 Consistent Performance
                </Text>
                <br />
                <Text
                  type="secondary"
                  style={{ fontSize: '13px', lineHeight: '1.4' }}
                >
                  Daily sales contribute to weekly rankings
                </Text>
              </div>
              <div>
                <Text strong style={{ fontSize: '14px' }}>
                  👥 Team Work
                </Text>
                <br />
                <Text
                  type="secondary"
                  style={{ fontSize: '13px', lineHeight: '1.4' }}
                >
                  Coordinate with your team for better results
                </Text>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Details Modal */}
      <Modal
        title={
          selectedCompetition ? selectedCompetition.name : 'Competition Details'
        }
        open={detailsModalVisible}
        onCancel={closeDetails}
        footer={[
          <Button key="close" onClick={closeDetails} block>
            Close
          </Button>,
        ]}
        width="90%"
        style={{ maxWidth: 800, top: 20 }}
        bodyStyle={{ padding: '16px' }}
      >
        {detailsLoading || !selectedCompetition ? (
          <Spin />
        ) : (
          <>
            <Row gutter={[16, 16]}>
              <Col xs={24} lg={16}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      flexWrap: 'wrap',
                      gap: 8,
                    }}
                  >
                    <Text strong style={{ fontSize: 16 }}>
                      {selectedCompetition.name}
                    </Text>
                    {(() => {
                      const st = getCompetitionStatus(selectedCompetition);
                      return <Tag color={st.color}>{st.text}</Tag>;
                    })()}
                  </div>
                  <Text type="secondary" style={{ fontSize: '14px' }}>
                    {selectedCompetition.description}
                  </Text>
                  <div>
                    <Text style={{ fontSize: '14px' }}>
                      <CalendarOutlined />{' '}
                      {dayjs(selectedCompetition.startDate).format(
                        'MMM D, YYYY'
                      )}{' '}
                      -{' '}
                      {dayjs(selectedCompetition.endDate).format('MMM D, YYYY')}
                    </Text>
                  </div>
                  <div>
                    <Text style={{ fontSize: '14px' }}>
                      Prize:{' '}
                      {selectedCompetition.prize || 'Bonus & Recognition'}
                    </Text>
                  </div>
                  <Divider />
                  <Text strong>Top 5 Leaderboard</Text>
                  <Table
                    dataSource={selectedCompetitionLeaderboard}
                    columns={modalColumns}
                    rowKey={(r, idx) =>
                      r.userId || r.id || r._id || `row-${idx}`
                    }
                    pagination={false}
                    style={{ marginTop: 12 }}
                    scroll={{ x: 400 }}
                    size="small"
                  />
                </Space>
              </Col>

              <Col xs={24} lg={8}>
                <Card size="small" title="Competition Stats">
                  <Statistic
                    title="Participants"
                    value={
                      selectedCompetition.participantsCount ||
                      selectedCompetition.participants?.length ||
                      '-'
                    }
                  />
                  <Divider />
                  <Statistic
                    title="Your Status"
                    value={
                      joinedCompetitionIds.has(
                        String(
                          selectedCompetition._id || selectedCompetition.id
                        )
                      )
                        ? 'Joined'
                        : 'Not Joined'
                    }
                  />
                </Card>

                <div style={{ marginTop: 12 }}>
                  {(() => {
                    const compId = String(
                      selectedCompetition._id || selectedCompetition.id
                    );
                    const isJoined = joinedCompetitionIds.has(compId);
                    const st = getCompetitionStatus(selectedCompetition);

                    if (isJoined) {
                      return (
                        <Button onClick={() => leaveCompetition(compId)} block>
                          Leave Competition
                        </Button>
                      );
                    }

                    // Do not allow joining if competition not active
                    return (
                      <Button
                        type="primary"
                        disabled={st.status !== 'active'}
                        onClick={() => joinCompetition(compId)}
                        block
                      >
                        Join Competition
                      </Button>
                    );
                  })()}
                </div>
              </Col>
            </Row>
          </>
        )}
      </Modal>
    </div>
  );
};

export default Competitions;



