import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#100c14",
        }}
      >
        <div style={{ width: 108, height: 108, borderRadius: 54, background: "#e4c27a", display: "flex" }} />
        <div
          style={{
            width: 88,
            height: 88,
            borderRadius: 44,
            background: "#100c14",
            marginLeft: -78,
            marginTop: -8,
            display: "flex",
          }}
        />
      </div>
    ),
    size,
  );
}
