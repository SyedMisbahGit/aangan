import React from 'react';

interface ModalSoftBackProps {
  onClick: () => void;
}

export default function ModalSoftBack({ onClick }: ModalSoftBackProps) {
  return (
    <button
      onClick={onClick}
      className="absolute left-3 top-3 z-50 rounded-full bg-[#ffffffcc] backdrop-blur px-3 py-1 text-sm shadow"
    >
      ← Back
    </button>
  );
}
