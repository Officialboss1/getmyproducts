import React, { useState, useEffect } from 'react';
import {
  Layout,
  Menu,
  Button,
  message,
  Dropdown,
  Space,
  Avatar,
  Typography,
  Drawer,
  Grid,
} from 'antd';
import LiveChatSupport from '../components/LiveChatSupport';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  PieChartOutlined,
  ShoppingCartOutlined,
  TrophyOutlined,
  SettingOutlined,
  TeamOutlined,
  FileSearchOutlined,
  LogoutOutlined,
  UserOutlined,
  DashboardOutlined,
  QuestionCircleOutlined,
  MessageOutlined,
  ShoppingOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUser } from '../contexts/App';

// Dashboards
import SalespersonDashboard from './dashboard/SalespersonDashboard';
import SuperAdminDashboard from './dashboard/SuperAdminDashboard';
import AdminDashboard from './dashboard/AdminDashboard';
import CustomerDashboard from './dashboard/CustomerDashboard';

// Sales
import AddSale from './sales/AddSale';
import SalesHistory from './sales/SalesHistory';

// Salesperson Orders
import OrderTracking from './salesperson/OrderTracking';

// Competitions
import Competitions from './competitions/Competitions';
import CompetitionsManagement from './admin/CompetitionsManagement';

// Referrals
import Referrals from './referrals/Referrals';

// Analytics
import AnalyticsTargets from './analytics/AnalyticsTargets';
import Analytics from './admin/Analytics';

// Profile
import ProfilePage from './profile/ProfilePage';

// Super Admin
import AdminManagement from './superadmin/AdminManagement';
import SalespersonsManagement from './superadmin/SalespersonsManagement';
import CustomersManagement from './superadmin/CustomersManagement';
import AuditLogs from './superadmin/AuditLogs';
import ChatManagement from './superadmin/ChatManagement';

// Admin
import UserManagement from './admin/UserManagement';
import TargetsManagement from './admin/TargetsManagement';
import AdminChatManagement from './admin/ChatManagement';
import ReferralSettings from './admin/ReferralSettings';

// Customer
import PurchaseHistory from './customer/PurchaseHistory';
import Support from './customer/Support';

