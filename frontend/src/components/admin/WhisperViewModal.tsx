import React, { useEffect, useState } from "react";
import axios from "axios";

interface Props {
  whisperId: string;
  open: boolean;
  onClose: () => void;
}

export const WhisperViewModal: React.FC<Props> = ({ whisperId, open, onClose }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const jwt = localStorage.getItem("admin_jwt");

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    axios.get(`/api/whispers/${whisperId}`, {
      headers: { Authorization: `Bearer ${jwt}` },
    })
      .then(res => setData(res.data))
      .catch(() => setError("Failed to fetch whisper details"))
      .finally(() => setLoading(false));
    // eslint-disable-next-line
  }, [whisperId, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>&times;</button>
        <h2 className="text-lg font-semibold mb-4">Whisper Details</h2>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : data ? (
          <div className="space-y-2">
            <div><span className="font-semibold">ID:</span> {data.id}</div>
            <div><span className="font-semibold">Content:</span> {data.content}</div>
            <div><span className="font-semibold">Emotion:</span> {data.emotion}</div>
            <div><span className="font-semibold">Zone:</span> {data.zone}</div>
            <div><span className="font-semibold">Created:</span> {new Date(data.created_at).toLocaleString()}</div>
            <div><span className="font-semibold">User:</span> {data.guest_id}</div>
            {data.is_ai_generated && <div className="text-xs text-blue-600">AI Generated</div>}
          </div>
        ) : null}
      </div>
    </div>
  );
}; 