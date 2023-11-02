import { useEffect, useState, useRef, useCallback } from "react";
import TodoListSideBar from "./components/TodoListSideBar";
import TodoListColumns from "./components/TodoListColumns";
import AWS from "aws-sdk";
import { generateDynamoDBParams, generateUID } from "@/utils";
// import io from 'socket.io-client';
import { w3cwebsocket as WebSocketClient } from "websocket";
// const socket = io('http://localhost:8080');

AWS.config.update({
  accessKeyId: "AKIASFTSXCKEDDKP5YOO",
  secretAccessKey: "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",
  region: "eu-north-1",
});

const URL = "wss://ik4z4c9pqa.execute-api.eu-north-1.amazonaws.com/production/";

export default function TodoListContainer() {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const webSocketRef = useRef<WebSocket | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [todoListItems, setTodoListItems] = useState();
  // async function createToDoList(listID: string, name: string): Promise<void> {
  //   const params = {
  //     TableName: "ubiquiti-todo",
  //     Item: {
  //       ListID: listID,
  //       Name: name,
  //       // Add more attributes as needed for your to-do lists
  //     },
  //   };

  //   try {
  //     await dynamodb.put(params).promise();
  //     console.log("To-Do List created successfully");
  //   } catch (error) {
  //     console.error("Error creating to-do list:", error);
  //   }
  // }

  async function pushTaskToList(
    listID: string,
    taskTitle: string
  ): Promise<void> {
    const params = generateDynamoDBParams(listID);
    try {
      // Get the current item from DynamoDB
      const result = await dynamodb.get(params).promise();
      const existingTasks = result.Item?.Tasks || [];

      const newTask = {
        taskId: generateUID(),
        taskTitle,
        taskDone: false,
      };

      const updatedTasks = existingTasks.concat(newTask);
      const updateParams = {
        TableName: "ubiquiti-todo",
        Key: {
          ListID: listID,
        },
        UpdateExpression: "SET Tasks = :tasks",
        ExpressionAttributeValues: {
          ":tasks": updatedTasks,
        },
      };
      await dynamodb.update(updateParams).promise();
      console.log("Task added to the list:", taskTitle);
    } catch (error) {
      console.error("Error adding task to the list:", error);
    }
  }

  async function updateTask(taskId: string): Promise<void> {
    const params = generateDynamoDBParams("MyTodoList");
    try {
      // Get the current item from DynamoDB
      const result = await dynamodb.get(params).promise();
      const existingTasks = result.Item?.Tasks || [];
      console.log(existingTasks);
      const index = existingTasks.findIndex(
        (item: { taskId: string }) => item.taskId === taskId
      );
      console.log("FOUND INDEX", index);
      existingTasks[index].taskDone = !existingTasks[index].taskDone;
      setTodoListItems(existingTasks);

      const updatedTasks = existingTasks;
      const updateParams = {
        TableName: "ubiquiti-todo",
        Key: {
          ListID: "MyTodoList",
        },
        UpdateExpression: "SET Tasks = :tasks",
        ExpressionAttributeValues: {
          ":tasks": updatedTasks,
        },
      };
      await dynamodb.update(updateParams).promise();
      console.log("Updated task:", taskId);
      socket.current?.send(
        JSON.stringify({
          action: "sendPublic",
          message: updatedTasks,
        })
      );
    } catch (error) {
      console.error("Error adding task to the list:", error);
    }
  }

  async function getItemsFromTodoList(listID: string): Promise<any> {
    try {
      const params = generateDynamoDBParams(listID);
      const result = await dynamodb.get(params).promise();
      console.log(result);
      // console.log("Items for ListID:", listID, " - Data:", result.Item);
      return result;
    } catch (error) {
      console.error("Error getting items:", error);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      const response = await getItemsFromTodoList("MyTodoList");
      console.log("RESULTS", response.Item.Tasks);
      setTodoListItems(response.Item.Tasks);
    };
    fetchData();
  }, []);

  const onSocketOpen = useCallback(() => {
    setIsConnected(true);
    const names = "abcdefghijklmnopqrstuvw";
    const name =
      names[Math.floor(Math.random() * names.length)] +
      names[Math.floor(Math.random() * names.length)];
    socket.current?.send(JSON.stringify({ action: "setName", name }));
  }, []);

  const onSocketClose = useCallback(() => {
    setActiveUsers([]);
    setIsConnected(false);
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

  // const onSendPrivateMessage = useCallback((to: string) => {
  //   const message = prompt("Enter private message for " + to);
  //   socket.current?.send(
  //     JSON.stringify({
  //       action: "sendPrivate",
  //       message,
  //       to,
  //     })
  //   );
  // }, []);

  const onSendPublicMessage = useCallback(() => {
    // const message = prompt("Enter public message");
    socket.current?.send(
      JSON.stringify({
        action: "sendPublic",
        message: todoListItems,
      })
    );
  }, [todoListItems]);

  // useEffect(() => {
  //   if (isConnected) {
  //     // onSendPublicMessage();
  //     socket.current?.send(
  //       JSON.stringify({
  //         action: "sendPublic",
  //         message: todoListItems,
  //       })
  //     );
  //   }
  // }, [todoListItems]);

  // const onDisconnect = useCallback(() => {
  //   if (isConnected) {
  //     socket.current?.close();
  //   }
  // }, [isConnected]);

  // const toggleTodoItemHandler = (id: number) => {
  //   const newArr = [...todoListItems];
  //   const index = newArr.findIndex((item) => item.taskId === id);
  //   newArr[index].taskDone = !newArr[index].taskDone;
  //   setTodoListItems(newArr);
  // };

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
            toggleTodoItemHandler={updateTask}
          />
        </div>
      )}
    </div>
  );
}
