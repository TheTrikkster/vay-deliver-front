import React, { useState } from 'react';

interface AddTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (note: string) => void;
}

const AddTagModal: React.FC<AddTagModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [noteText, setNoteText] = useState('');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(noteText);
    setNoteText('');
    onClose();
  };

  const handleClose = () => {
    setNoteText('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-md">
        <h2 className="text-2xl font-medium mb-4">Новая заметка</h2>

        <textarea
          className="w-full border rounded-lg p-3 min-h-[100px] mb-4"
          placeholder="Введите текст заметки"
          value={noteText}
          onChange={e => setNoteText(e.target.value)}
        />

        <div className="flex gap-4">
          <button
            onClick={handleClose}
            className="flex-1 py-3 px-4 rounded-lg bg-gray-100 text-gray-900"
          >
            Отменить
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 px-4 rounded-lg bg-green-500 text-white"
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddTagModal;
