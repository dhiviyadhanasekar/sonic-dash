import { useEffect, useState, useCallback } from "react";
import { CHARACTERS, type CharacterType } from "./logic";

interface Props {
  onStart: (p1: CharacterType, p2: CharacterType) => void;
}

// Character color palette
const CHAR_COLORS: Record<CharacterType, { bg: string; accent: string; text: string }> = {
  sonic:      { bg: "#0D47A1", accent: "#42A5F5", text: "#E3F2FD" },
  shadow:     { bg: "#1A1A2E", accent: "#E53935", text: "#FFCDD2" },
  tails:      { bg: "#E65100", accent: "#FFB300", text: "#FFF8E1" },
  superSonic: { bg: "#F57F17", accent: "#FFD600", text: "#FFFDE7" },
  knuckles:   { bg: "#B71C1C", accent: "#EF9A9A", text: "#FFEBEE" },
};

// Simple character icon as a styled element
function CharIcon({ type }: { type: CharacterType }) {
  const colors = CHAR_COLORS[type];
  const symbols: Record<CharacterType, string> = {
    sonic: "S",
    shadow: "Sh",
    tails: "T",
    superSonic: "SS",
    knuckles: "K",
  };
  return (
    <div
      aria-hidden="true"
      style={{
        width: 72, height: 72,
        borderRadius: "50%",
        background: `radial-gradient(circle at 35% 35%, ${colors.accent}, ${colors.bg})`,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 26, fontWeight: 900, color: colors.text,
        margin: "0 auto 10px",
        boxShadow: `0 0 16px ${colors.accent}80`,
        letterSpacing: -1,
      }}
    >
      {symbols[type]}
    </div>
  );
}

