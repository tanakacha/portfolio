import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";
import { THEME_COLORS } from "@/lib/constants";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

const theme = THEME_COLORS.default;

export default async function AppleIcon() {
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
        }}
      >
        <img src={dataUrl} alt="" width={150} height={150} />
      </div>
    ),
    { ...size }
  );
}
