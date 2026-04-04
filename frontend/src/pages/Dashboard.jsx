import { useData } from "../data/useData";
import "./Dashboard.css";

export default function Dashboard() {
  const { zones, sessions, payments, loading, error } = useData(['zones', 'sessions', 'payments']);

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error loading database: {error}. Please ensure your MongoDB Atlas IP is whitelisted and your backend is connected.</div>;
  if (!zones || !sessions || !payments) return <div>No data available.</div>;

  const totalSlots = zones.reduce((sum, z) => sum + z.total_slots, 0);
  const activeSessions = sessions.filter((s) => s.status === "Active").length;
  // UI-only: align occupied slots with active sessions.
  const occupiedSlots = activeSessions;
  const availableSlots = Math.max(totalSlots - occupiedSlots, 0);
  const totalRevenue = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const stats = [
    { label: "Parking Zones", value: zones.length, icon: "🗺️", color: "#4fc3f7" },
    { label: "Total Slots", value: totalSlots, icon: "🅿️", color: "#81c784" },
    { label: "Available", value: availableSlots, icon: "✅", color: "#a5d6a7" },
    { label: "Occupied", value: occupiedSlots, icon: "🚗", color: "#ef9a9a" },
    // { label: "Active Sessions", value: activeSessions, icon: "⏱️", color: "#ffcc80" },
    { label: "Revenue Today", value: `$${totalRevenue.toFixed(2)}`, icon: "💳", color: "#ce93d8" },
  ];

  return (
    <div className="page dashboard">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Real-time overview of the Urban Smart Parking System</p>

      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.label} className="stat-card" style={{ borderTopColor: s.color }}>
            <span className="stat-icon">{s.icon}</span>
            <div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-panels">
        <div className="panel">
          <h2 className="panel-title">Zone Availability</h2>
          {zones.map((z) => {
            const zoneOccupied = sessions.filter(
              (s) => s.status === "Active" && s.zone_name === z.zone_name
            ).length;
            const zoneAvailable = Math.max(z.total_slots - zoneOccupied, 0);
            const pct = z.total_slots > 0
              ? Math.round((zoneAvailable / z.total_slots) * 100)
              : 0;
            return (
              <div key={z.zone_id} className="zone-bar-row">
                <div className="zone-bar-label">
                  <span>{z.zone_name}</span>
                  <span className="zone-bar-pct">{pct}% free</span>
                </div>
                <div className="zone-bar-track">
                  <div
                    className="zone-bar-fill"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: pct > 50 ? "#81c784" : pct > 20 ? "#ffb74d" : "#e57373",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="panel">
          <h2 className="panel-title">Recent Sessions</h2>
          <table className="mini-table">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Plate</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {[...sessions].sort((a, b) => b.session_id - a.session_id).slice(0, 4).map((s) => (
                <tr key={s.session_id}>
                  <td>{s.driver_name}</td>
                  <td>{s.vehicle_plate}</td>
                  <td>
                    <span className={`badge ${s.status === "Active" ? "badge-active" : "badge-done"}`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
