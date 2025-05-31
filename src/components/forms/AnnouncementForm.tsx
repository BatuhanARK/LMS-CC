import React from "react";

type AnnouncementFormProps = {
  type: "create" | "update";
  data?: any;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  relatedData?: any;
};

const AnnouncementForm = ({ type, data, setOpen }: AnnouncementFormProps) => {
  return (
    <form
      method="POST"
      className="flex flex-col gap-4"
      // Buraya action ve submit handler eklemelisin
    >
      {/* Diğer form alanların... */}
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

      {/* Submit butonu */}
      <button type="submit" className="btn-primary">
        {type === "create" ? "Create" : "Update"} Announcement
      </button>
    </form>
  );
};

export default AnnouncementForm;
