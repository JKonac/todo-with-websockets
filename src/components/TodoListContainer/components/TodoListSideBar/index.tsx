export default function TodoListSideBar({
  todoListTitle,
}: {
  todoListTitle: string;
}) {
  return (
    <div className="min-w-[260px] border-r-[1px] mr-5 h-[300px]">
      <p className="font-medium text-2xl">{todoListTitle}</p>
    </div>
  );
}
