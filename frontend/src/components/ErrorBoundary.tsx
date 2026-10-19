import { Component, type ErrorInfo, type ReactNode } from "react";
import { useI18n } from "../context";
function ErrorScreen() {
  const { t } = useI18n();
  return (
    <main className="page-content">
      <h1>NARO</h1>
      <p>{t("app.failure")}</p>
      <button
        className="naro-button naro-button--primary"
        onClick={() => location.reload()}
      >
        {t("app.reload")}
      </button>
    </main>
  );
}
export class ErrorBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(_error: Error, _info: ErrorInfo) {
    /* Do not log wallet addresses or provider payloads. */
  }
  render() {
    return this.state.failed ? <ErrorScreen /> : this.props.children;
  }
}
