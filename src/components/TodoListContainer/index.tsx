import { useEffect, useState, useRef, useCallback } from "react";
import TodoListSideBar from "./components/TodoListSideBar";
import TodoListColumns from "./components/TodoListColumns";
import AWS from "aws-sdk";
import {
  updateTask,
  getItemsFromTodoList,
  addTaskToTodoList,
  deleteTaskFromTodoList,
  createToDoList,
  generateUID,
} from "@/utils";
import ActionPopup from "./components/ActionPopup";

AWS.config.update({
  accessKeyId: "AKIASFTSXCKEDDKP5YOO",
  secretAccessKey: "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",
  region: "eu-north-1",
});

const URL = "wss://ik4z4c9pqa.execute-api.eu-north-1.amazonaws.com/production/";

export default function TodoListContainer() {
  const dynamodb = new AWS.DynamoDB.DocumentClient();
  const socket = useRef<WebSocket | null>(null);
  const selectedTableRef = useRef<string>("MyTodoList");
  const [loaded, setLoaded] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState([]);
  const [todoListItems, setTodoListItems] = useState();
  const [allTodoLists, setAllTodoLists] = useState<
    { name: string; listID: string }[]
  >([]);
  const [showAddTodoListPopup, setShowAddTodoListPopup] = useState(false);
  const [selectedTable, setSelectedTable] = useState({
    name: "MyTodoList",
    listID: "MyTodoList",
  });

  const updateTaskHandler = (taskId: string) => {
    updateTask(
      taskId,
      dynamodb,
      setTodoListItems,
      socket,
      selectedTable.listID
    );
  };

  const getItemsFromTodoListHandler = (listID: string): Promise<any> => {
    return getItemsFromTodoList(listID, dynamodb);
  };

  const addTaskToTodoListHandler = async (
    listID: string,
    taskTitle: string
  ) => {
    const newList = await addTaskToTodoList(
      selectedTable.listID,
      dynamodb,
      taskTitle
    );
    socket.current?.send(
      JSON.stringify({
        action: "sendPublic",
        message: newList,
      })
    );
  };

  const createToDoListHandler = async (todoListName: string) => {
    try {
      const newId = generateUID();
      const response = await createToDoList(newId, dynamodb, todoListName);
      setAllTodoLists((prev) => [...prev, response]);
    } catch (err) {
      console.log("Couldn't create new todo list");
    }
  };

  const removeTaskFromTodoHandler = async (listID: string, taskID: string) => {
    const newList = await deleteTaskFromTodoList(
      selectedTable.listID,
      dynamodb,
      taskID
    );
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
        const response = await getItemsFromTodoListHandler(
          selectedTable.listID
        );
        await scanTables();
        setTodoListItems(response.Item.Tasks);
        setLoaded(true);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    setLoaded(() => false);
    const fetchData = async () => {
      try {
        const response = await getItemsFromTodoListHandler(
          selectedTable.listID
        );
        await scanTables();
        setTodoListItems(response.Item.Tasks);
        setLoaded(true);
      } catch (err) {
        console.log(err);
      }
    };
    fetchData();
  }, [selectedTable]);

  const onSocketOpen = () => {
    const names = "abcdefghijklmnopqrstuvw";
    const name =
      names[Math.floor(Math.random() * names.length)] +
      names[Math.floor(Math.random() * names.length)];
    socket.current?.send(JSON.stringify({ action: "setName", name }));
  };

  const onSocketClose = () => {
    setActiveUsers([]);
  };

  const onSocketMessage = (dataStr: string) => {
    const data = JSON.parse(dataStr || "[{}]");
    if (data?.users) {
      setActiveUsers(data.users);
    } else if (
      data?.todoList &&
      JSON.stringify(data?.todoList) !== JSON.stringify(todoListItems) &&
      data.listID === selectedTableRef.current
    ) {
      setTodoListItems(data.todoList);
    }
  };

  const onConnect = () => {
    if (socket.current?.readyState !== WebSocket.OPEN) {
      socket.current = new WebSocket(URL);
      socket.current.addEventListener("open", onSocketOpen);
      socket.current.addEventListener("close", onSocketClose);
      socket.current.addEventListener("message", (event) => {
        onSocketMessage(event.data);
      });
    }
  };

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

  const scanTables = async () => {
    let topLevelKeys: { listID: string; name: string }[] = [];
    await dynamodb.scan({ TableName: "ubiquiti-todo" }, (error, data) => {
      if (error) {
        console.error("Error scanning DynamoDB table:", error);
      } else {
        data.Items?.forEach((item) => {
          topLevelKeys.push({ listID: item.ListID, name: item.Name });
        });
        setAllTodoLists(topLevelKeys);
      }
    });
  };

  return (
    <>
      <div className="flex w-full">
        <div className="w-1/5 h-fit pr-12">
          <div className="bg-gray-100 p-3 rounded">
            <div className="flex justify-between">
              <p className="font-medium">Todolists</p>
              <button
                className=""
                onClick={() => setShowAddTodoListPopup(true)}
              >
                add
              </button>
            </div>
            <div className="border-b border-gray-300 my-2"></div>
            <div className="grid grid-cols-1 gap-y-2">
              {allTodoLists?.map(
                (todoList: { name: string; listID: string }) => (
                  <div
                    className="text-sm col-span-1"
                    onClick={() => {
                      setSelectedTable(todoList);
                      selectedTableRef.current = todoList.listID;
                    }}
                  >
                    {todoList.name}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
        <div className="w-4/5 mt-12">
          <div className="h-10 flex">
            {activeUsers?.map((user: { userId: string; userName: string }) => (
              <div className="w-7 h-7 flex justify-center items-center uppercase text-xs rounded-full border-2 border-green-500 mr-2">
                {user.userName}
              </div>
            ))}
          </div>
          {loaded && (
            <div className="flex w-full">
              <TodoListSideBar todoListTitle={selectedTable.name} />
              <TodoListColumns
                data={todoListItems || []}
                toggleTodoItemHandler={updateTaskHandler}
                addTaskToTodoListHandler={addTaskToTodoListHandler}
                removeTaskFromTodoHandler={removeTaskFromTodoHandler}
                selectedTable={selectedTable.listID}
              />
            </div>
          )}
        </div>
      </div>
      {showAddTodoListPopup && (
        <ActionPopup
          title={"Add new todo list"}
          callToAction={createToDoListHandler}
        />
      )}
    </>
  );
}
