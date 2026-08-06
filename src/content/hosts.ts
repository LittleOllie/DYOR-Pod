import type { Host } from "@/types/content";

export const hosts: Host[] = [
  {
    id: "dw",
    name: "DW",
    handle: "DWDrummer_eth",
    role: "DYOR Host",
    image: "/hosts/dw.webp",
    fullImage: "/hosts/DWFull.webp",
    portraitBackground: "#189e97",
    xUrl: "https://x.com/DWDrummer_eth",
    displayOrder: 1,
  },
  {
    id: "petey-k",
    name: "Petey K",
    handle: "PeteyK",
    role: "DYOR Host",
    image: "/hosts/petey-k.webp",
    fullImage: "/hosts/PeteyKFull.webp",
    portraitBackground: "#68bee3",
    xUrl: "https://x.com/PeteyK",
    displayOrder: 2,
  },
  {
    id: "janner",
    name: "Janner",
    handle: "NF_Janner",
    role: "DYOR Host",
    image: "/hosts/janner.webp",
    fullImage: "/hosts/janner-full.webp",
    portraitBackground: "#c4dc3a",
    xUrl: "https://x.com/NF_Janner",
    displayOrder: 3,
  },
];

export function getHosts(): Host[] {
  return [...hosts].sort((a, b) => a.displayOrder - b.displayOrder);
}
