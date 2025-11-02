import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "./modules/router/SimpleRouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "./styles/global.css";

const queryClient = new QueryClient();

const container = document.getElementById("root");

if (!container) {
  throw new Error("No se encontró el elemento root");
}

createRoot(container).render(
  <StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <App />
      </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
);
