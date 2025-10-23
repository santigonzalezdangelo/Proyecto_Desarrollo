import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { socket } from "../lib/socket"; // <-- ajustá la ruta si tu socket.js está en otro lugar
import { useDirectChat } from "../hooks/useDirectChat";

const TEXT_DARK = "#0F172A";
const API = import.meta.env.VITE_API_URL.replace(/\/$/, "");

export default function Navbar({
  logoSrc = "/images/logo.png",
  logoHref = "/",
  bg = "#F5DCA1",
  z = 200,
}) {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isHuesped, setIsHuesped] = useState(false);
  const [isAnfitrion, setIsAnfitrion] = useState(false);
  const [meId, setMeId] = useState(null);

  // Notificaciones + Chat Dock
  const [bellOpen, setBellOpen] = useState(false);
  const [unreadByPeer, setUnreadByPeer] = useState({}); // { [peerId]: count }
  const [chatOpen, setChatOpen] = useState(false);
  const [chatPeerId, setChatPeerId] = useState(null);

  const menuRef = useRef(null);
  const buttonRef = useRef(null);

  const ROLE_IDS = {
    HUESPED: Number(import.meta.env.VITE_DEFAULT_ROLE_ID),
    ANFITRION: Number(import.meta.env.VITE_DEFAULT_ANFITRION_ID),
  };

  function roleNameFromId(id) {
    const idNum = Number(id);
    if (idNum === ROLE_IDS.HUESPED) return "huesped";
    if (idNum === ROLE_IDS.ANFITRION) return "anfitrion";
    return "";
  }

  // Detectar sesión + rol + meId
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        const r = await fetch(`${API}/auth/current`, {
          credentials: "include",
          headers: { Accept: "application/json" },
        });

        if (ignore) return;

        if (!r.ok) {
          setIsLoggedIn(false);
          setIsHuesped(false);
          setIsAnfitrion(false);
          setMeId(null);
          return;
        }

        setIsLoggedIn(true);

        const j = await r.json().catch(() => ({}));
        const idRol = Number(j?.data?.id_rol ?? j?.id_rol ?? NaN);
        const role = roleNameFromId(idRol);
        setIsHuesped(role === "huesped");
        setIsAnfitrion(role === "anfitrion");

        const uid = Number(j?.data?.id_usuario ?? j?.id_usuario ?? j?.id);
        if (Number.isFinite(uid)) setMeId(uid);
      } catch {
        if (!ignore) {
          setIsLoggedIn(false);
          setIsHuesped(false);
          setIsAnfitrion(false);
          setMeId(null);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, []);

  // Suscripción a mensajes/notifications (Socket.IO) + EventBus para abrir chat
  useEffect(() => {
    if (!meId) return; // esperamos a conocer mi id

    const myIdStr = String(meId);

    // 🔔 Notificaciones livianas desde el server
    const onNotif = (n) => {
      // { type:'dm', from, text, at }
      if (!n || n.type !== "dm") return;
      const fromStr = String(n.from);
      if (fromStr === myIdStr) return; // yo no me notifico a mí mismo
      if (String(chatPeerId) === fromStr) return; // ya estoy con ese chat abierto
      setUnreadByPeer((prev) => ({
        ...prev,
        [fromStr]: (prev[fromStr] || 0) + 1,
      }));
    };

    // 📩 Mensajes completos (fallback o eco)
    const onDm = (m) => {
      // { from, to, text, at, echo? }
      if (!m) return;

      const fromStr = String(m.from);
      const toStr = String(m.to);
      const isEcho = Boolean(m.echo);

      // No sumamos si soy quien envía (eco) o si el chat de ese peer está abierto
      if (isEcho || fromStr === myIdStr) return;
      // Solo me interesan mensajes que vengan dirigidos a mí
      if (toStr !== myIdStr) return;
      if (String(chatPeerId) === fromStr) return;

      setUnreadByPeer((prev) => ({
        ...prev,
        [fromStr]: (prev[fromStr] || 0) + 1,
      }));
    };

    socket.on("notif:new", onNotif);
    socket.on("dm:new", onDm);

    // EventBus global para abrir el chat desde otras pantallas
    const onOpenChat = (ev) => {
      const pid = ev?.detail?.peerId;
      if (!pid) return;
      const pidStr = String(pid);
      setChatPeerId(pidStr);
      setChatOpen(true);
      setBellOpen(false);
      setUnreadByPeer((prev) => {
        const cp = { ...prev };
        delete cp[pidStr];
        return cp;
      });
    };
    window.addEventListener("chat:open", onOpenChat);

    return () => {
      socket.off("notif:new", onNotif);
      socket.off("dm:new", onDm);
      window.removeEventListener("chat:open", onOpenChat);
    };
  }, [meId, chatPeerId]);

  // cerrar al tocar fuera del MENÚ **y** del BOTÓN, o con Esc
  useEffect(() => {
    const onPointerDown = (e) => {
      const inMenu = menuRef.current && menuRef.current.contains(e.target);
      const inButton =
        buttonRef.current && buttonRef.current.contains(e.target);
      if (!inMenu && !inButton) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        setBellOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  // Logout
  const handleLogout = async (e) => {
    e.preventDefault();
    if (loggingOut) return;
    setOpen(false);
    setLoggingOut(true);
    try {
      await fetch(`${API}/auth/logout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
    } catch {}
    setLoggingOut(false);
    window.location.href = "/login";
  };

  const H = 72,
    PADX = 28,
    BTN = 52,
    LOGO_H = 64;

  const unreadTotal = Object.values(unreadByPeer).reduce((a, b) => a + b, 0);
  const peers = Object.keys(unreadByPeer);

  return (
    <header
      className="fixed top-0 left-0 right-0 w-full shadow-md"
      style={{
        height: H,
        backgroundColor: bg,
        color: TEXT_DARK,
        overflow: "visible",
        zIndex: z,
      }}
      aria-label="Barra de navegación"
    >
      <div
        className="mx-auto flex items-center justify-between"
        style={{ height: "100%", paddingInline: PADX, overflow: "visible" }}
      >
        {/* Logo */}
        <a
          href={logoHref}
          aria-label="Ir al inicio"
          className="flex items-center"
          style={{ lineHeight: 0, transform: "translate(-10px,8px)" }}
        >
          <img
            src={logoSrc}
            alt="AlojaApp"
            style={{
              height: LOGO_H,
              width: "auto",
              display: "block",
              objectFit: "contain",
            }}
          />
        </a>

        {/* === Botón campana (notificaciones) === */}
        {isLoggedIn &&
          createPortal(
            <button
              type="button"
              aria-label="Notificaciones"
              onClick={() => setBellOpen((v) => !v)}
              className="inline-flex items-center justify-center rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2"
              style={{
                position: "fixed",
                top: 10,
                right: 16 + BTN + 12,
                height: BTN,
                width: BTN,
                backgroundColor: "#F8C24D",
                color: TEXT_DARK,
                boxShadow: "0 10px 24px rgba(0,0,0,.16)",
                zIndex: 100000,
              }}
              title="Notificaciones"
            >
              <BellIcon />
              {unreadTotal > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: 6,
                    right: 6,
                    minWidth: 18,
                    height: 18,
                    borderRadius: 9,
                    background: "#ef4444",
                    color: "white",
                    fontSize: 11,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    paddingInline: 4,
                  }}
                >
                  {unreadTotal}
                </span>
              )}
            </button>,
            document.body
          )}

        {/* Panel de notificaciones */}
        {isLoggedIn &&
          bellOpen &&
          createPortal(
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 99998,
                pointerEvents: "none",
              }}
            >
              <div
                onClick={() => setBellOpen(false)}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.25)",
                  pointerEvents: "auto",
                }}
              />
              <div
                role="dialog"
                aria-label="Notificaciones"
                className="w-72 rounded-2xl shadow-lg border"
                style={{
                  position: "absolute",
                  top: 72 + 8,
                  right: 16 + BTN + 12,
                  background: "#FFFFFF",
                  borderColor: "rgba(0,0,0,0.06)",
                  pointerEvents: "auto",
                }}
              >
                <div className="px-4 py-3 border-b text-sm font-semibold">
                  Notificaciones
                </div>
                <div className="max-h-72 overflow-auto">
                  {unreadTotal === 0 && (
                    <div className="p-4 text-sm text-neutral-600">
                      Sin notificaciones.
                    </div>
                  )}
                  {peers.map((pid) => (
                    <button
                      key={pid}
                      onClick={() => {
                        const pidStr = String(pid);
                        setChatPeerId(pidStr);
                        setChatOpen(true);
                        setBellOpen(false);
                        setUnreadByPeer((prev) => {
                          const cp = { ...prev };
                          delete cp[pidStr];
                          return cp;
                        });
                      }}
                      className="w-full px-4 py-3 text-left hover:bg-slate-50"
                    >
                      <div className="text-sm font-medium">
                        Mensaje de usuario #{pid}
                      </div>
                      <div className="text-xs text-neutral-600">
                        Tienes {unreadByPeer[pid]} sin leer
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>,
            document.body
          )}

        {/* Botón hamburguesa portaleado */}
        {createPortal(
          <button
            ref={buttonRef}
            type="button"
            aria-haspopup="menu"
            aria-expanded={open}
            aria-controls="navbar-menu"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              position: "fixed",
              top: 10,
              right: 16,
              height: BTN,
              width: BTN,
              backgroundColor: "#F8C24D",
              color: TEXT_DARK,
              boxShadow: "0 10px 24px rgba(0,0,0,.16)",
              zIndex: 100000,
            }}
            title="Abrir menú"
          >
            <HamburgerIcon />
          </button>,
          document.body
        )}

        {/* Menú portaleado */}
        {open &&
          createPortal(
            <div
              style={{
                position: "fixed",
                inset: 0,
                zIndex: 99997,
                pointerEvents: "none",
              }}
            >
              <div
                onClick={() => setOpen(false)}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "rgba(0,0,0,0.25)",
                  pointerEvents: "auto",
                }}
              />
              <div
                ref={menuRef}
                id="navbar-menu"
                role="menu"
                aria-label="Opciones"
                className="w-64 rounded-2xl shadow-lg border"
                style={{
                  position: "absolute",
                  top: 72 + 8,
                  right: 16,
                  background: "#FFFFFF",
                  borderColor: "rgba(0,0,0,0.06)",
                  pointerEvents: "auto",
                }}
              >
                <nav className="py-2">
                  {isLoggedIn ? (
                    <>
                      {isHuesped && (
                        <>
                          <a
                            role="menuitem"
                            href="/perfil"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                            onClick={() => setOpen(false)}
                          >
                            Perfil
                          </a>
                          <a
                            role="menuitem"
                            href="/reservas"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                            onClick={() => setOpen(false)}
                          >
                            Mis reservas
                          </a>
                          <a
                            role="menuitem"
                            href="/conviertete-en-anfitrion"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                            onClick={() => setOpen(false)}
                          >
                            Convertirse en anfitrión
                          </a>
                          <div className="h-px my-2 bg-black/10 mx-3" />
                          <a
                            role="menuitem"
                            href="/login"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1 text-red-600"
                            onClick={handleLogout}
                            aria-disabled={loggingOut}
                          >
                            {loggingOut
                              ? "Cerrando sesión..."
                              : "Cerrar sesión"}
                          </a>
                        </>
                      )}

                      {isAnfitrion && (
                        <>
                          <a
                            role="menuitem"
                            href="/perfil"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                            onClick={() => setOpen(false)}
                          >
                            Perfil
                          </a>
                          <a
                            role="menuitem"
                            href="/administrarPropiedades"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                            onClick={() => setOpen(false)}
                          >
                            Administrar propiedades
                          </a>
                          <a
                            role="menuitem"
                            href="/reservas"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                            onClick={() => setOpen(false)}
                          >
                            Administrar reservas
                          </a>
                          <div className="h-px my-2 bg-black/10 mx-3" />
                          <a
                            role="menuitem"
                            href="/login"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1 text-red-600"
                            onClick={handleLogout}
                            aria-disabled={loggingOut}
                          >
                            {loggingOut
                              ? "Cerrando sesión..."
                              : "Cerrar sesión"}
                          </a>
                        </>
                      )}

                      {!isHuesped && !isAnfitrion && (
                        <>
                          <a
                            role="menuitem"
                            href="/perfil"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                            onClick={() => setOpen(false)}
                          >
                            Perfil
                          </a>
                          <div className="h-px my-2 bg-black/10 mx-3" />
                          <a
                            role="menuitem"
                            href="/login"
                            className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1 text-red-600"
                            onClick={handleLogout}
                            aria-disabled={loggingOut}
                          >
                            {loggingOut
                              ? "Cerrando sesión..."
                              : "Cerrar sesión"}
                          </a>
                        </>
                      )}
                    </>
                  ) : (
                    <a
                      role="menuitem"
                      href="/login"
                      className="block px-4 py-3 hover:bg-slate-50 rounded-xl mx-1"
                      onClick={() => setOpen(false)}
                    >
                      Login
                    </a>
                  )}
                </nav>
              </div>
            </div>,
            document.body
          )}
      </div>

      {/* === Chat flotante (dock) === */}
      {chatOpen &&
        meId &&
        chatPeerId &&
        createPortal(
          <ChatDock
            meId={meId}
            peerId={chatPeerId}
            onClose={() => setChatOpen(false)}
          />,
          document.body
        )}
    </header>
  );
}

/* ==================== Iconos ==================== */
function HamburgerIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="6" width="18" height="2" rx="1" fill={TEXT_DARK} />
      <rect x="3" y="11" width="18" height="2" rx="1" fill={TEXT_DARK} />
      <rect x="3" y="16" width="18" height="2" rx="1" fill={TEXT_DARK} />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M12 3a6 6 0 00-6 6v3.28l-.894 2.236A1 1 0 005.999 16h12a1 1 0 00.894-1.484L18 12.28V9a6 6 0 00-6-6z"
        stroke={TEXT_DARK}
        strokeWidth="1.6"
        fill="none"
      />
      <path
        d="M9 17a3 3 0 006 0"
        stroke={TEXT_DARK}
        strokeWidth="1.6"
        fill="none"
      />
    </svg>
  );
}

/* ==================== ChatDock flotante ==================== */
function ChatDock({ meId, peerId, onClose }) {
  const { messages, send } = useDirectChat(meId, peerId);
  const [text, setText] = useState("");
  const dockRef = useRef(null);
  const posRef = useRef({ x: 12, y: 120, dx: 0, dy: 0, dragging: false });

  // Drag con pointer events
  useEffect(() => {
    const el = dockRef.current;
    if (!el) return;
    const header = el.querySelector(".chatdock-handle");

    const onDown = (e) => {
      posRef.current.dragging = true;
      posRef.current.dx = e.clientX - posRef.current.x;
      posRef.current.dy = e.clientY - posRef.current.y;
      e.preventDefault();
    };
    const onMove = (e) => {
      if (!posRef.current.dragging) return;
      posRef.current.x = e.clientX - posRef.current.dx;
      posRef.current.y = e.clientY - posRef.current.dy;
      el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;
    };
    const onUp = () => {
      posRef.current.dragging = false;
    };

    header.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    // posición inicial
    el.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`;

    return () => {
      header.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, []);

  async function onSend(e) {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    await send(t);
    setText("");
  }

  return (
    <div
      ref={dockRef}
      style={{ position: "fixed", left: 0, top: 0, width: 340, zIndex: 100001 }}
      className="rounded-2xl shadow-xl border bg-white"
    >
      <div
        className="chatdock-handle cursor-move select-none flex items-center justify-between px-3 py-2 rounded-t-2xl"
        style={{ background: "#F8C24D", color: TEXT_DARK }}
      >
        <div className="text-sm font-semibold">Chat con usuario #{peerId}</div>
        <button
          onClick={onClose}
          title="Cerrar"
          className="rounded p-1 hover:bg-black/5"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M6 6l12 12M18 6L6 18"
              stroke={TEXT_DARK}
              strokeWidth="2"
              fill="none"
            />
          </svg>
        </button>
      </div>

      <div className="p-3 h-72 overflow-auto">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`my-1 flex ${
              String(m.from) === String(meId) ? "justify-end" : "justify-start"
            }`}
          >
            <span
              className={`px-3 py-1.5 rounded-2xl ${
                String(m.from) === String(meId)
                  ? "bg-black text-white"
                  : "bg-gray-100"
              }`}
            >
              {m.text}
            </span>
          </div>
        ))}
      </div>

      <form onSubmit={onSend} className="p-3 border-t flex gap-2">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Escribí un mensaje…"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <button className="px-3 py-2 rounded bg-black text-white">
          Enviar
        </button>
      </form>
    </div>
  );
}
