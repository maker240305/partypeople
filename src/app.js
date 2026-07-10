const { useEffect, useState } = React;
const h = React.createElement;

const STORE_KEY = "party-people.events.v1";
const LEGACY_STORE_KEY = "moidam.events.v1";
const SUPABASE_URL = "https://ckgqawmbtqnpmdumamuv.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_6jMbCnxw2r0ahw-pkMZk5w_jQPHOoTx";
const db = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY) : null;

const themes = [
  { id: "neon", name: "Neon Night", label: "파티", titleFont: "'Black Han Sans', Pretendard, sans-serif", bodyFont: "Pretendard, sans-serif", palette: ["#12131f", "#fa3eaa", "#2ae8c8", "#f7f2df"], accent: "#fa3eaa", image: "assets/templates/neon-night.png", cssImage: "../assets/templates/neon-night.png", textColor: "#fff7df", className: "theme-neon" },
  { id: "birthday", name: "Birthday Pop", label: "생일", titleFont: "'Black Han Sans', Pretendard, sans-serif", bodyFont: "Pretendard, sans-serif", palette: ["#ffefe2", "#f45b69", "#ffd166", "#26547c"], accent: "#f45b69", image: "assets/templates/birthday-pop.png", cssImage: "../assets/templates/birthday-pop.png", textColor: "#242235", className: "theme-birthday" },
  { id: "home", name: "Cozy Home", label: "홈파티", titleFont: "'Gowun Dodum', Pretendard, sans-serif", bodyFont: "Pretendard, sans-serif", palette: ["#26322f", "#efc38d", "#fbf3df", "#8eb69b"], accent: "#efc38d", image: "assets/templates/cozy-home.png", cssImage: "../assets/templates/cozy-home.png", textColor: "#fff3dc", className: "theme-home" },
  { id: "campus", name: "Campus Club", label: "동아리", titleFont: "Pretendard, sans-serif", bodyFont: "Pretendard, sans-serif", palette: ["#f4f1e8", "#263b6b", "#e24f3d", "#1f8a70"], accent: "#e24f3d", image: "assets/templates/campus-club.png", cssImage: "../assets/templates/campus-club.png", textColor: "#24345f", className: "theme-campus" },
  { id: "picnic", name: "Picnic Day", label: "피크닉", titleFont: "'Gowun Dodum', Pretendard, sans-serif", bodyFont: "Pretendard, sans-serif", palette: ["#f8f7ef", "#6aa96f", "#f5b85f", "#32524a"], accent: "#6aa96f", image: "assets/templates/picnic-day.png", cssImage: "../assets/templates/picnic-day.png", textColor: "#2f5148", className: "theme-picnic" },
  { id: "serif", name: "Soft Formal", label: "모임", titleFont: "'Noto Serif KR', serif", bodyFont: "Pretendard, sans-serif", palette: ["#10151a", "#d7b56d", "#eef1f4", "#6488a6"], accent: "#d7b56d", image: "assets/templates/year-end.png", cssImage: "../assets/templates/year-end.png", textColor: "#f3efe4", className: "theme-serif" }
];

const posterImages = [
  { id: "neon-birthday", name: "Neon Birthday", src: "assets/posters/neon-birthday.png" },
  { id: "mint-cake", name: "Mint Cake", src: "assets/posters/mint-cake.png" },
  { id: "rooftop-night", name: "Rooftop Night", src: "assets/posters/rooftop-night.png" },
  { id: "picnic-spring", name: "Picnic Spring", src: "assets/posters/picnic-spring.png" }
];

const defaultEvent = {
  code: "",
  password: "",
  title: "금요일 밤에 모여요",
  subtitle: "오랜만에 얼굴 보는 날",
  hostName: "파티피플",
  date: "2026-06-19",
  time: "19:30",
  placeName: "홍대 어딘가",
  address: "서울 마포구",
  placeUrl: "",
  description: "편하게 와서 같이 먹고 얘기해요. 늦게 와도 괜찮아요.",
  themeId: "neon",
  posterImageId: "neon-birthday",
  createdAt: ""
};

function loadEvents() {
  try {
    const saved = localStorage.getItem(STORE_KEY) || localStorage.getItem(LEGACY_STORE_KEY);
    return JSON.parse(saved) || [];
  } catch {
    return [];
  }
}

function saveEvents(events) {
  localStorage.setItem(STORE_KEY, JSON.stringify(events));
}

async function fetchEventsFromDb() {
  return [];
}

async function fetchEventFromDb(code) {
  if (!db || !code) return null;
  const { data, error } = await db.rpc("party_get_event", { invite_code: code.toUpperCase() });
  if (error) throw error;
  return data || null;
}

async function createEventInDb(event) {
  if (!db) return event;
  const { data, error } = await db.rpc("party_create_event", { event_payload: event });
  if (error) throw error;
  return data || event;
}

async function submitRsvpInDb(code, rsvp) {
  if (!db) return null;
  const { data, error } = await db.rpc("party_submit_rsvp", { invite_code: code.toUpperCase(), rsvp_payload: rsvp });
  if (error) throw error;
  return data || null;
}