// Product & Order Management
import ProductManagement from './dashboard/ProductManagement';
import OrderManagement from './dashboard/OrderManagement';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const DashboardPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const { user, logout } = useUser();
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();

  const role = user?.role;

  // Removed sensitive console.log statements for security

  useEffect(() => {
    const validateAuth = () => {
      try {
        const token = localStorage.getItem('token');
        if (!token || !user) {
          throw new Error('No token or user data found');
        }
      } catch (error) {
        // Removed console.error for security - error details logged server-side
        message.error('Please log in to continue');
        navigate('/login', { replace: true });
      }
    };
    if (user) validateAuth();
  }, [navigate, user]);

  const toggleCollapse = () => {
    if (screens.md) {
      setCollapsed(!collapsed);
    } else {
      setDrawerVisible(!drawerVisible);
    }
  };

  const closeDrawer = () => setDrawerVisible(false);

  const handleLogout = () => {
    logout();
    message.success('Logged out successfully');
    navigate('/login');
  };

  const getMenuItems = () => {
    switch (role) {
      case 'customer':
        return [
          {
            key: '/dashboard',
            label: 'Dashboard',
            icon: <DashboardOutlined />,
          },
          {
            key: '/customer/purchases',
            label: 'Purchase History',
            icon: <ShoppingCartOutlined />,
          },
          {
            key: '/customer/support',
            label: 'Support',
            icon: <QuestionCircleOutlined />,
          },
          { key: '/profile', label: 'My Profile', icon: <UserOutlined /> },
        ];

      case 'salesperson':
        return [
          {
            key: '/dashboard',
            label: 'Dashboard',
            icon: <DashboardOutlined />,
          },
          {
            key: 'sales-submenu',
            label: 'Sales',
            icon: <ShoppingCartOutlined />,
            children: [
              { key: '/sales/add', label: 'Add Sale' },
              { key: '/sales/history', label: 'Sales History' },
            ],
          },
          {
            key: '/order-tracking',
            label: 'Order Tracking',
            icon: <ShoppingOutlined />,
          },
          {
            key: '/competitions',
            label: 'Competitions',
            icon: <TrophyOutlined />,
          },
          { key: '/referrals', label: 'Referrals', icon: <TeamOutlined /> },
          {
            key: '/analytics',
            label: 'Analytics & Targets',
            icon: <PieChartOutlined />,
          },
          { key: '/profile', label: 'My Profile', icon: <UserOutlined /> },
        ];

      case 'super_admin':
        return [
          {
            key: '/dashboard',
            label: 'Dashboard',
            icon: <DashboardOutlined />,
          },
          {
            key: '/analytics',
            label: 'Analytics & Targets',
            icon: <PieChartOutlined />,
          },
          {
            key: 'management-submenu',
            label: 'User Management',
            icon: <TeamOutlined />,
            children: [
              { key: '/admins', label: 'Admin Management' },
              { key: '/salespersons', label: 'Salespersons' },
              { key: '/customers', label: 'Customers' },
            ],
          },
          {
            key: 'product-order-submenu',
            label: 'Product & Orders',
            icon: <ShoppingOutlined />,
            children: [
              { key: '/products', label: 'Product Management' },
              { key: '/orders', label: 'Order Management' },
            ],
          },
          {
            key: '/chat-management',
            label: 'Chat Support',
            icon: <MessageOutlined />,
          },
          {
            key: '/admin-competitions',
            label: 'Competitions',
            icon: <TrophyOutlined />,
          },
          { key: '/audit', label: 'Audit Logs', icon: <FileSearchOutlined /> },
          {
            key: '/referral-settings',
            label: 'Referral Settings',
            icon: <SettingOutlined />,
          },
          { key: '/profile', label: 'My Profile', icon: <UserOutlined /> },
        ];

      case 'admin':
        return [
          {
            key: '/dashboard',
            label: 'Dashboard',
            icon: <DashboardOutlined />,
          },
          {
            key: '/analytics',
            label: 'Analytics & Targets',
            icon: <PieChartOutlined />,
          },
          {
            key: 'admin-management-submenu',
            label: 'Team Management',
            icon: <TeamOutlined />,
            children: [
              { key: "/salespersons", label: "Sales Team" },
              { key: "/targets", label: "Targets" },
            ],
          },
          {
            key: 'product-order-submenu',
            label: 'Product & Orders',
            icon: <ShoppingOutlined />,
            children: [
              { key: '/products', label: 'Product Management' },
              { key: '/orders', label: 'Order Management' },
            ],
          },
          {
            key: '/chat-management',
            label: 'Chat Support',
            icon: <MessageOutlined />,
          },
          {
            key: '/admin-competitions',
            label: 'Competitions',
            icon: <TrophyOutlined />,
          },
          {
            key: '/admin-referral-settings',
            label: 'Referral Settings',
            icon: <SettingOutlined />,
          },
          { key: '/audit', label: 'Audit Logs', icon: <FileSearchOutlined /> },
          { key: '/profile', label: 'My Profile', icon: <UserOutlined /> },
        ];

      default:
        return [];
    }
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    { type: 'divider' },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const renderContent = () => {
    if (!role) return null;

    if (
      role === 'customer' &&
      (location.pathname === '/dashboard' || location.pathname === '/')
    )
      return <CustomerDashboard user={user} />;
    if (
      role === 'salesperson' &&
      (location.pathname === '/dashboard' || location.pathname === '/')
    )
      return <SalespersonDashboard user={user} />;
    if (
      role === 'super_admin' &&
      (location.pathname === '/dashboard' || location.pathname === '/')
    )
      return <SuperAdminDashboard user={user} />;
    if (
      role === 'admin' &&
      (location.pathname === '/dashboard' || location.pathname === '/')
    )
      return <AdminDashboard user={user} />;

    // Handle profile routes
    if (location.pathname === '/profile') {
      return <ProfilePage />;
    } else if (location.pathname.startsWith('/profile/')) {
      const userId = location.pathname.split('/')[2];
      return <ProfilePage userId={userId} />;
    }

    switch (location.pathname) {
      case '/sales/add':
        return <AddSale user={user} />;
      case '/sales/history':
        return <SalesHistory user={user} />;
      case '/competitions':
        return role === 'salesperson' ? (
          <Competitions user={user} />
        ) : (
          <AdminDashboard user={user} />
        );
      case '/admin-competitions':
        return role === 'admin' || role === 'super_admin' ? (
          <CompetitionsManagement user={user} />
        ) : (
          <AdminDashboard user={user} />
        );
      case '/referrals':
        return role === 'salesperson' ? (
          <Referrals user={user} />
        ) : (
          <AdminDashboard user={user} />
        );
      case '/analytics':
        return role === 'admin' ? (
          <Analytics user={user} />
        ) : (
          <AnalyticsTargets user={user} />
        );

      // Super Admin routes
      case '/admins':
        return role === 'super_admin' ? (
          <AdminManagement user={user} />
        ) : (
          <AdminDashboard user={user} />
        );
      case '/salespersons':
        return role === 'super_admin' ? (
          <SalespersonsManagement user={user} />
        ) : role === 'admin' ? (
          <UserManagement user={user} />
        ) : (
          <AdminDashboard user={user} />
        );
      case '/customers':
        return role === 'super_admin' ? (
          <CustomersManagement user={user} />
        ) : (
          <AdminDashboard user={user} />
        );
      case '/audit':
        return role === 'admin' || role === 'super_admin' ? (
          <AuditLogs user={user} />
        ) : (
          <AdminDashboard user={user} />
        );
      case '/referral-settings':
        return role === 'super_admin' ? (
          <ReferralSettings user={user} />
        ) : (
          <AdminDashboard user={user} />
        );
      case '/targets':
        return role === 'admin' ? (
          <TargetsManagement user={user} />
        ) : (
          <AdminDashboard user={user} />
        );
      case '/chat-management':
        return role === 'super_admin' ? (
          <ChatManagement user={user} />
        ) : role === 'admin' ? (
          <AdminChatManagement user={user} />
        ) : (
          <AdminDashboard user={user} />
        );
      case '/admin-referral-settings':
        return role === 'admin' ? (
          <ReferralSettings user={user} />
        ) : (
          <AdminDashboard user={user} />
        );

      // Product & Order Management routes - only Admin and Super Admin can access
      case '/products':
        return role === 'admin' || role === 'super_admin' ? (
          <ProductManagement user={user} />
        ) : (
          <div>
            <h2>Access Denied</h2>
            <p>You don't have permission to manage products.</p>
          </div>
        );
      case '/orders':
        return role === 'admin' || role === 'super_admin' ? (
          <OrderManagement user={user} />
        ) : (
          <div>
            <h2>Access Denied</h2>
            <p>You don't have permission to manage orders.</p>
          </div>
        );

      // Customer routes
      case '/customer/purchases':
        return role === 'customer' ? (
          <PurchaseHistory user={user} />
        ) : (
          <AdminDashboard user={user} />
        );
      case '/customer/support':
        return role === 'customer' ? (
          <Support user={user} />
        ) : (
          <AdminDashboard user={user} />
        );

      // Salesperson order tracking
      case '/order-tracking':
        return role === 'salesperson' ? (
          <OrderTracking user={user} />
        ) : (
          <AdminDashboard user={user} />
        );

      default:
        return (
          <div>
            <h2>Access Denied</h2>
            <p>You don't have permission to access this page.</p>
          </div>
        );
    }
  };

  if (!role)
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        Authenticating...
      </div>
    );

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      {screens.md && (
        <Sider collapsible collapsed={collapsed} trigger={null}>
          <div
            className="logo"
            style={{
              color: 'white',
              textAlign: 'center',
              padding: '1rem',
              fontSize: collapsed ? '16px' : '18px',
              fontWeight: 'bold',
            }}
          >
            {collapsed ? 'ST' : 'Sales Tracker'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            items={getMenuItems()}
            selectedKeys={[location.pathname]}
            defaultOpenKeys={[]} // submenus closed
            onClick={({ key }) => navigate(key)}
          />
        </Sider>
      )}

      <Layout>
        <Header
          style={{
            padding: screens.xs ? '0 0.5rem' : '0 1rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            height: screens.xs ? '56px' : '64px',
          }}
        >
          <Button type="text" onClick={toggleCollapse}>
            {screens.md &&
              (collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />)}
            {!screens.md && <MenuUnfoldOutlined />}
          </Button>
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <Space
              style={{ cursor: 'pointer', padding: screens.xs ? '4px' : '8px' }}
            >
              <Avatar
                size={screens.xs ? 32 : 40}
                icon={<UserOutlined />}
                src={
                  user?.avatar
                    ? `http://localhost:5000/${user.avatar}`
                    : undefined
                }
              />
              {!screens.xs && (
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <Text strong>
                    {user?.firstName} {user?.lastName}
                  </Text>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {role?.replace('_', ' ').toUpperCase()}
                  </Text>
                </div>
              )}
            </Space>
          </Dropdown>
        </Header>

        <Content
          style={{
            margin: screens.xs ? '8px' : '16px',
            padding: screens.xs ? '16px' : '24px',
            background: '#fff',
            borderRadius: '8px',
            minHeight: screens.xs
              ? 'calc(100vh - 80px)'
              : 'calc(100vh - 120px)',
            overflow: 'auto',
          }}
        >
          {renderContent()}
        </Content>
      </Layout>

      {/* Mobile Drawer */}
      {!screens.md && (
        <Drawer
          title="Sales Tracker"
          placement="left"
          onClose={closeDrawer}
          open={drawerVisible}
          width={280}
          styles={{ body: { padding: 0 } }}
        >
          <Menu
            theme="light"
            mode="inline"
            items={getMenuItems()}
            selectedKeys={[location.pathname]}
            defaultOpenKeys={[]} // submenus closed
            onClick={({ key }) => {
              navigate(key);
              closeDrawer();
            }}
          />
        </Drawer>
      )}

      {/* Live Chat Support - only for customers and salespeople */}
      {(role === 'customer' || role === 'salesperson') && <LiveChatSupport />}
    </Layout>
  );
};

export default DashboardPage;

