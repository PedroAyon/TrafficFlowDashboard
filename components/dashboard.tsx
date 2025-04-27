// File: components/dashboard.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowUpIcon, // Keep for potential future use
  Car,
  Clock,
  Download,
  LineChart as SpeedIcon, // Renamed to avoid conflict with recharts
  MoreHorizontal,
  RefreshCw,
  Search,
  Settings,
  Loader2, // Added for loading state
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import TrafficChart, { ChartDataPoint } from "@/components/traffic-chart"; // Import updated chart and type
import TimeFilter, { TimeFilterPreset } from "@/components/time-filter"; // Import updated filter and type
import { apiClient } from "@/lib/apiClient"; // Import your API client
import {
  TrafficStatsResponse,
  PeakHoursResponse,
  CongestionResponse,
  TrafficRecord,
  TrafficRecordsResponse,
  isTrafficRecordsMessage,
  // Add other necessary types if needed
} from "@/types/api"; // Import API types
import type { DateRange } from "react-day-picker";

// Helper to format date string (e.g., from '2024-04-27T10:30:00Z' to 'Apr 27, 10:30')
function formatDisplayDateTime(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    try {
        const date = new Date(dateString);
        // Use UTC methods or specify 'UTC' timezone if the API returns UTC
        // Otherwise, toLocaleTimeString converts to local time zone
        return date.toLocaleTimeString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: false // Use 24-hour format for clarity
        });
    } catch (e) {
        return dateString; // Return original if parsing fails
    }
}


