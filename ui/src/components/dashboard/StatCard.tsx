import { Card, CardContent, Stack, Typography, Box } from "@mui/material";
import { TrendingUp, TrendingDown } from "@mui/icons-material";
import React from "react";

interface StatCardProps {
  label: string;
  value: number | string;
  delta: string;
  isPositive?: boolean;
  icon?: React.ReactNode;
}

export default function StatCard({
  label,
  value,
  delta,
  isPositive = true,
  icon,
}: StatCardProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        height: "100%",
        background: "linear-gradient(135deg, rgba(99, 102, 241, 0.05) 0%, rgba(139, 92, 246, 0.05) 100%)",
        border: "1px solid",
        borderColor: "divider",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        "&:hover": {
          boxShadow: "0 12px 24px rgba(0, 0, 0, 0.08)",
          borderColor: "primary.main",
          transform: "translateY(-2px)",
        },
      }}
    >
      <CardContent>
        <Stack spacing={1}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
            {icon && (
              <Box sx={{ color: isPositive ? "success.main" : "error.main", opacity: 0.7 }}>
                {icon}
              </Box>
            )}
          </Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mt: 1 }}>
            {value.toLocaleString?.() ?? value}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {isPositive ? (
              <TrendingUp fontSize="small" sx={{ color: "success.main" }} />
            ) : (
              <TrendingDown fontSize="small" sx={{ color: "error.main" }} />
            )}
            <Typography
              variant="body2"
              sx={{
                color: isPositive ? "success.main" : "error.main",
                fontWeight: 600,
              }}
            >
              {delta}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              vs last month
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
