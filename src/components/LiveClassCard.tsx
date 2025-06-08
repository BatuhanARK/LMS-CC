"use client";
import Link from "next/link";

export default function LiveClassCard({ data, role, userId }) {
  const liveId = data.id;

  let link = "";
  if (role === "ADMIN") link = `/live/admin/${liveId}`;
  else if (role === "TEACHER") link = `/live/teacher/${userId}/${liveId}`;
  else if (role === "STUDENT") link = `/live/student/${userId}/${liveId}`;

  return (
    <div className="border p-3 rounded shadow-sm bg-white">
      <h3 className="font-semibold text-lg">{data.title}</h3>
      <p>Başlangıç: {new Date(data.startTime).toLocaleString()}</p>
      <Link href={link}>
        <button className="mt-2 px-4 py-1 bg-blue-600 text-white rounded">
          Derse Katıl
        </button>
      </Link>
    </div>
  );
}
