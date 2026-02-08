import { Outlet } from "react-router-dom";

export default function PortfolioLayout() {
  return (
    <div className="portfolio-layout">
      {/* Aquí luego irá header / idioma / footer */}
      <Outlet />
    </div>
  );
}
