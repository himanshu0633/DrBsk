import React, { useState, useEffect } from "react";
import { Box, Typography, Button, Fade, Grow, Zoom } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { useLocation, useNavigate } from "react-router-dom";
import { clearProducts } from "../store/Action";
import { connect } from "react-redux";
import confetti from "canvas-confetti";

const OrderSuccessModal = ({ clearProducts }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state || {};
  const data = state?.data || {};
  const [showContent, setShowContent] = useState(false);
  const [showHurray, setShowHurray] = useState(false);

  useEffect(() => {
    // Show "Hurray!!" and trigger confetti
    // setShowHurray(true);
    const duration = 2 * 1000; // 3 seconds
    const end = Date.now() + duration;

    (function frame() {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 150,
        origin: { x: 0, y: 1 }, // Bottom-left
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 150,
        origin: { x: 1, y: 1 }, // Bottom-right
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Hide "Hurray!!" after confetti finishes
    // setTimeout(() => setShowHurray(false), duration);

    // Show main content with delay
    setTimeout(() => setShowContent(true), duration + 500);
  }, []);

  const handleClose = () => {
    setShowContent(false);
    navigate("/OrderPage");
    clearProducts();
  };

  return (
    <Fade in={showContent || showHurray} timeout={3000}>
      <Box
        sx={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          bgcolor: "rgba(0, 0, 0, 0.9)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
      >
        {/* {showHurray && (
          <Typography
            variant="h2"
            component="div"
            sx={{
              position: "absolute",
              top: "50%",
              color: "gold",
              fontWeight: "bold",
              textShadow: "2px 2px 5px rgba(0,0,0,0.7)",
            //   animation: "fadeInOut 3s",
            }}
          >
            Hurray!!
          </Typography>
        )} */}
        {showContent && (
          <Zoom in={showContent} timeout={50}>
            <Box sx={{ textAlign: "center", color: "white" }}>
              <Grow in={showContent} timeout={500}>
                <CheckCircleOutlineIcon
                  sx={{
                    fontSize: 120,
                    color: "success.main",
                    mb: 4,
                  }}
                />
              </Grow>
              <Typography variant="h3" component="h1" gutterBottom>
                Order Placed Successfully!
              </Typography>
              <Typography variant="h6" sx={{ mt: 2, mb: 4 }}>
                Thank you for your order. We'll send you a confirmation email
                shortly.
              </Typography>
             
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={handleClose}
                sx={{
                  mt: 2,
                  fontSize: "1.2rem",
                  padding: "12px 24px",
                  "&:hover": {
                    transform: "scale(1.05)",
                    transition: "transform 0.2s",
                  },
                  borderRadius: 2,
                }}
              >
                Check Orders
              </Button>
            </Box>
          </Zoom>
        )}
      </Box>
    </Fade>
  );
};

const mapStateToProps = (state) => ({
  data: state.data,
});

const mapDispatchToProps = {
  clearProducts,
};

export default connect(mapStateToProps, mapDispatchToProps)(OrderSuccessModal);
