import { useState } from "react";
import TodoListSideBar from "./components/TodoListSideBar";
import TodoListColumns from "./components/TodoListColumns";
import { TodoItemType } from "@/utils";
import AWS from "aws-sdk";

AWS.config.update({
  accessKeyId: "AKIASFTSXCKEDDKP5YOO",
  secretAccessKey: "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",
  region: "eu-north-1",
});

export default function TodoListContainer() {
  const dynamodb = new AWS.DynamoDB.DocumentClient();

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

  async function pushTaskToList(listID: string, task: string): Promise<void> {
    const params = {
      TableName: "ubiquiti-todo",
      Key: {
        ListID: listID,
      },
    };

    try {
      // Get the current item from DynamoDB
      const result = await dynamodb.get(params).promise();
      const existingTasks = result.Item?.Tasks || [];
      const updatedTasks = existingTasks.concat(task);

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
      console.log("Task added to the list:", task);
    } catch (error) {
      console.error("Error adding task to the list:", error);
    }
  }

  async function getItemsFromTodoList(listID: string): Promise<void> {
    const params = {
      TableName: "ubiquiti-todo",
      Key: {
        ListID: listID,
      },
    };

    try {
      const result = await dynamodb.get(params).promise();
      console.log("Items for ListID:", listID, " - Data:", result.Item);
    } catch (error) {
      console.error("Error getting items:", error);
    }
  }

  const [mockData, setMockData] = useState([
    { title: "test", taskDone: false, taskId: 0 },
    { title: "test1", taskDone: false, taskId: 1 },
    { title: "test2", taskDone: true, taskId: 2 },
    { title: "test3", taskDone: false, taskId: 3 },
    { title: "test4", taskDone: false, taskId: 4 },
    { title: "test5", taskDone: false, taskId: 5 },
    { title: "test6", taskDone: true, taskId: 6 },
    { title: "test7", taskDone: true, taskId: 7 },
  ]);

  const toggleTodoItemHandler = (id: number) => {
    const newArr = [...mockData];
    const index = newArr.findIndex((item) => item.taskId === id);
    newArr[index].taskDone = !newArr[index].taskDone;
    setMockData(newArr);
  };

  return (
    <>
      {/* <button onClick={() => createToDoList("MyTodoList", "MyTodoList")}>HEJ</button> */}
      <button onClick={() => getItemsFromTodoList("MyTodoList")}>Get</button>
      <button
        onClick={() =>
          pushTaskToList("MyTodoList", `Hello ${Math.random() * 100}`)
        }
      >
        push item
      </button>
      <TodoListSideBar />
      <TodoListColumns
        data={mockData}
        toggleTodoItemHandler={toggleTodoItemHandler}
      />
    </>
  );
}
