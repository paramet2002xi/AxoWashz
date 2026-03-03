'use client';

import { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { WashingMachine } from '../types/washingMachine';
import { fansApi, adminFansApi } from '../lib/api';
import { mapFanStatusToMachine, mapFanEditToMachine, createFanId, mapMachineStatusToFanStatus } from '../lib/fanMapper';
import { useAuth } from './AuthContext';
import { mockMachines } from '../lib/mockData';

interface WashingMachineContextType {
  machines: WashingMachine[];
  addMachine: (machine: Omit<WashingMachine, 'id'>) => Promise<{ success: boolean; error?: string }>;
  deleteMachine: (id: string) => Promise<{ success: boolean; error?: string }>;
  updateMachine: (id: string, updates: Partial<WashingMachine>) => Promise<{ success: boolean; error?: string }>;
  getMachineById: (id: string) => WashingMachine | undefined;
  isLoading: boolean;
  refreshMachines: () => Promise<void>;
}

const CAPACITY_STORAGE_KEY = 'washingMachineCapacity';

function getCapacityStore(): Record<string, number> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(CAPACITY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function setCapacity(machineNumber: string, capacity: number) {
  const store = getCapacityStore();
  store[machineNumber] = capacity;
  if (typeof window !== 'undefined') {
    localStorage.setItem(CAPACITY_STORAGE_KEY, JSON.stringify(store));
  }
}

function removeCapacity(machineNumber: string) {
  const store = getCapacityStore();
  delete store[machineNumber];
  if (typeof window !== 'undefined') {
    localStorage.setItem(CAPACITY_STORAGE_KEY, JSON.stringify(store));
  }
}

const WashingMachineContext = createContext<WashingMachineContextType | undefined>(undefined);

export function WashingMachineProvider({ children }: { children: ReactNode }) {
  const [machines, setMachines] = useState<WashingMachine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAuthenticated, user } = useAuth();

  // Load machines from API (with timeout so loading never hangs forever)
  const LOAD_TIMEOUT_MS = 15000;

  const loadMachines = async () => {
    try {
      setIsLoading(true);

      if (!isAuthenticated) {
        setIsLoading(false);
        return;
      }

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Timeout loading machines')), LOAD_TIMEOUT_MS)
      );

      // Both admin and user use the same status endpoint to get complete data (status, updated_date)
      // Admin can still use admin endpoints for editing, but for display we need status info
      const fanStatusItems = await Promise.race([fansApi.getStatus(), timeoutPromise]);
      let mappedMachines = fanStatusItems.map(mapFanStatusToMachine);

      // ใช้ค่าที่ผู้ใช้ตั้งตอนสร้าง/แก้ไข (backend ไม่มีฟิลด์ capacity)
      const capacityStore = getCapacityStore();
      mappedMachines = mappedMachines.map(m => ({
        ...m,
        capacity: capacityStore[m.machineNumber ?? ''] ?? m.capacity,
      }));

      // Time remaining is already calculated from updated_date in mapFanStatusToMachine
      // If status is 'in-use' but timeRemaining is 0 or undefined, change to available
      mappedMachines = mappedMachines.map(machine => {
        if (machine.status === 'in-use' && (!machine.timeRemaining || machine.timeRemaining <= 0)) {
          return { ...machine, status: 'available' as const, timeRemaining: undefined };
        }
        return machine;
      });

      setMachines(mappedMachines);
    } catch (error: any) {
      console.error('Error loading machines from API:', error);
      // สำหรับนำเสนอ: ใช้ mock data เมื่อ API ไม่พร้อม
      setMachines(mockMachines);
    } finally {
      setIsLoading(false);
    }
  };

  // Load machines on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated) {
      loadMachines();
    } else {
      setMachines([]);
      setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role]);

  // Periodically refresh machines from API (every 30 seconds)
  useEffect(() => {
    if (!isAuthenticated) return;

    const interval = setInterval(() => {
      loadMachines();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user?.role]);

  // Refresh machines function
  const refreshMachines = async () => {
    await loadMachines();
  };

  const addMachine = async (machineData: Omit<WashingMachine, 'id'>): Promise<{ success: boolean; error?: string }> => {
    try {
      // Validate required fields
      if (!machineData.machineNumber || !machineData.capacity) {
        return { success: false, error: 'กรุณากรอกข้อมูลให้ครบถ้วน' };
      }

      // Check for duplicate machine number
      const existingMachine = machines.find(
        (m) => m.machineNumber === machineData.machineNumber
      );
      if (existingMachine) {
        return { success: false, error: 'เลขเครื่องซ้ำกัน' };
      }

      // Create fan_id
      const fanId = createFanId(machineData.machineNumber);
      const fanName = machineData.name || `เครื่องซักผ้า ${machineData.machineNumber}`;

      // Call API to create fan
      await adminFansApi.create({
        fan_name: fanName,
        fan_id: fanId,
      });

      // เก็บน้ำหนักที่ผู้ใช้ใส่ (backend ไม่มีฟิลด์นี้) เพื่อให้การ์ดโชว์ตรง
      setCapacity(machineData.machineNumber, machineData.capacity ?? 10);

      // Refresh machines from API
      await loadMachines();
      
      return { success: true };
    } catch (error: any) {
      console.error('Error adding machine:', error);
      return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการเพิ่มเครื่องซักผ้า' };
    }
  };

  const deleteMachine = async (id: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const machineExists = machines.find((m) => m.id === id);
      if (!machineExists) {
        return { success: false, error: 'ไม่พบเครื่องซักผ้านี้' };
      }

      removeCapacity(machineExists.machineNumber ?? '');

      // Call API to delete fan
      await adminFansApi.delete(parseInt(id));

      // Refresh machines from API
      await loadMachines();
      
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting machine:', error);
      return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการลบเครื่องซักผ้า' };
    }
  };

  const updateMachine = async (
    id: string,
    updates: Partial<WashingMachine>
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const machineExists = machines.find((m) => m.id === id);
      if (!machineExists) {
        return { success: false, error: 'ไม่พบเครื่องซักผ้านี้' };
      }

      // If updating status, call API to update Backend
      if (updates.status !== undefined) {
        // Only admin can update status via API
        if (user?.role === 'admin') {
          try {
            // Use updateStatus API for status updates
            const fanStatus = mapMachineStatusToFanStatus(updates.status);
            await adminFansApi.updateStatus(parseInt(id), fanStatus);
            // Refresh machines from API (will recalculate timeRemaining from updated_date)
            await loadMachines();
            return { success: true };
          } catch (error: any) {
            console.error('Error updating machine status:', error);
            return { 
              success: false, 
              error: error.message || 'เกิดข้อผิดพลาดในการอัปเดตสถานะเครื่องซักผ้า' 
            };
          }
        } else {
          // For non-admin users, just update local state
          // (They can't change status via API, but can see updates)
          setMachines((prev) =>
            prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
          );
          return { success: true };
        }
      }

      // For other updates (not status), update local state
      // Note: timeRemaining is calculated from updated_date when loading from API
      if (updates.capacity !== undefined && machineExists.machineNumber) {
        setCapacity(machineExists.machineNumber, updates.capacity);
      }
      setMachines((prev) =>
        prev.map((m) => (m.id === id ? { ...m, ...updates } : m))
      );
      
      return { success: true };
    } catch (error: any) {
      console.error('Error updating machine:', error);
      return { success: false, error: error.message || 'เกิดข้อผิดพลาดในการอัปเดตเครื่องซักผ้า' };
    }
  };

  const getMachineById = (id: string): WashingMachine | undefined => {
    return machines.find((m) => m.id === id);
  };

  // Sort machines by machineNumber (numeric sort) - memoized so consumers don't re-run effects unnecessarily
  const sortedMachines = useMemo(
    () =>
      [...machines].sort((a, b) => {
        const numA = a.machineNumber ? parseInt(a.machineNumber, 10) : 0;
        const numB = b.machineNumber ? parseInt(b.machineNumber, 10) : 0;
        if (isNaN(numA)) return 1;
        if (isNaN(numB)) return -1;
        return numA - numB;
      }),
    [machines]
  );

  const value = useMemo(
    () => ({
      machines: sortedMachines,
      addMachine,
      deleteMachine,
      updateMachine,
      getMachineById,
      isLoading,
      refreshMachines,
    }),
    [sortedMachines, isLoading]
  );

  return (
    <WashingMachineContext.Provider value={value}>
      {children}
    </WashingMachineContext.Provider>
  );
}

export function useWashingMachines() {
  const context = useContext(WashingMachineContext);
  if (context === undefined) {
    throw new Error('useWashingMachines must be used within a WashingMachineProvider');
  }
  return context;
}

