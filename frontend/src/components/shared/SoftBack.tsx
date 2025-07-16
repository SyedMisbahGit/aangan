import { useNavigate } from "react-router-dom";

export default function SoftBack() {
  const nav = useNavigate();
  return (
    <button
      onClick={() => nav(-1)}
      className="fixed left-3 top-3 z-50 rounded-full bg-[#ffffffcc] backdrop-blur px-3 py-1 text-sm shadow"
    >
      ← Back
    </button>
  );
} 