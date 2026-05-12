import { type ReactNode } from "react";
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
}
export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
}: ModalProps) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-8 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl bg-surface-container-lowest shadow-2xl shadow-black/20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-outline-variant px-6 py-5">
          <div>
            <h3 className="font-headline text-lg font-extrabold text-on-surface">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1 text-xs text-on-surface-variant">{subtitle}</p>
            )}
          </div>
          <button
            aria-label="Cerrar modal"
            className="rounded-lg p-2 text-on-surface-variant transition-colors hover:bg-surface-container-low hover:text-on-surface cursor-pointer"
            onClick={onClose}
            type="button"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
