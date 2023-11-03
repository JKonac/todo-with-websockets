export type TodoItemType = {
  taskTitle: string;
  taskDone: boolean;
  taskId: string;
};

export const generateDynamoDBParams = (
  listId: string
): {
  TableName: string;
  Key: {
    ListID: string;
  };
} => {
  return {
    TableName: "ubiquiti-todo",
    Key: {
      ListID: listId,
    },
  };
};

export const generateUID = function () {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export async function createToDoList(
  listID: string,
  dynamodb: any,
  name: string
) {
  const params = {
    TableName: "ubiquiti-todo",
    Item: {
      ListID: listID,
      Name: name,
      Tasks: [],
      ActiveUsers: [],
      // Add more attributes as needed for your to-do lists
    },
  };

  try {
    await dynamodb.put(params).promise();
    console.log("To-Do List created successfully");
    return { listID: listID, name: name };
  } catch (error) {
    console.error("Error creating to-do list:", error);
  }
}

export async function updateTask(
  taskId: string,
  dynamodb: any,
  setTodoListItems: any,
  socket: any,
  selectedTable: string,
): Promise<void> {
  const params = generateDynamoDBParams(selectedTable);
  try {
    // Get the current item from DynamoDB
    const result = await dynamodb.get(params).promise();
    const existingTasks = result.Item?.Tasks || [];
    console.log(existingTasks, taskId);
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
        ListID: selectedTable,
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
        message: {updatedTasks, listID: selectedTable},
      })
    );
  } catch (error) {
    console.error("Error adding task to the list:", error);
  }
}

export async function getItemsFromTodoList(
  listID: string,
  dynamodb: any
): Promise<any> {
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

export async function deleteTaskFromTodoList(
  listID: string,
  dynamodb: any,
  taskID: string
): Promise<void> {
  const params = generateDynamoDBParams(listID);
  try {
    // Get the current item from DynamoDB
    const result = await dynamodb.get(params).promise();
    const existingTasks = result.Item?.Tasks || [];
    console.log(
      "ASDASD",
      taskID,
      existingTasks,
      existingTasks.filter((task: any) => task.taskId === taskID)
    );
    const newTasks = existingTasks.filter(
      (task: any) => task.taskId !== taskID
    );
    const updateParams = {
      TableName: "ubiquiti-todo",
      Key: {
        ListID: listID,
      },
      UpdateExpression: "SET Tasks = :tasks",
      ExpressionAttributeValues: {
        ":tasks": newTasks,
      },
    };
    await dynamodb.update(updateParams).promise();
    return newTasks;
  } catch (error) {
    console.error("Error removing task from the list:", error);
  }
}
export async function addTaskToTodoList(
  listID: string,
  dynamodb: any,
  taskTitle: string
): Promise<void> {
  const params = generateDynamoDBParams(listID);
  try {
    console.log(1, params)
    // Get the current item from DynamoDB
    const result = await dynamodb.get(params).promise();
    console.log(2)
    
    const existingTasks = result.Item?.Tasks || [];
    console.log(3)

    const newTask = {
      taskId: generateUID(),
      taskTitle,
      taskDone: false,
    };
    const updatedTasks = existingTasks.concat(newTask);
    console.log("HIT", existingTasks, updatedTasks)
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
    return updatedTasks;
    console.log("Task added to the list:", taskTitle);
  } catch (error) {
    console.error("Error adding task to the list:", error);
  }
}
