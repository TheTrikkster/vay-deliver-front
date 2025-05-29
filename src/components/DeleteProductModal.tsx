interface DeleteProductModalProps {
  title: string;
  message: string;
  cancelText: string;
  confirmText: string;
  onClose: () => void;
  onConfirm: () => void;
  variant?: 'normal' | 'danger';
}

function DeleteProductModal({
  title,
  message,
  cancelText,
  confirmText,
  onClose,
  onConfirm,
  variant = 'normal',
}: DeleteProductModalProps) {
  return (
    <div className="px-4 md:px-0 fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 className="text-lg font-bold mb-4">{title}</h3>
        <p className={`mb-4 ${variant === 'danger' ? 'text-amber-500' : ''}`}>{message}</p>
        <div className="flex justify-center gap-2">
          <button
            className="flex-1 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button
            className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default DeleteProductModal;
