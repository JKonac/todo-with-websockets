import Image from "next/image";

export default function TodoListSideBar({
  todoListTitle,
  selectedTable,
}: {
  todoListTitle: string;
  selectedTable: { listID: string; name: string };
}) {
  const shareHandler = () => {
    navigator.clipboard.writeText(
      `localhost:3000/?listID=${selectedTable.listID}`
    );
  };
  return (
    <div className="min-w-[260px] border-r-[1px] mr-5 h-[300px] truncate">
      <p className="font-medium text-2xl">{todoListTitle}</p>
      <button onClick={() => shareHandler()} className="flex items-center border border-gray-300 hover:bg-gray-100 rounded p-2 text-sm mt-4">
        <Image src={"share_icon.svg"} alt="share" width={20} height={20} className="mr-2" /> Share list
      </button>
    </div>
  );
}
