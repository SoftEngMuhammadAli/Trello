function Modal({ open, onClose, title, children, className = 'max-w-2xl' }) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto bg-slate-950/60 p-2 sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        className={`modal-enter max-h-[calc(100vh-1rem)] w-full overflow-y-auto custom-scrollbar ${className} rounded-2xl border border-app bg-panel p-4 shadow-soft sm:max-h-[calc(100vh-2rem)] sm:p-6`}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between gap-3 border-b border-app pb-3">
          <h2 className="text-lg font-black tracking-tight text-app">{title}</h2>
          <button className="rounded-lg border border-app bg-panel-soft px-3 py-1.5 text-sm text-app-muted hover:bg-hover hover:text-app" onClick={onClose}>
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default Modal;
