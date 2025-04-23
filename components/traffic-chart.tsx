"use client"

import { useEffect, useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TrafficChartProps {
  timeFilter: string
}

export default function TrafficChart({ timeFilter }: TrafficChartProps) {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    // In a real app, this would fetch data based on the timeFilter
    // For this example, we'll generate mock data
    const mockData = generateMockData(timeFilter)
    setData(mockData)
  }, [timeFilter])

  return (
    <div className="h-[350px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis yAxisId="left" />
          <YAxis yAxisId="right" orientation="right" />
          <Tooltip />
          <Legend />
          <Line yAxisId="left" type="monotone" dataKey="volume" stroke="#8884d8" activeDot={{ r: 8 }} />
          <Line yAxisId="right" type="monotone" dataKey="speed" stroke="#82ca9d" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

function generateMockData(timeFilter: string) {
  switch (timeFilter) {
    case "hour":
      return [
        { name: "Now", volume: 950, speed: 42 },
        { name: "15 min ago", volume: 900, speed: 43 },
        { name: "30 min ago", volume: 850, speed: 44 },
        { name: "45 min ago", volume: 800, speed: 45 },
        { name: "60 min ago", volume: 750, speed: 46 },
      ]
    case "day":
      return [
        { name: "6 AM", volume: 400, speed: 45 },
        { name: "8 AM", volume: 1200, speed: 32 },
        { name: "10 AM", volume: 800, speed: 40 },
        { name: "12 PM", volume: 900, speed: 38 },
        { name: "2 PM", volume: 850, speed: 42 },
        { name: "4 PM", volume: 1300, speed: 30 },
        { name: "6 PM", volume: 1100, speed: 35 },
        { name: "8 PM", volume: 700, speed: 44 },
      ]
    case "week":
      return [
        { name: "Mon", volume: 4000, speed: 40 },
        { name: "Tue", volume: 3800, speed: 42 },
        { name: "Wed", volume: 4200, speed: 38 },
        { name: "Thu", volume: 3900, speed: 41 },
        { name: "Fri", volume: 4500, speed: 36 },
        { name: "Sat", volume: 3500, speed: 45 },
        { name: "Sun", volume: 3000, speed: 48 },
      ]
    case "month":
      return [
        { name: "Week 1", volume: 25000, speed: 41 },
        { name: "Week 2", volume: 26500, speed: 40 },
        { name: "Week 3", volume: 24800, speed: 42 },
        { name: "Week 4", volume: 27000, speed: 39 },
      ]
    case "custom":
      return [
        { name: "Day 1", volume: 4200, speed: 41 },
        { name: "Day 3", volume: 4500, speed: 40 },
        { name: "Day 5", volume: 4300, speed: 42 },
        { name: "Day 7", volume: 4600, speed: 39 },
        { name: "Day 9", volume: 4400, speed: 41 },
      ]
    default:
      return []
  }
}

