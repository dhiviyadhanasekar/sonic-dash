export default function Slide02TheIdea() {
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4vh" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "1vw" }}>
            <div style={{ width: "3vw", height: "3vw", backgroundColor: "#1a1a1a", borderRadius: "1vw", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: "1.4vw" }}>S.</div>
            <div style={{ fontSize: "1.5vw", fontWeight: 700, color: "#1a1a1a" }}>Sonic Dash</div>
          </div>
          <div style={{ padding: "1vh 2vw", backgroundColor: "#e2d8ff", borderRadius: "4vw", fontSize: "1.2vw", fontWeight: 600, color: "#5c3ca8" }}>The Idea</div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: "flex", gap: "5vw", alignItems: "center" }}>
          {/* Left */}
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: "4vw", fontWeight: 800, color: "#1a1a1a", margin: "0 0 3vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>
              A race on the same screen
            </h2>
            <p style={{ fontSize: "2vw", fontWeight: 400, color: "#555555", lineHeight: 1.5, margin: "0 0 3vh 0" }}>
              Two friends, one keyboard, one goal — collect rings faster than your opponent.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5vw", marginBottom: "2vh" }}>
              <div style={{ width: "1vw", height: "1vw", borderRadius: "50%", backgroundColor: "#ffd8d8", border: "0.2vw solid #a83232", flexShrink: 0 }} />
              <div style={{ fontSize: "1.8vw", fontWeight: 600, color: "#1a1a1a" }}>First to 15 rings wins</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5vw", marginBottom: "2vh" }}>
              <div style={{ width: "1vw", height: "1vw", borderRadius: "50%", backgroundColor: "#ffe8a1", border: "0.2vw solid #9a7c00", flexShrink: 0 }} />
              <div style={{ fontSize: "1.8vw", fontWeight: 600, color: "#1a1a1a" }}>Spikes and springs add chaos</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "1.5vw" }}>
              <div style={{ width: "1vw", height: "1vw", borderRadius: "50%", backgroundColor: "#d8f0e6", border: "0.2vw solid #2e7d5d", flexShrink: 0 }} />
              <div style={{ fontSize: "1.8vw", fontWeight: 600, color: "#1a1a1a" }}>Pick up and play in seconds</div>
            </div>
          </div>

          {/* Right cards */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2vh" }}>
            <div style={{ backgroundColor: "#ffffff", borderRadius: "3vw", padding: "2.5vh 3vw", border: "0.1vw solid #f0f0f0", boxShadow: "0 2vh 4vh rgba(0,0,0,0.02)", transform: "rotate(2deg)" }}>
              <h3 style={{ fontSize: "1.6vw", fontWeight: 700, margin: "0 0 0.8vh 0", color: "#1a1a1a" }}>No install needed</h3>
              <p style={{ fontSize: "1.4vw", margin: 0, color: "#777777", lineHeight: 1.4 }}>Runs entirely in the browser — open and play.</p>
            </div>
            <div style={{ backgroundColor: "#e2d8ff", borderRadius: "3vw", padding: "2.5vh 3vw", border: "0.1vw solid #d4c4fa", boxShadow: "0 2vh 4vh rgba(0,0,0,0.02)", transform: "rotate(-1deg)" }}>
              <h3 style={{ fontSize: "1.6vw", fontWeight: 700, margin: "0 0 0.8vh 0", color: "#5c3ca8" }}>5 characters to choose</h3>
              <p style={{ fontSize: "1.4vw", margin: 0, color: "#6b4eb5", lineHeight: 1.4 }}>Sonic, Shadow, Tails, Super Sonic, Knuckles.</p>
            </div>
            <div style={{ backgroundColor: "#d8f0e6", borderRadius: "3vw", padding: "2.5vh 3vw", border: "0.1vw solid #bce6d5", boxShadow: "0 2vh 4vh rgba(0,0,0,0.02)", transform: "rotate(1.5deg)" }}>
              <h3 style={{ fontSize: "1.6vw", fontWeight: 700, margin: "0 0 0.8vh 0", color: "#2e7d5d" }}>Same character? No problem</h3>
              <p style={{ fontSize: "1.4vw", margin: 0, color: "#3f9c76", lineHeight: 1.4 }}>A P1 / P2 label appears above each character.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "auto", paddingTop: "2vh" }}>
          <div style={{ fontSize: "1.2vw", fontWeight: 500, color: "#888888", display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "0.8vw", height: "0.8vw", backgroundColor: "#888888", borderRadius: "50%", display: "inline-block" }} />
            dhiviyadhanasekar
          </div>
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#888888" }}>02</div>
        </div>
      </div>
    </div>
  );
}
