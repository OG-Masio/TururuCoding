import { useEffect } from "react";

export interface NoticeData {
  text: string;
  action?: { label: string; run: () => void };
}

interface Props {
  notice: NoticeData | null;
  onClose: () => void;
}

/** A short message at the bottom of the screen, with an optional Undo. */
export function Notice({ notice, onClose }: Props) {
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(onClose, notice.action ? 9000 : 4000);
    return () => clearTimeout(timer);
  }, [notice, onClose]);
  if (!notice) return null;
  return (
    <div className="notice" role="status">
      {notice.text}{" "}
      {notice.action ? (
        <button
          type="button"
          className="linkbtn"
          style={{ color: "var(--paper)", fontWeight: 800, marginLeft: 8 }}
          onClick={() => {
            notice.action?.run();
            onClose();
          }}
        >
          {notice.action.label}
        </button>
      ) : null}
    </div>
  );
}
