import TodoListColumn from "./components/TodoListColumn";

interface TodoListColumnsProps {
  data: {
    taskTitle: string;
    taskDone: Boolean;
    taskId: string;
  }[];
  toggleTodoItemHandler: (taskId: string) => void;
  addTaskToTodoListHandler: (listID: string, taskTitle: string) => void;
  removeTaskFromTodoHandler: (listID: string, taskID: string) => void;
}

export default function TodoListColumns({
  data,
  toggleTodoItemHandler,
  addTaskToTodoListHandler,
  removeTaskFromTodoHandler,
}: TodoListColumnsProps) {
  return (
    <div className="w-full grid grid-cols-2 gap-8">
      <TodoListColumn
        data={data.filter((item) => !item.taskDone)}
        toggleTodoItemHandler={toggleTodoItemHandler}
        addTaskToTodoListHandler={addTaskToTodoListHandler}
        removeTaskFromTodoHandler={removeTaskFromTodoHandler}
        title={"Active tasks"}
      />
      <TodoListColumn
        data={data.filter((item) => item.taskDone)}
        toggleTodoItemHandler={toggleTodoItemHandler}
        addTaskToTodoListHandler={addTaskToTodoListHandler}
        removeTaskFromTodoHandler={removeTaskFromTodoHandler}
        title={"Finished tasks"}
        status={"finished"}
      />
    </div>
  );
}
