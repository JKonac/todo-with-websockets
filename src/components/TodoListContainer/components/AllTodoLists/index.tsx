import Image from "next/image";

interface AllTodoListsProps {
  allTodoLists: TodoList[];
  selectedTable: {
    name: string;
    listID: string;
  };
  setSelectedTable: (val: TodoList) => void;
  setShowAddTodoListPopup: (val: boolean) => void;
  updateSelectedTableRef: (listID: string) => void;
}

interface TodoList {
  name: string;
  listID: string;
}

// Move outside todolist container and update selectedTable via context or similar
export default function AllTodoLists({
  allTodoLists,
  setShowAddTodoListPopup,
  selectedTable,
  updateSelectedTableRef,
  setSelectedTable,
}: AllTodoListsProps) {
  return (
    <div className="w-[250px] min-w-[250px] h-fit pr-12">
      <div className="bg-gray-100 p-3 rounded">
        <div className="flex justify-between">
          <p className="font-medium">Todolists</p>
          <button className="" onClick={() => setShowAddTodoListPopup(true)}>
            <Image src={"add_icon.svg"} alt="add" width={25} height={25} />
          </button>
        </div>
        <div className="border-b border-gray-300 my-2"></div>
        <div className="grid grid-cols-1 gap-y-2">
          {allTodoLists?.map((todoList: TodoList) => (
            <div
              className={`text-sm col-span-1 hover:bg-white p-2 rounded cursor-pointer w-full ${
                todoList.listID === selectedTable.listID && "bg-white"
              }`}
              onClick={() => {
                setSelectedTable(todoList);
                updateSelectedTableRef(todoList.listID);
              }}
            >
              <p
                className={`
                  ${todoList.listID === selectedTable.listID && "font-medium"}
                `}
              >
                {todoList.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
