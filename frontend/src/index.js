import React from "react";
import ReactDOM from "react-dom/client";
import "@/index.css";
import App from "@/App";

// Temporary error overlay — shows the actual JS error on screen so we can
// diagnose the blank page. Remove once the root cause is fixed.
function showErrorOverlay(message, source) {
  const existing = document.getElementById("tsh-error-overlay");
  if (existing) return;
  const div = document.createElement("div");
  div.id = "tsh-error-overlay";
  div.style.cssText =
    "position:fixed;top:0;left:0;right:0;z-index:99999;background:#7f1d1d;color:#fff;padding:12px;font-family:monospace;font-size:12px;white-space:pre-wrap;word-break:break-all;max-height:50vh;overflow:auto;";
  div.textContent = `[${source}] ${message}`;
  document.body.appendChild(div);
}
window.addEventListener("error", (e) => {
  showErrorOverlay(`${e.message}\n${e.filename}:${e.lineno}:${e.colno}`, "window.onerror");
});
window.addEventListener("unhandledrejection", (e) => {
  showErrorOverlay(`Unhandled rejection: ${e.reason?.message || e.reason}`, "unhandledrejection");
});

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  componentDidCatch(error, info) {
    showErrorOverlay(`${error.message}\n${info.componentStack}`, "ErrorBoundary");
  }
  render() {
    if (this.state.error) {
      return React.createElement(
        "div",
        { style: { padding: 20, fontFamily: "monospace", color: "#7f1d1d" } },
        React.createElement("h2", null, "App crashed:"),
        React.createElement("pre", null, this.state.error.message),
      );
    }
    return this.props.children;
  }
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
);
