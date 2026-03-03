import { FanStatusItem, FanEditItem } from './api';
import { WashingMachine } from '../types/washingMachine';

/**
 * Map backend fan status string to frontend status
 */
export function mapFanStatusToMachineStatus(fanStatus: string): 'available' | 'in-use' | 'maintenance' {
  // Backend uses Thai status strings
  if (fanStatus.includes('ว่าง') || fanStatus.includes('พร้อม')) {
    return 'available';
  }
  if (fanStatus.includes('ทำงาน') || fanStatus.includes('ใช้งาน')) {
    return 'in-use';
  }
  if (fanStatus.includes('ซ่อม') || fanStatus.includes('บำรุง')) {
    return 'maintenance';
  }
  // If status is 'ขัดข้อง' or 'error', treat as 'available' instead
  if (fanStatus.includes('ขัดข้อง') || fanStatus.includes('ผิดพลาด') || fanStatus.includes('error')) {
    return 'available';
  }
  // Default to available if unknown
  return 'available';
}

/**
 * Map frontend status to backend Thai status string
 */
export function mapMachineStatusToFanStatus(status: 'available' | 'in-use' | 'maintenance'): string {
  switch (status) {
    case 'available':
      return 'เครื่องว่าง';
    case 'in-use':
      return 'เครื่องกำลังทำงาน';
    case 'maintenance':
      return 'เครื่องซ่อมบำรุง';
    default:
      return 'เครื่องว่าง';
  }
}

/**
 * Calculate time remaining from updated_date
 * If status is 'in-use', calculate remaining time based on when it started
 */
function calculateTimeRemaining(
  status: 'available' | 'in-use' | 'maintenance',
  updatedDate: string | null | any
): number | undefined {
  if (status !== 'in-use' || !updatedDate) {
    return undefined;
  }

  try {
    let startTime: number;
    
    // Handle different date formats from Backend
    if (typeof updatedDate === 'string') {
      // ISO string format: "2024-01-01T12:00:00" or "2024-01-01T12:00:00.000"
      startTime = new Date(updatedDate).getTime();
    } else if (Array.isArray(updatedDate)) {
      // LocalDateTime array format: [2024, 1, 1, 12, 0, 0, 0]
      // Format: [year, month, day, hour, minute, second, nano]
      const [year, month, day, hour = 0, minute = 0, second = 0] = updatedDate;
      startTime = new Date(year, month - 1, day, hour, minute, second).getTime();
    } else if (updatedDate && typeof updatedDate === 'object') {
      // Object format: { year: 2024, month: 1, day: 1, hour: 12, ... }
      const { year, month, day, hour = 0, minute = 0, second = 0 } = updatedDate;
      startTime = new Date(year, month - 1, day, hour, minute, second).getTime();
    } else {
      console.warn('Unknown updated_date format:', updatedDate);
      return undefined;
    }
    
    // Check if date is valid
    if (isNaN(startTime)) {
      console.warn('Invalid date from updated_date:', updatedDate);
      return undefined;
    }
    
    const now = Date.now();
    const elapsedMinutes = Math.floor((now - startTime) / 60000); // elapsed in minutes
    
    // Default duration: 5 minutes
    // You can adjust this based on your business logic
    const defaultDuration = 5;
    const remaining = Math.max(0, defaultDuration - elapsedMinutes);
    
    return remaining > 0 ? remaining : undefined;
  } catch (error) {
    console.error('Error calculating time remaining:', error, 'updatedDate:', updatedDate);
    return undefined;
  }
}

/**
 * Map backend FanStatusItem to frontend WashingMachine
 */
export function mapFanStatusToMachine(fan: FanStatusItem): WashingMachine {
  const status = mapFanStatusToMachineStatus(fan.fan_status);
  // Store updated_date as string for real-time calculation
  // Backend returns LocalDateTime as ISO string: "2024-01-01T12:00:00"
  let updatedDateStr: string | null = null;
  if (fan.updated_date) {
    if (typeof fan.updated_date === 'string') {
      updatedDateStr = fan.updated_date;
    } else if (Array.isArray(fan.updated_date)) {
      // Array format: [2024, 1, 1, 12, 0, 0]
      updatedDateStr = JSON.stringify(fan.updated_date);
    } else if (typeof fan.updated_date === 'object' && fan.updated_date !== null) {
      // Object format
      updatedDateStr = JSON.stringify(fan.updated_date);
    }
    
    // Log for debugging
    console.log('Mapping fan to machine - updated_date:', {
      original: fan.updated_date,
      type: typeof fan.updated_date,
      stored: updatedDateStr,
      status: fan.fan_status,
    });
  }
  const timeRemaining = calculateTimeRemaining(status, fan.updated_date);
  
  return {
    id: fan.id.toString(),
    name: fan.fan_name,
    machineNumber: extractMachineNumber(fan.fan_name),
    status,
    location: 'ชั้น 1', // Default location
    capacity: 10, // Default capacity, can be adjusted if backend provides this
    timeRemaining, // Calculated from updated_date
    updatedDate: updatedDateStr, // Store for real-time calculation
  };
}

/**
 * Map backend FanEditItem to frontend WashingMachine
 */
export function mapFanEditToMachine(fan: FanEditItem): WashingMachine {
  return {
    id: fan.id.toString(),
    name: fan.fan_name,
    machineNumber: extractMachineNumber(fan.fan_name),
    status: 'available', // Default status for edit items
    location: 'ชั้น 1',
    capacity: 10,
  };
}

/**
 * Extract machine number from fan name (e.g., "เครื่องซักผ้า 1" -> "1")
 */
function extractMachineNumber(fanName: string): string {
  const match = fanName.match(/(\d+)/);
  return match ? match[1] : '';
}

/**
 * Create fan_id from machine data
 */
export function createFanId(machineNumber: string): string {
  // Generate a unique ID based on timestamp and machine number
  const timestamp = Date.now();
  return `${timestamp}MN${machineNumber.padStart(5, '0')}`;
}

