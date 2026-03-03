import type { DashboardStats, FanLogItem, PageResponse } from './api';

/** ยอดรวมรายได้ต่อวัน (บาท) - สำหรับการ์ด KPI */
export const mockDailyRevenueTotal = 5310;

/** ยอดรวมการใช้งานต่อวัน (จำนวนครั้ง) - สำหรับการ์ด KPI */
export const mockDailyUsageTotal = 371;

/**
 * Mock ข้อมูล Dashboard สำหรับนำเสนอ (เมื่อ API ไม่พร้อมหรือใช้ ?demo=1)
 */
export const mockDashboardStats: DashboardStats = {
  totalLogs: 248,
  logsToday: 32,
  logsThisWeek: 156,
  byStatus: [
    { status: 'เครื่องว่าง', count: 89 },
    { status: 'เครื่องกำลังทำงาน', count: 112 },
    { status: 'เครื่องซ่อมบำรุง', count: 47 },
  ],
  byFan: [
    { fan_id: '173001MN00001', fan_name: 'เครื่องซักผ้า 1', count: 42 },
    { fan_id: '173001MN00002', fan_name: 'เครื่องซักผ้า 2', count: 38 },
    { fan_id: '173001MN00003', fan_name: 'เครื่องซักผ้า 3', count: 35 },
    { fan_id: '173001MN00004', fan_name: 'เครื่องซักผ้า 4', count: 31 },
    { fan_id: '173001MN00005', fan_name: 'เครื่องซักผ้า 5', count: 28 },
    { fan_id: '173001MN00006', fan_name: 'เครื่องซักผ้า 6', count: 24 },
    { fan_id: '173001MN00007', fan_name: 'เครื่องซักผ้า 7', count: 25 },
    { fan_id: '173001MN00008', fan_name: 'เครื่องซักผ้า 8', count: 25 },
    { fan_id: '173001MN00009', fan_name: 'เครื่องซักผ้า 9', count: 22 },
    { fan_id: '173001MN00010', fan_name: 'เครื่องซักผ้า 10', count: 20 },
  ],
};

export const mockDashboardLogs: FanLogItem[] = [
  { id: 1, fan_name: 'เครื่องซักผ้า 1', fan_id: '173001MN00001', fan_status: 'เครื่องกำลังทำงาน', coin: '5', log_date: '2025-02-24 14:32' },
  { id: 2, fan_name: 'เครื่องซักผ้า 3', fan_id: '173001MN00003', fan_status: 'เครื่องว่าง', coin: null, log_date: '2025-02-24 14:28' },
  { id: 3, fan_name: 'เครื่องซักผ้า 2', fan_id: '173001MN00002', fan_status: 'เครื่องกำลังทำงาน', coin: '10', log_date: '2025-02-24 14:15' },
  { id: 4, fan_name: 'เครื่องซักผ้า 5', fan_id: '173001MN00005', fan_status: 'เครื่องว่าง', coin: null, log_date: '2025-02-24 14:02' },
  { id: 5, fan_name: 'เครื่องซักผ้า 4', fan_id: '173001MN00004', fan_status: 'เครื่องซ่อมบำรุง', coin: null, log_date: '2025-02-24 13:45' },
  { id: 6, fan_name: 'เครื่องซักผ้า 6', fan_id: '173001MN00006', fan_status: 'เครื่องกำลังทำงาน', coin: '5', log_date: '2025-02-24 13:30' },
  { id: 7, fan_name: 'เครื่องซักผ้า 8', fan_id: '173001MN00008', fan_status: 'เครื่องว่าง', coin: null, log_date: '2025-02-24 13:18' },
  { id: 8, fan_name: 'เครื่องซักผ้า 7', fan_id: '173001MN00007', fan_status: 'เครื่องกำลังทำงาน', coin: '15', log_date: '2025-02-24 13:00' },
  { id: 9, fan_name: 'เครื่องซักผ้า 1', fan_id: '173001MN00001', fan_status: 'เครื่องว่าง', coin: null, log_date: '2025-02-24 12:55' },
  { id: 10, fan_name: 'เครื่องซักผ้า 2', fan_id: '173001MN00002', fan_status: 'เครื่องว่าง', coin: null, log_date: '2025-02-24 12:40' },
];

export function getMockLogsPage(page: number = 0, size: number = 20): PageResponse<FanLogItem> {
  const start = page * size;
  const content = mockDashboardLogs.slice(start, start + size);
  return {
    content,
    totalElements: mockDashboardLogs.length,
    totalPages: Math.ceil(mockDashboardLogs.length / size) || 1,
    number: page,
    size,
  };
}

/** ข้อมูลรายได้สำหรับกราฟเส้น (label = วันที่/สัปดาห์/เดือน, value = บาท) */
export type IncomeDataPoint = { label: string; value: number };

export const mockIncomeByWeek: IncomeDataPoint[] = [
  { label: 'จ.', value: 420 },
  { label: 'อ.', value: 580 },
  { label: 'พ.', value: 750 },
  { label: 'พฤ.', value: 620 },
  { label: 'ศ.', value: 890 },
  { label: 'ส.', value: 1100 },
  { label: 'อา.', value: 950 },
];

export const mockIncomeByMonth: IncomeDataPoint[] = [
  { label: 'สัปดาห์ 1', value: 3200 },
  { label: 'สัปดาห์ 2', value: 4100 },
  { label: 'สัปดาห์ 3', value: 3800 },
  { label: 'สัปดาห์ 4', value: 4500 },
];

export const mockIncomeByYear: IncomeDataPoint[] = [
  { label: 'ม.ค.', value: 14200 },
  { label: 'ก.พ.', value: 15800 },
  { label: 'มี.ค.', value: 16500 },
  { label: 'เม.ย.', value: 15200 },
  { label: 'พ.ค.', value: 17800 },
  { label: 'มิ.ย.', value: 18500 },
  { label: 'ก.ค.', value: 19200 },
  { label: 'ส.ค.', value: 18800 },
  { label: 'ก.ย.', value: 20100 },
  { label: 'ต.ค.', value: 19500 },
  { label: 'พ.ย.', value: 21000 },
  { label: 'ธ.ค.', value: 22500 },
];

/** ข้อมูลยอดการใช้งานสำหรับกราฟแท่ง (จำนวนครั้ง/รายการ) */
export const mockUsageByWeek: IncomeDataPoint[] = [
  { label: 'จ.', value: 28 },
  { label: 'อ.', value: 35 },
  { label: 'พ.', value: 42 },
  { label: 'พฤ.', value: 38 },
  { label: 'ศ.', value: 52 },
  { label: 'ส.', value: 68 },
  { label: 'อา.', value: 58 },
];

export const mockUsageByMonth: IncomeDataPoint[] = [
  { label: 'สัปดาห์ 1', value: 185 },
  { label: 'สัปดาห์ 2', value: 212 },
  { label: 'สัปดาห์ 3', value: 198 },
  { label: 'สัปดาห์ 4', value: 235 },
];

export const mockUsageByYear: IncomeDataPoint[] = [
  { label: 'ม.ค.', value: 720 },
  { label: 'ก.พ.', value: 810 },
  { label: 'มี.ค.', value: 845 },
  { label: 'เม.ย.', value: 790 },
  { label: 'พ.ค.', value: 920 },
  { label: 'มิ.ย.', value: 955 },
  { label: 'ก.ค.', value: 980 },
  { label: 'ส.ค.', value: 965 },
  { label: 'ก.ย.', value: 1020 },
  { label: 'ต.ค.', value: 995 },
  { label: 'พ.ย.', value: 1080 },
  { label: 'ธ.ค.', value: 1150 },
];
