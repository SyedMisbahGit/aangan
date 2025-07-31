import { useState, useRef, useEffect } from 'react';
import { Box, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material';
import { PlayArrow, Pause, NavigateBefore, NavigateNext } from '@mui/icons-material';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  thumbnail?: string;
  alt?: string;
}

interface PostMediaProps {
  media: MediaItem[];
  onImageClick?: (index: number) => void;
  variant?: 'default' | 'compact';
  autoPlay?: boolean;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
}

const PostMedia = ({
  media,
  onImageClick,
  variant = 'default',
  autoPlay = false,
  controls = true,
  loop = true,
  muted = true,
}: PostMediaProps) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const [isHovered, setIsHovered] = useState(false);
  const videoRefs = useRef<{[key: string]: HTMLVideoElement | null}>({});
  const isCompact = variant === 'compact' || isMobile;
  
  const currentMedia = media[currentIndex];
  const hasMultipleMedia = media.length > 1;
  
  // Handle video play/pause
  const togglePlayPause = () => {
    if (!currentMedia) return;
    
    const video = videoRefs.current[currentMedia.id];
    if (!video) return;
    
    if (video.paused) {
      video.play().then(() => setIsPlaying(true));
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };
  
  // Handle next/previous media
  const goToNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex + 1) % media.length);
    setIsPlaying(autoPlay);
  };
  
  const goToPrevious = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
    setIsPlaying(autoPlay);
  };
  
  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasMultipleMedia) return;
      
      if (e.key === 'ArrowRight') {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % media.length);
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + media.length) % media.length);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasMultipleMedia, media.length]);
  
  // Handle autoplay for videos
  useEffect(() => {
    if (!currentMedia || currentMedia.type !== 'video') return;
    
    const video = videoRefs.current[currentMedia.id];
    if (!video) return;
    
    if (isPlaying) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay was prevented, handle it here
          setIsPlaying(false);
        });
      }
    } else {
      video.pause();
    }
  }, [currentMedia, isPlaying]);
  
  // Handle video end
  const handleVideoEnd = () => {
    if (loop && hasMultipleMedia) {
      goToNext({ stopPropagation: () => {} } as React.MouseEvent);
    } else {
      setIsPlaying(false);
    }
  };
  
  // Handle click on media
  const handleMediaClick = (e: React.MouseEvent) => {
    if (currentMedia.type === 'image' && onImageClick) {
      onImageClick(currentIndex);
    } else if (currentMedia.type === 'video') {
      togglePlayPause();
    }
  };
  
  if (!currentMedia) return null;
  
  // Calculate aspect ratio for the media container
  const getAspectRatio = () => {
    if (isCompact) return '16/9';
    if (media.length === 1) return '16/9';
    return '1/1'; // Square for carousel
  };
  
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        aspectRatio: getAspectRatio(),
        backgroundColor: theme.palette.background.default,
        overflow: 'hidden',
        '&:hover': {
          cursor: currentMedia.type === 'image' && onImageClick ? 'zoom-in' : 'default',
        },
      }}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
      onClick={handleMediaClick}
      onTouchStart={() => isMobile && setIsHovered(true)}
      onTouchEnd={() => isMobile && setTimeout(() => setIsHovered(false), 2000)}
    >
      {/* Media content */}
      {currentMedia.type === 'image' ? (
        <Box
          component="img"
          src={currentMedia.url}
          alt={currentMedia.alt || 'Post media'}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <Box
          component="video"
          ref={(el) => (videoRefs.current[currentMedia.id] = el)}
          src={currentMedia.url}
          poster={currentMedia.thumbnail}
          loop={loop}
          muted={muted}
          playsInline
          onEnded={handleVideoEnd}
          onClick={(e) => e.stopPropagation()}
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            display: 'block',
            backgroundColor: '#000',
          }}
        />
      )}
      
      {/* Video controls */}
      {currentMedia.type === 'video' && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            background: 'linear-gradient(0deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 1,
            opacity: isHovered || !isPlaying ? 1 : 0,
            transition: 'opacity 0.3s ease',
            zIndex: 1,
          }}
        >
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              togglePlayPause();
            }}
            sx={{
              color: '#fff',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
            }}
          >
            {isPlaying ? <Pause /> : <PlayArrow />}
          </IconButton>
        </Box>
      )}
      
      {/* Navigation arrows */}
      {hasMultipleMedia && (
        <>
          <IconButton
            onClick={goToPrevious}
            sx={{
              position: 'absolute',
              left: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: '#fff',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
              zIndex: 1,
            }}
            size={isCompact ? 'small' : 'medium'}
          >
            <NavigateBefore />
          </IconButton>
          
          <IconButton
            onClick={goToNext}
            sx={{
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              color: '#fff',
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.3s ease',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
              zIndex: 1,
            }}
            size={isCompact ? 'small' : 'medium'}
          >
            <NavigateNext />
          </IconButton>
        </>
      )}
      
      {/* Dots indicator for multiple media */}
      {hasMultipleMedia && media.length > 1 && (
        <Box
          sx={{
            position: 'absolute',
            bottom: 8,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            gap: 0.5,
            zIndex: 1,
          }}
        >
          {media.map((_, index) => (
            <Box
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
                setIsPlaying(autoPlay);
              }}
              sx={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                backgroundColor: index === currentIndex ? theme.palette.primary.main : 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: index === currentIndex ? theme.palette.primary.dark : 'rgba(255, 255, 255, 0.7)',
                },
              }}
            />
          ))}
        </Box>
      )}
      
      {/* Media type indicator */}
      {currentMedia.type === 'video' && (
        <Box
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            color: '#fff',
            borderRadius: 2,
            px: 1,
            fontSize: '0.7rem',
            display: 'flex',
            alignItems: 'center',
            zIndex: 1,
          }}
        >
          <PlayArrow fontSize="small" sx={{ fontSize: '0.8rem', mr: 0.2 }} />
          VIDEO
        </Box>
      )}
    </Box>
  );
};

export default PostMedia;
