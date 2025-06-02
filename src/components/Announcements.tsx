import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import AnnouncementScrollContainer from "./AnnouncementScrollContainer";
import Image from "next/image";
import Link from "next/link";

const Announcements = async () => {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const roleConditions = {
    teacher: { lessons: { some: { teacherId: userId! } } },
    student: { students: { some: { id: userId! } } }
  };

  const data = await prisma.announcement.findMany({
    take: 10,
    orderBy: { date: "desc" },
    where: {
      ...(role !== "admin" && {
        OR: [
          { classId: null },
          { class: roleConditions[role as keyof typeof roleConditions] || {} },
        ],
      }),
    },
  });

  // Announcement'ları render edilmiş JSX olarak hazırlayalım
  const announcementElements = data.map((announcement, index) => {
    // Farklı renkler için index'e göre stil belirleme
    const bgColors = ["bg-bSkyLight", "bg-bPurpleLight", "bg-bYellowLight"];
    const bgColor = bgColors[index % 3];

    return (
      <div className={`${bgColor} rounded-md p-4 h-[120px] flex-shrink-0`} key={announcement.id}>
        <div className="flex items-center justify-between">
          <h2 className="font-medium">
            {announcement.title.length > 25 
              ? `${announcement.title.substring(0, 25)}...` 
              : announcement.title}
          </h2>
          <span className="text-xs text-gray-400 bg-white rounded-md px-1 py-1">
            {new Intl.DateTimeFormat("en-GB").format(announcement.date)}
          </span>
        </div>
        <p className="text-sm text-gray-400 mt-1 line-clamp-3 overflow-hidden">
          {announcement.description && announcement.description.length > 75 
            ? `${announcement.description.substring(0, 75)}...` 
            : announcement.description}
        </p>
      </div>
    );
  });

  return (
    <div className="bg-white p-4 rounded-md">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Announcements</h1>
        <div className="flex items-start gap-2">
          <div className="flex-1"></div> {/* Boş alan - AnnouncementScrollContainer'daki flex-1 ile aynı */}
          <Link href="/list/announcements">
            <div className="p-2 rounded-md border-2 border-gray-100 hover:border-gray-300 transition-all duration-200">
              <Image 
                src="/moreDark.png" 
                alt="" 
                width={16} 
                height={16} 
                className="cursor-pointer" 
              />
            </div>
          </Link>
        </div>
      </div>
      <div className="mt-4">
        <AnnouncementScrollContainer 
          announcementElements={announcementElements} 
          totalAnnouncements={data.length} 
        />
      </div>
    </div>
  );
};

export default Announcements;
