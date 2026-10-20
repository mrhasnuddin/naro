import { isLocalDemo } from "../demo/network";
import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./ui";
import { useI18n } from "../context";
export function Modal({
  children,
  onDismiss,
  returnFocus,
}: {
  children: ReactNode;
  onDismiss: () => void;
  returnFocus: HTMLElement | null;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const { t } = useI18n();
  useEffect(() => {
    const node = ref.current!;
    node.showModal();
    closeRef.current?.focus({ preventScroll: true });
    return () => {
      node.close();
      (returnFocus?.isConnected
        ? returnFocus
        : document.getElementById("wallet-button")
      )?.focus({ preventScroll: true });
    };
  }, [returnFocus]);
  return (
    <dialog
      ref={ref}
      id="app-dialog"
      aria-labelledby="dialog-title"
      onCancel={(event) => {
        event.preventDefault();
        onDismiss();
      }}
    >
      <div className="dialog-top">
        <span className="naro-badge naro-badge--info">
          {t(isLocalDemo ? "demo.local" : "demo.testnet")}
        </span>
        <button
          ref={closeRef}
          className="icon-button"
          onClick={onDismiss}
          aria-label={t("orig.common.close")}
        >
          <Icon name="close" />
        </button>
      </div>
      <div id="dialog-content">{children}</div>
    </dialog>
  );
}
