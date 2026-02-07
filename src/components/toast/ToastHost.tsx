import { useMemo } from "react";
import "./ToastHost.css";
import type { ToastItem, ToastTone } from "./toastTypes";

function iconFor(tone: ToastTone) {
  switch (tone) {
    case "success":
      return "✓";
    case "warning":
      return "!";
    case "error":
      return "✕";
    case "oracle":
      return "✦";
    default:
      return "i";
  }
}

export default function ToastHost(props: {
  items: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  const items = useMemo(() => props.items.slice(0, 4), [props.items]);

  return (
    <div className="toasts" aria-live="polite" aria-relevant="additions">
      {items.map((t) => (
        <div key={t.id} className={`toast toast--${t.tone}`}>
          <div className="toast__icon" aria-hidden>
            {iconFor(t.tone)}
          </div>

          <div className="toast__body">
            {t.title && <div className="toast__title">{t.title}</div>}
            <div className="toast__msg">{t.message}</div>
          </div>

          <button
            className="toast__x"
            type="button"
            onClick={() => props.onDismiss(t.id)}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
