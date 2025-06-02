"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import InputField from "../InputField";
import { Dispatch, SetStateAction, useEffect } from "react";
import { useFormState } from "react-dom";
import { createAssignment, updateAssignment } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";

const schema = z.object({
  id: z.coerce.number().optional(),
  title: z.string().min(1, { message: "Assignment title is required!" }),
  dueDate: z.string().min(1, { message: "Due date is required!" }),
  lessonId: z.coerce.number().min(1, { message: "Lesson is required!" }),
});

type Inputs = z.infer<typeof schema>;

const AssignmentForm = ({
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
  } = useForm<Inputs>({
    resolver: zodResolver(schema),
    defaultValues: data,
  });

  const [state, formAction] = useFormState(
    type === "create" ? createAssignment : updateAssignment,
    {
      success: false,
      error: false,
    }
  );

  const router = useRouter();

  useEffect(() => {
    if (state.success) {
      toast(`Assignment has been ${type === "create" ? "created" : "updated"}!`);
      setOpen(false);
      router.refresh();
    }
  }, [state, router, type, setOpen]);

  const onSubmit = handleSubmit((data) => {
    const formData = {
      ...data,
      startDate: new Date().toISOString(), // Automatically set startDate to current date
    };
    formAction(formData);
  });

  const { lessons } = relatedData;

  return (
    <form className="flex flex-col gap-6" onSubmit={onSubmit}>
      <h1 className="text-xl font-semibold">
        {type === "create" ? "Create Assignment" : "Update Assignment"}
      </h1>
      <div className="flex justify-between flex-wrap gap-4">
        <InputField
          label="Title"
          register={register}
          name="title"
          error={errors.title}
        />
        <InputField
          label="Due Date"
          register={register}
          name="dueDate"
          error={errors.dueDate}
          type="datetime-local"
        />
      </div>
      <InputField
        label="Lesson"
        register={register}
        name="lessonId"
        error={errors.lessonId}
        type="select"
        options={lessons}
      />
      <button className="bg-blue-400 text-white p-2 rounded-md">
        {type === "create" ? "Create" : "Update"}
      </button>
    </form>
  );
};

export default AssignmentForm;
