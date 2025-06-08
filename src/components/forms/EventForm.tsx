"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import InputField from "../InputField";
import {
  eventSchema,
  EventSchema,
} from "@/lib/formValidationSchemas";
import {
  createEvent,
  updateEvent,
} from "@/lib/actions";
import { useFormState } from "react-dom";
import { Dispatch, SetStateAction, useEffect } from "react";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

const EventForm = ({
  type,
  data,
  setOpen,
  relatedData,
}: {
  type: "create" | "update";
  data?: any;
  setOpen: Dispatch<SetStateAction<boolean>>;
  relatedData?: any;
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EventSchema>({
    resolver: zodResolver(eventSchema),
  });

  const [state, formAction] = useFormState(
    type === "create" ? createEvent : updateEvent,
    {
      success: false,
      error: false,
    }
  );

  const onSubmit = handleSubmit((data) => {
    console.log(data);
    formAction(data);
  });

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Event has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const { classes } = relatedData ?? { classes: [] };

  return (
    <form className="flex flex-col gap-8" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create a new event" : "Update the event"}
      </h1>

      <div className="flex justify-between flex-wrap gap-4 relative">
        <InputField
          label="Event Title"
          name="title"
          defaultValue={data?.title}
          register={register}
          error={errors?.title}
        />

        <InputField
          label="Description"
          name="description"
          defaultValue={data?.description}
          register={register}
          error={errors?.description}
        />

        <InputField
          label="Start Time"
          name="startTime"
          type="datetime-local"
          defaultValue={
            data?.startTime
              ? new Date(data.startTime).toISOString().slice(0, 16)
              : ""
          }
          register={register}
          error={errors?.startTime}
        />

        <InputField
          label="End Time"
          name="endTime"
          type="datetime-local"
          defaultValue={
            data?.endTime
              ? new Date(data.endTime).toISOString().slice(0, 16)
              : ""
          }
          register={register}
          error={errors?.endTime}
        />

        <div className="flex flex-col gap-2 w-full md:w-[48%]">
          <label htmlFor="targetAudience" className="text-xs text-gray-500">Target Audience</label>
          <select
            id="targetAudience"
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("targetAudience")}
            defaultValue={data?.targetAudience || "ALL"}
          >
            <option value="ALL">Everyone</option>
            <option value="TEACHERS">Teachers</option>
            <option value="STUDENTS">Students</option>
          </select>
          {errors?.targetAudience?.message && (
            <p className="text-xs text-red-400">
              {errors.targetAudience.message.toString()}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 w-full md:w-[48%]">
          <label className="text-xs text-gray-500">Class (Optional)</label>
          <select
            className="ring-[1.5px] ring-gray-300 p-2 rounded-md text-sm w-full"
            {...register("classId")}
            defaultValue={data?.classId || ""}
          >
            <option value="">None</option>
            {classes.map((cls: { id: number; name: string }) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>
          {errors?.classId?.message && (
            <p className="text-xs text-red-400">
              {errors.classId.message.toString()}
            </p>
          )}
        </div>

        {data?.id && (
          <InputField
            label="Id"
            name="id"
            defaultValue={data.id}
            register={register}
            error={errors?.id}
            hidden
          />
        )}
      </div>

      {state.error && (
        <span className="text-red-500">Something went wrong!</span>
      )}

      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default EventForm;
