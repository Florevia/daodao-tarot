import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "叨叨占卜师 Daodao Tarot";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const font = await readFile(join(process.cwd(), "app/fonts/noto-serif-sc-subset.ttf"));
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          background: "#100c14",
          color: "#e4c27a",
          padding: "80px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 24,
              background: "#1a1422",
              border: "2px solid #e4c27a",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 48,
            }}
          >
            叨
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 84, fontFamily: "Noto Serif SC", lineHeight: 1.1 }}>叨叨占卜师</div>
            <div style={{ marginTop: 12, fontSize: 32, letterSpacing: 8, color: "#f7f3ea" }}>DAODAO TAROT</div>
          </div>
        </div>
        <div style={{ marginTop: 48, fontSize: 28, color: "#f7f3ea" }}>把问题放下，让七十八张牌一张一张说给你听。</div>
      </div>
    ),
    {
      ...size,
      fonts: [{ name: "Noto Serif SC", data: font, weight: 600, style: "normal" }],
    },
  );
}
