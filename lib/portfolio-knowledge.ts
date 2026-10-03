import { siteConfig, services, toolLogos } from "./site-config";
import { videos } from "./videos";

export const portfolioKnowledge = {
  brand: siteConfig.name,
  role: siteConfig.role,
  introduction: siteConfig.introduction,
  services: services.map(({ title, description }) => ({ title, description })),
  suppliedTools: toolLogos.map(tool => tool.name),
  samples: videos,
  contact: { whatsapp: siteConfig.whatsapp, calendly: siteConfig.calendly },
  unknown: ["pricing", "availability", "turnaround times", "clients", "experience", "performance results", "location", "revision policy"],
};
