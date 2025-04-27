// File: components/time-filter.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, ChevronDown } from "lucide-react";
import type { DateRange } from "react-day-picker";

// Define filter preset types
export type TimeFilterPreset = "hour" | "day" | "week" | "month" | "custom";

interface TimeFilterProps {
  // Callback to inform parent about the selected preset and date range
  onFilterChange: (preset: TimeFilterPreset, range: DateRange) => void;
  // Initial range to display
  initialRange: DateRange;
}

// Helper to format date range for display
const formatDate = (date: Date | undefined): string => {
  if (!date) return "";
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return date.toLocaleDateString("en-US", options);
};

export default function TimeFilter({ onFilterChange, initialRange }: TimeFilterProps) {
  // Internal state to manage the UI selection before confirming
  const [selectedPreset, setSelectedPreset] = useState<TimeFilterPreset>("week"); // Default preset
  const [currentRange, setCurrentRange] = useState<DateRange | undefined>(initialRange);

  // Update internal state if initialRange prop changes
  useEffect(() => {
    setCurrentRange(initialRange);
    // Try to determine the preset based on the initial range (optional, can be complex)
    // For simplicity, we might just default to 'custom' if it doesn't match a known preset
  }, [initialRange]);


  const timeOptions: { value: TimeFilterPreset; label: string }[] = [
    { value: "hour", label: "Last Hour" },
    { value: "day", label: "Today" }, // Changed from "Per Day" for clarity
    { value: "week", label: "This Week" },
    { value: "month", label: "This Month" },
    { value: "custom", label: "Custom Range" },
  ];

  const handlePresetSelect = (preset: TimeFilterPreset) => {
    setSelectedPreset(preset);

    let newRange: DateRange = { from: undefined, to: undefined };
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);


    switch (preset) {
      case "hour":
        newRange = { from: new Date(now.getTime() - 60 * 60 * 1000), to: now };
        break;
      case "day":
         // Today from start to end
        newRange = { from: todayStart, to: todayEnd };
        break;
      case "week":
         // This week (assuming Sunday is the start of the week)
        const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, ...
        const startOfWeek = new Date(now.setDate(now.getDate() - dayOfWeek));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        endOfWeek.setHours(23, 59, 59, 999);
        newRange = { from: startOfWeek, to: endOfWeek };
        break;
      case "month":
         // This month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999); // Day 0 of next month is last day of current
        newRange = { from: startOfMonth, to: endOfMonth };
        break;
      case "custom":
        // Keep current range if switching TO custom, wait for Popover selection
        // If currentRange is undefined, set a default custom range (e.g., last 7 days)
        if (!currentRange?.from && !currentRange?.to) {
             const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
             sevenDaysAgo.setHours(0, 0, 0, 0);
             newRange = { from: sevenDaysAgo, to: todayEnd };
        } else {
            newRange = currentRange || { from: undefined, to: undefined}; // Keep existing custom range
        }
        break;
    }

    // Only update if the range is valid and the preset is not 'custom' (custom waits for popover)
    if (preset !== 'custom' && newRange.from && newRange.to) {
        setCurrentRange(newRange);
        onFilterChange(preset, newRange);
    } else if (preset === 'custom') {
        // If switching to custom, ensure currentRange reflects the last valid state or a default
        setCurrentRange(newRange);
        // Don't call onFilterChange immediately for custom, wait for Popover interaction
    }
  };

  const handleDateRangeSelect = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
        // Ensure time part is set for range end if needed (e.g., end of day)
        const endOfDayRange = {
            from: range.from,
            to: new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate(), 23, 59, 59, 999)
        };
      setSelectedPreset("custom"); // Explicitly set to custom
      setCurrentRange(endOfDayRange);
      onFilterChange("custom", endOfDayRange);
    } else {
        // Handle case where only one date is selected or cleared (optional)
         setCurrentRange(range); // Update UI state but don't trigger filter change yet
    }
  };

  const selectedOptionLabel = timeOptions.find((option) => option.value === selectedPreset)?.label || "Select time";

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-full sm:w-[160px] justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4" />
              <span>{selectedOptionLabel}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          {timeOptions.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => handlePresetSelect(option.value)}
            >
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Always show the date range selector when custom is chosen */}
      {selectedPreset === "custom" && (
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-full sm:w-[280px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {currentRange?.from ? (
                currentRange.to ? (
                  <>
                    {formatDate(currentRange.from)} - {formatDate(currentRange.to)}
                  </>
                ) : (
                  formatDate(currentRange.from)
                )
              ) : (
                "Select date range"
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="range"
              selected={currentRange}
              onSelect={handleDateRangeSelect}
              numberOfMonths={2}
              initialFocus
              defaultMonth={currentRange?.from} // Start calendar view at selection
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}