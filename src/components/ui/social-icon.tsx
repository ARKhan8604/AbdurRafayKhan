import { Mail, Globe, FileText } from "lucide-react";
import { GithubIcon, LinkedinIcon, TwitterIcon, InstagramIcon } from "./brand-icons";

const MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  github: GithubIcon,
  linkedin: LinkedinIcon,
  mail: Mail,
  email: Mail,
  twitter: TwitterIcon,
  x: TwitterIcon,
  instagram: InstagramIcon,
  globe: Globe,
  website: Globe,
  resume: FileText,
};

export function SocialIcon({
  name,
  className,
}: {
  name?: string | null;
  className?: string;
}) {
  const key = (name ?? "").toLowerCase();
  const Icon = MAP[key] ?? Globe;
  return <Icon className={className} />;
}