export default function CharacterSelect({ onStart }: Props) {
  const [p1Idx, setP1Idx] = useState(0);
  const [p2Idx, setP2Idx] = useState(2); // Tails as default for P2
  const [p1Confirmed, setP1Confirmed] = useState(false);
  const [p2Confirmed, setP2Confirmed] = useState(false);

  const tryStart = useCallback(
    (newP1Confirmed: boolean, newP2Confirmed: boolean, p1I: number, p2I: number) => {
      if (newP1Confirmed && newP2Confirmed) {
        onStart(CHARACTERS[p1I].id, CHARACTERS[p2I].id);
      }
    },
    [onStart],
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      const n = CHARACTERS.length;

      // P1 navigation (A/D) and confirm (W)
      if (!p1Confirmed) {
        if (e.code === "KeyA") {
          e.preventDefault(); e.stopPropagation();
          setP1Idx(i => (i - 1 + n) % n);
          return;
        }
        if (e.code === "KeyD") {
          e.preventDefault(); e.stopPropagation();
          setP1Idx(i => (i + 1) % n);
          return;
        }
        if (e.code === "KeyW") {
          e.preventDefault(); e.stopPropagation();
          setP1Confirmed(true);
          tryStart(true, p2Confirmed, p1Idx, p2Idx);
          return;
        }
      }

      // P2 navigation (arrows) and confirm (ArrowUp)
      if (!p2Confirmed) {
        if (e.code === "ArrowLeft") {
          e.preventDefault(); e.stopPropagation();
          setP2Idx(i => (i - 1 + n) % n);
          return;
        }
        if (e.code === "ArrowRight") {
          e.preventDefault(); e.stopPropagation();
          setP2Idx(i => (i + 1) % n);
          return;
        }
        if (e.code === "ArrowUp") {
          e.preventDefault(); e.stopPropagation();
          setP2Confirmed(true);
          tryStart(p1Confirmed, true, p1Idx, p2Idx);
          return;
        }
      }
    };

    window.addEventListener("keydown", handleKey, { capture: true });
    return () => window.removeEventListener("keydown", handleKey, { capture: true });
  }, [p1Idx, p2Idx, p1Confirmed, p2Confirmed, tryStart]);

  const isDuplicate = p1Idx === p2Idx;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Character selection screen"
      style={{
        position: "absolute", inset: 0,
        background: "rgba(2, 8, 28, 0.92)",
        display: "flex", alignItems: "center", justifyContent: "center",
        zIndex: 10,
      }}
    >
      <div style={{ textAlign: "center", width: "100%", maxWidth: 1100, padding: "0 16px" }}>
        {/* Title */}
        <h1
          style={{
            margin: "0 0 6px",
            fontSize: 38, fontWeight: 900, letterSpacing: 2,
            background: "linear-gradient(90deg, #4488FF, #FFD700, #4488FF)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          CHOOSE YOUR CHARACTER
        </h1>

        {/* Controls legend */}
        <div style={{ display: "flex", justifyContent: "center", gap: 48, marginBottom: 24, fontSize: 15 }}>
          <div style={{ color: "#64B5F6" }}>
            <strong style={{ color: "#4488FF" }}>P1</strong>
            &nbsp;&nbsp;A / D&nbsp; navigate &nbsp;·&nbsp; W&nbsp; confirm
          </div>
          <div style={{ color: "#FFAB91" }}>
            <strong style={{ color: "#FF6600" }}>P2</strong>
            &nbsp;&nbsp;← / →&nbsp; navigate &nbsp;·&nbsp; ↑&nbsp; confirm
          </div>
        </div>

        {/* Character cards */}
        <div
          role="listbox"
          aria-label="Characters"
          style={{ display: "flex", gap: 14, justifyContent: "center", marginBottom: 24 }}
        >
          {CHARACTERS.map((char, i) => {
            const isP1Here = p1Idx === i;
            const isP2Here = p2Idx === i;
            const colors = CHAR_COLORS[char.id];
            const bothHere = isP1Here && isP2Here;

            let borderStyle = "3px solid rgba(255,255,255,0.08)";
            let boxShadow = "none";
            if (bothHere) {
              borderStyle = "3px solid #FFD700";
              boxShadow = "0 0 18px #FFD70088";
            } else if (isP1Here) {
              borderStyle = "3px solid #4488FF";
              boxShadow = "0 0 14px #4488FF88";
            } else if (isP2Here) {
              borderStyle = "3px solid #FF6600";
              boxShadow = "0 0 14px #FF660088";
            }

            return (
              <div
                key={char.id}
                role="option"
                aria-selected={isP1Here || isP2Here}
                aria-label={`${char.name}. ${char.description}${isP1Here ? ". Selected by P1" : ""}${isP2Here ? ". Selected by P2" : ""}`}
                style={{
                  background: `linear-gradient(160deg, ${colors.bg}EE, ${colors.bg}AA)`,
                  border: borderStyle,
                  boxShadow,
                  borderRadius: 14,
                  padding: "16px 12px 14px",
                  width: 160,
                  cursor: "default",
                  transition: "box-shadow 0.15s, border 0.15s",
                  position: "relative",
                  userSelect: "none",
                }}
              >
                {/* Confirmed overlay */}
                {((isP1Here && p1Confirmed) || (isP2Here && p2Confirmed)) && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute", top: 6, right: 8,
                      fontSize: 20, color: "#69F0AE",
                    }}
                  >
                    ✓
                  </div>
                )}

                <CharIcon type={char.id} />

                {/* Player badges */}
                <div style={{ display: "flex", justifyContent: "center", gap: 6, minHeight: 22, marginBottom: 6 }}>
                  {isP1Here && (
                    <span
                      aria-hidden="true"
                      style={{
                        background: p1Confirmed ? "#1B5E20" : "#1565C0",
                        color: "white", fontSize: 11, fontWeight: 800,
                        padding: "2px 8px", borderRadius: 10,
                      }}
                    >
                      {p1Confirmed ? "P1 ✓" : "P1"}
                    </span>
                  )}
                  {isP2Here && (
                    <span
                      aria-hidden="true"
                      style={{
                        background: p2Confirmed ? "#1B5E20" : "#BF360C",
                        color: "white", fontSize: 11, fontWeight: 800,
                        padding: "2px 8px", borderRadius: 10,
                      }}
                    >
                      {p2Confirmed ? "P2 ✓" : "P2"}
                    </span>
                  )}
                </div>

                <div style={{ color: colors.accent, fontWeight: 800, fontSize: 14, letterSpacing: 1 }}>
                  {char.name}
                </div>
                <div style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 4 }}>
                  {char.description}
                </div>
              </div>
            );
          })}
        </div>

        {/* Same-character notice */}
        {isDuplicate && (
          <p
            role="alert"
            style={{ color: "#FFD700", fontSize: 14, margin: "0 0 12px", fontWeight: 600 }}
          >
            ★ Same character chosen! Each player will show a colored name tag in game. ★
          </p>
        )}

        {/* Status row */}
        <div style={{ display: "flex", justifyContent: "center", gap: 48, fontSize: 16 }}>
          <div style={{ color: p1Confirmed ? "#69F0AE" : "#64B5F6" }}>
            <strong>P1:</strong>{" "}
            {p1Confirmed
              ? `✓ ${CHARACTERS[p1Idx].name} — READY!`
              : `${CHARACTERS[p1Idx].name} — Press W to confirm`}
          </div>
          <div style={{ color: p2Confirmed ? "#69F0AE" : "#FFAB91" }}>
            <strong>P2:</strong>{" "}
            {p2Confirmed
              ? `✓ ${CHARACTERS[p2Idx].name} — READY!`
              : `${CHARACTERS[p2Idx].name} — Press ↑ to confirm`}
          </div>
        </div>
      </div>
    </div>
  );
}