export default function Dashboard() {
  // --- State ---
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State for the selected date range - source of truth
   const [selectedRange, setSelectedRange] = useState<DateRange>(() => {
        // Default to "This Week"
        const now = new Date();
        const dayOfWeek = now.getDay();
        const startOfWeek = new Date(now); // Create a copy
        startOfWeek.setDate(now.getDate() - dayOfWeek);
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek); // Create a copy based on start
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        return { from: startOfWeek, to: endOfWeek };
   });

  // State for API data
  const [statsData, setStatsData] = useState<TrafficStatsResponse | null>(null);
  const [peakHoursData, setPeakHoursData] = useState<PeakHoursResponse | null>(null);
  const [congestionData, setCongestionData] = useState<CongestionResponse | null>(null);
  const [trafficRecords, setTrafficRecords] = useState<TrafficRecord[]>([]); // For table
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]); // For chart

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    if (!selectedRange.from || !selectedRange.to) {
      setError("Please select a valid date range.");
      return;
    }

    setIsLoading(true);
    setError(null);
    // Clear previous data for better UX during loading, especially on errors
    setStatsData(null);
    setPeakHoursData(null);
    setCongestionData(null);
    setTrafficRecords([]);
    setChartData([]);


    try {
      // TODO: Make traffic_cam_id dynamic (e.g., from search/filter or user settings)
      const defaultTrafficCamId = 1; // Example ID

      // Fetch all data concurrently
      const [
        statsResult,
        peakHoursResult,
        congestionResult,
        recordsResult,
      ] = await Promise.all([
        apiClient.getTrafficStats({ start: selectedRange.from, end: selectedRange.to }),
        apiClient.getPeakHours({ start: selectedRange.from, end: selectedRange.to }),
        apiClient.getCongestion({
            trafficCamId: defaultTrafficCamId,
            startDateTime: selectedRange.from,
            endDateTime: selectedRange.to,
            // speedThreshold: 25 // Optionally override default threshold
        }),
        apiClient.getTrafficRecords({ start: selectedRange.from, end: selectedRange.to }),
      ]);

      // Update state with results
      setStatsData(statsResult);
      setPeakHoursData(peakHoursResult);
      setCongestionData(congestionResult);

      // Handle traffic records response (could be records or a message)
      if (isTrafficRecordsMessage(recordsResult)) {
         console.log("API Message:", recordsResult.message);
         setTrafficRecords([]); // Clear records if none found
         setChartData([]);
      } else {
         const records = recordsResult.traffic_records;
         setTrafficRecords(records);
         // Process records for the chart
         const processedChartData = records
            .map(record => ({
                // Format the start_time for the X-axis label
                name: formatDisplayDateTime(record.start_time),
                volume: record.vehicle_count,
                speed: record.average_speed,
                // Store original timestamp for sorting if needed
                timestamp: record.start_time ? new Date(record.start_time).getTime() : 0 // Handle potentially null start_time
            }))
            .sort((a, b) => a.timestamp - b.timestamp); // Sort by time

            // Optional: Limit the number of points for performance if needed
            // if (processedChartData.length > 100) { ... sampling logic ... }

         setChartData(processedChartData);
      }

    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred while fetching data.");
      }
       // Clear data on error
       setStatsData(null);
       setPeakHoursData(null);
       setCongestionData(null);
       setTrafficRecords([]);
       setChartData([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedRange]); // Dependency: refetch when selectedRange changes

  // Initial fetch on component mount
  useEffect(() => {
    fetchData();
  }, [fetchData]); // Include fetchData in dependency array

  // Handler for the TimeFilter component
  const handleTimeFilterChange = (
    preset: TimeFilterPreset,
    range: DateRange
  ) => {
    // Update the selected range, which will trigger the useEffect to fetch data
    setSelectedRange(range);
    console.log(`Filter changed to: ${preset}`, range);
  };

  // Format Peak Hours for display
  const formattedPeakHours = peakHoursData?.peak_hours
        .map(ph => ph.hour) // Assuming hour is like "08:00 - 09:00"
        .join(", ") || "N/A";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
        <h1 className="text-xl font-semibold">Traffic Flow Dashboard</h1>
        <div className="ml-auto flex items-center gap-4">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            className="h-8 gap-1"
            onClick={fetchData} // Trigger refetch
            disabled={isLoading} // Disable while loading
          >
            {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
                <RefreshCw className="h-3.5 w-3.5" />
            )}
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {isLoading ? "Refreshing..." : "Refresh Data"}
            </span>
          </Button>
          <Button variant="outline" size="sm" className="h-8 gap-1" disabled> {/* Disabled for now */}
            <Download className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
          </Button>
           <Button variant="outline" size="icon" className="h-8 w-8" disabled> {/* Disabled for now */}
            <Settings className="h-3.5 w-3.5" />
            <span className="sr-only">Settings</span>
          </Button>
        </div>
      </header>
      <div className="flex-1 space-y-4 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Analytics Overview</h2>
            <Badge variant={error ? "destructive" : "outline"} className="ml-2">
              {isLoading ? "Loading..." : error ? "Error" : "Live"}
            </Badge>
          </div>
          <div className="ml-auto flex flex-col gap-2 sm:flex-row sm:items-center">
            {/* TODO: Implement Search functionality if needed */}
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search locations... (disabled)"
                className="w-full rounded-md pl-8 sm:w-[240px] md:w-[260px] lg:w-[300px]"
                disabled
              />
            </div>
            {/* Time Filter Component */}
            <TimeFilter
                initialRange={selectedRange}
                onFilterChange={handleTimeFilterChange}
             />
          </div>
        </div>

        {/* Display error message if any */}
        {error && (
            <Card className="border-destructive bg-destructive/10">
                <CardHeader>
                    <CardTitle className="text-destructive text-lg flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" /> Data Fetching Error
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-destructive">{error}</p>
                    <p className="text-sm text-muted-foreground mt-2">
                        Could not load dashboard data. Please check the API connection and try refreshing.
                    </p>
                </CardContent>
            </Card>
        )}

        {/* Overview Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Traffic Volume Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Traffic Volume</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {isLoading ? (
                 <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <div className="text-2xl font-bold">
                    {statsData?.total_vehicle_count?.toLocaleString() ?? 'N/A'}
                </div>
              )}
              {/* <p className="text-xs text-muted-foreground">+20.1% from last month</p> */}
            </CardContent>
          </Card>
          {/* Average Speed Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Speed</CardTitle>
              <SpeedIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
             {isLoading ? (
                 <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                 <div className="text-2xl font-bold">
                    {statsData?.average_speed?.toFixed(1) ?? 'N/A'} km/h
                 </div>
              )}
               {/* <p className="text-xs text-muted-foreground">+180.1% from last month</p> */}
            </CardContent>
          </Card>
          {/* Peak Hours Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Peak Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
             {isLoading ? (
                 <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                 <div className="text-xl font-bold truncate" title={formattedPeakHours}> {/* Use text-xl and truncate */}
                    {formattedPeakHours}
                 </div>
              )}
              {/* Example of sub-text (removed percentage change for now) */}
               {peakHoursData && peakHoursData.peak_hours.length > 0 && !isLoading && (
                    <p className="text-xs text-muted-foreground mt-1">
                       Highest traffic periods
                    </p>
                )}
            </CardContent>
          </Card>
           {/* Congestion Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Congestion Status</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
             {isLoading ? (
                 <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              ) : (
                <>
                 <div className="text-2xl font-bold">
                    {congestionData?.congestion_percentage?.toFixed(1) ?? 'N/A'} %
                 </div>
                 <p className={`text-xs font-semibold ${congestionData?.status === 'congestionado' ? 'text-red-500' : 'text-green-500'}`}>
                    {congestionData?.status ? congestionData.status.charAt(0).toUpperCase() + congestionData.status.slice(1) : 'No data'}
                 </p>
                </>
              )}
              {/* <p className="text-xs text-muted-foreground">Based on Cam ID: {defaultTrafficCamId}</p> */}
            </CardContent>
          </Card>
        </div>

        {/* Traffic Flow Chart */}
        <div className="grid gap-4 md:grid-cols-1">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div>
                <CardTitle>Traffic Flow Metrics</CardTitle>
                <CardDescription>Traffic volume and speed over the selected period</CardDescription>
              </div>
              {/* Dropdown Menu (keep structure, disable actions for now) */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto" disabled>
                    <MoreHorizontal className="h-4 w-4" />
                    <span className="sr-only">More options</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem disabled>View detailed report</DropdownMenuItem>
                  <DropdownMenuItem disabled>Export data</DropdownMenuItem>
                  <DropdownMenuItem disabled>Set alerts</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </CardHeader>
            <CardContent>
              {/* Pass processed chart data and loading state */}
              <TrafficChart data={chartData} isLoading={isLoading} />
            </CardContent>
          </Card>
        </div>

        {/* Historical/Raw Data Table */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Traffic Records</CardTitle>
              <CardDescription>
                Detailed records for the selected time period.
                {/* Displaying {trafficRecords.length} records. */}
              </CardDescription>
            </CardHeader>
            <CardContent>
               {isLoading ? (
                 <div className="flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                 </div>
               ) : trafficRecords.length > 0 ? (
                <div className="rounded-md border overflow-x-auto"> {/* Added overflow-x-auto */}
                    <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                        <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">
                            Camera ID
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">
                            Start Time
                        </th>
                        <th className="h-12 px-4 text-left align-middle font-medium text-muted-foreground whitespace-nowrap">
                            End Time
                        </th>
                        <th className="h-12 px-4 text-right align-middle font-medium text-muted-foreground whitespace-nowrap">
                            Vehicles
                        </th>
                        <th className="h-12 px-4 pr-6 text-right align-middle font-medium text-muted-foreground whitespace-nowrap"> {/* Added pr-6 */}
                            Avg. Speed (km/h)
                        </th>
                        </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                        {trafficRecords.map((record, index) => (
                        <tr
                            // FIX: Ensure each list item has a unique key.
                            // Use record.id if it exists and is unique, otherwise fallback to index.
                            // The error suggests record.id might be missing or duplicated.
                            // Using index is a fallback to fix the error, but ensuring
                            // unique IDs from the API is the preferred long-term solution.
                            key={record.id ?? index}
                            className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                        >
                            <td className="p-4 align-middle whitespace-nowrap">{record.traffic_cam_id}</td>
                            <td className="p-4 align-middle whitespace-nowrap">{formatDisplayDateTime(record.start_time)}</td>
                            <td className="p-4 align-middle whitespace-nowrap">{formatDisplayDateTime(record.end_time)}</td>
                            <td className="p-4 align-middle text-right whitespace-nowrap">{record.vehicle_count.toLocaleString()}</td>
                            <td className="p-4 pr-6 align-middle text-right whitespace-nowrap">{record.average_speed.toFixed(1)}</td>
                        </tr>
                        ))}
                    </tbody>
                    </table>
                </div>
               ) : (
                  <p className="text-center text-muted-foreground p-8">No traffic records found for this period.</p>
               )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}