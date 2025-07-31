import { useState, useRef, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Divider,
  Chip,
  Skeleton,
  useScrollTrigger,
  Slide,
  AppBar,
  Toolbar,
  Dialog,
  DialogContent,
  DialogActions,
  Button,
} from '@mui/material';
import {
  Favorite,
  FavoriteBorder,
  ChatBubbleOutline,
  Share,
  BookmarkBorder,
  Bookmark,
  MoreVert,
  Close,
  Person,
  Flag,
  Block,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { likePost, savePost } from '../../store/slices/postsSlice';
import { selectCurrentUser } from '../../store/slices/authSlice';
import PostComments from './PostComments';
import PostMedia from './PostMedia';
import PostActions from './PostActions';
import { Post as PostType } from '../../types';

interface PostCardProps {
  post: PostType;
  showActions?: boolean;
  onDelete?: (postId: string) => void;
  onReport?: (postId: string) => void;
  onBlockUser?: (userId: string) => void;
  variant?: 'default' | 'compact';
}

const PostCard = ({
  post,
  showActions = true,
  onDelete,
  onReport,
  onBlockUser,
  variant = 'default',
}: PostCardProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const currentUser = useAppSelector(selectCurrentUser);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [showComments, setShowComments] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const cardRef = useRef<HTMLDivElement>(null);
  const isMenuOpen = Boolean(anchorEl);
  const isCompact = variant === 'compact' || isMobile;

  // Handle like/unlike post
  const handleLike = async () => {
    try {
      await dispatch(likePost(post.id)).unwrap();
      setIsLiked(!isLiked);
      setLikeCount(prev => (isLiked ? prev - 1 : prev + 1));
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  // Handle save/unsave post
  const handleSave = async () => {
    try {
      await dispatch(savePost(post.id)).unwrap();
      setIsSaved(!isSaved);
    } catch (error) {
      console.error('Failed to save post:', error);
    }
  };

  // Handle menu open/close
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Handle post deletion
  const handleDelete = () => {
    if (onDelete) {
      onDelete(post.id);
      handleMenuClose();
    }
  };

  // Handle user report
  const handleReport = () => {
    if (onReport) {
      onReport(post.id);
      handleMenuClose();
    }
  };

  // Handle user block
  const handleBlockUser = () => {
    if (onBlockUser && post.user) {
      onBlockUser(post.user.id);
      handleMenuClose();
    }
  };

  // Toggle comments visibility
  const toggleComments = () => {
    setShowComments(!showComments);
  };

  // Handle image click for fullscreen view
  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowFullImage(true);
  };

  // Format post date
  const formatDate = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  };

  // Check if the current user is the post author
  const isAuthor = currentUser?.id === post.user?.id;

  // Render post content with line breaks and links
  const renderContent = (content: string) => {
    if (!content) return null;
    
    // Split content into paragraphs
    return content.split('\n').map((paragraph, index) => (
      <Typography 
        key={index} 
        variant="body1" 
        component="p" 
        sx={{ 
          mb: 1.5,
          wordBreak: 'break-word',
          '& a': {
            color: theme.palette.primary.main,
            textDecoration: 'none',
            '&:hover': {
              textDecoration: 'underline',
            },
          },
        }}
      >
        {paragraph}
      </Typography>
    ));
  };

  // Render post header with user info and menu
  const renderHeader = () => (
    <CardHeader
      avatar={
        <Avatar 
          src={post.user?.avatar} 
          alt={post.user?.name}
          sx={{ 
            width: isCompact ? 36 : 40, 
            height: isCompact ? 36 : 40,
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (post.user) {
              navigate(`/profile/${post.user.username}`);
            }
          }}
        >
          {post.user?.name?.[0] || <Person />}
        </Avatar>
      }
      action={
        showActions ? (
          <IconButton 
            aria-label="post options"
            onClick={handleMenuOpen}
            size="small"
            sx={{
              color: 'text.secondary',
            }}
          >
            <MoreVert />
          </IconButton>
        ) : null
      }
      title={
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            '&:hover': {
              textDecoration: 'underline',
              cursor: 'pointer',
            },
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (post.user) {
              navigate(`/profile/${post.user.username}`);
            }
          }}
        >
          <Typography 
            variant="subtitle2" 
            component="span"
            sx={{ 
              fontWeight: 600,
              mr: 1,
            }}
          >
            {post.user?.name || 'Anonymous'}
          </Typography>
          {post.user?.isVerified && (
            <Box 
              component="span"
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                color: theme.palette.primary.main,
                ml: 0.5,
              }}
            >
              <VerifiedIcon fontSize="small" />
            </Box>
          )}
        </Box>
      }
      subheader={
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{
              fontSize: '0.7rem',
            }}
          >
            {formatDate(post.createdAt)}
          </Typography>
          {post.location && (
            <>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{ mx: 0.5 }}
              >
                •
              </Typography>
              <Typography 
                variant="caption" 
                color="text.secondary"
                sx={{
                  fontSize: '0.7rem',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <RoomIcon fontSize="inherit" sx={{ fontSize: '0.8rem', mr: 0.2 }} />
                {post.location}
              </Typography>
            </>
          )}
        </Box>
      }
      sx={{
        p: isCompact ? 1 : 2,
        pb: 0.5,
        '& .MuiCardHeader-action': {
          m: 0,
          alignSelf: 'center',
        },
      }}
    />
  );

  // Render post media (images/videos)
  const renderMedia = () => {
    if (!post.media || post.media.length === 0) return null;
    
    return (
      <Box 
        sx={{ 
          mt: isCompact ? 0.5 : 1,
          mb: isCompact ? 0.5 : 1.5,
          borderRadius: 1,
          overflow: 'hidden',
          position: 'relative',
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <PostMedia 
          media={post.media}
          onImageClick={handleImageClick}
          variant={isCompact ? 'compact' : 'default'}
        />
      </Box>
    );
  };

  // Render post actions (like, comment, share, save)
  const renderActions = () => (
    <CardActions 
      disableSpacing 
      sx={{
        px: isCompact ? 1 : 2,
        pt: 0,
        pb: isCompact ? 0.5 : 1,
        justifyContent: 'space-between',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <IconButton 
          aria-label="like" 
          size={isCompact ? 'small' : 'medium'}
          onClick={handleLike}
          sx={{
            color: isLiked ? theme.palette.error.main : 'text.secondary',
            p: isCompact ? 0.5 : 1,
            mr: isCompact ? 0.5 : 1,
          }}
        >
          {isLiked ? (
            <Favorite fontSize={isCompact ? 'small' : 'medium'} />
          ) : (
            <FavoriteBorder fontSize={isCompact ? 'small' : 'medium'} />
          )}
          {likeCount > 0 && (
            <Typography 
              variant="caption" 
              sx={{ 
                ml: 0.5,
                color: isLiked ? theme.palette.error.main : 'text.secondary',
                fontWeight: isLiked ? 600 : 400,
              }}
            >
              {likeCount > 1000 ? `${(likeCount / 1000).toFixed(1)}k` : likeCount}
            </Typography>
          )}
        </IconButton>
        
        <IconButton 
          aria-label="comment" 
          size={isCompact ? 'small' : 'medium'}
          onClick={toggleComments}
          sx={{
            color: showComments ? theme.palette.primary.main : 'text.secondary',
            p: isCompact ? 0.5 : 1,
            mr: isCompact ? 0.5 : 1,
          }}
        >
          <ChatBubbleOutline fontSize={isCompact ? 'small' : 'medium'} />
          {commentCount > 0 && (
            <Typography 
              variant="caption" 
              sx={{ 
                ml: 0.5,
                color: showComments ? theme.palette.primary.main : 'text.secondary',
                fontWeight: showComments ? 600 : 400,
              }}
            >
              {commentCount > 1000 ? `${(commentCount / 1000).toFixed(1)}k` : commentCount}
            </Typography>
          )}
        </IconButton>
        
        <IconButton 
          aria-label="share" 
          size={isCompact ? 'small' : 'medium'}
          sx={{
            p: isCompact ? 0.5 : 1,
            color: 'text.secondary',
            display: isMobile ? 'none' : 'inline-flex',
          }}
        >
          <Share fontSize={isCompact ? 'small' : 'medium'} />
        </IconButton>
      </Box>
      
      <IconButton 
        aria-label="save" 
        size={isCompact ? 'small' : 'medium'}
        onClick={handleSave}
        sx={{
          p: isCompact ? 0.5 : 1,
          color: isSaved ? theme.palette.primary.main : 'text.secondary',
        }}
      >
        {isSaved ? (
          <Bookmark fontSize={isCompact ? 'small' : 'medium'} />
        ) : (
          <BookmarkBorder fontSize={isCompact ? 'small' : 'medium'} />
        )}
      </IconButton>
    </CardActions>
  );

  // Render post tags
  const renderTags = () => {
    if (!post.tags || post.tags.length === 0) return null;
    
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexWrap: 'wrap',
          gap: 0.5,
          px: isCompact ? 1 : 2,
          pb: isCompact ? 0.5 : 1,
        }}
      >
        {post.tags.map((tag, index) => (
          <Chip
            key={index}
            label={`#${tag}`}
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/explore/tags/${tag}`);
            }}
            sx={{
              height: 20,
              fontSize: '0.65rem',
              '& .MuiChip-label': {
                px: 0.75,
              },
            }}
          />
        ))}
      </Box>
    );
  };

  // Render post menu
  const renderMenu = () => (
    <Menu
      anchorEl={anchorEl}
      open={isMenuOpen}
      onClose={handleMenuClose}
      onClick={(e) => e.stopPropagation()}
      PaperProps={{
        elevation: 0,
        sx: {
          overflow: 'visible',
          filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.1))',
          mt: 1.5,
          minWidth: 200,
          '& .MuiAvatar-root': {
            width: 32,
            height: 32,
            ml: -0.5,
            mr: 1,
          },
          '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            bgcolor: 'background.paper',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
          },
        },
      }}
      transformOrigin={{ horizontal: 'right', vertical: 'top' }}
      anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
    >
      {isAuthor ? (
        <>
          <MenuItem onClick={handleDelete}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Delete Post</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Post</ListItemText>
          </MenuItem>
        </>
      ) : (
        <>
          <MenuItem onClick={handleReport}>
            <ListItemIcon>
              <Flag fontSize="small" />
            </ListItemIcon>
            <ListItemText>Report Post</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleBlockUser}>
            <ListItemIcon>
              <Block fontSize="small" />
            </ListItemIcon>
            <ListItemText>Block User</ListItemText>
          </MenuItem>
        </>
      )}
      <Divider />
      <MenuItem onClick={handleMenuClose}>
        <ListItemText>Cancel</ListItemText>
      </MenuItem>
    </Menu>
  );

  // Render fullscreen image viewer
  const renderFullscreenImage = () => (
    <Dialog
      fullScreen
      open={showFullImage}
      onClose={() => setShowFullImage(false)}
      PaperProps={{
        style: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          color: '#fff',
        },
      }}
    >
      <AppBar position="sticky" color="transparent" elevation={0}>
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            onClick={() => setShowFullImage(false)}
            aria-label="close"
          >
            <Close />
          </IconButton>
          <Typography variant="h6" sx={{ ml: 2, flex: 1 }}>
            {selectedImageIndex + 1} / {post.media?.length}
          </Typography>
        </Toolbar>
      </AppBar>
      <DialogContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box
          component="img"
          src={post.media?.[selectedImageIndex]?.url}
          alt={`Post media ${selectedImageIndex + 1}`}
          sx={{
            maxHeight: '80vh',
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 2 }}>
        <Button 
          onClick={() => setShowFullImage(false)}
          variant="outlined"
          color="inherit"
          startIcon={<Close />}
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <>
      <Card 
        ref={cardRef}
        elevation={0}
        sx={{
          mb: isCompact ? 1 : 2,
          borderRadius: 2,
          backgroundColor: 'background.paper',
          border: `1px solid ${theme.palette.divider}`,
          overflow: 'hidden',
          '&:hover': {
            boxShadow: theme.shadows[1],
          },
          cursor: 'pointer',
          transition: 'all 0.2s ease-in-out',
        }}
        onClick={() => navigate(`/post/${post.id}`)}
      >
        {renderHeader()}
        <CardContent 
          sx={{ 
            p: isCompact ? 1 : 2,
            pt: 0,
            pb: isCompact ? 0.5 : '0 !important',
          }}
        >
          {renderContent(post.content)}
          {renderTags()}
        </CardContent>
        {renderMedia()}
        {showActions && renderActions()}
      </Card>
      
      {/* Comments Section */}
      {showComments && (
        <Box 
          sx={{ 
            mb: isCompact ? 1 : 2,
            ml: isCompact ? 0 : 4,
            pl: isCompact ? 0 : 2,
            borderLeft: isCompact ? 'none' : `2px solid ${theme.palette.divider}`,
          }}
        >
          <PostComments 
            postId={post.id} 
            initialComments={post.comments}
            onCommentAdded={() => setCommentCount(prev => prev + 1)}
            onCommentRemoved={() => setCommentCount(prev => Math.max(0, prev - 1))}
          />
        </Box>
      )}
      
      {renderMenu()}
      {renderFullscreenImage()}
    </>
  );
};

export default PostCard;
