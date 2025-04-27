// File: types/api.ts

/**
 * Represents a single traffic record based on the database schema.
 * Dates are strings because they come from JSON.
 */
export interface TrafficRecord {
    id: number;
    traffic_cam_id: number;
    start_time: string; // ISO date string format expected from server (or YYYY-MM-DD HH:MM:SS)
    end_time: string;   // ISO date string format expected from server (or YYYY-MM-DD HH:MM:SS)
    vehicle_count: number;
    average_speed: number; // km/h
  }
  
  /**
   * Response structure for the /stats endpoint.
   */
  export interface TrafficStatsResponse {
    average_speed: number | null;       // Can be null if no data
    total_vehicle_count: number | null; // Can be null if no data
  }
  
  /**
   * Represents a peak hour entry.
   */
  export interface PeakHour {
    hour: string;         // e.g., "08:00 - 09:00"
    vehicle_count: number; // Average vehicle count for this peak hour across days
  }
  
  /**
   * Response structure for the /peak_hours endpoint.
   */
  export interface PeakHoursResponse {
    peak_hours: PeakHour[];
  }
  
  /**
   * Response structure for the /congestion endpoint.
   */
  export interface CongestionResponse {
    congestion_percentage: number;
    status: string; // e.g., "congestionado", "fluido", "sin datos"
  }
  
  /**
   * Union type for /traffic_records response.
   * Can be an array of records or a message indicating none were found.
   */
  export type TrafficRecordsResponse =
    | { traffic_records: TrafficRecord[] }
    | { message: string };
  
  
  /**
   * Represents a single traffic jam alert.
   */
  export interface TrafficJam {
      traffic_cam_id: number;
      event_time: string; // ISO date string format expected from server (or YYYY-MM-DD HH:MM:SS)
  }
  
  /**
   * Union type for /traffic_jams response.
   * Can be an array of jams or a message indicating none were found.
   */
  export type TrafficJamsResponse =
    | { traffic_jams: TrafficJam[] }
    | { message: string };
  
  
  /**
   * Generic type for API error responses.
   */
  export interface ApiErrorResponse {
    error: string;
  }
  
  /**
   * Represents query parameters for API calls that use date ranges.
   * Uses Date objects for easier handling in TypeScript, will be converted to strings.
   */
  export interface DateRangeParams {
    start: Date;
    end: Date;
  }
  
  /**
   * Represents query parameters for the /congestion endpoint.
   */
  export interface CongestionParams {
      trafficCamId: number; // Use camelCase in TS, will be converted to snake_case for API
      startDateTime?: Date;
      endDateTime?: Date;
      speedThreshold?: number;
  }
  
  /**
   * Represents query parameters for the /traffic_jams endpoint.
   */
  export interface TrafficJamsParams extends DateRangeParams {
      speedThreshold?: number;
  }
  
  // Helper type to check if a response is an error
  export function isApiError(response: any): response is ApiErrorResponse {
    return response && typeof response.error === 'string';
  }
  
  // Helper type to check if /traffic_records returned a message
  export function isTrafficRecordsMessage(response: TrafficRecordsResponse): response is { message: string } {
      return response && typeof (response as { message: string }).message === 'string';
  }
  
  // Helper type to check if /traffic_jams returned a message
  export function isTrafficJamsMessage(response: TrafficJamsResponse): response is { message: string } {
      return response && typeof (response as { message: string }).message === 'string';
  }