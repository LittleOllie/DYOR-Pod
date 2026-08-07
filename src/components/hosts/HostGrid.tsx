import { HostCard } from "@/components/hosts/HostCard";
import { MobileHostList } from "@/components/mobile/MobileHostList";
import { MobileSectionHeader } from "@/components/mobile/MobileSectionHeader";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { hostsDesktop, hostsMobile } from "@/content/site";
import { getHosts } from "@/content/hosts";

export function HostGrid() {
  const hosts = getHosts();

  return (
    <div className="min-w-0">
      <MobileSectionHeader
        title={hostsMobile.title}
        accent="DYOR"
        description={hostsMobile.description}
        className="md:hidden"
      />

      <MobileHostList hosts={hosts} />

      <div className="hidden md:block">
        <SectionHeading
          title={hostsDesktop.title}
          accent={hostsDesktop.accent}
          description={hostsDesktop.description}
          className="mb-8"
        />
        <div className="host-grid grid min-w-0 grid-cols-2 gap-4 max-[1100px]:gap-4 lg:grid-cols-4 lg:gap-[22px]">
          {hosts.map((host) => (
            <HostCard key={host.id} host={host} />
          ))}
        </div>
      </div>
    </div>
  );
}
