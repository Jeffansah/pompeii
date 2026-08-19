import ReactDOM from "react-dom/client";
import { RouterProvider, createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";
import { AppProviders } from "./providers";
import floral from "@/assets/onboarding/floral.png";

const floralPreload = document.createElement("link");
floralPreload.rel = "preload";
floralPreload.as = "image";
floralPreload.href = floral;
floralPreload.fetchPriority = "high";
document.head.appendChild(floralPreload);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
  scrollRestoration: true,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const rootElement = document.getElementById("app")!;

if (!rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>,
  );
}
