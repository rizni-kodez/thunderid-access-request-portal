import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { ThunderIDProvider } from "@thunderid/react";
import App from "./App";
import { appConfig } from "./configs/env";
import { queryClient } from "./configs/queryClient";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThunderIDProvider
          clientId={appConfig.thunderIdClientId}
          baseUrl={appConfig.thunderIdBaseUrl}
          afterSignInUrl={`${window.location.origin}/dashboard`}
          afterSignOutUrl={`${window.location.origin}/`}
        >
          <App />
        </ThunderIDProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
