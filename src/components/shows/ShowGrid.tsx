import { ShowCard } from "@/components/shows/ShowCard";
import { ShowCarousel } from "@/components/shows/ShowCarousel";
import { HorizontalScrollItem, HorizontalScrollRow } from "@/components/ui/HorizontalScrollRow";
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

      <div className="md:hidden">
        <HorizontalScrollRow ariaLabel="DYOR programmes">
          {shows.map((show) => (
            <HorizontalScrollItem key={show.id}>
              <ShowCard show={show} compact />
            </HorizontalScrollItem>
          ))}
        </HorizontalScrollRow>
      </div>

      <div className="hidden md:block">
        <ShowCarousel shows={shows} />
      </div>
    </div>
  );
}
