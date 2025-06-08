import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import Link from "next/link";
import LogoutButton from "./LogoutButton";

const menuItems = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "student"],
      },
      {
        icon: "/live.png",
        label: "Live",
        href: "/live",
        visible: ["admin", "teacher", "student"],
        isDynamic: true,
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/lesson.png",
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student"],
      },
      {
        icon: "/assignment.png",
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student"],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student"],
      },
      {
        icon: "/attendance.png",
        label: "Attendances",
        href: "/list/attendances",
        visible: ["admin", "teacher", "student"],
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student"],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["teacher", "student"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/list/settings",
        visible: ["admin", "teacher", "student"],
      },
      // Logout item'ı kaldırıldı, aşağıda ayrı component olarak eklenecek
    ],
  },
];

const Menu = async () => {
  const user = await currentUser();
  const role = user?.publicMetadata.role as string;
  const userId = user?.id;
  
  return (
    <div className="mt-4 text-sm h-full overflow-y-auto scrollbar-hide">
      {menuItems.map((i, index) => (
        <div className="flex flex-col gap-2" key={i.title}>
          {/* OTHER bölümü için ayırıcı çizgi ekle */}
          {index === 1 && (
            <div className="border-t border-gray-300 mb-2 mt-3 mx-2"></div>
          )}
          {i.items.map((item) => {
            if (item.visible.includes(role)) {
              // Dinamik href hesaplama
              let href = item.href;
              
              if (item.label === "Profile") {
                if (role === "teacher") {
                  href = `/list/teachers/${userId}`;
                } else if (role === "student") {
                  href = `/list/students/${userId}`;
                }
              } else if (item.label === "Live" && item.isDynamic) {
                href = `/list/live`;
              }

              
              return (
                <Link
                  href={href}
                  key={item.label}
                  className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-bSkyLight"
                >
                  <Image src={item.icon} alt="" width={20} height={20} />
                  <span className="hidden lg:block">{item.label}</span>
                </Link>
              );
            }
          })}
        </div>
      ))}
      
      {/* Logout Button - Ayrı component olarak */}
      <div className="mt-2 mb-[5px]">
        <LogoutButton />
      </div>
    </div>
  );
};

export default Menu;
