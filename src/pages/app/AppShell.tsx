// src/pages/app/AppShell.tsx
import { Outlet, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../state/authStore";

export default function AppShell() {
  const auth = useAuthStore();
  const navigate = useNavigate();

  return (
    <div>
      <div style={{ display: "flex", gap: 12, padding: 12, alignItems: "center" }}>
        <strong>/app</strong>

        <div style={{ marginLeft: "auto", display: "flex", gap: 10, alignItems: "center" }}>
          {auth.status === "authed" && (
            <>
              <span style={{ opacity: 0.85 }}>
                {auth.user?.name || auth.user?.email}
              </span>
              <button
                type="button"
                onClick={async () => {
                  await auth.logout();
                  navigate("/", { replace: true });
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>

      <Outlet />
    </div>
  );
}