async function adminGetEventFromDb(code, password) {
  if (!db) return null;
  const { data, error } = await db.rpc("party_admin_get_event", { invite_code: code.toUpperCase(), admin_password: password });
  if (error) throw error;
  return data || null;
}

async function adminRemoveRsvpFromDb(code, password, name) {
  if (!db) return null;
  const { data, error } = await db.rpc("party_admin_remove_rsvp", { invite_code: code.toUpperCase(), admin_password: password, guest_name: name });
  if (error) throw error;
  return data || null;
}

function randomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function getRoute() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const parts = hash.split("/").filter(Boolean);
  return { hash, parts };
}

function navigate(path) {
  window.location.hash = path;
}

function formatDate(dateValue) {
  if (!dateValue) return "날짜 미정";
  const date = new Date(`${dateValue}T00:00:00`);
  return new Intl.DateTimeFormat("ko-KR", { month: "long", day: "numeric", weekday: "long" }).format(date);
}

function formatTime(timeValue) {
  if (!timeValue) return "시간 미정";
  const [hour, minute] = timeValue.split(":").map(Number);
  const period = hour >= 12 ? "오후" : "오전";
  const hour12 = hour % 12 || 12;
  return `${period} ${hour12}:${String(minute || 0).padStart(2, "0")}`;
}

function getTheme(themeId) {
  return themes.find((theme) => theme.id === themeId) || themes[0];
}

function getPosterImage(posterImageId) {
  return posterImages.find((image) => image.id === posterImageId) || posterImages[0];
}

function getPosterWord(title) {
  const words = String(title || "party").trim().split(/\s+/).filter(Boolean);
  return words.length > 0 ? words[0].slice(0, 8) : "party";
}

function getInitial(name) {
  return String(name || "?").trim().slice(0, 1).toUpperCase() || "?";
}

function getLocationUrl(event) {
  if (event.placeUrl) return event.placeUrl;
  const query = encodeURIComponent([event.placeName, event.address].filter(Boolean).join(" "));
  return `https://map.naver.com/p/search/${query || encodeURIComponent("파티 장소")}`;
}

function upsertEventList(events, nextEvent) {
  const exists = events.some((event) => event.code === nextEvent.code);
  return exists ? events.map((event) => event.code === nextEvent.code ? nextEvent : event) : [nextEvent, ...events];
}

function App() {
  const [route, setRoute] = useState(getRoute());
  const [events, setEvents] = useState(loadEvents);

  useEffect(() => {
    const onHashChange = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => saveEvents(events), [events]);

  const screen = route.parts[0] || "";
  const code = route.parts[1] || "";

  useEffect(() => {
    let alive = true;
    fetchEventsFromDb()
      .then((dbEvents) => {
        if (alive && dbEvents.length > 0) setEvents(dbEvents);
      })
      .catch((error) => console.warn("Supabase list failed", error));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!code || (screen !== "e" && screen !== "admin")) return;
    let alive = true;
    fetchEventFromDb(code)
      .then((dbEvent) => {
        if (alive && dbEvent) setEvents((prev) => upsertEventList(prev, dbEvent));
      })
      .catch((error) => console.warn("Supabase event fetch failed", error));
    return () => {
      alive = false;
    };
  }, [screen, code]);

  const updateEvent = (nextEvent, action = {}) => {
    setEvents((prev) => upsertEventList(prev, nextEvent));

    if (action.type === "create") {
      createEventInDb(nextEvent)
        .then((dbEvent) => setEvents((prev) => upsertEventList(prev, dbEvent)))
        .catch((error) => console.warn("Supabase create failed", error));
      return;
    }

    if (action.type === "rsvp" && action.rsvp) {
      submitRsvpInDb(nextEvent.code, action.rsvp)
        .then((dbEvent) => {
          if (dbEvent) setEvents((prev) => upsertEventList(prev, dbEvent));
        })
        .catch((error) => console.warn("Supabase RSVP failed", error));
    }
  };

  const adminGetEvent = async (adminCode, password) => {
    const dbEvent = await adminGetEventFromDb(adminCode, password);
    if (dbEvent) setEvents((prev) => upsertEventList(prev, dbEvent));
    return dbEvent;
  };

  const adminRemoveRsvp = async (adminCode, password, name) => {
    const dbEvent = await adminRemoveRsvpFromDb(adminCode, password, name);
    if (dbEvent) setEvents((prev) => upsertEventList(prev, dbEvent));
    return dbEvent;
  };

  if (screen === "create") return h(CreateScreen, { events, updateEvent });
  if (screen === "e") return h(EventScreen, { event: events.find((item) => item.code === code), updateEvent });
  if (screen === "admin") return h(AdminScreen, { events, updateEvent, code, adminGetEvent, adminRemoveRsvp });
  return h(HomeScreen, { events });
}

