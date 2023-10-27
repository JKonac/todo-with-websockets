"use client";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const [mockData, setMockData] = useState([
    { title: "test", taskDone: false, id: 0 },
    { title: "test1", taskDone: false, id: 1 },
    { title: "test2", taskDone: true, id: 2 },
    { title: "test3", taskDone: false, id: 3 },
    { title: "test4", taskDone: false, id: 4 },
    { title: "test5", taskDone: false, id: 5 },
    { title: "test6", taskDone: true, id: 6 },
    { title: "test7", taskDone: true, id: 7 },
  ]);

  const toggleTodoItemHandler = (id: number) => {
    const newArr = [...mockData];
    const index = newArr.findIndex((item) => item.id === id);
    console.log("INDEX ", index);
    newArr[index].taskDone = !newArr[index].taskDone;
    setMockData(newArr);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24 max-w-6xl">
      <div className="w-full h-10 grid grid-cols-3">
        <div className="col-span-1">
          <p>title of todolist</p>
        </div>
        <div className="col-span-1 grid gap-y-2">
          {mockData
            .filter((item) => !item.taskDone)
            .map((mock, index) => {
              return (
                <div
                  key={index}
                  className="flex rounded-md shadow-md border border-blue-300 p-3 items-center justify-between"
                >
                  <p className="font-medium">{mock.title}</p>
                  <div
                    onClick={() => toggleTodoItemHandler(mock.id)}
                    className="w-5 h-5 border border-gray-800 rounded"
                  ></div>
                </div>
              );
            })}
        </div>
        <div className="col-span-1">
          {mockData
            .filter((item) => item.taskDone)
            .map((mock, index) => {
              return (
                <div
                  key={index}
                  className="flex rounded-md shadow-md border border-blue-300 p-3 items-center justify-between"
                >
                  <p className="font-medium">{mock.title}</p>
                  <div
                    onClick={() => toggleTodoItemHandler(mock.id)}
                    className={`w-5 h-5 border border-gray-800 rounded ${
                      mock.taskDone ? "bg-green-700" : "bg-white"
                    }`}
                  ></div>
                </div>
              );
            })}
        </div>
      </div>
    </main>
  );
}
