import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Layout, Menu, theme, Typography } from 'antd';
import { 
  DashboardOutlined, 
  FlagOutlined, 
  UserOutlined, 
  UserDeleteOutlined,
  AlertOutlined,
  SettingOutlined
} from '@ant-design/icons';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const ModerationLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer },
  } = theme.useToken();

  // Get the current selected key based on the route
  const getSelectedKey = () => {
    const path = location.pathname;
    if (path.includes('/moderation/flags')) return 'flags';
    if (path.includes('/moderation/users')) return 'users';
    if (path.includes('/moderation/suspensions')) return 'suspensions';
    if (path.includes('/moderation/reports')) return 'reports';
    if (path.includes('/moderation/settings')) return 'settings';
    return 'dashboard';
  };

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/moderation')
    },
    {
      key: 'flags',
      icon: <FlagOutlined />,
      label: 'Flagged Content',
      onClick: () => navigate('/moderation/flags')
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: 'User Management',
      onClick: () => navigate('/moderation/users')
    },
    {
      key: 'suspensions',
      icon: <UserDeleteOutlined />,
      label: 'Suspensions',
      onClick: () => navigate('/moderation/suspensions')
    },
    {
      key: 'reports',
      icon: <AlertOutlined />,
      label: 'Reports',
      onClick: () => navigate('/moderation/reports')
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/moderation/settings')
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        width={250} 
        theme="light"
        breakpoint="lg"
        collapsedWidth="0"
        onCollapse={(collapsed, type) => {
          console.log(collapsed, type);
        }}
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            College Whisper Mod
          </Title>
        </div>
        
        <Menu
          theme="light"
          mode="inline"
          selectedKeys={[getSelectedKey()]}
          items={menuItems}
          style={{ borderRight: 0 }}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: '0 24px',
          background: colorBgContainer,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={4} style={{ margin: 0 }}>
            {menuItems.find(item => item.key === getSelectedKey())?.label}
          </Title>
          <div>
            {/* Add user profile/notification components here */}
          </div>
        </Header>
        
        <Content style={{ margin: '24px 16px 0' }}>
          <div style={{ 
            padding: 24, 
            minHeight: 360,
            background: colorBgContainer,
            borderRadius: 8
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default ModerationLayout;
