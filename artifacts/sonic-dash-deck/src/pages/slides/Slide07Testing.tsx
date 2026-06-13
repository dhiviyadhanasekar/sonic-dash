export default function Slide07Testing() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ backgroundColor: "#fdfbf7", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div style={{ position: "absolute", top: "-10vh", left: "-5vw", width: "40vw", height: "40vw", backgroundColor: "#ffd8d8", borderRadius: "50%", opacity: 0.6, filter: "blur(4vw)" }} />
      <div style={{ position: "absolute", bottom: "-15vh", right: "-10vw", width: "50vw", height: "50vw", backgroundColor: "#d8f0e6", borderRadius: "50%", opacity: 0.6, filter: "blur(5vw)" }} />
      <div style={{ position: "absolute", top: "20vh", right: "15vw", width: "15vw", height: "15vw", backgroundColor: "#e2d8ff", borderRadius: "4vw", transform: "rotate(15deg)", opacity: 0.7 }} />
      <div style={{ position: "absolute", bottom: "25vh", left: "15vw", width: "10vw", height: "10vw", backgroundColor: "#ffe8a1", borderRadius: "50%", opacity: 0.8 }} />
      <div style={{ position: "absolute", top: "10vh", left: "30vw", width: "5vw", height: "5vw", backgroundColor: "#ffc4a3", borderRadius: "2vw", transform: "rotate(-20deg)", opacity: 0.7 }} />

      <div style={{ width: "80vw", height: "80vh", backgroundColor: "rgba(255,255,255,0.6)", backdropFilter: "blur(2vw)", WebkitBackdropFilter: "blur(2vw)", borderRadius: "6vw", border: "0.2vw solid rgba(255,255,255,0.8)", boxShadow: "0 4vh 8vh rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", padding: "6vh 6vw", boxSizing: "border-box", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "3vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
            <div style={{ width: "3vw", height: "3vw", backgroundColor: "#1a1a1a", borderRadius: "1vw", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1.4vw" }}>S.</div>
            <div style={{ fontSize: "1.5vw", fontWeight: 700, color: "#1a1a1a" }}>Sonic Dash</div>
          </div>
          <div style={{ padding: "1vh 2vw", backgroundColor: "#ffc4a3", borderRadius: "4vw", fontSize: "1.2vw", fontWeight: 600, color: "#a65121" }}>Testing</div>
        </div>

        {/* Content — big stat left, breakdown right */}
        <div style={{ flex: 1, display: "flex", gap: "5vw", alignItems: "center" }}>
          {/* Hero stat */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "#e2d8ff", borderRadius: "4vw", padding: "4vh 3vw" }}>
            <div style={{ fontSize: "12vw", fontWeight: 800, color: "#5c3ca8", lineHeight: 1, letterSpacing: "-0.05em" }}>165</div>
            <div style={{ fontSize: "2vw", fontWeight: 600, color: "#5c3ca8", marginTop: "1vh" }}>tests — all passing</div>
            <div style={{ fontSize: "1.5vw", fontWeight: 400, color: "#777777", marginTop: "1vh" }}>Test-first development</div>
          </div>

          {/* Breakdown */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2.5vh" }}>
            <div>
              <div style={{ fontSize: "2.5vw", fontWeight: 800, color: "#1a1a1a" }}>119</div>
              <div style={{ fontSize: "1.6vw", fontWeight: 400, color: "#555555" }}>Unit tests — physics, rings, characters, win conditions</div>
            </div>
            <div style={{ width: "100%", height: "0.1vw", backgroundColor: "#e0e0e0" }} />
            <div>
              <div style={{ fontSize: "2.5vw", fontWeight: 800, color: "#1a1a1a" }}>24</div>
              <div style={{ fontSize: "1.6vw", fontWeight: 400, color: "#555555" }}>Integration tests — full game-state flows</div>
            </div>
            <div style={{ width: "100%", height: "0.1vw", backgroundColor: "#e0e0e0" }} />
            <div>
              <div style={{ fontSize: "2.5vw", fontWeight: 800, color: "#1a1a1a" }}>22</div>
              <div style={{ fontSize: "1.6vw", fontWeight: 400, color: "#555555" }}>Playwright E2E — including full character select flow</div>
            </div>
            <div style={{ width: "100%", height: "0.1vw", backgroundColor: "#e0e0e0" }} />
            <div style={{ fontSize: "1.6vw", fontWeight: 400, color: "#555555" }}>Character system tests were written before the implementation</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2vh" }}>
          <div style={{ fontSize: "1.2vw", fontWeight: 500, color: "#888888", display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "0.8vw", height: "0.8vw", backgroundColor: "#888888", borderRadius: "50%", display: "inline-block" }} />
            dhiviyadhanasekar
          </div>
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#888888" }}>07</div>
        </div>
      </div>
    </div>
  );
}
