interface TodoListColumnProps {
  data: {
    title: string;
    taskDone: Boolean;
    id: number;
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
            className="flex rounded-md shadow-md border border-blue-300 p-3 items-center justify-between"
          >
            <p className="font-medium">{mock.title}</p>
            <div
              onClick={() => toggleTodoItemHandler(mock.id)}
              className="w-5 h-5 border border-gray-800 rounded"
            ></div>
          </div>
        );
      })}
    </>
  );
}
