"use client";

import { Calendar, momentLocalizer, View, Views } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { useState } from "react";

const localizer = momentLocalizer(moment);

const BigCalendar = ({
  data,
}: {
  data: { title: string; start: Date; end: Date }[];
}) => {
  const processedData = data.map(event => ({
    ...event,
    start: new Date(event.start.getTime() - (3 * 60 * 60 * 1000)),
    end: new Date(event.end.getTime() - (3 * 60 * 60 * 1000))
  }));
  
  const [view, setView] = useState<View>(Views.WORK_WEEK);

  const handleOnChangeView = (selectedView: View) => {
    setView(selectedView);
  };

  const firstEventDate = processedData.length > 0 ? processedData[0].start : new Date();

  return (
    <Calendar
      localizer={localizer}
      events={processedData}
      startAccessor="start"
      endAccessor="end"
      views={["work_week", "day"]}
      view={view}
      style={{ height: "500px" }}
      onView={handleOnChangeView}
      defaultDate={firstEventDate}
      min={new Date(2025, 0, 1, 8, 0, 0)}
      max={new Date(2025, 0, 1, 17, 0, 0)}
    />
  );
};

export default BigCalendar;
