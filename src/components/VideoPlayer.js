import React, { useState, useRef, useEffect } from "react";
import PropTypes from "prop-types";
import { Box, Typography, styled } from "@mui/material";
import { PlayArrow } from "@mui/icons-material";

const VideoContainer = styled(Box)({
  position: "relative",
  overflow: "hidden",
  boxShadow: "0 20px 60px rgba(0,0,0,0.2)",
  cursor: "pointer",
  width: "100%",
  margin: "0 auto",
  borderRadius: "20px",
});

const VideoInner = styled(Box)({
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const VideoElement = styled("video")({
  display: "block",
  width: "100%",
  height: "100%",
  backgroundColor: "#000",
});

const VideoOverlay = styled(Box)(({ isplaying }) => ({
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  pointerEvents: "none",
}));

const PlayButton = styled(Box)({
  pointerEvents: "auto",
  width: 80,
  height: 80,
  borderRadius: "50%",
  background: "rgba(255,255,255,0.95)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const VideoPlayer = ({
  videoUrl = "https://drbskhealthcare.com/uploads/intro-video.mp4",
  autoPlay = true,
  showControls = false,
  fullWidth = true,
  showPlayButton = true,
  containerProps = {},
  videoProps = {},
}) => {
  const containerRef = useRef(null);
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [containerHeight, setContainerHeight] = useState(null); // px

  // On video metadata load, compute container height to match video aspect ratio
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const onLoaded = () => {
      // videoWidth/videoHeight available
      const vw = vid.videoWidth;
      const vh = vid.videoHeight;
      if (!vw || !vh) return;

      // container width
      const container = containerRef.current;
      const cw = container ? container.clientWidth : window.innerWidth;

      // desired height in px to preserve aspect ratio
      const desiredHeight = Math.round((cw * vh) / vw);
      setContainerHeight(desiredHeight);

      // try autoplay (muted)
      vid.muted = isMuted;
      vid.playsInline = true;
      if (autoPlay) {
        vid.play().catch(() => {});
      }
    };

    vid.addEventListener("loadedmetadata", onLoaded);

    return () => {
      vid.removeEventListener("loadedmetadata", onLoaded);
    };
  }, [autoPlay, isMuted]);

  // Recalculate on window resize so height follows width
  useEffect(() => {
    const handleResize = () => {
      const vid = videoRef.current;
      const container = containerRef.current;
      if (!vid || !container) return;
      const vw = vid.videoWidth;
      const vh = vid.videoHeight;
      if (!vw || !vh) return;
      const cw = container.clientWidth;
      const desiredHeight = Math.round((cw * vh) / vw);
      setContainerHeight(desiredHeight);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Play/pause toggle
  const handleTogglePlay = (e) => {
    // if users click mute button, we stopPropagation from that button; overlay click toggles play
    const vid = videoRef.current;
    if (!vid) return;
    if (vid.paused) {
      vid.play().catch(() => {});
    } else {
      vid.pause();
    }
  };

  // mute toggle
  const toggleMute = (e) => {
    e.stopPropagation();
    const vid = videoRef.current;
    if (!vid) return;
    vid.muted = !vid.muted;
    setIsMuted(vid.muted);
  };

  // update play state
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    vid.addEventListener("play", onPlay);
    vid.addEventListener("pause", onPause);
    return () => {
      vid.removeEventListener("play", onPlay);
      vid.removeEventListener("pause", onPause);
    };
  }, []);

  const containerStyle = containerHeight ? { height: `${containerHeight}px` } : { height: "auto" };

  return (
    <VideoContainer
      ref={containerRef}
      onClick={handleTogglePlay}
      sx={{ width: fullWidth ? "100%" : "auto", ...containerStyle, ...containerProps }}
    >
      <VideoInner>
        <VideoElement
          ref={videoRef}
          poster=""
          preload="auto"
          controls={showControls}
          playsInline
          autoPlay={autoPlay}
          muted={isMuted}
          {...videoProps}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </VideoElement>
      </VideoInner>

      {showPlayButton && (
        <VideoOverlay isplaying={isPlaying ? 1 : 0}>
          {!isPlaying && (
            <PlayButton>
              <PlayArrow sx={{ fontSize: 32, color: "#2C2C2C" }} />
            </PlayButton>
          )}
        </VideoOverlay>
      )}

      {/* mute button bottom-right */}
      <Box
        onClick={toggleMute}
        sx={{
          position: "absolute",
          right: 12,
          bottom: 12,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          zIndex: 10,
        }}
      >
        {isMuted ? "🔇" : "🔊"}
      </Box>
    </VideoContainer>
  );
};

VideoPlayer.propTypes = {
  videoUrl: PropTypes.string,
  autoPlay: PropTypes.bool,
  showControls: PropTypes.bool,
  fullWidth: PropTypes.bool,
  showPlayButton: PropTypes.bool,
  containerProps: PropTypes.object,
  videoProps: PropTypes.object,
};

export default VideoPlayer;