function HomeScreen({ events }) {
  const [code, setCode] = useState("");

  const join = (event) => {
    event.preventDefault();
    if (code.trim()) navigate(`/e/${code.trim().toUpperCase()}`);
  };

  return h("main", { className: "app-shell home-shell" },
    h("section", { className: "home-hero" },
      h("div", { className: "brand-row" }, h("div", { className: "brand-mark" }, "피"), h("span", null, "파티피플")),
      h("div", { className: "hero-copy" },
        h("p", { className: "eyebrow" }, "친구들을 초대하세요!"),
        h("h1", null, "파티에 초대하세요!"),
        h("p", null, "예쁜 초대장을 만들고 링크 하나로 참석 여부를 받아보세요.")
      ),
      h("div", { className: "hero-actions" },
        h("button", { className: "primary-button", onClick: () => navigate("/create") }, "초대장 만들기"),
        h("button", { className: "ghost-button", onClick: () => navigate("/admin") }, "관리자 입장")
      )
    ),
    h("section", { className: "entry-band" },
      h("form", { className: "code-form", onSubmit: join },
        h("label", null, "초대코드"),
        h("div", { className: "inline-input" },
          h("input", { value: code, onChange: (event) => setCode(event.target.value), placeholder: "예: A7K92B", maxLength: 12 }),
          h("button", { type: "submit" }, "입장")
        )
      )
    ),
    events.length > 0 && h("section", { className: "recent-section" },
      h("h2", null, "최근 만든 초대장"),
      h("div", { className: "recent-grid" },
        events.slice(0, 4).map((event) =>
          h("button", { key: event.code, className: "recent-card", onClick: () => navigate(`/e/${event.code}`) },
            h("strong", null, event.title),
            h("span", null, `${formatDate(event.date)} · ${event.code}`)
          )
        )
      )
    )
  );
}

function CreateScreen({ events, updateEvent }) {
  const [event, setEvent] = useState({ ...defaultEvent, code: uniqueCode(events), password: "", createdAt: new Date().toISOString() });
  const setField = (field, value) => setEvent((prev) => ({ ...prev, [field]: value }));

  const submit = (formEvent) => {
    formEvent.preventDefault();
    if (!event.password.trim()) {
      alert("관리자 비밀번호를 입력해 주세요.");
      return;
    }
    const code = event.code.toUpperCase();
    sessionStorage.setItem(`partyPeople.skipArrival.${code}`, "1");
    updateEvent({ ...event, code, rsvps: event.rsvps || [] }, { type: "create" });
    navigate(`/e/${code}`);
  };

  return h("main", { className: "create-shell" },
    h("form", { className: "composer-form", onSubmit: submit },
      h(EditableInviteComposer, { event, setField }),
      h("section", { className: "composer-settings" },
        h("h2", null, "추가 설정"),
        h(Field, { label: "초대글" }, h("textarea", { value: event.description, onChange: (e) => setField("description", e.target.value), maxLength: 160 })),
        h(Field, { label: "네이버지도 링크" }, h("input", { value: event.placeUrl, onChange: (e) => setField("placeUrl", e.target.value), placeholder: "https://map.naver.com/..." })),
        h(Field, { label: "관리자 비밀번호" }, h("input", { type: "password", value: event.password, onChange: (e) => setField("password", e.target.value), placeholder: "수정/관리할 때 사용" })),
        h("div", { className: "theme-picker" },
          themes.map((theme) =>
            h("button", { type: "button", key: theme.id, className: event.themeId === theme.id ? "theme-swatch selected" : "theme-swatch", onClick: () => setField("themeId", theme.id) },
              h("span", { className: "swatch-colors" }, theme.palette.map((color) => h("i", { key: color, style: { background: color } }))),
              h("strong", null, theme.name),
              h("small", null, theme.label)
            )
          )
        ),
        h("button", { className: "primary-button wide-button", type: "submit" }, "초대장 저장")
      )
    )
  );
}

