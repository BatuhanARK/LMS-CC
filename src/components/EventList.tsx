import prisma from "@/lib/prisma";
import EventScrollContainer from "./EventScrollContainer";

const EventList = async ({ dateParam }: { dateParam?: string }) => {
  const selectedDate = dateParam ? new Date(dateParam) : new Date();

  const startOfDay = new Date(selectedDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(selectedDate.setHours(23, 59, 59, 999));

  const data = await prisma.event.findMany({
    where: {
      AND: [
        {
          startTime: {
            lte: endOfDay,
          },
        },
        {
          endTime: {
            gte: startOfDay,
          },
        },
      ],
    },
    orderBy: {
      startTime: "desc",
    },
  });

  // Event'leri render edilmiş JSX olarak hazırlayalım (boş array olsa bile)
  const eventElements = data.map((event) => (
    <div
      className="p-5 rounded-md border-2 border-gray-100 border-t-4 odd:border-t-bSky even:border-t-bPurple h-[130px] flex-shrink-0"
      key={event.id}
    >
      <div className="flex items-center justify-between">
        <h1 className="font-semibold text-gray-600">
          {event.title.length > 15 
            ? `${event.title.substring(0, 15)}...` 
            : event.title}
        </h1>
        <span className="text-gray-600 text-sm"> {/* Stil değişikliği uygulandı */}
          {new Date(event.startTime).toLocaleString("en-UK", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
            timeZone: "UTC",
          })}
        </span>
      </div>
      <p className="text-xs text-gray-400 mt-1">
        End Time:{" "}
        {new Date(event.endTime).toLocaleString("en-UK", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
          timeZone: "UTC",
        })}
      </p>
      <p className="mt-2 text-gray-500 text-sm line-clamp-2 overflow-hidden">
        {event.description && event.description.length > 70 
          ? `${event.description.substring(0, 70)}...` 
          : event.description}
      </p>
    </div>
  ));

  // Her durumda EventScrollContainer'ı render et
  return <EventScrollContainer eventElements={eventElements} totalEvents={data.length} />;
};

export default EventList;
