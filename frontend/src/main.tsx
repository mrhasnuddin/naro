import { createRoot } from "react-dom/client";
import { I18nProvider } from "./i18n";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { App } from "./App";
import "../../design-system/tokens.css";
import "../../design-system/components.css";
import "../../prototype/styles.css";
import "./styles.css";
import "./parity/parity.css";
createRoot(document.getElementById("root")!).render(
  <I18nProvider>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </I18nProvider>,
);