function EditableInviteComposer({ event, setField }) {
  const theme = getTheme(event.themeId);
  const posterImage = getPosterImage(event.posterImageId);
  const [isPosterPickerOpen, setIsPosterPickerOpen] = useState(false);
  const previewGuests = [{ name: "서연", status: "yes", guests: 1 }, { name: "민수", status: "maybe", guests: 0 }];
  const counts = getCounts(previewGuests);
  const choosePoster = (posterImageId) => {
    setField("posterImageId", posterImageId);
    setIsPosterPickerOpen(false);
  };

  return h("section", {
    className: `event-page composer-event-page ${theme.className}`,
    style: {
      "--poster-image": `url("${theme.cssImage}")`,
      "--poster-text": theme.textColor,
      "--accent": theme.accent,
      "--title-font": theme.titleFont,
      "--body-font": theme.bodyFont
    }
  },
    h("div", { className: "event-phone composer-event-phone" },
      h("header", { className: "event-brandbar" },
        h("button", { className: "brand-button event-brand-button", type: "button", onClick: () => navigate("/") },
          h("span", { className: "brand-mark small" }, "피"),
          h("span", null, "파티피플")
        ),
        h("span", { className: "event-admin-link" }, "편집")
      ),
      h("section", { className: "event-hero composer-hero" },
        h("label", { className: "composer-inline-label" },
          h("span", null, "한 줄 소개"),
          h("input", { className: "composer-kicker-input", value: event.subtitle, onChange: (e) => setField("subtitle", e.target.value), maxLength: 42 })
        ),
        h("label", { className: "composer-title-label" },
          h("span", null, "모임 이름"),
          h("textarea", { className: "composer-title-input", value: event.title, onChange: (e) => setField("title", e.target.value), maxLength: 36, rows: 2 })
        ),
        h("div", { className: "event-art-card poster-picker-card" },
          h("img", { src: posterImage.src, alt: posterImage.name }),
          h("button", { className: "poster-edit-button", type: "button", onClick: () => setIsPosterPickerOpen((open) => !open), "aria-label": "이미지 선택" }, "✎"),
          isPosterPickerOpen && h("div", { className: "poster-choice-popover" },
            posterImages.map((image) =>
              h("button", { type: "button", key: image.id, className: event.posterImageId === image.id ? "selected" : "", onClick: () => choosePoster(image.id), "aria-label": image.name },
                h("img", { src: image.src, alt: image.name })
              )
            )
          )
        )
      ),
      h("section", { className: "event-info-stack composer-info-stack" },
        h("div", { className: "event-date-block composer-date-block" },
          h("label", null,
            h("span", null, "날짜"),
            h("input", { type: "date", value: event.date, onChange: (e) => setField("date", e.target.value) })
          ),
          h("label", null,
            h("span", null, "시간"),
            h("input", { type: "time", value: event.time, onChange: (e) => setField("time", e.target.value) })
          )
        ),
        h("div", { className: "event-info-row composer-info-row" },
          h("span", { className: "event-info-icon" }, "★"),
          h("label", null,
            h("small", null, "Hosted by"),
            h("input", { value: event.hostName, onChange: (e) => setField("hostName", e.target.value), placeholder: "주선자 이름", maxLength: 24 })
          )
        ),
        h("div", { className: "event-info-row composer-info-row" },
          h("span", { className: "event-info-icon" }, "⌖"),
          h("span", null,
            h("small", null, "Location"),
            h("input", { value: event.placeName, onChange: (e) => setField("placeName", e.target.value), placeholder: "장소명", maxLength: 32 }),
            h("input", { value: event.address, onChange: (e) => setField("address", e.target.value), placeholder: "주소", maxLength: 64 })
          )
        ),
        h("div", { className: "event-info-row attendees-row" },
          h("span", { className: "event-info-icon" }, "✓"),
          h("span", null,
            h("small", null, "Guests"),
            h("strong", null, `${counts.yes}명 참석 예정`),
            h("em", null, `미정 ${counts.maybe}명 · 불참 ${counts.no}명`)
          ),
          h("div", { className: "avatar-stack" }, h("i", null, "서"), h("i", null, "민"))
        ),
        h("div", { className: "share-row event-share-row composer-share-row" },
          h("button", { type: "button" }, "스토리 저장"),
          h("button", { type: "button" }, "이미지 공유"),
          h("button", { type: "button" }, "링크 복사")
        ),
        h("div", { className: "invite-code-card event-code-card" }, h("span", null, "초대코드"), h("strong", null, event.code))
      )
    )
  );
}

