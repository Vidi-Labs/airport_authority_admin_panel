import { Suspense } from "react";
import { Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Map from "./pages/Map";

import Loading from "./pages/Loading";

function App() {
  return (
    <Suspense fallback={<Loading />}>
      <div className="flex flex-col relative w-full max-h-dvh">
        <Routes>
          <Route path="/:postion?" element={<Map />} />
        </Routes>
        <ToastContainer position="bottom-left" closeOnClick autoClose={2500} />
      </div>
    </Suspense>
  );
}

export default App;
