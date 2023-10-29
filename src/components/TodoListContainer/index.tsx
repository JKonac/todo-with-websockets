import { useState } from "react";
import TodoListSideBar from "./components/TodoListSideBar";
import TodoListColumns from "./components/TodoListColumns";
import { TodoItemType } from "@/utils";

export default function TodoListContainer() {
  const [mockData, setMockData] = useState([
    { title: "test", taskDone: false, id: 0 },
    { title: "test1", taskDone: false, id: 1 },
    { title: "test2", taskDone: true, id: 2 },
    { title: "test3", taskDone: false, id: 3 },
    { title: "test4", taskDone: false, id: 4 },
    { title: "test5", taskDone: false, id: 5 },
    { title: "test6", taskDone: true, id: 6 },
    { title: "test7", taskDone: true, id: 7 },
  ]);

  const toggleTodoItemHandler = (id: number) => {
    const newArr = [...mockData];
    const index = newArr.findIndex((item) => item.id === id);
    console.log("INDEX ", index);
    newArr[index].taskDone = !newArr[index].taskDone;
    setMockData(newArr);
  };

  return (
    <>
      <TodoListSideBar />
      <TodoListColumns data={mockData} toggleTodoItemHandler={toggleTodoItemHandler}  />
    </>
  );
}
