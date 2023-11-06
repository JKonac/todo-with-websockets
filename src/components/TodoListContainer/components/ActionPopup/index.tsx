import { useState } from "react";

interface ActionPopupProps {
  title: string;
  callToAction: (arg: string) => void;
  onClose: () => void;
}

export default function ActionPopup({
  title,
  callToAction,
  onClose,
}: ActionPopupProps) {
  const [name, setName] = useState<string>("");
  return (
    <>
      <div className="bg-black opacity-20 left-0 top-0 w-screen h-screen absolute"></div>
      <div className="absolute w-[400px] h-fit p-8 rounded-md bg-white popupAnimation m-auto left-0 right-0 top-0 bottom-0">
        <div className="flex items-center justify-between mb-6">
          <p className="text-2xl font-medium">{title}</p>
          <button onClick={() => onClose()}>X</button>
        </div>
        <p className="text-sm mb-1">Name</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded "
        />
        <div className="flex justify-end mt-10">
          <button
            className={`font-semibold text-xs tracking-wider py-2 px-4 rounded border ${
              name?.length > 0
                ? "bg-blue-700 border-blue-700"
                : "bg-gray-700 border-gray-700"
            }]  hover:opacity-80 text-white uppercase`}
            onClick={() => callToAction(name)}
            disabled={name?.length === 0}
          >
            Add
          </button>
        </div>
      </div>
    </>
  );
}
