import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoomPortfolio from "./room/RoomPortfolio.tsx";
import { ContactPage } from "./pages/ContactPage.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<RoomPortfolio />} />
      {/* The brief form. It used to live at /contact, but that slug belongs to
          the phone section now that every section has its own URL. */}
      <Route path="/message" element={<ContactPage />} />
      {/* Must come last: it would otherwise swallow /message. */}
      <Route path="/:section" element={<RoomPortfolio />} />
    </Routes>
  </BrowserRouter>
);
