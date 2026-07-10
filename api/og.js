import React from "react";
import { ImageResponse } from "@vercel/og";
const h = React.createElement;

export const config = { runtime: "edge" };

const SUPABASE_URL = "https://ckgqawmbtqnpmdumamuv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_6jMbCnxw2r0ahw-pkMZk5w_jQPHOoTx";
const posterPaths = {
  "neon-birthday": "assets/posters/neon-birthday.png",
  "mint-cake": "assets/posters/mint-cake.png",
  "rooftop-night": "assets/posters/rooftop-night.png",
  "picnic-spring": "assets/posters/picnic-spring.png"
};

function cleanCode(value) {
  const code = String(value || "").toUpperCase();
  return /^[A-Z0-9]{6,12}$/.test(code) ? code : "";
}

function cropValue(value, fallback, min, max) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.min(max, Math.max(min, numeric)) : fallback;
}

async function getEvent(code) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/party_get_event`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: `Bearer ${SUPABASE_PUBLISHABLE_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ invite_code: code })
  });

  if (!response.ok) return null;
  return response.json();
}

async function getKoreanFont(text) {
  const css = await fetch(
    `https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@700&text=${encodeURIComponent(text)}`
  ).then((response) => response.text());
  const fontUrl = css.match(/url\(([^)]+)\)/)?.[1];
  if (!fontUrl) throw new Error("Korean font unavailable");
  return fetch(fontUrl).then((response) => response.arrayBuffer());
}

export default async function handler(request) {
  const url = new URL(request.url);
  const code = cleanCode(url.searchParams.get("code"));
  const event = code ? await getEvent(code) : null;
  const title = event && event.title ? event.title : "파티 초대장";
  const subtitle = event && event.subtitle ? event.subtitle : "파티피플에서 만나요";
  const date = event && event.date ? event.date.replace(/-/g, ".") : "날짜 미정";
  const place = event && event.placeName ? event.placeName : "장소 미정";
  const host = event && event.hostName ? event.hostName : "파티피플";
  const cropX = cropValue(event && event.posterPositionX, 50, 0, 100);
  const cropY = cropValue(event && event.posterPositionY, 50, 0, 100);
  const zoom = cropValue(event && event.posterZoom, 1, 1, 2.5);
  const posterSource = event && event.customPosterImage
    ? event.customPosterImage
    : `${url.origin}/${posterPaths[event && event.posterImageId] || posterPaths["neon-birthday"]}`;
  const font = await getKoreanFont(`${title}${subtitle}${date}${place}${host}파티피플`);

  const brandStyle = { display: "flex", fontSize: 30, fontWeight: 700, opacity: 0.86 };
  const detailStyle = { display: "flex", fontSize: 28, lineHeight: 1.35, opacity: 0.9 };
  return new ImageResponse(
    h("div", {
      style: {
        width: "100%",
        height: "100%",
        display: "flex",
        padding: 48,
        color: "#fff7df",
        background: "linear-gradient(135deg, #18071d 0%, #10152a 52%, #06364a 100%)",
        fontFamily: "Noto Sans KR"
      }
    },
      h("div", { style: { display: "flex", flexDirection: "column", width: "54%", padding: "12px 34px 12px 4px" } },
        h("div", { style: brandStyle }, "파티피플"),
        h("div", { style: { display: "flex", marginTop: 62, fontSize: 30, fontWeight: 700, opacity: 0.8 } }, subtitle),
        h("div", { style: { display: "flex", marginTop: 14, fontSize: 72, fontWeight: 700, lineHeight: 1.08 } }, title),
        h("div", { style: { display: "flex", marginTop: "auto", flexDirection: "column", gap: 4 } },
          h("div", { style: detailStyle }, date),
          h("div", { style: detailStyle }, place),
          h("div", { style: { display: "flex", marginTop: 16, fontSize: 24, opacity: 0.72 } }, `Hosted by ${host}`)
        )
      ),
      h("div", { style: { display: "flex", width: "46%", alignItems: "center", justifyContent: "center" } },
        h("div", { style: { display: "flex", width: 486, height: 486, borderRadius: 28, overflow: "hidden", border: "3px solid rgba(255,255,255,0.54)", background: "#261529" } },
          h("img", {
            src: posterSource,
            width: "486",
            height: "486",
            style: {
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: `${cropX}% ${cropY}%`,
              transform: `scale(${zoom})`,
              transformOrigin: `${cropX}% ${cropY}%`
            }
          })
        )
      )
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Noto Sans KR", data: font, weight: 700, style: "normal" }]
    }
  );
}
