'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'th' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  th: {
    // Navigation
    'nav.home': 'หน้าแรก',
    'nav.admin': 'แอดมิน',
    'nav.settings': 'ตั้งค่า',
    'nav.logout': 'ออกจากระบบ',
    'nav.role.admin': 'ผู้ดูแลระบบ',
    'nav.role.user': 'ผู้ใช้',
    'nav.management': 'การจัดการ',

    // Login
    'login.welcome': 'ยินดีต้อนรับ',
    'login.welcomeBack': 'ยินดีต้อนรับกลับ',
    'login.subtitle': 'กรุณากรอกข้อมูลเพื่อเข้าสู่ระบบ',
    'login.enterCredentials': 'กรอกข้อมูลเพื่อเข้าสู่บัญชีของคุณ',
    'login.username': 'ชื่อผู้ใช้',
    'login.email': 'อีเมล',
    'login.emailPlaceholder': 'name@company.com',
    'login.username.placeholder': 'กรุณากรอกชื่อผู้ใช้',
    'login.admin': 'เข้าสู่ระบบแอดมิน',
    'login.user': 'ผู้ใช้',
    'login.role': 'ประเภทผู้ใช้',
    'login.password': 'รหัสผ่าน',
    'login.password.placeholder': 'กรุณากรอกรหัสผ่าน',
    'login.remember': 'จดจำฉัน',
    'login.rememberPassword': 'จดจำรหัสผ่าน',
    'login.submit': 'เข้าสู่ระบบ',
    'login.signIn': 'เข้าสู่ระบบ',
    'login.startUse': 'เริ่มใช้งาน',
    'login.forgotPassword': 'ลืมรหัสผ่าน?',
    'login.orContinueWith': 'หรือเข้าสู่ด้วย',
    'login.google': 'Google',
    'login.noAccount': 'ยังไม่มีบัญชี?',
    'login.signUp': 'สมัครสมาชิก',
    'login.back': 'กลับไปหน้าแรก',
    'login.error.empty': 'กรุณากรอกข้อมูลให้ครบถ้วน',
    'login.error.username': 'กรุณากรอกชื่อผู้ใช้',
    'login.error.password': 'กรุณากรอกรหัสผ่าน',
    'login.error.invalid': 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง',
    'login.passwordHint': 'รหัสผ่านเริ่มต้นใช้ตาม username (เช่น user001)',
    'login.signingIn': 'กำลังเข้าสู่ระบบ...',

    // Role Selection
    'role.admin': 'เข้าสู่ระบบแอดมิน',
    'role.user': 'เข้าสู่ระบบผู้ใช้ทั่วไป',

    // Home
    'home.title': 'ตรวจสอบสถานะเครื่องซักผ้า',
    'home.subtitle': 'สถานะเครื่องซักผ้าแบบเรียลไทม์',
    'home.status': 'สถานะ',
    'home.status.available': 'ว่าง',
    'home.status.in-use': 'กำลังซัก',
    'home.status.active': 'กำลังใช้งาน',
    'home.status.error': 'เครื่องขัดข้อง',
    'home.status.down': 'ขัดข้อง',
    'home.status.label': 'สถานะ',
    'home.status.ready': 'พร้อมใช้งาน',
    'home.machineNo': 'เครื่องที่',
    'home.timeRemaining': 'เวลาที่เหลือ',
    'home.capacity': 'ความจุ',
    'home.location': 'สถานที่',
    'home.currentUser': 'ผู้ใช้งาน',
    'home.markCompleted': 'ทำเครื่องหมายว่าเสร็จสิ้น',
    'home.start': 'เริ่มใช้งาน',
    'home.kg': 'กิโลกรัม',
    'home.hour': 'ชั่วโมง',
    'home.hours': 'ชั่วโมง',
    'home.minute': 'นาที',
    'home.minutes': 'นาที',
    'home.second': 'วินาที',
    'home.seconds': 'วินาที',
    'home.search': 'ค้นหาเครื่อง...',

    // Admin
    'admin.title': 'ตั้งค่าข้อมูลเครื่องซักผ้า',
    'admin.subtitle': 'จัดการเครื่องซักผ้าทั้งหมด',
    'admin.add': 'เพิ่มเครื่องซักผ้าใหม่',
    'admin.edit': 'คลิกแก้ไข',
    'admin.filter.all': 'ทั้งหมด',
    'admin.filter.noResults': 'ไม่พบเครื่องซักผ้าที่ตรงกับเงื่อนไข',

    // Dashboard
    'dashboard.title': 'แดชบอร์ด',
    'dashboard.controlPanel': 'แผงควบคุม',
    'dashboard.moreInfo': 'ดูเพิ่มเติม',
    'dashboard.stats': 'สถิติจากบันทึก',
    'dashboard.totalLogs': 'รายการบันทึกทั้งหมด',
    'dashboard.logsToday': 'วันนี้',
    'dashboard.logsThisWeek': '7 วันที่ผ่านมา',
    'dashboard.byStatus': 'แยกตามสถานะ',
    'dashboard.income': 'รายได้',
    'dashboard.dailyRevenue': 'ยอดรวมรายได้ต่อวัน',
    'dashboard.dailyUsage': 'ยอดรวมการใช้งานต่อวัน',
    'dashboard.currency': 'บาท',
    'dashboard.periodWeek': 'สัปดาห์',
    'dashboard.periodMonth': 'เดือน',
    'dashboard.periodYear': 'ปี',
    'dashboard.usage': 'ยอดการใช้งาน',
    'dashboard.byMachine': 'แยกตามเครื่อง',
    'dashboard.recentLogs': 'รายการบันทึกล่าสุด',
    'dashboard.fanName': 'ชื่อเครื่อง',
    'dashboard.fanId': 'รหัสเครื่อง',
    'dashboard.status': 'สถานะ',
    'dashboard.coin': 'เหรียญ',
    'dashboard.logDate': 'วันเวลา',
    'dashboard.noLogs': 'ยังไม่มีข้อมูลบันทึก',

    // Add Machine
    'add.title': 'เพิ่มเครื่องซักผ้า',
    'add.subtitle': 'เพิ่มเครื่องซักผ้าใหม่เข้าสู่ระบบ',
    'add.machineNumber': 'เลขเครื่อง',
    'add.capacity': 'น้ำหนัก',
    'add.submit': 'เพิ่ม',
    'add.placeholder.number': '| ใส่เลขเครื่อง',
    'add.placeholder.capacity': 'ใส่น้ำหนักเครื่อง (กก.)',
    'add.error.incomplete': 'กรุณากรอกข้อมูลให้ครบถ้วน',

    // Edit Machine
    'edit.title': 'แก้ไขสถานะเครื่องซักผ้า',
    'edit.malfunction': 'แจ้งสถานะเครื่องขัดข้อง',
    'edit.reset': 'รีเซ็ตเครื่อง',
    'edit.delete': 'ลบเครื่องซักผ้า',
    'edit.clickEdit': 'คลิกแก้ไข',
    'edit.alert.malfunction': 'แจ้งสถานะเครื่องขัดข้องแล้ว',
    'edit.alert.reset': 'รีเซ็ตเครื่องแล้ว',
    'edit.confirm.delete': 'คุณแน่ใจหรือไม่ว่าต้องการลบเครื่องซักผ้านี้?',

    // Common
    'common.washingMachine': 'เครื่องซักผ้า',
    'common.profile': 'โปรไฟล์',
    'common.loading': 'กำลังโหลด...',
    'common.cancel': 'ยกเลิก',
    'common.confirm': 'ยืนยัน',
    'common.delete': 'ลบ',
    'common.success': 'สำเร็จ',
    'common.error': 'เกิดข้อผิดพลาด',
    'common.save': 'บันทึก',

    // Error Messages
    'error.add.incomplete': 'กรุณากรอกข้อมูลให้ครบถ้วน',
    'error.add.duplicate': 'เลขเครื่องซ้ำกัน',
    'error.delete.notFound': 'ไม่พบเครื่องซักผ้านี้',
    'error.delete.failed': 'เกิดข้อผิดพลาดในการลบเครื่องซักผ้า',
    'error.add.failed': 'เกิดข้อผิดพลาดในการเพิ่มเครื่องซักผ้า',
    'error.update.failed': 'เกิดข้อผิดพลาดในการอัปเดตเครื่องซักผ้า',

    // Success Messages
    'success.add': 'เพิ่มเครื่องซักผ้าสำเร็จ',
    'success.delete': 'ลบเครื่องซักผ้าสำเร็จ',
    'success.update': 'อัปเดตเครื่องซักผ้าสำเร็จ',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.admin': 'Admin',
    'nav.settings': 'Settings',
    'nav.logout': 'Log Out',
    'nav.role.admin': 'Administrator',
    'nav.role.user': 'User',
    'nav.management': 'Management',

    // Login
    'login.welcome': 'Welcome',
    'login.welcomeBack': 'Welcome back',
    'login.subtitle': 'Please enter your details',
    'login.enterCredentials': 'Enter your credentials to access your account',
    'login.username': 'Username',
    'login.email': 'Email',
    'login.emailPlaceholder': 'name@company.com',
    'login.username.placeholder': 'Enter your username',
    'login.admin': 'Admin',
    'login.user': 'User',
    'login.role': 'User Type',
    'login.password': 'Password',
    'login.password.placeholder': 'Enter your password',
    'login.remember': 'Remember me',
    'login.rememberPassword': 'Remember password',
    'login.submit': 'Log In',
    'login.signIn': 'Sign in',
    'login.startUse': 'Get started',
    'login.forgotPassword': 'Forgot password?',
    'login.orContinueWith': 'Or continue with',
    'login.google': 'Google',
    'login.noAccount': "Don't have an account?",
    'login.signUp': 'Sign up',
    'login.back': 'Back to Home',
    'login.error.empty': 'Please fill in all fields',
    'login.error.username': 'Please enter username',
    'login.error.password': 'Please enter password',
    'login.error.invalid': 'Invalid username or password',
    'login.passwordHint': 'Default password matches username (e.g. user001)',
    'login.signingIn': 'Signing in...',

    // Role Selection
    'role.admin': 'Login Admin',
    'role.user': 'Login General User',

    // Home
    'home.title': 'Check Washing Machine Status',
    'home.subtitle': 'Real-time status of all laundry units',
    'home.status': 'Status',
    'home.status.available': 'Available',
    'home.status.in-use': 'In Use',
    'home.status.active': 'Active',
    'home.status.error': 'Error',
    'home.status.down': 'Down',
    'home.status.label': 'Status',
    'home.status.ready': 'Ready',
    'home.machineNo': 'Machine No.',
    'home.timeRemaining': 'Time Remaining',
    'home.capacity': 'Capacity',
    'home.location': 'Location',
    'home.currentUser': 'Current User',
    'home.markCompleted': 'Mark as completed',
    'home.start': 'Start',
    'home.kg': 'KG',
    'home.hour': 'hour',
    'home.hours': 'hours',
    'home.minute': 'minute',
    'home.minutes': 'minutes',
    'home.second': 'second',
    'home.seconds': 'seconds',
    'home.search': 'Search machines...',

    // Admin
    'admin.title': 'Washing Machine Settings',
    'admin.subtitle': 'Manage all laundry machines',
    'admin.add': 'Add New Washing Machine',
    'admin.edit': 'Click Edit',
    'admin.filter.all': 'All',
    'admin.filter.noResults': 'No machines found matching the filter',

    // Dashboard
    'dashboard.title': 'Dashboard',
    'dashboard.controlPanel': 'Control panel',
    'dashboard.moreInfo': 'More info',
    'dashboard.stats': 'Stats from Log',
    'dashboard.totalLogs': 'Total Logs',
    'dashboard.logsToday': 'Today',
    'dashboard.logsThisWeek': 'Last 7 days',
    'dashboard.byStatus': 'By Status',
    'dashboard.income': 'Income',
    'dashboard.dailyRevenue': 'Daily Revenue',
    'dashboard.dailyUsage': 'Daily Usage',
    'dashboard.currency': 'THB',
    'dashboard.periodWeek': 'Week',
    'dashboard.periodMonth': 'Month',
    'dashboard.periodYear': 'Year',
    'dashboard.usage': 'Usage',
    'dashboard.byMachine': 'By Machine',
    'dashboard.recentLogs': 'Recent Logs',
    'dashboard.fanName': 'Machine Name',
    'dashboard.fanId': 'Machine ID',
    'dashboard.status': 'Status',
    'dashboard.coin': 'Coin',
    'dashboard.logDate': 'Date & Time',
    'dashboard.noLogs': 'No log data yet',

    // Add Machine
    'add.title': 'Add Washing Machine',
    'add.subtitle': 'Add a new washing machine to the system',
    'add.machineNumber': 'Machine Number',
    'add.capacity': 'Capacity',
    'add.submit': 'Add',
    'add.placeholder.number': '| Enter Machine Number',
    'add.placeholder.capacity': 'Enter Machine Weight (KG)',
    'add.error.incomplete': 'Please fill in all fields',

    // Edit Machine
    'edit.title': 'Edit Washing Machine Status',
    'edit.malfunction': 'Report Malfunction',
    'edit.reset': 'Reset Machine',
    'edit.delete': 'Delete Machine',
    'edit.clickEdit': 'Click Edit',
    'edit.alert.malfunction': 'Malfunction reported',
    'edit.alert.reset': 'Machine reset',
    'edit.confirm.delete': 'Are you sure you want to delete this machine?',

    // Common
    'common.washingMachine': 'Washing Machine',
    'common.profile': 'Profile',
    'common.loading': 'Loading...',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.success': 'Success',
    'common.error': 'Error',
    'common.save': 'Save',

    // Error Messages
    'error.add.incomplete': 'Please fill in all fields',
    'error.add.duplicate': 'Machine number already exists',
    'error.delete.notFound': 'Machine not found',
    'error.delete.failed': 'Failed to delete machine',
    'error.add.failed': 'Failed to add machine',
    'error.update.failed': 'Failed to update machine',

    // Success Messages
    'success.add': 'Machine added successfully',
    'success.delete': 'Machine deleted successfully',
    'success.update': 'Machine updated successfully',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('th');

  useEffect(() => {
    // Load language from localStorage
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('language') as Language;
      if (savedLanguage && (savedLanguage === 'th' || savedLanguage === 'en')) {
        setLanguageState(savedLanguage);
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', lang);
    }
  };

  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

