import { SpacesLibrary } from "@/components/library/SpacesLibrary";
import { getLibraryCategoriesForPage } from "@/lib/library/spaceRecordings";

export async function SpacesLibrarySection() {
  const categories = await getLibraryCategoriesForPage();
  return <SpacesLibrary categories={categories} />;
}
