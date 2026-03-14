import { useRef } from "react";
import "./ProjectCarousel.css";

type CarouselItem = {
  title: string;
  image: string; // ruta desde /public
  link?: string;
};

type Props = {
  title?: string;
  items: CarouselItem[];
};

export default function ProjectCarousel({ title, items }: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);

  function scrollLeft() {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({
      left: -400,
      behavior: "smooth",
    });
  }

  function scrollRight() {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({
      left: 400,
      behavior: "smooth",
    });
  }

  return (
    <section className="pcRow">
      {title && <h2 className="pcTitle">{title}</h2>}

      <div className="pcWrapper">
        <button
          className="pcArrow pcArrow--left"
          onClick={scrollLeft}
          aria-label="Scroll left"
        >
          ‹
        </button>

        <div className="pcTrack" ref={trackRef}>
          {items.map((item, i) => (
            <a
              key={i}
              href={item.link ?? "#"}
              className="pcCard"
            >
              <img
                src={item.image}
                alt={item.title}
                className="pcImage"
                loading="lazy"
              />

              <div className="pcOverlay">
                <span>{item.title}</span>
              </div>
            </a>
          ))}
        </div>

        <button
          className="pcArrow pcArrow--right"
          onClick={scrollRight}
          aria-label="Scroll right"
        >
          ›
        </button>
      </div>
    </section>
  );
}