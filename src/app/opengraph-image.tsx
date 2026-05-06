import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { THEME_COLORS } from "@/lib/constants";

export const alt = "Chisa - Apps & Things";
export const contentType = "image/png";
export const size = { width: 1200, height: 630 };

const theme = THEME_COLORS.default;

export default async function OpengraphImage() {
  const svgPath = path.join(process.cwd(), "public/og-macaron.svg");
  const svg = fs.readFileSync(svgPath);
  const dataUrl = `data:image/svg+xml;base64,${svg.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: theme.background,
          backgroundImage: `repeating-linear-gradient(45deg, ${theme.border}1f 0 6px, transparent 6px 22px), repeating-linear-gradient(-45deg, ${theme.accent}1f 0 6px, transparent 6px 22px)`,
          border: `16px solid ${theme.border}`,
        }}
      >
        <img src={dataUrl} alt="" width={450} height={450} />
      </div>
    ),
    { ...size }
  );
}
