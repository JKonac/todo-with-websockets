interface TodoListColumnProps {
  data: {
    title: string;
    taskDone: Boolean;
    taskId: number;
  }[];
  toggleTodoItemHandler: (id: number) => void;
}

export default function TodoListColumn({
  data,
  toggleTodoItemHandler,
}: TodoListColumnProps) {
  return (
    <>
      {data.map((mock, index) => {
        return (
          <div
            key={index}
            className="flex rounded-md shadow-md border border-blue-300 p-3 items-center justify-between transition-all ease-in duration-100"
          >
            <p className="font-medium">{mock.title}</p>
            <div
              onClick={() => toggleTodoItemHandler(mock.taskId)}
              className="w-5 h-5 border border-gray-800 rounded"
            ></div>
          </div>
        );
      })}
    </>
  );
}