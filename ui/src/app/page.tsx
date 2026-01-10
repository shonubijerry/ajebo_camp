"use client"

import { useEffect, useState } from "react"
import { Box, CircularProgress } from "@mui/material"
import CampsDisplay from "../components/home/CampsDisplay"
import { api } from "@/lib/api/server"
import { Camp } from "@/interfaces"

export default function HomePage() {
  const [camps, setCamps] = useState<Camp[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadCamps = async () => {
      try {
        const result = await api.GET("/api/v1/camps/list", {
          query: { page: 0, per_page: 100 },
        })

        if (!isMounted) return
        setCamps(result.data?.success ? (result.data.data ?? []) : [])
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadCamps()

    return () => {
      isMounted = false
    }
  }, [])

  if (isLoading) {
    return (
      <Box
        sx={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    )
  }

  return <CampsDisplay camps={camps} />
}
