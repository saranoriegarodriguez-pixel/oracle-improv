import { Link } from "react-router-dom";
import "./NetflixRow.css";

export type NetflixItem = {
  slug: string;
  title: string;
  subtitle?: string;
  image: string;
  badge?: string;
  cta?: string;
};

type Props = {
  title: string;
  items: NetflixItem[];
};

export default function NetflixRow({ title, items }: Props) {
  return (
    <section className="nfRow">
      <h2 className="nfRow__title">{title}</h2>

      <div className="nfRow__track" role="list">
        {items.map((item) => (
          <Link
            key={item.slug}
            to={`/work/${item.slug}`}
            className="nfCard"
            role="listitem"
          >
            <div className="nfCard__media">
              <img
                src={item.image}
                alt={item.title}
                className="nfCard__img"
                loading="lazy"
              />
              <div className="nfCard__shade" />
            </div>

            <div className="nfCard__hover">
              {item.badge && <div className="nfCard__badge">{item.badge}</div>}
              <h3 className="nfCard__title">{item.title}</h3>
              {item.subtitle && <p className="nfCard__subtitle">{item.subtitle}</p>}
              <div className="nfCard__cta">{item.cta ?? "Ver proyecto"}</div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}