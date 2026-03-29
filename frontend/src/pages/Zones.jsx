import { zones } from "../data/mockData";
import "./Dashboard.css";
import "./Zones.css";

export default function Zones() {
  return (
    <div className="page">
      <h1 className="page-title">Parking Zones</h1>
      <p className="page-subtitle">All registered parking zones and their current availability</p>

      <div className="zones-grid">
        {zones.map((z) => {
          const pct = Math.round((z.available_slots / z.total_slots) * 100);
          const color = pct > 50 ? "#81c784" : pct > 20 ? "#ffb74d" : "#e57373";
          return (
            <div key={z.zone_id} className="zone-card">
              <div className="zone-card-header" style={{ borderLeftColor: color }}>
                <h2 className="zone-name">{z.zone_name}</h2>
                <span className="zone-location">📍 {z.location}</span>
              </div>
              <div className="zone-stats">
                <div className="zone-stat">
                  <span className="zone-stat-value">{z.total_slots}</span>
                  <span className="zone-stat-label">Total</span>
                </div>
                <div className="zone-stat">
                  <span className="zone-stat-value" style={{ color: "#a5d6a7" }}>
                    {z.available_slots}
                  </span>
                  <span className="zone-stat-label">Available</span>
                </div>
                <div className="zone-stat">
                  <span className="zone-stat-value" style={{ color: "#ef9a9a" }}>
                    {z.total_slots - z.available_slots}
                  </span>
                  <span className="zone-stat-label">Occupied</span>
                </div>
                <div className="zone-stat">
                  <span className="zone-stat-value" style={{ color: "#ffcc80" }}>
                    ${z.hourly_rate.toFixed(2)}
                  </span>
                  <span className="zone-stat-label">/ Hour</span>
                </div>
              </div>
              <div className="zone-bar-row">
                <div className="zone-bar-label">
                  <span>Availability</span>
                  <span className="zone-bar-pct">{pct}%</span>
                </div>
                <div className="zone-bar-track">
                  <div className="zone-bar-fill" style={{ width: `${pct}%`, backgroundColor: color }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
