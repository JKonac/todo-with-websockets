import TodoListColumn from "./components/TodoListColumn";

interface TodoListColumnsProps {
  data: {
    title: string;
    taskDone: Boolean;
    id: number;
  }[];
  toggleTodoItemHandler: (id: number) => void;
}

export default function TodoListColumns({ data, toggleTodoItemHandler }: TodoListColumnsProps) {
  return (
    <div className="w-full flex">
      <div className="w-full grid gap-y-2 px-4">
        <p>Active tasks</p>
        <TodoListColumn data={data.filter((item) => !item.taskDone)} toggleTodoItemHandler={toggleTodoItemHandler} />
      </div>
      <div className="w-full px-4 grid gap-y-2">
        <p>Finished tasks</p>
        <TodoListColumn data={data.filter((item) => item.taskDone)} toggleTodoItemHandler={toggleTodoItemHandler} />
      </div>
    </div>
  );
}
