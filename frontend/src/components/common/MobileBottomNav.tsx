import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BottomNavigation, BottomNavigationAction, Paper, Badge } from '@mui/material';
import {
  Home as HomeIcon,
  Explore as ExploreIcon,
  AddBox as CreateIcon,
  Notifications as NotificationsIcon,
  AccountCircle as ProfileIcon,
} from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useAppSelector } from '../../store/hooks';
import { selectUnreadNotificationsCount } from '../../store/slices/notificationsSlice';

const MobileBottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [value, setValue] = useState('home');
  const unreadCount = useAppSelector(selectUnreadNotificationsCount);

  // Update the selected tab based on the current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') setValue('home');
    else if (path.startsWith('/explore')) setValue('explore');
    else if (path.startsWith('/create')) setValue('create');
    else if (path.startsWith('/notifications')) setValue('notifications');
    else if (path.startsWith('/profile')) setValue('profile');
  }, [location]);

  const handleChange = (event: React.SyntheticEvent, newValue: string) => {
    setValue(newValue);
    switch (newValue) {
      case 'home':
        navigate('/');
        break;
      case 'explore':
        navigate('/explore');
        break;
      case 'create':
        navigate('/create');
        break;
      case 'notifications':
        navigate('/notifications');
        break;
      case 'profile':
        navigate('/profile');
        break;
      default:
        navigate('/');
    }
  };

  // Only show on mobile devices
  if (!isMobile) return null;

  return (
    <Paper 
      sx={{ 
        position: 'fixed', 
        bottom: 0, 
        left: 0, 
        right: 0, 
        zIndex: theme.zIndex.appBar,
        boxShadow: '0 -2px 10px 0 rgba(0,0,0,0.1)'
      }} 
      elevation={3}
    >
      <BottomNavigation 
        value={value} 
        onChange={handleChange}
        sx={{
          backgroundColor: theme.palette.background.paper,
          '& .Mui-selected, & .Mui-selected > svg': {
            color: theme.palette.primary.main,
          },
        }}
      >
        <BottomNavigationAction
          label="Home"
          value="home"
          icon={<HomeIcon />}
          sx={{
            minWidth: 'auto',
            padding: theme.spacing(1, 0),
            '&.Mui-selected': {
              paddingTop: '6px',
              '& svg': {
                fontSize: '1.8rem',
              },
            },
          }}
        />
        <BottomNavigationAction
          label="Explore"
          value="explore"
          icon={<ExploreIcon />}
          sx={{
            minWidth: 'auto',
            padding: theme.spacing(1, 0),
            '&.Mui-selected': {
              paddingTop: '6px',
              '& svg': {
                fontSize: '1.8rem',
              },
            },
          }}
        />
        <BottomNavigationAction
          label="Create"
          value="create"
          icon={
            <div style={{
              backgroundColor: theme.palette.primary.main,
              borderRadius: '50%',
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
              boxShadow: `0 4px 12px ${theme.palette.primary.main}40`,
            }}>
              <CreateIcon sx={{ color: 'white' }} />
            </div>
          }
          sx={{
            minWidth: 'auto',
            padding: 0,
            '&.Mui-selected': {
              paddingTop: '6px',
            },
          }}
        />
        <BottomNavigationAction
          label="Notifications"
          value="notifications"
          icon={
            <Badge 
              badgeContent={unreadCount} 
              color="error"
              max={99}
              sx={{
                '& .MuiBadge-badge': {
                  right: -4,
                  top: 4,
                  border: `2px solid ${theme.palette.background.paper}`,
                  padding: '0 4px',
                },
              }}
            >
              <NotificationsIcon />
            </Badge>
          }
          sx={{
            minWidth: 'auto',
            padding: theme.spacing(1, 0),
            '&.Mui-selected': {
              paddingTop: '6px',
              '& svg': {
                fontSize: '1.8rem',
              },
            },
          }}
        />
        <BottomNavigationAction
          label="Profile"
          value="profile"
          icon={<ProfileIcon />}
          sx={{
            minWidth: 'auto',
            padding: theme.spacing(1, 0),
            '&.Mui-selected': {
              paddingTop: '6px',
              '& svg': {
                fontSize: '1.8rem',
              },
            },
          }}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default MobileBottomNav;
