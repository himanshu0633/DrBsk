import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Container, Button, styled } from '@mui/material';
import { PlayArrow } from '@mui/icons-material';

// Styled components matching your ExchangeOffer component
const VideoContainer = styled(Box)({
  position: "relative",
  borderRadius: "20px",
  overflow: "hidden",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  cursor: "pointer",
  width: "100%",
  margin: "0 auto",
});

const VideoElement = styled("video")({
  width: "100%",
  height: "490px",
  objectFit: "contain",
  objectPosition: "center",
  backgroundColor: "#000",
  "@media (max-width: 960px)": {
    height: "400px",
  },
  "@media (max-width: 600px)": {
    height: "300px",
  },
});

const VideoOverlay = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isPlaying',
})(({ isPlaying }) => ({
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: isPlaying ? "transparent" : "rgba(0,0,0,0.3)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "all 0.3s ease",
  opacity: isPlaying ? 0 : 1,
  pointerEvents: isPlaying ? "none" : "auto",
}));

const PlayButton = styled(Box)({
  width: "80px",
  height: "80px",
  borderRadius: "50%",
  backgroundColor: "rgba(255,255,255,0.9)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  transition: "all 0.3s ease",
  "&:hover": {
    backgroundColor: "#fff",
    transform: "scale(1.1)",
  },
  "@media (max-width: 600px)": {
    width: "60px",
    height: "60px",
  },
});

const BrandLogo = styled(Box)({
  position: "absolute",
  top: "0px",
  left: "0px",
  zIndex: 5,
});

const LogoContainer = styled(Box)({
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "8px 5px",
  borderRadius: "8px",
});

const VideoPlayer = ({ 
  videoUrl = null,
  thumbnailUrl = null,
  autoPlay = false,  // Changed default to false to match ExchangeOffer
  showControls = false,
  height = "500px",
  fullWidth = true,
  objectFit = "cover",
  showLogo = true,
  logoUrl = "/logo.svg",
  logoAlt = "Logo",
  showPlayButton = true,
  onPlayClick,
  containerProps = {},
  videoProps = {}
}) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Set video properties
    video.muted = isMuted;
    video.playsInline = true;

    if (autoPlay) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(e => {
          console.log("Autoplay prevented:", e);
        });
      }
    }
  }, [autoPlay, isMuted]);

  // Event handlers
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handlePlay = () => {
      setIsPlaying(true);
      if (onPlayClick) onPlayClick(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
      if (onPlayClick) onPlayClick(false);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      if (onPlayClick) onPlayClick(false);
    };

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('ended', handleEnded);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('ended', handleEnded);
    };
  }, [onPlayClick]);

  const handlePlayClick = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch(e => {
        console.log("Play failed:", e);
      });
    }
    
    if (onPlayClick) {
      onPlayClick(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  // Video style based on height prop
  const videoStyle = {
    height: typeof height === 'number' ? `${height}px` : height,
    objectFit: objectFit,
  };

  return (
    <VideoContainer 
      onClick={handlePlayClick}
      sx={{ 
        width: fullWidth ? '100%' : 'auto',
        ...containerProps 
      }}
    >
      {videoUrl ? (
        <>
          <VideoElement
            ref={videoRef}
            style={videoStyle}
            poster={thumbnailUrl}
            preload="metadata"
            controls={false}
            playsInline
            autoPlay={autoPlay}
            muted={isMuted}
            loop
            {...videoProps}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </VideoElement>

          {showLogo && logoUrl && (
            <BrandLogo>
              
            </BrandLogo>
          )}

          {showPlayButton && (
            <VideoOverlay isPlaying={isPlaying}>
              <PlayButton>
                <PlayArrow sx={{ 
                  fontSize: "32px", 
                  color: "#2C2C2C", 
                  marginLeft: "4px" 
                }} />
              </PlayButton>
            </VideoOverlay>
          )}

          {/* Mute button - positioned differently */}
          <Box
            onClick={(e) => {
              e.stopPropagation();
              toggleMute();
            }}
            sx={{
              position: "absolute",
              bottom: "20px",
              right: "20px",
              background: "rgba(0, 0, 0, 0.5)",
              border: "none",
              color: "white",
              cursor: "pointer",
              fontSize: "20px",
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
              transition: "background 0.3s",
              "&:hover": {
                background: "rgba(0, 0, 0, 0.7)",
              }
            }}
          >
            {isMuted ? '🔇' : '🔊'}
          </Box>
        </>
      ) : (
        <Box
          sx={{
            width: '100%',
            height: height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            backgroundColor: '#222',
            borderRadius: '20px'
          }}
        >
          <Typography>No video available</Typography>
        </Box>
      )}
    </VideoContainer>
  );
};

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string,
  thumbnailUrl: PropTypes.string,
  autoPlay: PropTypes.bool,
  showControls: PropTypes.bool,
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  fullWidth: PropTypes.bool,
  objectFit: PropTypes.string,
  showLogo: PropTypes.bool,
  logoUrl: PropTypes.string,
  logoAlt: PropTypes.string,
  showPlayButton: PropTypes.bool,
  onPlayClick: PropTypes.func,
  containerProps: PropTypes.object,
  videoProps: PropTypes.object
};

VideoPlayer.defaultProps = {
  autoPlay: false,
  showControls: false,
  showLogo: true,
  showPlayButton: true,
  logoUrl: "/logo.svg",
  logoAlt: "Logo"
};

export default VideoPlayer;