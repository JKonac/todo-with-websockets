import { useState } from "react";

interface ActionPopupProps {
  title: string;
  callToAction: (name: string) => void;
}

export default function ActionPopup({ title, callToAction }: ActionPopupProps) {
  const [name, setName] = useState<string>("");
  return (
    <>
      <div className="bg-black opacity-20 left-0 top-0 w-screen h-screen absolute"></div>
      <div className="absolute w-[400px] h-fit p-8 rounded-md bg-white popupAnimation m-auto left-0 right-0 top-0 bottom-0">
        <p className="text-2xl font-medium mb-6">{title}</p>
        <p className="text-sm mb-1">Name</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded "
        />
        <div className="flex justify-between mt-10">
          <button className="font-semibold text-xs tracking-wider py-2 px-4 rounded border border-gray-500 hover:opacity-80 uppercase">
            Cancel
          </button>
          <button
            className="font-semibold text-xs tracking-wider py-2 px-4 rounded border border-blue-700 bg-blue-700 hover:opacity-80 text-white uppercase"
            onClick={() => callToAction(name)}
          >
            Add
          </button>
        </div>
      </div>
    </>
  );
}
