import { ImageResponse } from "next/og";
import fs from "node:fs";
import path from "node:path";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default async function Icon() {
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
        }}
      >
        <img src={dataUrl} alt="" width={512} height={512} />
      </div>
    ),
    { ...size }
  );
}
