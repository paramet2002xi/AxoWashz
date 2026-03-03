export interface WashingMachine {
  id: string;
  name: string;
  machineNumber?: string;
  capacity?: number; // in KG
  status: 'available' | 'in-use' | 'maintenance';
  currentUser?: string;
  timeRemaining?: number; // in minutes (calculated from updated_date)
  updatedDate?: string | null; // Store updated_date from backend for real-time calculation
  program?: string;
  location: string;
}

