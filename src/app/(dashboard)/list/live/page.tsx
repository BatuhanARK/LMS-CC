import prisma from "@/lib/prisma";
import { Live, Lesson, Class, Teacher, Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import Pagination from "@/components/Pagination";
import FormContainer from "@/components/FormContainer";
import Link from "next/link";
import { ITEM_PER_PAGE } from "@/lib/settings";

// Row tipi: canlı ders, ilgili ders, sınıf ve öğretmen bilgileriyle
type LiveList = Live & {
  lesson: Lesson | null;
  class: Class | null;
  teacher: Teacher;
};

const LiveListPage = async ({ searchParams }: { searchParams: { [key: string]: string | undefined } }) => {
  const { sessionClaims } = auth();
  const userId = sessionClaims?.sub as string;
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  // Tablo kolonları
  const columns = [
    { header: "Title", accessor: "title", className: "w-1/5 pl-4" },
    { header: "Lesson", accessor: "lesson", className: "w-1/5" },
    { header: "Class", accessor: "class", className: "w-1/6" },
    { header: "Date", accessor: "date", className: "w-1/6" },
    { header: "Teacher", accessor: "teacher", className: "w-1/6" },
    ...(role === "admin" || role === "teacher"
      ? [{ header: "Action", accessor: "action", className: "w-1/12" }]
      : []
    ),
    { header: "Join", accessor: "join", className: "w-1/12" },
  ];

  // Rol bazlı filtreleme
  let where: Prisma.LiveWhereInput = {};

  if (role === "admin") {
    // Admin tüm canlıları görür
  } else if (role === "teacher") {
    where.teacherId = userId;
  } else if (role === "student") {
    // Öğrencinin sınıfı
    const student = await prisma.student.findUnique({
      where: { id: userId },
      select: { classId: true }
    });
    where.classId = student?.classId;
  }

  // Search işlemi
  if (searchParams?.search) {
    where.title = { contains: searchParams.search, mode: "insensitive" };
  }

  // Pagination
  const page = searchParams?.page ? parseInt(searchParams.page) : 1;

  const [data, count] = await prisma.$transaction([
    prisma.live.findMany({
      where,
      include: { lesson: true, class: true, teacher: true },
      orderBy: { date: "desc" },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (page - 1),
    }),
    prisma.live.count({ where }),
  ]);

  // Row Renderer
  const renderRow = (item: LiveList) => (
    <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-purple-50">
      <td className="p-4">{item.title}</td>
      <td className="p-4">{item.lesson?.name ?? "-"}</td>
      <td className="p-4">{item.class?.name ?? "-"}</td>
      <td className="p-4">
        {new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(item.date)}
      </td>
      <td className="p-4">{item.teacher?.name} {item.teacher?.surname}</td>
      {/* İşlemler */}
      {(role === "admin" || (role === "teacher" && item.teacherId === userId)) && (
        <td className="p-4 flex gap-2">
          <FormContainer table="live" type="update" data={item} />
          <FormContainer table="live" type="delete" id={item.id} />
        </td>
      )}
      {/* Katıl */}
      <td className="p-4">
        <Link
          href={`/live/jitsi/${item.meetingUrl}`}
          className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-500"
          target="_blank"
        >
          Katıl
        </Link>
      </td>
    </tr>
  );

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      <div className="flex items-center justify-between mb-4">
        <h1 className="hidden md:block text-lg font-semibold">Canlı Dersler</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            {(role === "admin" || role === "teacher") && (
              <FormContainer table="live" type="create" />
            )}
          </div>
        </div>
      </div>
      <Table columns={columns} renderRow={renderRow} data={data} />
      <Pagination page={page} count={count} />
    </div>
  );
};

export default LiveListPage;
