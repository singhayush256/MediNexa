const API_BASE = 'http://localhost:3001/api/v1';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function inspectSlotSystem() {
  try {
    const doc = await prisma.doctorProfile.findFirst({
      where: { user: { email: 'dr.smith@medinexa.local' } },
      include: { user: true },
    });
    console.log(`Checking Dr. ${doc.user.firstName} ${doc.user.lastName} (${doc.id}):`);

    // 1. Inspect DoctorSchedule table records
    const scheds = await prisma.doctorSchedule.findMany({
      where: { doctorId: doc.id },
      orderBy: { dayOfWeek: 'asc' },
    });
    console.log('\n--- 1. DoctorSchedule Table Records ---');
    console.table(
      scheds.map((s) => ({
        id: s.id,
        dayOfWeek: s.dayOfWeek,
        dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][s.dayOfWeek],
        startTime: s.startTime,
        endTime: s.endTime,
        status: s.status,
      })),
    );

    // 2. Query API for dates 2026-08-28 to 2026-09-01
    const testDates = [
      '2026-08-28', // Friday
      '2026-08-29', // Saturday
      '2026-08-30', // Sunday
      '2026-08-31', // Monday
      '2026-09-01', // Tuesday
    ];

    console.log('\n--- 2. API Response for Availability ---');
    for (const dateStr of testDates) {
      const parts = dateStr.split('-').map(Number);
      const targetDate = new Date(parts[0], parts[1] - 1, parts[2]);
      const utcDate = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2]));
      const localDay = targetDate.getDay();
      const utcDay = utcDate.getUTCDay();

      const res = await fetch(`${API_BASE}/doctors/${doc.id}/availability?date=${dateStr}`);
      const data = await res.json();
      const slotCount = Array.isArray(data) ? data.length : 'ERROR';

      console.log(
        `Date: ${dateStr} | LocalDay: ${localDay} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][localDay]}) | UTCDay: ${utcDay} (${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][utcDay]}) | Slots: ${slotCount}`,
      );
    }
  } catch (err) {
    console.error('Error during inspection:', err);
  } finally {
    await prisma.$disconnect();
  }
}

inspectSlotSystem();