function EventScreen({ event, updateEvent }) {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("yes");
  const [guests, setGuests] = useState(0);
  const [message, setMessage] = useState("");
  const [opened, setOpened] = useState(() => event ? consumeArrivalSkip(event.code) : false);

  useEffect(() => {
    if (!event || !name.trim()) return;
    const existing = (event.rsvps || []).find((rsvp) => rsvp.name === name.trim());
    if (existing) {
      setStatus(existing.status);
      setGuests(existing.guests);
      setMessage(existing.message || "");
    }
  }, [name, event]);

  if (!event) return h(NotFoundScreen);
  if (!opened) return h(InviteArrivalScreen, { event, onOpen: () => setOpened(true) });

  const counts = getCounts(event.rsvps || []);
  const submit = (formEvent) => {
    formEvent.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      alert("이름을 입력해 주세요.");
      return;
    }
    const nextRsvp = { name: cleanName, status, guests: Number(guests) || 0, message: message.trim(), updatedAt: new Date().toISOString() };
    const nextRsvps = [nextRsvp, ...(event.rsvps || []).filter((rsvp) => rsvp.name !== cleanName)];
    updateEvent({ ...event, rsvps: nextRsvps }, { type: "rsvp", rsvp: nextRsvp });
    alert("참석 여부가 저장됐어요.");
  };

  const theme = getTheme(event.themeId);
  const posterImage = getPosterImage(event.posterImageId);
  const yesGuests = (event.rsvps || []).filter((rsvp) => rsvp.status === "yes");
  const totalGoing = counts.yes;
  const locationUrl = getLocationUrl(event);

  return h("main", {
    className: `event-page ${theme.className}`,
    style: {
      "--poster-image": `url("${theme.cssImage}")`,
      "--poster-text": theme.textColor,
      "--accent": theme.accent,
      "--title-font": theme.titleFont,
      "--body-font": theme.bodyFont
    }
  },
    h("div", { className: "event-backdrop" }),
    h("div", { className: "event-phone" },
      h("header", { className: "event-brandbar" },
        h("button", { className: "brand-button event-brand-button", onClick: () => navigate("/") },
          h("span", { className: "brand-mark small" }, "피"),
          h("span", null, "파티피플")
        ),
        h("button", { className: "event-admin-link", onClick: () => navigate(`/admin/${event.code}`) }, "관리")
      ),
      h("section", { className: "event-hero" },
        h("p", { className: "event-kicker" }, event.subtitle || "초대합니다"),
        h("h1", null, event.title || "이름 없는 모임"),
        h("div", { className: "event-art-card" },
          h("img", { src: posterImage.src, alt: posterImage.name })
        )
      ),
      h("section", { className: "event-info-stack" },
        h("div", { className: "event-date-block" },
          h("strong", null, formatDate(event.date)),
          h("span", null, formatTime(event.time))
        ),
        h("button", { className: "event-info-row", type: "button", onClick: () => copyText("파티피플") },
          h("span", { className: "event-info-icon" }, "★"),
          h("span", null,
            h("small", null, "Hosted by"),
            h("strong", null, event.hostName || "파티피플")
          )
        ),
        h("button", { className: "event-info-row", type: "button", onClick: () => window.open(locationUrl, "_blank") },
          h("span", { className: "event-info-icon" }, "⌖"),
          h("span", null,
            h("small", null, "Location"),
            h("strong", null, event.placeName || "장소 미정"),
            h("em", null, event.address || "주소 미정")
          )
        ),
        h("div", { className: "event-info-row attendees-row" },
          h("span", { className: "event-info-icon" }, "✓"),
          h("span", null,
            h("small", null, "Guests"),
            h("strong", null, `${totalGoing}명 참석 예정`),
            h("em", null, `미정 ${counts.maybe}명 · 불참 ${counts.no}명`)
          ),
          h("div", { className: "avatar-stack" },
            yesGuests.slice(0, 4).map((rsvp) => h("i", { key: rsvp.name }, getInitial(rsvp.name))),
            yesGuests.length === 0 && h("i", null, "?")
          )
        ),
        h("div", { className: "share-row event-share-row" },
          h("button", { onClick: () => downloadStoryImage(event) }, "스토리 저장"),
          h("button", { onClick: () => shareStoryImage(event) }, "이미지 공유"),
          h("button", { onClick: () => copyText(location.href) }, "링크 복사")
        ),
        h("p", { className: "event-description" }, event.description || "곧 만나요."),
        h("div", { className: "invite-code-card event-code-card" }, h("span", null, "초대코드"), h("strong", null, event.code))
      ),
      h("section", { className: "event-rsvp-card" },
        h("form", { onSubmit: submit, className: "rsvp-form" },
          h(Field, { label: "이름" }, h("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "친구들이 알아볼 이름" })),
          h("div", { className: "segmented event-segmented" }, statusButton("yes", "참석", status, setStatus), statusButton("maybe", "미정", status, setStatus), statusButton("no", "불참", status, setStatus)),
          h(Field, { label: "동반 인원" }, h("input", { type: "number", min: "0", max: "9", value: guests, onChange: (e) => setGuests(e.target.value) })),
          h(Field, { label: "한마디" }, h("textarea", { value: message, onChange: (e) => setMessage(e.target.value), placeholder: "선택사항", maxLength: 80 })),
          h("button", { className: "primary-button wide-button", type: "submit" }, "참석 여부 저장")
        )
      )
    )
  );
}

function InviteArrivalScreen({ event, onOpen }) {
  const theme = getTheme(event.themeId);
  return h("main", { className: `arrival-shell ${theme.className}`, style: { "--poster-image": `url("${theme.cssImage}")`, "--poster-text": theme.textColor } },
    h("div", { className: "arrival-card" },
      h("img", { className: "arrival-gif", src: "assets/arrival/mailbox-arrival.gif", alt: "픽셀 우편함에 초대장이 도착하는 애니메이션" }),
      h("p", { className: "arrival-kicker" }, "초대장이 도착했어요"),
      h("h1", null, event.title),
      h("p", { className: "arrival-meta" }, `${formatDate(event.date)} · ${formatTime(event.time)}`),
      h("button", { className: "arrival-open-button", onClick: onOpen }, "초대장 열기"),
      h("button", { className: "arrival-code-button", onClick: () => copyText(event.code) }, `초대코드 ${event.code}`)
    )
  );
}

function CompactEventPreview({ event }) {
  const theme = getTheme(event.themeId);
  const posterImage = getPosterImage(event.posterImageId);
  const previewEvent = { ...event, rsvps: [{ name: "가", status: "yes", guests: 0 }, { name: "나", status: "maybe", guests: 0 }] };
  const counts = getCounts(previewEvent.rsvps);

  return h("div", {
    className: `event-page preview-event-page ${theme.className}`,
    style: {
      "--poster-image": `url("${theme.cssImage}")`,
      "--poster-text": theme.textColor,
      "--accent": theme.accent,
      "--title-font": theme.titleFont,
      "--body-font": theme.bodyFont
    }
  },
    h("div", { className: "event-phone preview-event-phone" },
      h("header", { className: "event-brandbar" },
        h("button", { className: "brand-button event-brand-button", type: "button", onClick: () => navigate("/") },
          h("span", { className: "brand-mark small" }, "피"),
          h("span", null, "파티피플")
        ),
        h("span", { className: "event-admin-link" }, "관리")
      ),
      h("section", { className: "event-hero" },
        h("p", { className: "event-kicker" }, event.subtitle || "초대합니다"),
        h("h1", null, event.title || "이름 없는 모임"),
        h("div", { className: "event-art-card" }, h("img", { src: posterImage.src, alt: posterImage.name }))
      ),
      h("section", { className: "event-info-stack" },
        h("div", { className: "event-date-block" }, h("strong", null, formatDate(event.date)), h("span", null, formatTime(event.time))),
        h("div", { className: "event-info-row" },
          h("span", { className: "event-info-icon" }, "★"),
          h("span", null, h("small", null, "Hosted by"), h("strong", null, event.hostName || "파티피플"))
        ),
        h("div", { className: "event-info-row" },
          h("span", { className: "event-info-icon" }, "⌖"),
          h("span", null, h("small", null, "Location"), h("strong", null, event.placeName || "장소 미정"), h("em", null, event.address || "주소 미정"))
        ),
        h("div", { className: "event-info-row attendees-row" },
          h("span", { className: "event-info-icon" }, "✓"),
          h("span", null, h("small", null, "Guests"), h("strong", null, `${counts.yes}명 참석 예정`), h("em", null, `미정 ${counts.maybe}명 · 불참 ${counts.no}명`)),
          h("div", { className: "avatar-stack" }, h("i", null, "가"), h("i", null, "나"))
        ),
        h("div", { className: "share-row event-share-row" },
          h("button", { type: "button" }, "스토리 저장"),
          h("button", { type: "button" }, "링크 복사")
        )
      )
    )
  );
}

function AdminScreen({ events, updateEvent, code, adminGetEvent, adminRemoveRsvp }) {
  const event = code ? events.find((item) => item.code === code) : null;
  const [inputCode, setInputCode] = useState(code || "");
  const [password, setPassword] = useState("");
  const [unlocked, setUnlocked] = useState(false);

  const enter = async (formEvent) => {
    formEvent.preventDefault();
    const cleanCode = inputCode.trim().toUpperCase();
    const dbEvent = adminGetEvent ? await adminGetEvent(cleanCode, password) : null;
    const nextEvent = dbEvent || events.find((item) => item.code === cleanCode);
    if (!nextEvent) {
      alert("초대장을 찾을 수 없어요.");
      return;
    }
    if (!dbEvent && nextEvent.password !== password) {
      alert("비밀번호가 달라요.");
      return;
    }
    setUnlocked(true);
    navigate(`/admin/${nextEvent.code}`);
  };

  if (!event || !unlocked) {
    return h("main", { className: "app-shell admin-login-shell" },
      h(Header, { title: "관리자 입장" }),
      h("form", { className: "admin-login", onSubmit: enter },
        h(Field, { label: "초대코드" }, h("input", { value: inputCode, onChange: (e) => setInputCode(e.target.value), placeholder: "예: A7K92B" })),
        h(Field, { label: "비밀번호" }, h("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value) })),
        h("button", { className: "primary-button wide-button", type: "submit" }, "관리하기")
      )
    );
  }

  const counts = getCounts(event.rsvps || []);
  const removeRsvp = (name) => {
    const nextEvent = { ...event, rsvps: (event.rsvps || []).filter((rsvp) => rsvp.name !== name) };
    updateEvent(nextEvent);
    if (adminRemoveRsvp) {
      adminRemoveRsvp(event.code, password, name).catch((error) => console.warn("Supabase RSVP remove failed", error));
    }
  };

  return h("main", { className: "app-shell admin-shell" },
    h(Header, { title: "관리자" }),
    h("section", { className: "admin-summary" },
      h("div", null, h("span", null, "초대코드"), h("strong", null, event.code)),
      h("div", null, h("span", null, "참석"), h("strong", null, counts.yes)),
      h("div", null, h("span", null, "미정"), h("strong", null, counts.maybe)),
      h("div", null, h("span", null, "불참"), h("strong", null, counts.no))
    ),
    h("div", { className: "admin-actions" },
      h("button", { onClick: () => copyText(`${location.origin}${location.pathname}#/e/${event.code}`) }, "초대 링크 복사"),
      h("button", { onClick: () => navigate(`/e/${event.code}`) }, "초대장 보기")
    ),
    h("section", { className: "guest-list" },
      h("h2", null, "참석자"),
      (event.rsvps || []).length === 0
        ? h("p", { className: "empty-note" }, "아직 응답이 없어요.")
        : (event.rsvps || []).map((rsvp) =>
          h("article", { className: "guest-row", key: rsvp.name },
            h("div", null, h("strong", null, rsvp.name), h("span", null, `${statusLabel(rsvp.status)} · 동반 ${rsvp.guests || 0}명`)),
            h("p", null, rsvp.message || ""),
            h("button", { onClick: () => removeRsvp(rsvp.name) }, "삭제")
          )
        )
    )
  );
}

function InvitePoster({ event, compact }) {
  const theme = getTheme(event.themeId);
  return h("article", { className: `invite-poster ${theme.className} ${compact ? "compact" : ""}`, style: { "--accent": theme.accent, "--title-font": theme.titleFont, "--body-font": theme.bodyFont, "--poster-image": `url("${theme.cssImage}")`, "--poster-text": theme.textColor } },
    h("div", { className: "poster-decoration deco-one" }),
    h("div", { className: "poster-decoration deco-two" }),
    h("div", { className: "poster-inner" },
      h("p", { className: "poster-kicker" }, event.subtitle || "초대합니다"),
      h("h1", null, event.title || "이름 없는 모임"),
      h("div", { className: "poster-date" }, h("strong", null, formatDate(event.date)), h("span", null, formatTime(event.time))),
      h("div", { className: "poster-place" }, h("strong", null, event.placeName || "장소 미정"), h("span", null, event.address || "주소 미정")),
      h("p", { className: "poster-desc" }, event.description || "곧 만나요.")
    )
  );
}

function Header({ title, adminCode }) {
  return h("header", { className: "topbar" },
    h("button", { className: "brand-button", onClick: () => navigate("/") }, h("span", { className: "brand-mark small" }, "피"), h("span", null, "파티피플")),
    h("strong", null, title),
    adminCode ? h("button", { className: "text-button", onClick: () => navigate(`/admin/${adminCode}`) }, "관리") : h("span", null)
  );
}

function Field({ label, children }) {
  return h("label", { className: "field" }, h("span", null, label), children);
}

function CountPill({ label, value }) {
  return h("div", { className: "count-pill" }, h("span", null, label), h("strong", null, value));
}

function NotFoundScreen() {
  return h("main", { className: "app-shell not-found-shell" },
    h(Header, { title: "초대장 없음" }),
    h("section", { className: "empty-state" },
      h("h1", null, "초대장을 찾을 수 없어요"),
      h("button", { className: "primary-button", onClick: () => navigate("/") }, "처음으로")
    )
  );
}

function statusButton(value, label, selected, setSelected) {
  return h("button", { type: "button", className: selected === value ? "selected" : "", onClick: () => setSelected(value) }, label);
}

function statusLabel(status) {
  return { yes: "참석", maybe: "미정", no: "불참" }[status] || "미정";
}

function getCounts(rsvps) {
  return rsvps.reduce((counts, rsvp) => {
    counts[rsvp.status] = (counts[rsvp.status] || 0) + 1 + (Number(rsvp.guests) || 0);
    return counts;
  }, { yes: 0, maybe: 0, no: 0 });
}

function uniqueCode(events) {
  let code = randomCode();
  while (events.some((event) => event.code === code)) code = randomCode();
  return code;
}

function consumeArrivalSkip(code) {
  const key = `partyPeople.skipArrival.${code}`;
  const legacyKey = `moidam.skipArrival.${code}`;
  const shouldSkip = sessionStorage.getItem(key) === "1" || sessionStorage.getItem(legacyKey) === "1";
  if (shouldSkip) {
    sessionStorage.removeItem(key);
    sessionStorage.removeItem(legacyKey);
  }
  return shouldSkip;
}

async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    alert("복사됐어요.");
  } catch {
    window.prompt("복사할 링크", text);
  }
}

async function downloadStoryImage(event) {
  const blob = await createStoryBlob(event);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `party-people-${event.code}-story.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function shareStoryImage(event) {
  const blob = await createStoryBlob(event);
  const file = new File([blob], `party-people-${event.code}-story.png`, { type: "image/png" });
  const shareData = { title: event.title, text: `${event.title} 초대장`, files: [file] };

  if (navigator.canShare && navigator.canShare(shareData)) {
    try {
      await navigator.share(shareData);
    } catch (error) {
      if (error.name !== "AbortError") {
        await downloadStoryImage(event);
        alert("공유창을 열 수 없어서 이미지를 저장했어요.");
      }
    }
    return;
  }

  await downloadStoryImage(event);
  alert("이 브라우저에서는 바로 공유가 어려워서 이미지를 저장했어요.");
}

async function createStoryBlob(event) {
  const theme = getTheme(event.themeId);
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1920;
  const ctx = canvas.getContext("2d");
  if (location.protocol === "file:") {
    drawStoryFallbackBackground(ctx, theme, canvas.width, canvas.height);
  } else {
    const image = await loadImage(theme.image);
    drawCoverImage(ctx, image, canvas.width, canvas.height);
  }

  const darkThemes = ["neon", "home", "serif"];
  const isDark = darkThemes.includes(theme.id);
  const textColor = theme.textColor || (isDark ? "#fff7e6" : "#202124");
  const softColor = isDark ? "rgba(255,255,255,0.82)" : "rgba(32,33,36,0.72)";
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, isDark ? "rgba(0,0,0,0.08)" : "rgba(255,255,255,0.18)");
  gradient.addColorStop(0.45, isDark ? "rgba(0,0,0,0.24)" : "rgba(255,255,255,0.34)");
  gradient.addColorStop(1, isDark ? "rgba(0,0,0,0.62)" : "rgba(255,255,255,0.72)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.textBaseline = "top";
  ctx.fillStyle = textColor;
  ctx.font = `800 44px ${canvasFont(theme.bodyFont)}`;
  ctx.fillText(event.subtitle || "초대합니다", 94, 170);
  ctx.font = `900 118px ${canvasFont(theme.titleFont)}`;
  drawWrappedText(ctx, event.title || "이름 없는 모임", 90, 300, 900, 126, 4, textColor);

  const infoY = 1120;
  drawInfoBlock(ctx, "WHEN", `${formatDate(event.date)}  ${formatTime(event.time)}`, 90, infoY, textColor, softColor, theme);
  drawInfoBlock(ctx, "WHERE", event.placeName || "장소 미정", 90, infoY + 172, textColor, softColor, theme);
  ctx.font = `500 38px ${canvasFont(theme.bodyFont)}`;
  drawWrappedText(ctx, event.address || "주소 미정", 90, infoY + 286, 820, 52, 2, softColor);
  drawInfoBlock(ctx, "HOSTED BY", event.hostName || "파티피플", 90, infoY + 392, textColor, softColor, theme);

  ctx.fillStyle = isDark ? "rgba(255,255,255,0.9)" : "rgba(255,255,255,0.84)";
  roundRect(ctx, 86, 1650, 908, 142, 30);
  ctx.fill();
  ctx.fillStyle = "#171717";
  ctx.font = `800 34px ${canvasFont(theme.bodyFont)}`;
  ctx.fillText("초대코드", 130, 1684);
  ctx.font = `900 58px ${canvasFont(theme.bodyFont)}`;
  ctx.fillText(event.code, 130, 1728);
  ctx.font = `700 30px ${canvasFont(theme.bodyFont)}`;
  ctx.fillStyle = "rgba(23,23,23,0.62)";
  ctx.fillText("파티피플에서 코드로 입장", 562, 1714);

  return new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.96));
}

function drawInfoBlock(ctx, label, value, x, y, textColor, softColor, theme) {
  ctx.fillStyle = softColor;
  ctx.font = `800 28px ${canvasFont(theme.bodyFont)}`;
  ctx.fillText(label, x, y);
  ctx.fillStyle = textColor;
  ctx.font = `800 46px ${canvasFont(theme.bodyFont)}`;
  drawWrappedText(ctx, value, x, y + 48, 850, 58, 2, textColor);
}

function canvasFont(fontStack) {
  return fontStack.replace(/'/g, "\"");
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    fetch(src)
      .then((response) => {
        if (!response.ok) throw new Error(`이미지를 불러올 수 없어요: ${src}`);
        return response.blob();
      })
      .then((blob) => {
        const image = new Image();
        const objectUrl = URL.createObjectURL(blob);
        image.onload = () => {
          URL.revokeObjectURL(objectUrl);
          resolve(image);
        };
        image.onerror = (error) => {
          URL.revokeObjectURL(objectUrl);
          reject(error);
        };
        image.src = objectUrl;
      })
      .catch(reject);
  });
}

function drawCoverImage(ctx, image, width, height) {
  const scale = Math.max(width / image.width, height / image.height);
  const drawWidth = image.width * scale;
  const drawHeight = image.height * scale;
  ctx.drawImage(image, (width - drawWidth) / 2, (height - drawHeight) / 2, drawWidth, drawHeight);
}

function drawStoryFallbackBackground(ctx, theme, width, height) {
  const [base, accent, second, paper] = theme.palette;
  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, base);
  gradient.addColorStop(0.48, accent);
  gradient.addColorStop(1, second || paper || base);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  ctx.globalAlpha = 0.26;
  ctx.fillStyle = paper || "#ffffff";
  ctx.beginPath();
  ctx.arc(width * 0.18, height * 0.18, 220, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(width * 0.86, height * 0.72, 310, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines, fillStyle) {
  const chars = String(text).split("");
  const lines = [];
  let line = "";

  chars.forEach((char) => {
    const next = line + char;
    if (ctx.measureText(next).width > maxWidth && line) {
      lines.push(line);
      line = char;
    } else {
      line = next;
    }
  });
  if (line) lines.push(line);

  ctx.fillStyle = fillStyle;
  lines.slice(0, maxLines).forEach((lineText, index) => {
    const finalText = index === maxLines - 1 && lines.length > maxLines ? `${lineText.slice(0, -1)}…` : lineText;
    ctx.fillText(finalText, x, y + lineHeight * index);
  });
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

ReactDOM.createRoot(document.getElementById("root")).render(h(App));
