import { XMarkIcon } from "@heroicons/react/24/outline";

const Modal = ({ title, onClose, children, icon }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[600px] max-h-[85vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between bg-amazonclone text-white px-6 py-4 rounded-t-lg sticky top-0">
          <div className="flex items-center gap-2 text-lg xl:text-xl font-semibold">
            {icon && <span>{icon}</span>}
            {title}
          </div>
          <button onClick={onClose} className="hover:text-orange-400">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
