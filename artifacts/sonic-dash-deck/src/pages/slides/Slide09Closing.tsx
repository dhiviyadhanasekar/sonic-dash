export default function Slide09Closing() {
  return (
    <div
      className="w-screen h-screen overflow-hidden relative"
      style={{ backgroundColor: "#fdfbf7", fontFamily: "'DM Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div style={{ position: "absolute", top: "-10vh", left: "-5vw", width: "40vw", height: "40vw", backgroundColor: "#ffd8d8", borderRadius: "50%", opacity: 0.7, filter: "blur(4vw)" }} />
      <div style={{ position: "absolute", bottom: "-15vh", right: "-10vw", width: "50vw", height: "50vw", backgroundColor: "#d8f0e6", borderRadius: "50%", opacity: 0.7, filter: "blur(5vw)" }} />
      <div style={{ position: "absolute", top: "20vh", right: "15vw", width: "15vw", height: "15vw", backgroundColor: "#e2d8ff", borderRadius: "4vw", transform: "rotate(15deg)", opacity: 0.7 }} />
      <div style={{ position: "absolute", bottom: "25vh", left: "15vw", width: "10vw", height: "10vw", backgroundColor: "#ffe8a1", borderRadius: "50%", opacity: 0.8 }} />
      <div style={{ position: "absolute", top: "10vh", left: "30vw", width: "5vw", height: "5vw", backgroundColor: "#ffc4a3", borderRadius: "2vw", transform: "rotate(-20deg)", opacity: 0.7 }} />
      <div style={{ position: "absolute", top: "40vh", left: "5vw", width: "8vw", height: "8vw", backgroundColor: "#d8f0e6", borderRadius: "50%", opacity: 0.6, filter: "blur(1vw)" }} />
      <div style={{ position: "absolute", bottom: "10vh", right: "20vw", width: "6vw", height: "6vw", backgroundColor: "#ffe8a1", borderRadius: "2vw", transform: "rotate(30deg)", opacity: 0.6 }} />

      <div style={{ width: "80vw", height: "80vh", backgroundColor: "rgba(255,255,255,0.6)", backdropFilter: "blur(2vw)", WebkitBackdropFilter: "blur(2vw)", borderRadius: "6vw", border: "0.2vw solid rgba(255,255,255,0.8)", boxShadow: "0 4vh 8vh rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", padding: "6vh 6vw", boxSizing: "border-box", position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
            <div style={{ width: "3vw", height: "3vw", backgroundColor: "#1a1a1a", borderRadius: "1vw", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1.4vw" }}>S.</div>
            <div style={{ fontSize: "1.5vw", fontWeight: 700, color: "#1a1a1a" }}>Sonic Dash</div>
          </div>
          <div style={{ padding: "1vh 2vw", backgroundColor: "#ffe8a1", borderRadius: "4vw", fontSize: "1.2vw", fontWeight: 600, color: "#9a7c00" }}>Live on Replit</div>
        </div>

        {/* Center content */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center" }}>
          <div style={{ padding: "1.5vh 3vw", backgroundColor: "#d8f0e6", borderRadius: "4vw", fontSize: "1.5vw", fontWeight: 600, color: "#2e7d5d", marginBottom: "4vh", transform: "rotate(1.5deg)" }}>
            Open the preview and press Space to start
          </div>
          <h1 style={{ fontSize: "7vw", fontWeight: 800, color: "#1a1a1a", margin: 0, lineHeight: 1.1, letterSpacing: "-0.03em" }}>
            Play it Now
          </h1>
          <p style={{ fontSize: "2.2vw", fontWeight: 400, color: "#555555", marginTop: "3vh", maxWidth: "55vw", lineHeight: 1.4 }}>
            No installs. No accounts. Runs entirely in the browser — built on Replit.
          </p>
          <div style={{ marginTop: "4vh", display: "flex", gap: "2vw" }}>
            <div style={{ padding: "1.5vh 3vw", backgroundColor: "#e2d8ff", borderRadius: "3vw", fontSize: "1.6vw", fontWeight: 700, color: "#5c3ca8" }}>165 tests passing</div>
            <div style={{ padding: "1.5vh 3vw", backgroundColor: "#ffd8d8", borderRadius: "3vw", fontSize: "1.6vw", fontWeight: 700, color: "#a83232" }}>5 characters</div>
            <div style={{ padding: "1.5vh 3vw", backgroundColor: "#ffe8a1", borderRadius: "3vw", fontSize: "1.6vw", fontWeight: 700, color: "#9a7c00" }}>15 rings to win</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ fontSize: "1.2vw", fontWeight: 500, color: "#888888", display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "0.8vw", height: "0.8vw", backgroundColor: "#888888", borderRadius: "50%", display: "inline-block" }} />
            dhiviyadhanasekar
          </div>
        </div>
      </div>
    </div>
  );
}
