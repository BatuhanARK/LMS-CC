import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import { Class, Event, Prisma } from "@prisma/client";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { Audience } from "@prisma/client";
import Link from "next/link";

type EventList = Event & { class: Class | null };

const EventListPage = async ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {

  const { userId, sessionClaims } = auth();
  const role = (sessionClaims?.metadata as { role?: string })?.role;

  const columns = [
    {
      header: "Title",
      accessor: "title",
      className: "w-1/6 pl-4",
    },
    {
      header: "Description",
      accessor: "description",
      className: "w-1/3 pl-4",
    },
    {
      header: "Class",
      accessor: "class",
      className: "w-1/12",
    },
    {
      header: "Start Time",
      accessor: "startTime",
      className: "hidden md:table-cell w-1/6",
    },
    {
      header: "End Time",
      accessor: "endTime",
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

  const renderRow = (item: EventList) => {
    // URL parametrelerini temizle ve eventId ekle
    const currentParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value !== undefined && key !== 'eventId') {
        currentParams.set(key, value);
      }
    });
    currentParams.set('eventId', item.id.toString());

    return (
      <tr
        key={item.id}
        className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-lamaPurpleLight"
      >
        <td className="p-4 w-1/6 ">
          <Link 
            href={`/list/events?${currentParams.toString()}`}
            className="block cursor-pointer"
          >
            <div className="font-medium">{item.title.length >25
              ? `${item.title.substring(0,25)}...`
              : item.title}
            </div>
          </Link>
        </td>
        <td className="p-4 w-1/3 ">
          <Link 
            href={`/list/events?${currentParams.toString()}`}
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
          {new Intl.DateTimeFormat("tr-TR", {
            day: "2-digit",
            month: "2-digit", 
            year: "numeric",
            timeZone: "UTC"
          }).format(item.startTime)}, {new Intl.DateTimeFormat("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "UTC"
          }).format(item.startTime)}
        </td>
        <td className="hidden md:table-cell w-1/6">
          {new Intl.DateTimeFormat("tr-TR", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            timeZone: "UTC"
          }).format(item.endTime)}, {new Intl.DateTimeFormat("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "UTC"
          }).format(item.endTime)}
        </td>
        <td className="w-1/12">
          <div className="flex items-center gap-2">
            {role === "admin" && (
              <>
                <FormContainer table="event" type="update" data={item} />
                <FormContainer table="event" type="delete" id={item.id} />
              </>
            )}
          </div>
        </td>
      </tr>
    );
  };

  const { page, eventId, ...queryParams } = searchParams;
  const p = page ? parseInt(page) : 1;

  // URL PARAMS CONDITION
  const query: Prisma.EventWhereInput = {};

  if (queryParams) {
    for (const [key, value] of Object.entries(queryParams)) {
      if (value !== undefined) {
        switch (key) {
          case "search":
            query.title = { contains: value, mode: "insensitive" };
            break;
          default:
            break;
        }
      }
    }
  }

  // ROLE CONDITIONS
  if (role !== "admin") {
    const userAudience: Audience = role === "student" ? Audience.STUDENTS : Audience.TEACHERS;

    query.targetAudience = {
      in: [Audience.ALL, userAudience],
    };
  }

  const [data, count] = await prisma.$transaction([
    prisma.event.findMany({
      where: query,
      include: {
        class: true,
      },
      take: ITEM_PER_PAGE,
      skip: ITEM_PER_PAGE * (p - 1),
    }),
    prisma.event.count({ where: query }),
  ]);

  // Seçili event'i getir
  let selectedEvent: EventList | null = null;
  if (eventId) {
    selectedEvent = await prisma.event.findUnique({
      where: { id: parseInt(eventId) },
      include: { class: true },
    });
  }

  // Modal kapatma URL'i oluştur
  const closeModalParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value !== undefined && key !== 'eventId') {
      closeModalParams.set(key, value);
    }
  });
  const closeModalUrl = `/list/events${closeModalParams.toString() ? `?${closeModalParams.toString()}` : ''}`;

  return (
    <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0 relative">
      {/* TOP */}
      <div className="flex items-center justify-between">
        <h1 className="hidden md:block text-lg font-semibold">All Events</h1>
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <TableSearch />
          <div className="flex items-center gap-4 self-end">
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/filter.png" alt="" width={14} height={14} />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-full bg-lamaYellow">
              <Image src="/sort.png" alt="" width={14} height={14} />
            </button>
            {role === "admin" && <FormContainer table="event" type="create" />}
          </div>
        </div>
      </div>
      {/* LIST */}
      <Table columns={columns} renderRow={renderRow} data={data} />
      {/* PAGINATION */}
      <Pagination page={p} count={count} />

      {/* Event Detail Overlay - Server Side Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800">{selectedEvent.title}</h2>
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
                <span className="text-gray-800">{selectedEvent.class?.name || "No class assigned"}</span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Start Time: </span>
                <span className="text-gray-800">
                  {new Intl.DateTimeFormat("tr-TR", {
                    day: "2-digit",
                    month: "2-digit", 
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: "UTC"
                  }).format(selectedEvent.startTime)}
                </span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">End Time: </span>
                <span className="text-gray-800">
                  {new Intl.DateTimeFormat("tr-TR", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric", 
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: "UTC"
                  }).format(selectedEvent.endTime)}
                </span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-700">Description: </span>
                <p className="mt-2 text-gray-700 leading-relaxed">
                  {selectedEvent.description || "No description available"}
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

export default EventListPage;
