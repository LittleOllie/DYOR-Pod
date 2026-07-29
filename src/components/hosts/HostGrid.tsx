import { HostCard } from "@/components/hosts/HostCard";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getHosts } from "@/content/hosts";

export function HostGrid() {
  const hosts = getHosts();

  return (
    <div>
      <SectionHeading
        title="Meet the Voices Behind DYOR"
        description="Three hosts bringing independent perspectives to crypto conversations every week."
      />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {hosts.map((host) => (
          <HostCard key={host.id} host={host} />
        ))}
      </div>
    </div>
  );
}
