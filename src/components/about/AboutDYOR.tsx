import { about } from "@/content/site";

const principles = [
  {
    title: "Independent perspectives",
    description: "Different voices and opinions across live Spaces and the podcast.",
  },
  {
    title: "Live community conversation",
    description: "Real-time discussion on X — not just pre-recorded commentary.",
  },
  {
    title: "Research before reaction",
    description: "Stay informed, ask questions and draw your own conclusions.",
  },
] as const;

export function AboutDYOR() {
  return (
    <div className="max-w-3xl">
      <h2 className="font-heading text-3xl font-bold text-text-primary md:text-4xl">
        {about.heading}
      </h2>
      <p className="prose-width mt-4 text-lg leading-relaxed text-text-secondary">
        {about.body}
      </p>

      <ul className="mt-10 grid gap-4 sm:grid-cols-3">
        {principles.map((item) => (
          <li
            key={item.title}
            className="rounded-[var(--radius-large)] border border-border bg-surface/60 p-4"
          >
            <h3 className="font-heading text-base font-bold text-brand-bright">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-text-secondary">{item.description}</p>
          </li>
        ))}
      </ul>

      <aside className="mt-8 rounded-[var(--radius-medium)] border border-border/60 bg-surface/30 p-4 text-xs leading-relaxed text-text-secondary/80">
        <p>{about.disclaimer}</p>
      </aside>
    </div>
  );
}
