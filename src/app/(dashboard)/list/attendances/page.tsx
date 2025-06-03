import FormContainer from "@/components/FormContainer";
import Pagination from "@/components/Pagination";
import Table from "@/components/Table";
import TableSearch from "@/components/TableSearch";
import prisma from "@/lib/prisma";
import { ITEM_PER_PAGE } from "@/lib/settings";
import Image from "next/image";
import { auth } from "@clerk/nextjs/server";
import { Attendance, Prisma } from "@prisma/client";
import Link from "next/link";


type AttendanceList = {
    id: number;
    studentId: string;
    studentName: string;
    studentSurname: string;
    lessonId: number;
    lessonName: string;
    teacherName: string;
    teacherSurname: string;
    dateAtt: Date;
    timeRangeLesson: string;
    present: boolean;
};

const AttendanceListPage = async ({
    searchParams,
}: {
    searchParams: { [key: string]: string | undefined };
}) => {
    const { userId, sessionClaims } = auth();
    const role = (sessionClaims?.metadata as { role?: string })?.role;
    const currentUserId = userId;

    const columns = [
        { header: "Student ID", accessor: "studentId", className: "w-1/10", },
        { header: "Student", accessor: "student", className: "pl-4 w-1/10", },
        { header: "Lesson ID", accessor: "lessonId", className: "pl-4 w-1/12", },
        { header: "Lesson", accessor: "lesson", className: "pl-4 w-1/12", },
        { header: "Teacher", accessor: "teacher", className: "pl-4 w-1/8 hidden md:table-cell" },
        { header: "Date", accessor: "dateAtt", className: "pl-4 w-1/12 hidden md:table-cell" },
        { header: "Time Range", accessor: "timeRange", className: "pl-4 w-1/10 hidden md:table-cell" },
        { header: "Present", accessor: "present", className: "pl-4 w-1/14" },
        ...(role === "admin" || role === "teacher"
            ? [{ header: "Actions", accessor: "action", className: "pl-4 w-1/10" }]
            : []),
    ];

    const renderRow = (item: AttendanceList) => {
        // URL parametrelerini temizle ve attendanceId ekle
        const currentParams = new URLSearchParams();
        Object.entries(searchParams).forEach(([key, value]) => {
            if (value !== undefined && key !== 'attendanceId') {
                currentParams.set(key, value);
            }
        });
        currentParams.set('attendanceId', item.id.toString());
        return (
            <tr key={item.id} className="border-b border-gray-200 even:bg-slate-50 text-sm hover:bg-bPurpleLight">
                <td className="p-4 w-1/10 pl-4">
                    <Link href={`/list/attendances?studentId=${item.studentId}`}>
                        <div>
                            {item.studentId.length > 20 ? `${item.studentId.substring(0, 20)}...` : item.studentId}
                        </div>
                    </Link>
                </td>
                <td className="p-4 w-1/10">
                    <Link href={`/list/attendances?studentId=${item.studentId}`}>
                        <div>
                            {item.studentName + " " + item.studentSurname}
                        </div>
                    </Link>
                </td>
                <td className="p-4 w-1/12">{item.lessonId}</td>
                <td className="p-4 w-1/12">{item.lessonName}</td>
                <td className="p-4 w-1/8 hidden md:table-cell">{item.teacherName + " " + item.teacherSurname}</td>
                <td className="p-4 w-1/12 hidden md:table-cell">{new Intl.DateTimeFormat("tr-TR").format(item.dateAtt)}</td>
                <td className="p-4 w-1/10 hidden md:table-cell">{item.timeRangeLesson}</td>
                <td className="p-4 w-1/14">{item.present ? "✅" : "❌"}</td>
                <td>
                    {(role === "admin" || role === "teacher") && (
                        <div className="p-4 flex items-center gap-2">
                            <FormContainer table="attendance" type="update" data={item} />
                            <FormContainer table="attendance" type="delete" id={item.id} />
                        </div>
                    )}
                </td>
            </tr>
        )
    };

    const { page, attendanceId, ...queryParams } = searchParams;
    const p = page ? parseInt(page) : 1;

    // URL Query Filters
    const query: Prisma.AttendanceWhereInput = {};

    if (queryParams) {
        for (const [key, value] of Object.entries(queryParams)) {
            if (value !== undefined) {
                switch (key) {
                    case "studentId":
                        query.studentId = value;
                        break;
                    case "search":
                        query.OR = [
                            { student: { name: { contains: value, mode: "insensitive" } } },
                            { lesson: { name: { contains: value, mode: "insensitive" } } },
                        ];
                        break;
                }
            }
        }
    }

    // Role-Based Filtering
    switch (role) {
        case "admin":
            break;
        case "teacher":
            query.lesson = { teacherId: currentUserId! };
            break;
        case "student":
            query.studentId = currentUserId!;
            break;
    }

    const [dataRes, count] = await prisma.$transaction([
        prisma.attendance.findMany({
            where: query,
            include: {
                student: { select: { name: true, surname: true } },
                lesson: {
                    select: {
                        id: true,
                        name: true,
                        startTime: true,
                        endTime: true,
                        teacher: { select: { name: true, surname: true } },
                    },
                },
            },
            take: ITEM_PER_PAGE,
            skip: ITEM_PER_PAGE * (p - 1),
            orderBy: { date: "desc" },
        }),
        prisma.attendance.count({ where: query }),
    ]);

    const data = dataRes.map((item) => ({
        id: item.id,
        studentId: item.studentId,
        studentName: item.student.name,
        studentSurname: item.student.surname,
        lessonId: item.lessonId,
        lessonName: item.lesson.name,
        teacherName: item.lesson.teacher.name,
        teacherSurname: item.lesson.teacher.surname,
        dateAtt: item.date,
        timeRangeLesson: `${item.lesson.startTime.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} - ${item.lesson.endTime.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`,
        present: item.present,
    }));

    // Seçili attendance'ı getir
    let selectedAttendances: AttendanceList[] = [];
    if (searchParams.studentId && !attendanceId) {
        const studentAttendances = await prisma.attendance.findMany({
            where: { studentId: searchParams.studentId },
            include: {
                lesson: { include: { teacher: true } },
                student: true,
            },
            orderBy: { date: "desc" }
        });

        selectedAttendances = studentAttendances.map(attendance => ({
            id: attendance.id,
            studentId: attendance.studentId,
            studentName: attendance.student.name,
            studentSurname: attendance.student.surname,
            lessonId: attendance.lessonId,
            lessonName: attendance.lesson.name,
            teacherName: attendance.lesson.teacher.name,
            teacherSurname: attendance.lesson.teacher.surname,
            dateAtt: attendance.date,
            timeRangeLesson: `${attendance.lesson.startTime.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })} - ${attendance.lesson.endTime.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" })}`,
            present: attendance.present,
        }));
    }


    // Modal kapatma URL'i oluştur
    const closeModalParams = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
        if (value !== undefined && key !== 'attendanceId') {
            closeModalParams.set(key, value);
        }
    });
    const closeModalUrl = `/list/attendances${closeModalParams.toString() ? `?${closeModalParams.toString()}` : ''}`;

    return (
        <div className="bg-white p-4 rounded-md flex-1 m-4 mt-0">
            <div className="flex items-center justify-between">
                <h1 className="hidden md:block text-lg font-semibold">All Attendance Records</h1>
                <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                    <TableSearch />
                    <div className="flex items-center gap-4 self-end">
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-bYellow">
                            <Image src="/filter.png" alt="" width={14} height={14} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full bg-bYellow">
                            <Image src="/sort.png" alt="" width={14} height={14} />
                        </button>
                        {(role === "admin" || role === "teacher") && (
                            <FormContainer table="attendance" type="create" />
                        )}
                    </div>
                </div>
            </div>

            <Table columns={columns} renderRow={renderRow} data={data} />
            <Pagination page={p} count={count} />
            {/* Attendance Detail Overlay - Server Side Modal */}
            {selectedAttendances.length > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg max-w-3xl w-full max-h-[80vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-6 border-b border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-800">Attendance Records of {selectedAttendances[0].studentName} {selectedAttendances[0].studentSurname}</h2>
                        <Link
                            href={closeModalUrl}
                            className="text-gray-400 hover:text-gray-600 text-2xl font-light"
                        >⊗</Link>
                    </div>
                    <div className="flex flex-wrap gap-4">
                            {selectedAttendances.map((att) => (
                            <div key={att.id} className="fw-full md:w-[48%]">
                                    <div className="border-b p-4 rounded shadow">
                                        <p className="font-sm text-gray-600"><span className="font-semibold text-gray-800">Lesson:</span> {att.lessonName}</p>
                                        <p className="font-sm text-gray-600"><span className="font-semibold text-gray-800">Teacher:</span> {att.teacherName} {att.teacherSurname}</p>
                                        <p className="font-sm text-gray-600"><span className="font-semibold text-gray-800">Date:</span> {new Intl.DateTimeFormat("tr-TR").format(att.dateAtt)}</p>
                                        <p className="font-sm text-gray-600"><span className="font-semibold text-gray-800">Time Range:</span> {att.timeRangeLesson}</p>
                                        <p className="font-sm text-gray-600"><span className="font-semibold text-gray-800">Present:</span> {att.present ? "✅" : "❌"}</p>
                                    </div>
                            </div>
                            ))}
                    </div>
                    <div className="p-4 border-t">
                        <Link href={closeModalUrl} className="block w-full bg-purple-600 text-white py-2 px-4 rounded-md hover:bg-purple-500 transition-colors text-center font-semibold shadow-sm">Close</Link>
                    </div>
                </div>
            </div>
        )}
        </div>
    );
};

export default AttendanceListPage;
