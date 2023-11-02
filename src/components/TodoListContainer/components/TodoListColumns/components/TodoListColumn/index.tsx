import Image from "next/image";

interface TodoListColumnProps {
  data: {
    taskTitle: string;
    taskDone: Boolean;
    taskId: string;
  }[];
  toggleTodoItemHandler: (taskId: string) => void;
  title: string;
  status?: string;
}

export default function TodoListColumn({
  data,
  title,
  status = "",
  toggleTodoItemHandler,
}: TodoListColumnProps) {
  return (
    <div>
      <p className="mb-5 text-lg">{title}</p>
      <div className="col-span-1 grid gap-y-2">
        {data.map((mock, index) => {
          return (
            <div
              key={index}
              className={`flex rounded-md shadow-md border h-fit ${status === "finished" && "bg-gray-100"} border-blue-300 p-3 items-center transition-all ease-in duration-100`}
            >
              <div
                onClick={() => toggleTodoItemHandler(mock.taskId)}
                className={`w-[22px] h-[22px] ${status === "finished" && "bg-emerald-600"} border border-gray-500 rounded mr-2 cursor-pointer`}
              >
                <Image
                  src={"checkmark_icon.svg"}
                  alt="checkmark"
                  width={25}
                  height={25}
                />
              </div>
              <p className={`font-medium ${status === "finished" && "text-gray-500"}`}>{mock.taskTitle}</p>
              <div
                onClick={() => toggleTodoItemHandler(mock.taskId)}
                className={`p-1 ${status === "finished" ? "hover:bg-white" : "hover:bg-slate-100"} rounded cursor-pointer ml-auto`}
              >
                <Image
                  src={"delete_icon.svg"}
                  alt="delete"
                  width={23}
                  height={23}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
