// File: components/traffic-chart.tsx
"use client";

// Removed useState and useEffect as data is now passed via props
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Define the expected data structure for the chart
export interface ChartDataPoint {
  name: string; // Typically represents time (e.g., "HH:MM", "YYYY-MM-DD")
  volume: number | null; // Vehicle count
  speed: number | null; // Average speed
}

interface TrafficChartProps {
  data: ChartDataPoint[]; // Accept processed data as a prop
  isLoading?: boolean; // Optional loading indicator
}

export default function TrafficChart({ data, isLoading }: TrafficChartProps) {

  if (isLoading) {
      return <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">Loading chart data...</div>;
  }

  if (!data || data.length === 0) {
      return <div className="h-[350px] w-full flex items-center justify-center text-muted-foreground">No data available for the selected period.</div>;
  }


  return (
    // Ensure parent container provides dimensions, h-[350px] is good
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
           {/* Adjust XAxis dataKey if needed based on your data structure */}
          <XAxis dataKey="name" />
          {/* Left YAxis for Volume */}
          <YAxis
              yAxisId="left"
              label={{ value: 'Vehicle Volume', angle: -90, position: 'Left' }}
              stroke="#8884d8"
          />
          {/* Right YAxis for Speed */}
          <YAxis
              yAxisId="right"
              orientation="right"
              label={{ value: 'Average Speed (km/h)', angle: 90, position: 'Right' }}
              stroke="#82ca9d"
          />
          <Tooltip formatter={(value, name) => [`${value}${name === 'speed' ? ' km/h' : ''}`, name]} />
          <Legend />
          <Line
            yAxisId="left"
            type="monotone"
            dataKey="volume"
            stroke="#8884d8"
            activeDot={{ r: 6 }}
            name="Volume"
             connectNulls // Connect line across null points
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="speed"
            stroke="#82ca9d"
            activeDot={{ r: 6 }}
            name="Speed"
             connectNulls // Connect line across null points
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}