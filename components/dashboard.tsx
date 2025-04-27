"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  ArrowDownIcon,
  ArrowUpIcon,
  Car,
  Clock,
  Download,
  LineChart,
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import TrafficChart from "@/components/traffic-chart"
import TimeFilter from "@/components/time-filter"

export default function Dashboard() {
  const [timeFilter, setTimeFilter] = useState("day")

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <h1 className="text-xl font-semibold">Traffic Flow Dashboard</h1>
        <div className="ml-auto flex items-center gap-4">
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <RefreshCw className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Refresh Data</span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8">
            <Settings className="h-3.5 w-3.5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </header>
      <div className="flex-1 space-y-4 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
            <Badge variant="outline" className="ml-2">
              Live
            </Badge>
          </div>
          <div className="ml-auto flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search locations..."
                className="w-full rounded-md pl-8 sm:w-[240px] md:w-[260px] lg:w-[300px]"
              />
            </div>
            <TimeFilter value={timeFilter} onValueChange={setTimeFilter} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Traffic Volume</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24,685</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Speed</CardTitle>
              <LineChart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">42 km/h</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7-9 AM, 4-6 PM</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-emerald-500 flex items-center gap-1">
                  <ArrowUpIcon className="h-3 w-3" /> +0.5%
                </span>{" "}
                congestion increase
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Congestion Index</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">68%</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div>
                <CardTitle>Traffic Flow Metrics</CardTitle>
                <CardDescription>Traffic volume and speed over time</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>View detailed report</DropdownMenuItem>
                  <DropdownMenuItem>Export data</DropdownMenuItem>
                  <DropdownMenuItem>Set alerts</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              <TrafficChart timeFilter={timeFilter} />
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Historical Data</CardTitle>
              <CardDescription>Traffic statistics based on selected time period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full caption-bottom text-sm">
                  <thead className="[&_tr]:border-b">
                    <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Time Period
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Cars Detected
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Average Speed
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Peak Volume
                      </th>
                      <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground">
                        Lowest Speed
                      </th>
                    </tr>
                  </thead>
                  <tbody className="[&_tr:last-child]:border-0">
                    {generateHistoricalData(timeFilter).map((row, index) => (
                      <tr
                        key={index}
                        className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle">{row.period}</td>
                        <td className="p-4 align-middle">{row.carsDetected.toLocaleString()}</td>
                        <td className="p-4 align-middle">{row.avgSpeed} km/h</td>
                        <td className="p-4 align-middle">{row.peakVolume.toLocaleString()}</td>
                        <td className="p-4 align-middle">{row.lowestSpeed} km/h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function generateHistoricalData(timeFilter: string) {
  switch (timeFilter) {
    case "hour":
      return [
        { period: "12:00 PM - 1:00 PM", carsDetected: 1250, avgSpeed: 42, peakVolume: 1450, lowestSpeed: 38 },
        { period: "11:00 AM - 12:00 PM", carsDetected: 1100, avgSpeed: 45, peakVolume: 1300, lowestSpeed: 40 },
        { period: "10:00 AM - 11:00 AM", carsDetected: 980, avgSpeed: 47, peakVolume: 1150, lowestSpeed: 43 },
        { period: "9:00 AM - 10:00 AM", carsDetected: 1350, avgSpeed: 40, peakVolume: 1550, lowestSpeed: 35 },
        { period: "8:00 AM - 9:00 AM", carsDetected: 1650, avgSpeed: 35, peakVolume: 1850, lowestSpeed: 30 },
      ]
    case "day":
      return [
        { period: "Today (Mar 24)", carsDetected: 24685, avgSpeed: 42, peakVolume: 1850, lowestSpeed: 30 },
        { period: "Yesterday (Mar 23)", carsDetected: 23450, avgSpeed: 44, peakVolume: 1750, lowestSpeed: 32 },
        { period: "Mar 22", carsDetected: 22800, avgSpeed: 45, peakVolume: 1700, lowestSpeed: 33 },
        { period: "Mar 21", carsDetected: 24100, avgSpeed: 43, peakVolume: 1800, lowestSpeed: 31 },
        { period: "Mar 20", carsDetected: 25200, avgSpeed: 41, peakVolume: 1900, lowestSpeed: 29 },
      ]
    case "week":
      return [
        { period: "This Week (Mar 18-24)", carsDetected: 165400, avgSpeed: 43, peakVolume: 28500, lowestSpeed: 30 },
        { period: "Last Week (Mar 11-17)", carsDetected: 158700, avgSpeed: 44, peakVolume: 27800, lowestSpeed: 31 },
        { period: "Mar 4-10", carsDetected: 162300, avgSpeed: 42, peakVolume: 28100, lowestSpeed: 29 },
        { period: "Feb 26-Mar 3", carsDetected: 159500, avgSpeed: 43, peakVolume: 27500, lowestSpeed: 30 },
      ]
    case "month":
      return [
        { period: "This Month (Mar 1-24)", carsDetected: 580200, avgSpeed: 43, peakVolume: 165400, lowestSpeed: 29 },
        { period: "Last Month (Feb)", carsDetected: 620500, avgSpeed: 42, peakVolume: 170200, lowestSpeed: 28 },
        { period: "Jan 2025", carsDetected: 645300, avgSpeed: 41, peakVolume: 175500, lowestSpeed: 27 },
        { period: "Dec 2024", carsDetected: 690800, avgSpeed: 40, peakVolume: 180300, lowestSpeed: 26 },
      ]
    case "custom":
      return [
        { period: "Selected Range", carsDetected: 345600, avgSpeed: 43, peakVolume: 95400, lowestSpeed: 30 },
        {
          period: "Previous Period (Same Length)",
          carsDetected: 332800,
          avgSpeed: 44,
          peakVolume: 92300,
          lowestSpeed: 31,
        },
        {
          period: "Year-over-Year (Same Period)",
          carsDetected: 315200,
          avgSpeed: 45,
          peakVolume: 88700,
          lowestSpeed: 32,
        },
      ]
    default:
      return []
  }
}

