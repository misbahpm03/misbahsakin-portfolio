import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RoomPortfolio from "./room/RoomPortfolio.tsx";
import "./index.css";

// The pre-rendered copy has done its job by now (crawlers and link previews
// read it from the HTML). Removing it keeps a second copy of every heading out
// of the accessibility tree.
document.getElementById("seo-static")?.remove();

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<RoomPortfolio />} />
      {/* The brief form is a dialog over the room now, not a separate page in
          a different visual language. The URL still works: it opens the room
          with the dialog up. src/pages/ContactPage.tsx is no longer routed. */}
      <Route path="/message" element={<RoomPortfolio />} />
      {/* Must come last: it would otherwise swallow /message. */}
      <Route path="/:section" element={<RoomPortfolio />} />
    </Routes>
  </BrowserRouter>
);
