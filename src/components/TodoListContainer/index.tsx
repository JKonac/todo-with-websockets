import { useEffect, useState, useRef, useCallback } from "react";
import TodoListSideBar from "./components/TodoListSideBar";
import TodoListColumns from "./components/TodoListColumns";
import AWS from "aws-sdk";
import {
  updateTask,
  getItemsFromTodoList,
  addTaskToTodoList,
  deleteTaskFromTodoList,
} from "@/utils";

AWS.config.update({
  accessKeyId: "AKIASFTSXCKEDDKP5YOO",
  secretAccessKey: "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",
  region: "eu-north-1",
});

const URL = "wss://ik4z4c9pqa.execute-api.eu-north-1.amazonaws.com/production/";

export default function TodoListContainer() {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const socket = useRef<WebSocket | null>(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [todoListItems, setTodoListItems] = useState();

  const updateTaskHandler = (taskId: string) => {
    updateTask(taskId, dynamodb, setTodoListItems, socket);
  };

  const getItemsFromTodoListHandler = (listID: string): Promise<any> => {
    return getItemsFromTodoList(listID, dynamodb);
  };

  const addTaskToTodoListHandler = async (
    listID: string,
    taskTitle: string
  ) => {
    const newList = await addTaskToTodoList(listID, dynamodb, taskTitle);
    socket.current?.send(
      JSON.stringify({
        action: "sendPublic",
        message: newList,
      })
    );
  };

  const removeTaskFromTodoHandler = async (listID: string, taskID: string) => {
    const newList = await deleteTaskFromTodoList(listID, dynamodb, taskID);
    socket.current?.send(
      JSON.stringify({
        action: "sendPublic",
        message: newList,
      })
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await getItemsFromTodoListHandler("MyTodoList");
        setTodoListItems(response.Item.Tasks);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  const onSocketOpen = useCallback(() => {
    const names = "abcdefghijklmnopqrstuvw";
    const name =
      names[Math.floor(Math.random() * names.length)] +
      names[Math.floor(Math.random() * names.length)];
    console.log("SENDING NAME");
    socket.current?.send(JSON.stringify({ action: "setName", name }));
  }, []);

  const onSocketClose = useCallback(() => {
    setActiveUsers([]);
  }, []);

  const onSocketMessage = useCallback((dataStr: string) => {
    const data = JSON.parse(dataStr || "[{}]");
    console.log(data, dataStr);
    if (data?.users) {
      setActiveUsers(data.users);
    } else if (
      data?.todoList &&
      JSON.stringify(data?.todoList) !== JSON.stringify(todoListItems)
    ) {
      setTodoListItems(data.todoList);
    }
  }, []);

  const onConnect = useCallback(() => {
    if (socket.current?.readyState !== WebSocket.OPEN) {
      socket.current = new WebSocket(URL);
      socket.current.addEventListener("open", onSocketOpen);
      socket.current.addEventListener("close", onSocketClose);
      socket.current.addEventListener("message", (event) => {
        console.log("message", event, event.data);
        onSocketMessage(event.data);
      });
    }
  }, []);

  useEffect(() => {
    onConnect();
    return () => {
      socket.current?.close();
    };
  }, []);

  const handleTabClosing = () => {
    socket.current?.close();
  };

  useEffect(() => {
    window.addEventListener("unload", handleTabClosing);
    return () => {
      window.removeEventListener("unload", handleTabClosing);
    };
  });

  return (
    <div className="w-full">
      <div className="h-10 flex">
        {activeUsers?.map((user: { userId: string; userName: string }) => (
          <div className="w-7 h-7 flex justify-center items-center uppercase text-xs rounded-full border-2 border-green-500 mr-2">
            {user.userName}
          </div>
        ))}
      </div>
      {todoListItems && (
        <div className="flex w-full">
          <TodoListSideBar />
          <TodoListColumns
            data={todoListItems}
            toggleTodoItemHandler={updateTaskHandler}
            addTaskToTodoListHandler={addTaskToTodoListHandler}
            removeTaskFromTodoHandler={removeTaskFromTodoHandler}
          />
        </div>
      )}
    </div>
  );
}
