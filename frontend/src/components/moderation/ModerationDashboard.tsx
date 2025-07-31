import { useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import { 
  Layout, Menu, theme, Card, Statistic, Row, Col, Alert, Spin, Typography 
} from 'antd';
import { 
  FlagOutlined, 
  UserDeleteOutlined, 
  DashboardOutlined, 
  AlertOutlined,
  UserOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { getModerationStats } from '../../services/moderation.service';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;

export default function ModerationDashboard() {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Fetch moderation stats
  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['moderationStats'],
    queryFn: () => getModerationStats(),
  });

  // Navigation items
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
      children: [
        { 
          key: 'pending-flags', 
          label: 'Pending Review',
          onClick: () => navigate('/moderation/flags/pending')
        },
        { 
          key: 'resolved-flags', 
          label: 'Resolved',
          onClick: () => navigate('/moderation/flags/resolved')
        },
      ],
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
      label: 'Moderation Settings',
      onClick: () => navigate('/moderation/settings')
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={(value) => setCollapsed(value)}
        width={250}
        theme="light"
      >
        <div style={{ 
          height: 64, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          borderBottom: '1px solid #f0f0f0'
        }}>
          <Title level={4} style={{ margin: 0, color: '#1890ff' }}>
            {collapsed ? 'MD' : 'Moderation'}
          </Title>
        </div>
        
        <Menu
          theme="light"
          defaultSelectedKeys={['dashboard']}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      
      <Layout>
        <Header style={{ 
          padding: 0, 
          background: colorBgContainer,
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 24
        }}>
          <Title level={4} style={{ margin: 0 }}>Moderation Dashboard</Title>
        </Header>
        
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          {/* Stats Overview */}
          {window.location.pathname === '/moderation' && (
            <div style={{ marginBottom: 24 }}>
              <Title level={5} style={{ marginBottom: 16 }}>Overview</Title>
              {error && (
                <Alert 
                  message="Error loading stats" 
                  description={error.message}
                  type="error" 
                  showIcon 
                  style={{ marginBottom: 16 }}
                />
              )}
              
              <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                  <StatisticCard 
                    title="Pending Review"
                    value={stats?.pendingFlags || 0}
                    loading={isLoading}
                    icon={<FlagOutlined style={{ color: '#faad14' }} />}
                    color="#faad14"
                    onClick={() => navigate('/moderation/flags/pending')}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatisticCard 
                    title="Active Suspensions"
                    value={stats?.activeSuspensions || 0}
                    loading={isLoading}
                    icon={<UserDeleteOutlined style={{ color: '#ff4d4f' }} />}
                    color="#ff4d4f"
                    onClick={() => navigate('/moderation/suspensions')}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatisticCard 
                    title="Today's Actions"
                    value={stats?.todaysActions || 0}
                    loading={isLoading}
                    icon={<AlertOutlined style={{ color: '#52c41a' }} />}
                    color="#52c41a"
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <StatisticCard 
                    title="Active Moderators"
                    value={stats?.activeModerators || 0}
                    loading={isLoading}
                    icon={<UserOutlined style={{ color: '#1890ff' }} />}
                    color="#1890ff"
                  />
                </Col>
              </Row>
            </div>
          )}
          
          {/* Nested routes content */}
          <div style={{ 
            padding: 24, 
            background: colorBgContainer, 
            borderRadius: borderRadiusLG 
          }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

// Statistic Card Component
function StatisticCard({ title, value, loading, icon, color, onClick }) {
  return (
    <Card 
      hoverable 
      onClick={onClick}
      style={{ 
        cursor: onClick ? 'pointer' : 'default',
        borderLeft: `4px solid ${color}`,
        height: '100%'
      }}
    >
      <Spin spinning={loading}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ 
            fontSize: 32, 
            marginRight: 16,
            color
          }}>
            {icon}
          </div>
          <div>
            <Text type="secondary">{title}</Text>
            <Title level={3} style={{ margin: '4px 0 0 0' }}>
              {loading ? '-' : value.toLocaleString()}
            </Title>
          </div>
        </div>
      </Spin>
    </Card>
  );
}
