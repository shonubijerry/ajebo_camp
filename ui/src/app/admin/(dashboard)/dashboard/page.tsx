"use client";

import React from "react";
import { Grid, Typography, Box } from "@mui/material";
import StatCard from "@/components/dashboard/StatCard";
import { People as UsersIcon, TrendingUp as TrendingIcon } from "@mui/icons-material";
import Link from "next/link";
import { Card, CardContent, Stack, Button } from "@mui/material";

const statCards = [
	{ label: "Total Users", value: 1280, delta: "+12%", icon: <UsersIcon /> },
	{ label: "Active Camps", value: 64, delta: "+5%", icon: <TrendingIcon /> },
	{ label: "Districts", value: 18, delta: "+2%", icon: <TrendingIcon /> },
	{ label: "Camp Allocations", value: 342, delta: "+8%", icon: <TrendingIcon /> },
];

export default function AdminDashboard() {
	return (
		<>
			<Grid container spacing={3} sx={{ mb: 4 }}>
					{statCards.map((card) => (
					<Grid sx={{ xs: 12, sm: 6, md: 3 }} key={card.label}>
						<StatCard {...card} isPositive={!card.delta.includes("-")} />
					</Grid>
				))}
			</Grid>

			<Grid container spacing={3}>
				<Grid sx={{ xs: 12, md: 8 }}>
						<Card variant="outlined" sx={{ height: "100%", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)" }}>
							<CardContent>
								<Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
									Recent Activity
								</Typography>
								<Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
									Track recent user activities and system events
								</Typography>
								<Box
									sx={{
										p: 3,
										textAlign: "center",
										borderRadius: 1,
										border: "1px dashed",
										borderColor: "divider",
										bgcolor: "background.paper",
									}}
								>
									<Typography variant="body2" color="text.secondary">
										Activity data will be populated from API endpoints
									</Typography>
								</Box>
							</CardContent>
						</Card>
					</Grid>

				<Grid sx={{ xs: 12, md: 4 }}>
						<Card variant="outlined" sx={{ height: "100%", background: "linear-gradient(135deg, rgba(99, 102, 241, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)" }}>
							<CardContent>
								<Typography variant="h6" gutterBottom sx={{ fontWeight: 700 }}>
									Quick Actions
								</Typography>
								<Stack spacing={1.5}>
									<Button component={Link} href="/admin/users" variant="contained" fullWidth>
										Manage Users
									</Button>
									<Button component={Link} href="/admin/camps" variant="outlined" fullWidth>
										View Camps
									</Button>
									<Button component={Link} href="/admin/districts" variant="outlined" fullWidth>
										View Districts
									</Button>
									<Button component={Link} href="/admin/camp-allocations" variant="outlined" fullWidth>
										Allocations
									</Button>
								</Stack>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
		</>
	);
}
