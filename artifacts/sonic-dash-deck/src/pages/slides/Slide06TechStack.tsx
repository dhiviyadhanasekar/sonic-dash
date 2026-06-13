export default function Slide06TechStack() {
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
          <div style={{ padding: "1vh 2vw", backgroundColor: "#d8f0e6", borderRadius: "4vw", fontSize: "1.2vw", fontWeight: 600, color: "#2e7d5d" }}>Tech Stack</div>
        </div>

        <h2 style={{ fontSize: "3.5vw", fontWeight: 800, color: "#1a1a1a", margin: "0 0 3vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>Built with</h2>

        {/* 2x3 grid */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gridTemplateRows: "1fr 1fr", gap: "2vh 2vw" }}>
          <div style={{ backgroundColor: "#ffffff", borderRadius: "2.5vw", padding: "2vh 2.5vw", border: "0.1vw solid #f0f0f0", display: "flex", flexDirection: "column", gap: "1vh" }}>
            <div style={{ fontSize: "1.8vw", fontWeight: 800, color: "#1a1a1a" }}>React 19 + Vite 7</div>
            <div style={{ fontSize: "1.4vw", fontWeight: 400, color: "#777777" }}>UI and dev server</div>
          </div>
          <div style={{ backgroundColor: "#e2d8ff", borderRadius: "2.5vw", padding: "2vh 2.5vw", border: "0.1vw solid #d4c4fa", display: "flex", flexDirection: "column", gap: "1vh" }}>
            <div style={{ fontSize: "1.8vw", fontWeight: 800, color: "#5c3ca8" }}>TypeScript 5.9</div>
            <div style={{ fontSize: "1.4vw", fontWeight: 400, color: "#6b4eb5" }}>Strict typing throughout</div>
          </div>
          <div style={{ backgroundColor: "#ffd8d8", borderRadius: "2.5vw", padding: "2vh 2.5vw", border: "0.1vw solid #ffc0c0", display: "flex", flexDirection: "column", gap: "1vh" }}>
            <div style={{ fontSize: "1.8vw", fontWeight: 800, color: "#a83232" }}>HTML Canvas API</div>
            <div style={{ fontSize: "1.4vw", fontWeight: 400, color: "#cc4444" }}>60 fps game rendering</div>
          </div>
          <div style={{ backgroundColor: "#d8f0e6", borderRadius: "2.5vw", padding: "2vh 2.5vw", border: "0.1vw solid #bce6d5", display: "flex", flexDirection: "column", gap: "1vh" }}>
            <div style={{ fontSize: "1.8vw", fontWeight: 800, color: "#2e7d5d" }}>pnpm workspaces</div>
            <div style={{ fontSize: "1.4vw", fontWeight: 400, color: "#3f9c76" }}>Monorepo structure</div>
          </div>
          <div style={{ backgroundColor: "#ffe8a1", borderRadius: "2.5vw", padding: "2vh 2.5vw", border: "0.1vw solid #ffd866", display: "flex", flexDirection: "column", gap: "1vh" }}>
            <div style={{ fontSize: "1.8vw", fontWeight: 800, color: "#9a7c00" }}>Vitest 3</div>
            <div style={{ fontSize: "1.4vw", fontWeight: 400, color: "#7a6200" }}>Unit + integration tests</div>
          </div>
          <div style={{ backgroundColor: "#ffc4a3", borderRadius: "2.5vw", padding: "2vh 2.5vw", border: "0.1vw solid #ffaa80", display: "flex", flexDirection: "column", gap: "1vh" }}>
            <div style={{ fontSize: "1.8vw", fontWeight: 800, color: "#a65121" }}>Playwright 1.49</div>
            <div style={{ fontSize: "1.4vw", fontWeight: 400, color: "#7a3d18" }}>End-to-end browser tests</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2vh" }}>
          <div style={{ fontSize: "1.2vw", fontWeight: 500, color: "#888888", display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "0.8vw", height: "0.8vw", backgroundColor: "#888888", borderRadius: "50%", display: "inline-block" }} />
            dhiviyadhanasekar
          </div>
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#888888" }}>06</div>
        </div>
      </div>
    </div>
  );
}
