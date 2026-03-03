import { WashingMachine } from '../types/washingMachine';

export const mockMachines: WashingMachine[] = [
  {
    id: '1',
    name: 'เครื่องซักผ้า A1',
    machineNumber: '1',
    capacity: 7,
    status: 'in-use',
    location: 'ชั้น 1',
    timeRemaining: 35, // 35 minutes remaining
    currentUser: 'user1',
    program: 'Normal Wash'
  },
  {
    id: '2',
    name: 'เครื่องซักผ้า A2',
    machineNumber: '2',
    capacity: 7,
    status: 'in-use',
    location: 'ชั้น 1',
    timeRemaining: 15, // 15 minutes remaining
    currentUser: 'user2',
    program: 'Quick Wash'
  },
  {
    id: '3',
    name: 'เครื่องซักผ้า B1',
    machineNumber: '3',
    capacity: 11,
    status: 'in-use',
    location: 'ชั้น 2',
    timeRemaining: 90, // 1 hour 30 minutes remaining
    currentUser: 'user3',
    program: 'Heavy Wash'
  },
  {
    id: '4',
    name: 'เครื่องซักผ้า B2',
    machineNumber: '4',
    capacity: 14,
    status: 'available',
    location: 'ชั้น 2'
  },
  {
    id: '5',
    name: 'เครื่องซักผ้า C1',
    machineNumber: '5',
    capacity: 14,
    status: 'in-use',
    location: 'ชั้น 3',
    timeRemaining: 5, // 5 minutes remaining
    currentUser: 'user4',
    program: 'Delicate Wash'
  },
  {
    id: '6',
    name: 'เครื่องซักผ้า C2',
    machineNumber: '6',
    capacity: 18,
    status: 'available',
    location: 'ชั้น 3'
  },
  {
    id: '7',
    name: 'เครื่องซักผ้า D1',
    machineNumber: '7',
    capacity: 20,
    status: 'in-use',
    location: 'ชั้น 4',
    timeRemaining: 150, // 2 hours 30 minutes remaining
    currentUser: 'user5',
    program: 'Extra Heavy Wash'
  },
  {
    id: '8',
    name: 'เครื่องซักผ้า D2',
    machineNumber: '8',
    capacity: 22,
    status: 'available',
    location: 'ชั้น 4'
  },
  {
    id: '9',
    name: 'เครื่องซักผ้า E1',
    machineNumber: '9',
    capacity: 28,
    status: 'maintenance',
    location: 'ชั้น 5'
  },
  {
    id: '10',
    name: 'เครื่องซักผ้า E2',
    machineNumber: '10',
    capacity: 28,
    status: 'available',
    location: 'ชั้น 5'
  }
];

