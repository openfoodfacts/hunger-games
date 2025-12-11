import * as React from "react";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

export default function QuestionSkeleton() {
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up("md"));

    return (
        <Stack
            sx={{ textAlign: "center", flexGrow: 1, flexBasis: 0, flexShrink: 1, p: 2, height: "100%" }}
            spacing={2}
        >
            <Stack sx={{ alignItems: "center" }} spacing={1}>
                {/* Question Text Skeleton */}
                <Skeleton variant="text" width="60%" height={32} />

                {/* Value Tag / Button Skeleton */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Skeleton variant="rounded" width={120} height={36} sx={{ borderRadius: 16 }} />
                    {/* Logo hint */}
                    <Skeleton variant="circular" width={36} height={36} />
                </Box>

                {/* "See examples" link skeleton (desktop only) */}
                {isDesktop && (
                    <Skeleton variant="text" width="100px" height={20} />
                )}
            </Stack>

            <Divider />

            {/* Main Image Area Skeleton */}
            <Box
                flexGrow={1}
                sx={{
                    height: `calc(100vh - ${isDesktop ? 461 : 445}px)`,
                    position: "relative",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    overflow: "hidden"
                }}
            >
                <Skeleton
                    variant="rectangular"
                    width="100%"
                    height="100%"
                    animation="wave"
                />
            </Box>

            {/* Action Buttons Skeleton */}
            <Stack direction="row" justifyContent="center" spacing={2} sx={{ mb: 1 }}>
                <Skeleton variant="rounded" height={60} sx={{ flexGrow: 1 }} />
                <Skeleton variant="rounded" height={60} sx={{ flexGrow: 1 }} />
            </Stack>
            <Skeleton variant="rounded" height={48} width="100%" />
        </Stack>
    );
}
