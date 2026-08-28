const API_BASE = 'http://localhost:3001/api/v1';
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const doctors = await prisma.doctorProfile.findMany({ include: { user: true } });
    console.log(`Found ${doctors.length} doctors:`);
    for (const d of doctors) {
      console.log(`- Doctor: ${d.user?.firstName} ${d.user?.lastName} (${d.id})`);
      const scheds = await prisma.doctorSchedule.findMany({ where: { doctorId: d.id } });
      console.log(`  Schedules (${scheds.length}):`, scheds.map((s) => ({ day: s.dayOfWeek, time: `${s.startTime}-${s.endTime}` })));

      const res = await fetch(API_BASE + `/doctors/${d.id}/availability?date=2026-08-31`);
      const slots = await res.json();
      console.log(`  Availability for 2026-08-31 (Monday, dayOfWeek=1): ${Array.isArray(slots) ? slots.length : JSON.stringify(slots)} slots`);
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
