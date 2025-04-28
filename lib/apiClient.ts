// File: lib/apiClient.ts

import {
    ApiErrorResponse,
    CongestionParams,
    CongestionResponse,
    DateRangeParams,
    isApiError,
    isTrafficJamsMessage,
    isTrafficRecordsMessage,
    PeakHoursResponse,
    TrafficJamsParams,
    TrafficJamsResponse,
    TrafficRecordsResponse,
    TrafficStatsResponse,
  } from '@/types/api'; // Adjust path if needed
  
  // --- Configuration ---
  // Get the API base URL from environment variables
  // Make sure to set NEXT_PUBLIC_API_BASE_URL in your .env.local file
  // e.g., NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:5000
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  
  if (!API_BASE_URL) {
    console.error("Error: NEXT_PUBLIC_API_BASE_URL environment variable is not set.");
    // You might throw an error here in development, or handle it gracefully
  }
  
  // --- Helper Functions ---
  
  /**
   * Formats a Date object into YYYY-MM-DD HH:MM:SS string format.
   * Required by the /traffic_records endpoint.
   * @param date - The Date object to format.
   * @returns Formatted date string.
   */
  function formatToSqlDateTime(date: Date): string {
      const pad = (num: number): string => num.toString().padStart(2, '0');
  
      const year = date.getFullYear();
      const month = pad(date.getMonth() + 1); // Months are 0-indexed
      const day = pad(date.getDate());
      const hours = pad(date.getHours());
      const minutes = pad(date.getMinutes());
      const seconds = pad(date.getSeconds());
  
      return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  
  /**
   * Generic request handler for the API.
   * @param endpoint - The API endpoint path (e.g., '/stats').
   * @param params - URL query parameters as an object.
   * @param options - Optional Fetch API options.
   * @returns The JSON response from the API.
   * @throws ApiError if the request fails or the API returns an error structure.
   */
  async function request<T>(
    endpoint: string,
    params?: Record<string, string | number | undefined>,
    options?: RequestInit
  ): Promise<T> {
    if (!API_BASE_URL) {
      throw new Error("API Base URL is not configured.");
    }
  
    const url = new URL(endpoint, API_BASE_URL);
  
    // Append query parameters if provided
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
          // Only append defined, non-null values
        if (value !== undefined && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
  
    try {
      const response = await fetch(url.toString(), {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });
  
      const data = await response.json();
  
      // Check for API-level errors (e.g., 4xx, 5xx status codes returning JSON errors)
      if (!response.ok) {
          // Check if the error response matches the expected format
          if (isApiError(data)) {
               // Throw a custom error or just the message for simplicity
              throw new Error(`API Error (${response.status}): ${data.error}`);
          } else {
              // Throw a generic error if the format is unexpected
              throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
          }
      }
  
      // Also check if the successful response contains an 'error' key (some APIs might do this with 200 OK)
      if (isApiError(data)) {
          throw new Error(`API Error: ${data.error}`);
      }
  
  
      return data as T;
    } catch (error) {
      console.error(`API Request Failed: ${endpoint}`, error);
      // Re-throw the error to be handled by the caller
      if (error instanceof Error) {
          throw error; // Keep the original error type if possible
      } else {
          throw new Error('An unknown network error occurred.');
      }
    }
  }
  
  // --- API Client Methods ---
  
  export const apiClient = {
    /**
     * Fetches traffic statistics (average speed, total count) for a given date range.
     */
    getTrafficStats: (params: DateRangeParams): Promise<TrafficStatsResponse> => {
      return request<TrafficStatsResponse>('/stats', {
        start_datetime: params.start.toISOString(), // Flask's isoparse handles ISO 8601
        end_datetime: params.end.toISOString(),
      });
    },
  
    /**
     * Fetches peak traffic hours for a given date range.
     */
    getPeakHours: (params: DateRangeParams): Promise<PeakHoursResponse> => {
      return request<PeakHoursResponse>('/peak_hours', {
        start: params.start.toISOString(), // Flask's isoparse handles ISO 8601
        end: params.end.toISOString(),
      });
    },
  
    /**
     * Fetches congestion percentage and status for a specific traffic camera.
     */
    getCongestion: (params: CongestionParams): Promise<CongestionResponse> => {
      return request<CongestionResponse>('/congestion', {
        traffic_cam_id: params.trafficCamId?.toString() || undefined, // Convert camelCase to snake_case for API
        start_datetime: params.startDateTime?.toISOString(), // Optional
        end_datetime: params.endDateTime?.toISOString(),     // Optional
        speed_threshold: params.speedThreshold,           // Optional
      });
    },
  
    /**
     * Fetches raw traffic records for a given date range.
     * Note: This endpoint requires 'YYYY-MM-DD HH:MM:SS' format.
     */
    getTrafficRecords: (params: DateRangeParams): Promise<TrafficRecordsResponse> => {
      return request<TrafficRecordsResponse>('/traffic_records', {
        start_datetime: formatToSqlDateTime(params.start),
        end_datetime: formatToSqlDateTime(params.end),
      });
    },
  
    /**
     * Fetches traffic jam alerts for a given date range.
     */
    getTrafficJams: (params: TrafficJamsParams): Promise<TrafficJamsResponse> => {
      return request<TrafficJamsResponse>('/traffic_jams', {
        start_datetime: params.start.toISOString(), // Flask's isoparse handles ISO 8601
        end_datetime: params.end.toISOString(),
        speed_threshold: params.speedThreshold,       // Optional
      });
    },
  
  };