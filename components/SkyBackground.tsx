/**
 * Animated sky behind the whole app: drifting clouds, planes cruising with
 * contrails, one plane climbing after take-off, and (in dark mode) twinkling stars.
 * Pure CSS animation, no JavaScript, so it costs almost nothing and
 * never causes hydration problems. See the ".sky" section in globals.css.
 */
function Plane() {
  // A simple airplane silhouette (points up; CSS rotates it to face right).
  return (
    <svg className="plane-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" />
    </svg>
  );
}

export default function SkyBackground() {
  return (
    <div className="sky" aria-hidden="true">
      <div className="stars" />
      <div className="sun" />

      <div className="cloud c1" />
      <div className="cloud c2" />
      <div className="cloud c3" />
      <div className="cloud c4" />
      <div className="cloud c5" />

      {/* Cruising planes: one flies left to right, one right to left, one far away and slow */}
      <div className="flyer f1"><span className="trail" /><Plane /></div>
      <div className="flyer f2 reverse"><span className="trail" /><Plane /></div>
      <div className="flyer f3"><span className="trail" /><Plane /></div>

      {/* Take-off: climbs from the bottom-left corner */}
      <div className="takeoff"><span className="trail" /><Plane /></div>

      <div className="horizon" />
    </div>
  );
}
