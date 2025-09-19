import { clsx, type ClassValue } from 'clsx';

/**
 * Utility function to merge Tailwind CSS classes
 * This is commonly used with NativeWind for conditional styling
 * 
 * @param inputs - Class values to merge
 * @returns Merged class string
 * 
 * @example
 * ```tsx
 * const buttonClass = cn(
 *   'px-4 py-2 rounded',
 *   variant === 'primary' && 'bg-blue-600',
 *   disabled && 'opacity-50'
 * );
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}