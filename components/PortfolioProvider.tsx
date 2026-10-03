"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import { findVideo } from "@/lib/videos";
import { VideoModal } from "./VideoModal";

const PortfolioContext = createContext<{ videoId: string | null; openVideo: (id: string) => void }>({ videoId: null, openVideo: () => {} });
export function PortfolioProvider({ children }: { children: ReactNode }) {
  const [videoId, setVideoId] = useState<string | null>(null);
  return <PortfolioContext.Provider value={{ videoId, openVideo: id => { if (findVideo(id)) setVideoId(id); } }}>{children}<VideoModal video={videoId ? findVideo(videoId)! : null} onClose={() => setVideoId(null)} /></PortfolioContext.Provider>;
}
export const usePortfolio = () => useContext(PortfolioContext);
