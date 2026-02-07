import "./Badge.css";

export type BadgeTone = "accent" | "gold" | "success" | "warning" | "danger" | "neutral";

export default function Badge(props: {
  children: React.ReactNode;
  tone?: BadgeTone;
  soft?: boolean;
  className?: string;
}) {
  const tone = props.tone ?? "neutral";
  const soft = props.soft ? " badge--soft" : "";
  return (
    <span className={`badge badge--${tone}${soft}${props.className ? ` ${props.className}` : ""}`}>
      {props.children}
    </span>
  );
}
