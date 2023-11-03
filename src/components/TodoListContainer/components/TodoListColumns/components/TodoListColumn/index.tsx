import Image from "next/image";

interface TodoListColumnProps {
  data: {
    taskTitle: string;
    taskDone: Boolean;
    taskId: string;
  }[];
  selectedTable: string,
  toggleTodoItemHandler: (taskId: string) => void;
  addTaskToTodoListHandler: (listID: string, taskTitle: string) => void;
  removeTaskFromTodoHandler: (listID: string, taskID: string) => void;
  title: string;
  status?: string;
}

export default function TodoListColumn({
  data,
  title,
  status = "default",
  selectedTable,
  toggleTodoItemHandler,
  addTaskToTodoListHandler,
  removeTaskFromTodoHandler,
}: TodoListColumnProps) {
  return (
    <div>
      <div className="flex items-center mb-5">
        <p className="text-lg font-medium">{title}</p>
        {status === "default" && (
          <button onClick={() => addTaskToTodoListHandler(selectedTable, "asd")}>
            add task
          </button>
        )}
      </div>
      <div className="col-span-1 grid gap-y-2">
        {data.map((mock, index) => {
          return (
            <div
              key={index}
              className={`flex rounded-md shadow-md border h-fit ${
                status === "finished"
                  ? "bg-gray-100 border-gray-200"
                  : "border-blue-300"
              }  p-3 items-center popupAnimation`}
            >
              <div
                onClick={() => toggleTodoItemHandler(mock.taskId)}
                className={`w-[22px] h-[22px] ${
                  status === "finished"
                    ? "bg-blue-600 border-blue-300"
                    : "border-gray-300 hover:bg-blue-100"
                } border border-gray-300 rounded mr-2 cursor-pointer transition duration-100`}
              >
                <Image
                  src={"checkmark_icon.svg"}
                  alt="checkmark"
                  width={25}
                  height={25}
                />
              </div>
              <p
                className={`font-medium ${
                  status === "finished" && "text-gray-500"
                }`}
              >
                {mock.taskTitle}
              </p>
              <div
                onClick={() =>
                  removeTaskFromTodoHandler(selectedTable, mock.taskId)
                }
                className={`p-1 ${
                  status === "finished"
                    ? "hover:bg-white"
                    : "hover:bg-slate-100"
                } rounded cursor-pointer ml-auto`}
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
