import TodoListColumn from "./components/TodoListColumn";

interface TodoListColumnsProps {
  data: {
    taskTitle: string;
    taskDone: Boolean;
    taskId: string;
  }[];
  toggleTodoItemHandler: (taskId: string) => void;
}

export default function TodoListColumns({
  data,
  toggleTodoItemHandler,
}: TodoListColumnsProps) {
  return (
    <div className="w-full grid grid-cols-2 gap-8">
      <TodoListColumn
        data={data.filter((item) => !item.taskDone)}
        toggleTodoItemHandler={toggleTodoItemHandler}
        title={"Active tasks"}
      />
      <TodoListColumn
        data={data.filter((item) => item.taskDone)}
        toggleTodoItemHandler={toggleTodoItemHandler}
        title={"Finished tasks"}
        status={"finished"}
      />
    </div>
  );
}
