import "./Banner.css";

export type BannerTone = "info" | "success" | "warning" | "error" | "oracle";

function iconFor(tone: BannerTone) {
  switch (tone) {
    case "success": return "✓";
    case "warning": return "!";
    case "error": return "×";
    case "oracle": return "⟡";
    default: return "i";
  }
}

export default function Banner(props: {
  tone?: BannerTone;
  title?: string;
  children?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}) {
  const tone = props.tone ?? "info";
  return (
    <div className={`banner banner--${tone}${props.className ? ` ${props.className}` : ""}`}>
      <div className="banner__icon" aria-hidden>{iconFor(tone)}</div>

      <div className="banner__body">
        {props.title && <div className="banner__title">{props.title}</div>}
        {props.children && <div className="banner__text">{props.children}</div>}
      </div>

      {props.right && <div className="banner__right">{props.right}</div>}
    </div>
  );
}
