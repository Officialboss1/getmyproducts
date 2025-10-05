import React, { useState, useEffect } from "react";
import { Layout, Menu, Button, message, Dropdown, Space, Avatar, Typography } from "antd";
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
  GiftOutlined,
  BellOutlined,
} from "@ant-design/icons";
import { useNavigate, useLocation } from "react-router-dom";
import SalespersonDashboard from "./dashboard/SalespersonDashboard";
import SuperAdminDashboard from './dashboard/SuperAdminDashboard';
import AdminDashboard from './dashboard/AdminDashboard';
import CustomerDashboard from './dashboard/CustomerDashboard';
import AddSale from "./sales/AddSale";
import SalesHistory from "./sales/SalesHistory";
import Competitions from "./competitions/Competitions";
import Referrals from "./referrals/Referrals";
import AnalyticsTargets from "./analytics/AnalyticsTargets";
import ProfilePage from './profile/ProfilePage';
import AdminManagement from './superadmin/AdminManagement';
import SalespersonsManagement from './superadmin/SalespersonsManagement';
import CustomersManagement from './superadmin/CustomersManagement';
import AuditLogs from './superadmin/AuditLogs';
import ReferralSettings from './superadmin/ReferralSettings';
import UserManagement from './admin/UserManagement';
import TargetsManagement from './admin/TargetsManagement';
import CompetitionsManagement from './admin/CompetitionsManagement';
import AdminReferralSettings from './admin/ReferralSettings';
import Analytics from './admin/Analytics';
import PurchaseHistory from './customer/PurchaseHistory';
// import Rewards from './customer/Rewards';
// import ReferralInfo from './customer/ReferralInfo';
// import Notifications from './customer/Notifications';
import Support from './customer/Support';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

