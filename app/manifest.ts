import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "WestKaz Agro",
    short_name: "WestKaz",
    description: "Учет КРС, откорма, кормов, расходов и прибыли",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f7f2",
    theme_color: "#1f4d3a",
    orientation: "portrait-primary",
    icons: [
      {
        src: "/logo.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
