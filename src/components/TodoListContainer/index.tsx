import { useEffect, useState } from "react";
import TodoListSideBar from "./components/TodoListSideBar";
import TodoListColumns from "./components/TodoListColumns";
import AWS from "aws-sdk";
import { generateDynamoDBParams, generateUID } from "@/utils";

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
    } catch (error) {
      console.error("Error adding task to the list:", error);
    }
  }

  const [todoListItems, setTodoListItems] = useState();

  async function getItemsFromTodoList(listID: string): Promise<any> {
    try {
      const params = generateDynamoDBParams(listID);
      const result = await dynamodb.get(params).promise();
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
  // const toggleTodoItemHandler = (id: number) => {
  //   const newArr = [...todoListItems];
  //   const index = newArr.findIndex((item) => item.taskId === id);
  //   newArr[index].taskDone = !newArr[index].taskDone;
  //   setTodoListItems(newArr);
  // };

  return (
    <>
      {/* <button onClick={() => createToDoList("MyTodoList", "MyTodoList")}>HEJ</button> */}
      <button
        onClick={() =>
          pushTaskToList("MyTodoList", `Hello ${Math.random() * 100}`)
        }
      >
        push item
      </button>
      {todoListItems && (
        <>
          <TodoListSideBar />
          <TodoListColumns
            data={todoListItems}
            toggleTodoItemHandler={updateTask}
          />
        </>
      )}
    </>
  );
}
