import { ShowCarousel } from "@/components/shows/ShowCarousel";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getActiveShows } from "@/content/shows";

export function ShowGrid() {
  const shows = getActiveShows();

  return (
    <div>
      <SectionHeading
        eyebrow="Programmes"
        title="Four Ways to Tune In"
        description="From Sunday news roundups to Friday interviews — find your weekly crypto fix."
      />
      <ShowCarousel shows={shows} />
    </div>
  );
}
