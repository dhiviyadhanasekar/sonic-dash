export default function Slide04Characters() {
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
          <div style={{ padding: "1vh 2vw", backgroundColor: "#e2d8ff", borderRadius: "4vw", fontSize: "1.2vw", fontWeight: 600, color: "#5c3ca8" }}>Characters</div>
        </div>

        <h2 style={{ fontSize: "3.5vw", fontWeight: 800, color: "#1a1a1a", margin: "0 0 3vh 0", lineHeight: 1.1, letterSpacing: "-0.02em" }}>Pick Your Character</h2>

        {/* 5 character cards */}
        <div style={{ flex: 1, display: "flex", gap: "2vw", alignItems: "stretch" }}>
          {/* Sonic */}
          <div style={{ flex: 1, backgroundColor: "#e2d8ff", borderRadius: "3vw", padding: "2.5vh 2vw", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5vh", transform: "rotate(-1deg)" }}>
            <div style={{ width: "6vw", height: "6vw", backgroundColor: "#4488ff", borderRadius: "50%", border: "0.3vw solid #2255cc" }} />
            <div style={{ fontSize: "1.6vw", fontWeight: 800, color: "#1a1a1a", textAlign: "center" }}>Sonic</div>
            <div style={{ fontSize: "1.3vw", fontWeight: 400, color: "#5c3ca8", textAlign: "center", lineHeight: 1.3 }}>Classic blue speedster</div>
          </div>
          {/* Shadow */}
          <div style={{ flex: 1, backgroundColor: "#ffd8d8", borderRadius: "3vw", padding: "2.5vh 2vw", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5vh", transform: "rotate(1.5deg)" }}>
            <div style={{ width: "6vw", height: "6vw", backgroundColor: "#222222", borderRadius: "50%", border: "0.3vw solid #cc2222" }} />
            <div style={{ fontSize: "1.6vw", fontWeight: 800, color: "#1a1a1a", textAlign: "center" }}>Shadow</div>
            <div style={{ fontSize: "1.3vw", fontWeight: 400, color: "#a83232", textAlign: "center", lineHeight: 1.3 }}>Red-and-black, attitude</div>
          </div>
          {/* Tails */}
          <div style={{ flex: 1, backgroundColor: "#ffe8a1", borderRadius: "3vw", padding: "2.5vh 2vw", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5vh", transform: "rotate(-0.5deg)" }}>
            <div style={{ width: "6vw", height: "6vw", backgroundColor: "#ff9933", borderRadius: "50%", border: "0.3vw solid #cc6600" }} />
            <div style={{ fontSize: "1.6vw", fontWeight: 800, color: "#1a1a1a", textAlign: "center" }}>Tails</div>
            <div style={{ fontSize: "1.3vw", fontWeight: 400, color: "#9a7c00", textAlign: "center", lineHeight: 1.3 }}>Twin animated tails</div>
          </div>
          {/* Super Sonic */}
          <div style={{ flex: 1, backgroundColor: "#d8f0e6", borderRadius: "3vw", padding: "2.5vh 2vw", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5vh", transform: "rotate(2deg)" }}>
            <div style={{ width: "6vw", height: "6vw", backgroundColor: "#ffdd00", borderRadius: "50%", border: "0.3vw solid #cc9900" }} />
            <div style={{ fontSize: "1.6vw", fontWeight: 800, color: "#1a1a1a", textAlign: "center" }}>Super Sonic</div>
            <div style={{ fontSize: "1.3vw", fontWeight: 400, color: "#2e7d5d", textAlign: "center", lineHeight: 1.3 }}>Golden powered-up form</div>
          </div>
          {/* Knuckles */}
          <div style={{ flex: 1, backgroundColor: "#ffc4a3", borderRadius: "3vw", padding: "2.5vh 2vw", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.5vh", transform: "rotate(-1.5deg)" }}>
            <div style={{ width: "6vw", height: "6vw", backgroundColor: "#dd2233", borderRadius: "50%", border: "0.3vw solid #881122" }} />
            <div style={{ fontSize: "1.6vw", fontWeight: 800, color: "#1a1a1a", textAlign: "center" }}>Knuckles</div>
            <div style={{ fontSize: "1.3vw", fontWeight: 400, color: "#a65121", textAlign: "center", lineHeight: 1.3 }}>Red guardian, dreadlock spikes</div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "2vh" }}>
          <div style={{ fontSize: "1.2vw", fontWeight: 500, color: "#888888", display: "flex", alignItems: "center", gap: "0.5vw" }}>
            <span style={{ width: "0.8vw", height: "0.8vw", backgroundColor: "#888888", borderRadius: "50%", display: "inline-block" }} />
            dhiviyadhanasekar
          </div>
          <div style={{ fontSize: "1.2vw", fontWeight: 600, color: "#888888" }}>04</div>
        </div>
      </div>
    </div>
  );
}
