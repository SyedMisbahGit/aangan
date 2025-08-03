import { ReactNode, useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Box, Drawer, CssBaseline, AppBar, Toolbar, IconButton, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import MobileBottomNav from '../common/MobileBottomNav';
import Sidebar from './Sidebar';

const drawerWidth = 240;

interface ResponsiveLayoutProps {
  children: ReactNode;
  title?: string;
  showSidebar?: boolean;
  showBottomNav?: boolean;
}

const ResponsiveLayout = ({
  children,
  title = 'Aangan',
  showSidebar = true,
  showBottomNav = true,
}: ResponsiveLayoutProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll for app bar shadow
  useEffect(() => {
    const handleScroll = () => {
      const offset = window.scrollY;
      setIsScrolled(offset > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Render the sidebar for desktop
  const desktopDrawer = (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        display: { xs: 'none', md: 'block' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          borderRight: 'none',
          backgroundColor: theme.palette.background.default,
          boxShadow: theme.shadows[1],
        },
      }}
      open
    >
      <Sidebar />
    </Drawer>
  );

  // Render the mobile drawer
  const mobileDrawer = (
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={handleDrawerToggle}
      ModalProps={{
        keepMounted: true, // Better open performance on mobile
      }}
      sx={{
        display: { xs: 'block', md: 'none' },
        '& .MuiDrawer-paper': {
          width: drawerWidth,
          boxSizing: 'border-box',
          backgroundColor: theme.palette.background.default,
        },
      }}
    >
      <Sidebar onItemClick={handleDrawerToggle} />
    </Drawer>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />
      
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={isScrolled ? 4 : 0}
        sx={{
          width: { md: showSidebar ? `calc(100% - ${drawerWidth}px)` : '100%' },
          ml: { md: showSidebar ? `${drawerWidth}px` : 0 },
          backgroundColor: 'background.paper',
          color: 'text.primary',
          transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
          borderBottom: `1px solid ${theme.palette.divider}`,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Toolbar>
          {showSidebar && isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          
          {/* Add any app bar actions here */}
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      {showSidebar && (
        <>
          {desktopDrawer}
          {mobileDrawer}
        </>
      )}

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3 },
          width: { md: showSidebar ? `calc(100% - ${drawerWidth}px)` : '100%' },
          marginTop: { xs: '56px', sm: '64px' }, // Account for app bar height
          marginBottom: showBottomNav && isMobile ? '56px' : 0, // Account for bottom nav
        }}
      >
        {children}
      </Box>

      {/* Mobile Bottom Navigation */}
      {showBottomNav && isMobile && <MobileBottomNav />}
    </Box>
  );
};

export default ResponsiveLayout;
