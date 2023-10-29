"use client";
import TodoListContainer from "./../components/TodoListContainer";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 w-full">
      <div className="w-full h-10 max-w-6xl flex">
        <TodoListContainer />
      </div>
    </main>
  );
}
