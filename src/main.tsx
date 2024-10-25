import ReactDOM from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "sonner";

import { Authorize, ViewPlaylist, GeneratePlaylist } from "@pages/index";
import { Footer } from "@components/footer";
import { Earth } from "@components/earth";
import { ProtectedRoute } from "./routes/ProtectedRoute";

import "./styles/index.css";

ReactDOM.createRoot(document.querySelector("#root")!).render(
  <HashRouter>
    <Toaster visibleToasts={5} className="toaster" theme="dark" position="bottom-center" />
    <main>
      <aside>
        <Earth />
      </aside>
      <Routes>
        <Route path="authorize" element={<Authorize />} />
        <Route
          path="/"
          index
          element={
            <ProtectedRoute>
              <GeneratePlaylist />
            </ProtectedRoute>
          }
        />
        <Route
          path="done"
          element={
            <ProtectedRoute>
              <ViewPlaylist />
            </ProtectedRoute>
          }
        />
      </Routes>
    </main>
    <Footer />
  </HashRouter>
);
