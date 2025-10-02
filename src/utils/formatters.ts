/**
 * Centralized formatting utilities
 * Provides consistent formatting across the application
 */

/**
 * Format bytes to human-readable file size
 * @param bytes - Size in bytes
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string (e.g., "1.5 MB")
 */
export const formatFileSize = (bytes: number, decimals: number = 2): string => {
  if (bytes === 0) return '0 B';
  if (bytes < 0) return 'Invalid size';

  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const size = bytes / Math.pow(k, i);

  return `${size.toFixed(decimals)} ${sizes[i]}`;
};

/**
 * Format bitrate in kbps to readable format
 * @param kbps - Bitrate in kilobits per second
 * @returns Formatted string (e.g., "1.5 Mbps")
 */
export const formatBitrate = (kbps: number): string => {
  if (kbps < 0) return 'Invalid bitrate';
  if (kbps === 0) return '0 kbps';

  if (kbps >= 1000) {
    return `${(kbps / 1000).toFixed(1)} Mbps`;
  }
  return `${kbps} kbps`;
};

/**
 * Format duration in seconds to human-readable time
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "1:23" or "1:23:45")
 */
export const formatDuration = (seconds: number): string => {
  if (seconds < 0) return '0:00';
  if (!isFinite(seconds)) return '0:00';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Format remaining time in seconds to readable format
 * @param seconds - Time in seconds
 * @returns Formatted string (e.g., "2m 30s" or "1h 15m")
 */
export const formatTimeRemaining = (seconds: number): string => {
  if (seconds < 0) return 'Unknown';
  if (!isFinite(seconds)) return 'Unknown';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  if (minutes > 0) {
    return `${minutes}m ${secs}s`;
  }
  return `${secs}s`;
};

/**
 * Format percentage
 * @param value - Percentage value (0-100)
 * @param decimals - Number of decimal places (default: 0)
 * @returns Formatted string (e.g., "75%")
 */
export const formatPercentage = (value: number, decimals: number = 0): string => {
  if (value < 0) return '0%';
  if (value > 100) return '100%';
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format resolution string
 * @param width - Video width
 * @param height - Video height
 * @returns Formatted string (e.g., "1920x1080" or "1080p")
 */
export const formatResolution = (width: number, height: number): string => {
  const commonResolutions: Record<number, string> = {
    480: '480p',
    720: '720p',
    1080: '1080p',
    1440: '1440p',
    2160: '4K',
    4320: '8K',
  };

  return commonResolutions[height] || `${width}x${height}`;
};

/**
 * Format frame rate
 * @param fps - Frames per second
 * @returns Formatted string (e.g., "30 fps")
 */
export const formatFrameRate = (fps: number): string => {
  if (fps < 0) return 'Invalid fps';
  return `${Math.round(fps)} fps`;
};

/**
 * Format date to relative time (e.g., "2 hours ago")
 * @param date - Date to format
 * @returns Formatted string
 */
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay > 1 ? 's' : ''} ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? 's' : ''} ago`;
  if (diffDay < 365) return `${Math.floor(diffDay / 30)} month${Math.floor(diffDay / 30) > 1 ? 's' : ''} ago`;
  return `${Math.floor(diffDay / 365)} year${Math.floor(diffDay / 365) > 1 ? 's' : ''} ago`;
};

/**
 * Format date to short string (e.g., "Jan 15, 2024")
 * @param date - Date to format
 * @returns Formatted string
 */
export const formatDate = (date: Date): string => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
};

/**
 * Format timestamp to time string (e.g., "2:30 PM")
 * @param date - Date to format
 * @returns Formatted string
 */
export const formatTime = (date: Date): string => {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 should be 12
  const minutesStr = minutes < 10 ? `0${minutes}` : minutes;
  return `${hours}:${minutesStr} ${ampm}`;
};
