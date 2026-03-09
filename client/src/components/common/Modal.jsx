function Modal({ open, onClose, title, children, className = 'max-w-2xl' }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/45 p-4" onClick={onClose}>
      <div
        className={`w-full ${className} rounded-2xl bg-white p-6 shadow-soft`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
          <button className="rounded p-2 text-slate-500 hover:bg-slate-100" onClick={onClose}>
            x
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;


