import React from "react";

type EventFormProps = {
  type: "create" | "update";
  data?: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  relatedData?: any;
};

const EventForm = ({ type, data, setOpen }: EventFormProps) => {
  return (
    <form method="POST" className="flex flex-col gap-4">
      <label htmlFor="title">Title</label>
      <input
        name="title"
        defaultValue={data?.title || ""}
        className="form-input"
        required
      />

      <label htmlFor="targetAudience">Target Audience</label>
      <select
        name="targetAudience"
        defaultValue={data?.targetAudience || "ALL"}
        className="form-select"
      >
        <option value="ALL">Everyone</option>
        <option value="TEACHERS">Teachers</option>
        <option value="STUDENTS">Students</option>
      </select>

      <button type="submit" className="btn-primary">
        {type === "create" ? "Create" : "Update"} Event
      </button>
    </form>
  );
};

export default EventForm;
