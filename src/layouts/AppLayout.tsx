// src/layouts/AppLayout.tsx
import Topbar from "../components/Topbar";
import AppShell from "../pages/app/AppShell";

export default function AppLayout() {
  return (
    <>
      <Topbar mode="app" />
      <AppShell />
    </>
  );
}
