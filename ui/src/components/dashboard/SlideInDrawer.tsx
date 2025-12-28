import React from "react";
import {
  Drawer,
  Box,
  IconButton,
  Typography,
  Divider,
  Stack,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

interface SlideInDrawerProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  width?: number | string;
}

export default function SlideInDrawer({
  open,
  onClose,
  title,
  children,
  width = 600,
}: SlideInDrawerProps) {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        "& .MuiDrawer-paper": {
          width: { xs: "100%", sm: width },
          maxWidth: "100vw",
        },
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
        <Box sx={{ flex: 1, overflow: "auto", p: 3 }}>{children}</Box>
      </Box>
    </Drawer>
  );
}
