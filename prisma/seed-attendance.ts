import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Adding new attendance records...')
  
  const existingCount = await prisma.attendance.count()
  console.log(`📊 Existing attendance records: ${existingCount}`)
  
  const attendanceData = []
  
  // Bugünün tarihini al
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
  const lastMonday = new Date(today);
  lastMonday.setDate(today.getDate() - daysSinceMonday);
  
  console.log('Last Monday for seed:', lastMonday);
  
  for (let num = 11; num <= 25; num++) {
    // Her öğrenci için Pazartesi'den Cuma'ya kadar (0=Pazartesi, 4=Cuma)
    for (let day = 0; day < 5; day++) {
      const attendanceDate = new Date(lastMonday);
      attendanceDate.setDate(lastMonday.getDate() + day);
      
      console.log(`Creating record for student${num} on ${attendanceDate.toDateString()}`);
      
      attendanceData.push({
        date: attendanceDate,
        present: Math.random() > 0.2,
        studentId: `student${num}`,
        lessonId: num,
      })
    }
  }

  console.log(`Total records to create: ${attendanceData.length}`);
  
  // Önce mevcut kayıtları temizle (isteğe bağlı)
  await prisma.attendance.deleteMany({
    where: {
      studentId: {
        in: Array.from({length: 15}, (_, i) => `student${i + 11}`)
      }
    }
  });

  const result = await prisma.attendance.createMany({
    data: attendanceData,
  })

  console.log(`✅ Added ${result.count} new attendance records`)
  
  const newCount = await prisma.attendance.count()
  console.log(`📊 Total attendance records now: ${newCount}`)
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
