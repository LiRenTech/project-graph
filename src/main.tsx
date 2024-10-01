import { createRoot } from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router-dom";
import { routes } from "@generouted/react-router";
import "./index.pcss";
import { RecoilRoot } from "recoil";
import { DialogProvider } from "./utils/dialog";

const router = createHashRouter(routes);
const Routes = () => <RouterProvider router={router} />;

createRoot(document.getElementById("root")!).render(
  <RecoilRoot>
    <DialogProvider>
      <Routes />
    </DialogProvider>
  </RecoilRoot>,
);
