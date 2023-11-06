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
import { useSearchParams } from "next/navigation";
import ActiveUsers from "./components/ActiveUsers";
import AllTodoLists from "./components/AllTodoLists";

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
  const [showAddTaskPopup, setShowAddTaskPopup] = useState(false);
  const [selectedTable, setSelectedTable] = useState({
    name: "MyTodoList",
    listID: "MyTodoList",
  });

  const searchParams = useSearchParams();

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

  const addTaskToTodoListHandler = async (taskTitle: string) => {
    try {
      const newList = await addTaskToTodoList(
        selectedTable.listID,
        dynamodb,
        taskTitle
      );
      console.log("newList", newList);
      socket.current?.send(
        JSON.stringify({
          action: "sendPublic",
          message: { updatedTasks: newList, listID: selectedTable.listID },
        })
      );
      setShowAddTaskPopup(false);
    } catch (err) {
      console.log(err);
    }
  };

  const createToDoListHandler = async (todoListName: string) => {
    try {
      const newId = generateUID();
      const response = await createToDoList(newId, dynamodb, todoListName);
      setAllTodoLists((prev) => [
        ...prev,
        response as { name: string; listID: string },
      ]);
      setShowAddTodoListPopup(false);
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
        message: { updatedTasks: newList, listID: selectedTable.listID },
      })
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const listIDFromURL = searchParams.get("listID");
        const response = await getItemsFromTodoListHandler(
          listIDFromURL || selectedTable.listID
        );
        if (listIDFromURL) {
          const { ListID, Name } = response.Item;
          setSelectedTable({ listID: ListID, name: Name });
          selectedTableRef.current = listIDFromURL;
        }
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

  const onSocketOpen = useCallback(() => {
    const names = "abcdefghijklmnopqrstuvw";
    const name =
      names[Math.floor(Math.random() * names.length)] +
      names[Math.floor(Math.random() * names.length)];
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      socket.current.send(JSON.stringify({ action: "setName", name }));
    }
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
      JSON.stringify(data?.todoList) !== JSON.stringify(todoListItems) &&
      data.listID === selectedTableRef.current
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
        onSocketMessage(event.data);
      });
    }
  }, []);

  useEffect(() => {
    onConnect();
    if (socket.current && socket.current.readyState === WebSocket.OPEN) {
      // Close the WebSocket connection if it's open
      socket.current.close();
    }
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

  const updateSelectedTableRef = (newVal: string) => {
    selectedTableRef.current = newVal
  }

  return (
    <>
      <div className="flex w-full">
        <AllTodoLists
          allTodoLists={allTodoLists}
          setShowAddTodoListPopup={setShowAddTodoListPopup}
          selectedTable={selectedTable}
          updateSelectedTableRef={updateSelectedTableRef}
          setSelectedTable={setSelectedTable}
        />
        <div className="w-full mt-12">
          {activeUsers && <ActiveUsers activeUsers={activeUsers} />}
          {loaded && (
            <div className="flex w-full min-w-[700px]">
              <TodoListSideBar
                todoListTitle={selectedTable.name}
                selectedTable={selectedTable}
              />
              <TodoListColumns
                data={todoListItems || []}
                toggleTodoItemHandler={updateTaskHandler}
                addTaskToTodoListHandler={addTaskToTodoListHandler}
                removeTaskFromTodoHandler={removeTaskFromTodoHandler}
                selectedTable={selectedTable.listID}
                setShowAddTaskPopup={setShowAddTaskPopup}
              />
            </div>
          )}
        </div>
      </div>
      {showAddTodoListPopup && (
        <ActionPopup
          title={"Add new todo list"}
          callToAction={createToDoListHandler}
          onClose={() => setShowAddTodoListPopup(false)}
        />
      )}
      {showAddTaskPopup && (
        <ActionPopup
          title={"Add new task"}
          callToAction={addTaskToTodoListHandler}
          onClose={() => setShowAddTaskPopup(false)}
        />
      )}
    </>
  );
}
