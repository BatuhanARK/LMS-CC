"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Image from "next/image";

const LogoutButton = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut();
      router.push("/"); // Ana sayfaya yönlendir
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center justify-center lg:justify-start gap-4 text-gray-500 py-2 md:px-2 rounded-md hover:bg-bSkyLight w-full text-left"
    >
      <Image src="/logout.png" alt="" width={20} height={20} />
      <span className="hidden lg:block">Logout</span>
    </button>
  );
};

export default LogoutButton;
