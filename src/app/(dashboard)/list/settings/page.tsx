import { auth } from "@clerk/nextjs/server";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

const COLOR_OPTIONS = [
  { name: "Sky", value: "bSky" },
  { name: "Purple", value: "bPurple" },
  { name: "Yellow", value: "bYellow" },
];

export default async function SettingsPage() {
  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role ?? "student";

  // Kullanıcı bilgilerini örnek olarak çekiyoruz (kendi modeline göre düzenle)
  let user: any = null;
  if (role === "student") {
    user = await prisma.student.findUnique({ where: { id: userId! } });
  } else if (role === "teacher") {
    user = await prisma.teacher.findUnique({ where: { id: userId! } });
  } else {
    // admin veya diğer roller için örnek
    user = { name: "Admin", username: "admin", img: "/default.png" };
  }

  // Kullanıcı renk tercihini örnek olarak localStorage veya db'den alabilirsin
  // Burada sadece örnek olarak bir default değer kullanıldı
  const currentColor = "bSky";

  // Form submit işlemleri için bir API route veya server action yazmalısın
  // Burada sadece görsel ve yapı örneği verilmiştir

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <h1 className="text-lg font-semibold mb-6">Settings</h1>
      <div className="flex flex-col gap-8">
        {/* Profil Bilgileri */}
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-bPurple">
            <Image
              src={user?.img || "/default.png"}
              alt="Profile"
              width={96}
              height={96}
              className="object-cover w-full h-full"
            />
          </div>
          <div>
            <div className="font-semibold text-xl">{user?.name} {user?.surname}</div>
            <div className="text-gray-500">@{user?.username}</div>
            <div className="mt-2">
              <label className="block text-xs text-gray-500 mb-1">Change Profile Picture</label>
              <input type="file" className="block text-sm" />
            </div>
          </div>
        </div>

        {/* Kullanıcı Adı Değiştir */}
        <div>
          <label className="block text-xs text-gray-500 mb-1">Change Username</label>
          <input
            type="text"
            defaultValue={user?.username}
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full max-w-xs"
          />
        </div>

        {/* Site Rengi Seç */}
        <div>
          <label className="block text-xs text-gray-500 mb-2">Site Color Theme</label>
          <div className="flex gap-4">
            {COLOR_OPTIONS.map((color) => (
              <label key={color.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="siteColor"
                  value={color.value}
                  defaultChecked={currentColor === color.value}
                  className="accent-purple-500"
                />
                <span
                  className={`w-6 h-6 rounded-full border-2 border-gray-300`}
                  style={{ backgroundColor: `var(--tw-color-${color.value})` }}
                ></span>
                <span className="text-sm">{color.name}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Kaydet Butonu */}
        <button className="bg-bPurple text-white px-6 py-2 rounded-md font-semibold w-fit self-end">
          Save Changes
        </button>
      </div>
    </div>
  );
}