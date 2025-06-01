import EventList from "./EventList";
import EventCalendar from "./EventCalendar";
import Image from "next/image";
import Link from "next/link";

const EventCalendarContainer = ({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) => {
  const dateParam = searchParams.date ?? undefined;

  return (
    <div className="bg-white p-4 rounded-md">
      <EventCalendar />
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold my-4">Events</h1>
        <div className="flex items-start gap-2">
          <div className="flex-1"></div> {/* Boş alan - EventScrollContainer'daki flex-1 ile aynı */}
          <Link href="/list/events">
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
      <div className="flex flex-col gap-4">
        <EventList dateParam={dateParam} />
      </div>
    </div>
  );
};

export default EventCalendarContainer;