const DashboardPage = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const validateAuth = () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("No token found");
        }

        const storedUser = localStorage.getItem("user");
        if (!storedUser) {
          throw new Error("No user data found");
        }

        const userData = JSON.parse(storedUser);
        
        if (!userData || typeof userData !== 'object' || !userData.role || !userData._id) {
          throw new Error("Invalid user data structure");
        }

        setRole(userData.role);
        setUser(userData);
      } catch (error) {
        console.error("Authentication validation failed:", error);
        message.error("Please log in to continue");
        
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/login", { replace: true });
      }
    };

    validateAuth();
  }, [navigate]);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    message.success("Logged out successfully");
    navigate("/login");
  };

  const getMenuItems = () => {
    // Customer specific menu items
    if (role === "customer") {
      return [
        { 
          key: "/dashboard", 
          label: "Dashboard", 
          icon: <DashboardOutlined /> 
        },
        { 
          key: "/customer/purchases", 
          label: "Purchase History", 
          icon: <ShoppingCartOutlined /> 
        },
        // { 
        //   key: "/customer/rewards", 
        //   label: "Rewards & Offers", 
        //   icon: <GiftOutlined /> 
        // },
        // { 
        //   key: "/customer/referral", 
        //   label: "Referral Info", 
        //   icon: <UserOutlined /> 
        // },
        // { 
        //   key: "/customer/notifications", 
        //   label: "Notifications", 
        //   icon: <BellOutlined /> 
        // },
        { 
          key: "/customer/support", 
          label: "Support", 
          icon: <QuestionCircleOutlined /> 
        },
        { 
          key: "/profile", 
          label: "My Profile", 
          icon: <UserOutlined /> 
        },
      ];
    }

    const baseMenu = [
      { 
        key: "/dashboard", 
        label: "Dashboard", 
        icon: <DashboardOutlined /> 
      },
      { 
        key: "/analytics", 
        label: "Analytics & Targets", 
        icon: <PieChartOutlined /> 
      },
      { 
        key: "sales-submenu",
        label: "Sales", 
        icon: <ShoppingCartOutlined />,
        children: [
          { key: "/sales/add", label: "Add Sale" },
          { key: "/sales/history", label: "Sales History" },
        ]
      },
      { 
        key: "/competitions", 
        label: "Competitions", 
        icon: <TrophyOutlined /> 
      },
      { 
        key: "/referrals", 
        label: "Referrals", 
        icon: <TeamOutlined /> 
      },
      { 
        key: "/profile", 
        label: "My Profile", 
        icon: <UserOutlined /> 
      },
    ];

    // Super Admin specific menu items
    if (role === "super_admin") {
      baseMenu.splice(1, 0, 
        { 
          key: "management-submenu",
          label: "User Management", 
          icon: <TeamOutlined />,
          children: [
            { key: "/admins", label: "Admin Management" },
            { key: "/salespersons", label: "Salespersons" },
            { key: "/customers", label: "Customers" },
          ]
        },
        { 
          key: "/audit", 
          label: "Audit Logs", 
          icon: <FileSearchOutlined /> 
        },
        { 
          key: "/referral-settings", 
          label: "Referral Settings", 
          icon: <SettingOutlined /> 
        }
      );
    }

    // Admin specific menu items (without duplicating super_admin items)
    if (role === "admin" && role !== "super_admin") {
      baseMenu.splice(1, 0, 
        { 
          key: "admin-management-submenu",
          label: "Team Management", 
          icon: <TeamOutlined />,
          children: [
            { key: "/salespersons", label: "Sales Team" },
            { key: "/customers", label: "Customers" },
            { key: "/targets", label: "Targets" },
          ]
        },
        { 
          key: "/admin-competitions", 
          label: "Competitions", 
          icon: <TrophyOutlined /> 
        },
        { 
          key: "/admin-referral-settings", 
          label: "Referral Settings", 
          icon: <SettingOutlined /> 
        }
      );
    }

    return baseMenu;
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const renderContent = () => {
    // Customer sees different dashboard
    if (role === 'customer' && (location.pathname === '/dashboard' || location.pathname === '/')) {
      return <CustomerDashboard user={user} />;
    }

    // Super Admin sees different dashboard
    if (role === 'super_admin' && (location.pathname === '/dashboard' || location.pathname === '/')) {
      return <SuperAdminDashboard user={user} />;
    }

    // Admin sees different dashboard
    if (role === 'admin' && (location.pathname === '/dashboard' || location.pathname === '/')) {
      return <AdminDashboard user={user} />;
    }

    switch (location.pathname) {
      case "/dashboard":
      case "/":
        return <SalespersonDashboard user={user} />;
      
      case "/sales/add":
        return <AddSale user={user} />;
      
      case "/sales/history":
        return <SalesHistory user={user} />;
      
      case "/competitions":
        return <Competitions user={user} />;
      
      case "/referrals":
        return <Referrals user={user} />;
      
      case "/analytics":
        return <AnalyticsTargets user={user} />;

      case "/profile":
        return <ProfilePage user={user} />;

      // Super Admin specific routes
      case "/admins":
        return <AdminManagement user={user} />;
      
      case "/salespersons":
        if (role === 'super_admin') {
          return <SalespersonsManagement user={user} />;
        }
        break;

      case "/customers":
        if (role === 'super_admin') {
          return <CustomersManagement user={user} />;
        }
        break;

      case "/audit":
        return <AuditLogs user={user} />;

      case "/referral-settings":
        return <ReferralSettings user={user} />;

      // Admin specific routes
      case "/salespersons":
        if (role === 'admin') {
          return <UserManagement user={user} />;
        }
        break;

      case "/targets":
        if (role === 'admin') {
          return <TargetsManagement user={user} />;
        }
        break;

      case "/admin-competitions":
        if (role === 'admin') {
          return <CompetitionsManagement user={user} />;
        }
        break;

      case "/admin-referral-settings":
        if (role === 'admin') {
          return <AdminReferralSettings user={user} />;
        }
        break;

      case "/analytics":
        if (role === 'admin') {
          return <Analytics user={user} />;
        }
        break;

      // Customer specific routes
      case "/customer/purchases":
        if (role === 'customer') {
          return <PurchaseHistory user={user} />;
        }
        break;

      case "/customer/rewards":
        if (role === 'customer') {
          return <Rewards user={user} />;
        }
        break;

      case "/customer/referral":
        if (role === 'customer') {
          return <ReferralInfo user={user} />;
        }
        break;

      case "/customer/notifications":
        if (role === 'customer') {
          return <Notifications user={user} />;
        }
        break;

      case "/customer/support":
        if (role === 'customer') {
          return <Support user={user} />;
        }
        break;
      
      default:
        return (
          <div>
            <h2>Welcome to {role?.replace("_", " ").toUpperCase()} Dashboard</h2>
            <p>Select an option from the sidebar to continue.</p>
            <p>Current path: {location.pathname}</p>
          </div>
        );
    }

    // Fallback for unauthorized access
    return (
      <div>
        <h2>Access Denied</h2>
        <p>You don't have permission to access this page.</p>
      </div>
    );
  };

  if (!role) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        flexDirection: 'column'
      }}>
        <div>Authenticating...</div>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible collapsed={collapsed} trigger={null}>
        <div className="logo" style={{ 
          color: "white", 
          textAlign: "center", 
          padding: "1rem",
          fontSize: collapsed ? "16px" : "18px",
          fontWeight: "bold"
        }}>
          {collapsed ? "ST" : "Sales Tracker"}
        </div>
        <Menu 
          theme="dark" 
          mode="inline" 
          items={getMenuItems()} 
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['sales-submenu', 'management-submenu', 'admin-management-submenu']}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>

      <Layout>
        <Header
          style={{
            padding: "0 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            background: "#fff",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
          }}
        >
          <Button type="text" onClick={toggleCollapse}>
            {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
          </Button>
          
          <Dropdown
            menu={{ items: userMenuItems }}
            placement="bottomRight"
            arrow
          >
            <Space style={{ cursor: 'pointer', padding: '8px' }}>
              <Avatar icon={<UserOutlined />} />
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <Text strong>
                  {user?.firstName} {user?.lastName}
                </Text>
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {role?.replace('_', ' ').toUpperCase()}
                </Text>
              </div>
            </Space>
          </Dropdown>
        </Header>

        <Content style={{ 
          margin: "16px", 
          padding: "24px", 
          background: "#fff",
          borderRadius: "8px",
          minHeight: "calc(100vh - 120px)",
          overflow: 'auto'
        }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
};

export default DashboardPage;