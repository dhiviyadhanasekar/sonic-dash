export default function Slide08Quality() {
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
          <div style={{ padding: "1vh 2vw", backgroundColor: "#d8f0e6", borderRadius: "4vw", fontSize: "1.2vw", fontWeight: 600, color: "#2e7d5d" }}>Quality</div>
        </div>

        <div style={{ flex: 1, display: "flex", gap: "5vw", alignItems: "center" }}>
          {/* Left — accessibility */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "3.5vw", fontWeight: 800, color: "#1a1a1a", margin: "0 0 3vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>Accessibility</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
              <div style={{ backgroundColor: "#e2d8ff", borderRadius: "2vw", padding: "1.8vh 2.5vw" }}>
                <div style={{ fontSize: "1.7vw", fontWeight: 700, color: "#5c3ca8" }}>Canvas role + aria-label</div>
                <div style={{ fontSize: "1.4vw", fontWeight: 400, color: "#6b4eb5", marginTop: "0.5vh" }}>Screen-reader compatible game element</div>
              </div>
              <div style={{ backgroundColor: "#d8f0e6", borderRadius: "2vw", padding: "1.8vh 2.5vw" }}>
                <div style={{ fontSize: "1.7vw", fontWeight: 700, color: "#2e7d5d" }}>Aria-live region</div>
                <div style={{ fontSize: "1.4vw", fontWeight: 400, color: "#3f9c76", marginTop: "0.5vh" }}>Game state changes announced automatically</div>
              </div>
              <div style={{ backgroundColor: "#ffe8a1", borderRadius: "2vw", padding: "1.8vh 2.5vw" }}>
                <div style={{ fontSize: "1.7vw", fontWeight: 700, color: "#9a7c00" }}>Character select dialog</div>
                <div style={{ fontSize: "1.4vw", fontWeight: 400, color: "#7a6200", marginTop: "0.5vh" }}>Full ARIA roles, keyboard navigation</div>
              </div>
            </div>
          </div>

          {/* Right — security */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "3.5vw", fontWeight: 800, color: "#1a1a1a", margin: "0 0 3vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>Security</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "2vh" }}>
              <div style={{ backgroundColor: "#ffd8d8", borderRadius: "2vw", padding: "1.8vh 2.5vw" }}>
                <div style={{ fontSize: "1.7vw", fontWeight: 700, color: "#a83232" }}>Content Security Policy</div>
                <div style={{ fontSize: "1.4vw", fontWeight: 400, color: "#cc4444", marginTop: "0.5vh" }}>Meta tag restricts resource loading (OWASP A05)</div>
              </div>
              <div style={{ backgroundColor: "#ffc4a3", borderRadius: "2vw", padding: "1.8vh 2.5vw" }}>
                <div style={{ fontSize: "1.7vw", fontWeight: 700, color: "#a65121" }}>Scoped key handling</div>
                <div style={{ fontSize: "1.4vw", fontWeight: 400, color: "#7a3d18", marginTop: "0.5vh" }}>preventDefault only fires for known game keys</div>
              </div>
              <div style={{ backgroundColor: "#ffffff", borderRadius: "2vw", padding: "1.8vh 2.5vw", border: "0.1vw solid #f0f0f0" }}>
                <div style={{ fontSize: "1.7vw", fontWeight: 700, color: "#1a1a1a" }}>X-Content-Type-Options</div>
                <div style={{ fontSize: "1.4vw", fontWeight: 400, color: "#555555", marginTop: "0.5vh" }}>MIME-type sniffing disabled</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2vh" }}>
          <div style={{ fontSize: "1.2vw", fontWeight: 500, color: "#888888", display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "0.8vw", height: "0.8vw", backgroundColor: "#888888", borderRadius: "50%", display: "inline-block" }} />
            dhiviyadhanasekar
          </div>
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#888888" }}>08</div>
        </div>
      </div>
    </div>
  );
}
