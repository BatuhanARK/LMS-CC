import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Announcement, Class, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

type AnnouncementList = Announcement & { class: Class | null};

const AnnouncementListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

  const { sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Title",
      accessor: "title",
      className: "w-1/5 pl-4",
    },
    {
      header: "Description",
      accessor: "description",
      className: "w-2/5 pl-4",
    },
    {
      header: "Class",
      accessor: "class",
      className: "w-1/12",
    },
    {
      header: "Date",
      accessor: "date",
      className: "hidden md:table-cell w-1/6",
    },
    ...(role === "admin"
      ? [
        {
          header: "Actions",
          accessor: "action",
          className: "w-1/12",
        },
      ]
      : []),
  ];

  const renderRow = (item: AnnouncementList) => {
    // URL parametrelerini temizle ve announcementId ekle
    const currentParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && key !== 'announcementId') {
        currentParams.set(key, value);
      }
    });
    currentParams.set('announcementId', item.id.toString());

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-bPurpleLight"
      >
        <td className="p-4 w-1/5 text-left">
          <Link 
            href={`/list/announcements?${currentParams.toString()}`}
            className="block cursor-pointer"
          >
            <div className="font-medium">
              {item.title.length > 30 
                ? `${item.title.substring(0, 30)}...` 
                : item.title}
            </div>
          </Link>
        </td>
        <td className="p-4 w-2/5 text-left">
          <Link 
            href={`/list/announcements?${currentParams.toString()}`}
            className="block cursor-pointer"
          >
            <div className="text-xs text-gray-500">
              {item.description && item.description.length > 100 
                ? `${item.description.substring(0, 100)}...` 
                : item.description || "No description"}
            </div>
          </Link>
        </td>
        <td className="w-1/12">{item.class?.name || "-"}</td>
        <td className="hidden md:table-cell w-1/6">
          {new Intl.DateTimeFormat("en-US").format(item.date)}
        </td>
        <td className="w-1/12">
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormContainer table="announcement" type="update" data={item} />
                <FormContainer table="announcement" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const { page, announcementId, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.AnnouncementWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        if (key === "search") {
          query.title = { contains: value, mode: "insensitive" };
        }
      }
    }
  }

  // ROLE CONDITIONS
  if (role === "teacher") {
    query.OR = [
      { targetAudience: "TEACHERS" },
      { targetAudience: "ALL" },
    ];
  } else if (role === "student") {
    query.OR = [
      { targetAudience: "STUDENTS" },
      { targetAudience: "ALL" },
    ];
  }

  const [data, count] = await prisma.$transaction([
    prisma.announcement.findMany({
      where: query,
      include: {
        class: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.announcement.count({ where: query }),
  ]);

  // Seçili announcement'ı getir
  let selectedAnnouncement: (Announcement & { class: Class | null }) | null = null;
  if (announcementId) {
    selectedAnnouncement = await prisma.announcement.findUnique({
      where: { id: parseInt(announcementId) },
      include: { class: true },
    });
  }

  // Modal kapatma URL'i oluştur
  const closeModalParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && key !== 'announcementId') {
      closeModalParams.set(key, value);
    }
  });
  const closeModalUrl = `/list/announcements${closeModalParams.toString() ? `?${closeModalParams.toString()}` : ''}`;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">
          All Announcements
        </h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-bYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-bYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && (
              <FormContainer table="announcement" type="create" />
            )}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />

      {/* Announcement Detail Overlay - Server Side Modal */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">{selectedAnnouncement.title}</h2>
              <Link
                href={closeModalUrl}
                className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              >
                ×
              </Link>
            </div>
            
            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div>
                <span className="font-semibold text-gray-700">Class: </span>
                <span className="text-gray-800">{selectedAnnouncement.class?.name || "All Classes"}</span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Date: </span>
                <span className="text-gray-800">
                  {new Intl.DateTimeFormat("tr-TR", {
                    day: "2-digit",
                    month: "2-digit", 
                    year: "numeric",
                  }).format(selectedAnnouncement.date)}
                </span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Description: </span>
                <p className="mt-2 text-gray-700 leading-relaxed">
                  {selectedAnnouncement.description || "No description available"}
                </p>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200">
              <Link
                href={closeModalUrl}
                className="block w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-500 transition-colors text-center font-semibold shadow-sm"
              >
                Close
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementListPage;
