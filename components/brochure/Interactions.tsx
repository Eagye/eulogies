 import { MemorialInteractions } from "@/types/interactions";

type Props = {
  interactions: MemorialInteractions;
  onLightCandle: () => void;
  onSubmitMessage: () => void;
  name: string;
  setName: (v: string) => void;
  message: string;
  setMessage: (v: string) => void;
  messageType: "condolence" | "tribute";
  setMessageType: (v: "condolence" | "tribute") => void;
};

export default function Interactions({
  interactions,
  onLightCandle,
  onSubmitMessage,
  name,
  setName,
  message,
  setMessage,
  messageType,
  setMessageType,
}: Props) {
  return (
    <div className="border-t pt-8 space-y-6">
      <div className="text-center">
        <button
          onClick={onLightCandle}
          className="px-6 py-2 bg-gray-900 text-white rounded-lg"
        >
          🕯️ Light a candle ({interactions.candles.length})
        </button>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-3">
        <h3 className="font-semibold">Leave a message</h3>

        <input
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border rounded p-2"
        />

        <select
          value={messageType}
          onChange={(e) =>
            setMessageType(e.target.value as "condolence" | "tribute")
          }
          className="w-full border rounded p-2"
        >
          <option value="condolence">Condolence</option>
          <option value="tribute">Tribute</option>
        </select>

        <textarea
          placeholder="Your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="w-full border rounded p-2"
          rows={3}
        />

        <button
          onClick={onSubmitMessage}
          className="bg-gray-900 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>

      <div className="space-y-4">
        {interactions.messages
          .filter((m) => m.approved)
          .map((m) => (
            <div
              key={m.id}
              className="border rounded p-3 bg-white"
            >
              <p className="text-sm font-semibold">
                {m.name} · {m.type.charAt(0).toUpperCase() + m.type.slice(1)}
              </p>
              <p className="text-sm text-gray-700">
                {m.message}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}
