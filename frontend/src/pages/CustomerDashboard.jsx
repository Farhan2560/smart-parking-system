import { useData } from "../data/useData";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

function formatDateTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString();
}

export default function CustomerDashboard() {
  const { auth } = useAuth();
  const result = useData(['zones', 'sessions/my']);
  const zones = result.zones;
  const mySessions = result['sessions/my'];
  const { loading, error } = result;

  if (loading) return <div className="page"><p>Loading data...</p></div>;
  if (error) return <div className="page"><p>Error: {error}</p></div>;
  if (!zones || !mySessions) return <div className="page"><p>No data available.</p></div>;

  const activeSession = mySessions.find(s => s.status === "Active");
  const completedCount = mySessions.filter(s => s.status === "Completed").length;
  const recentSessions = [...mySessions].sort((a, b) => String(b._id).localeCompare(String(a._id))).slice(0, 4);

  const stats = [
    { label: "Parking Zones", value: zones.length, icon: "🗺️", color: "#4fc3f7" },
    { label: "Total Available", value: zones.reduce((s, z) => s + z.available_slots, 0), icon: "✅", color: "#a5d6a7" },
    { label: "My Active Sessions", value: activeSession ? 1 : 0, icon: "⏱️", color: "#ffcc80" },
    { label: "My Completed", value: completedCount, icon: "🏁", color: "#ce93d8" },
  ];

  return (
    <div className="page dashboard">
      <h1 className="page-title">Welcome, {auth.full_name || auth.username}! 👋</h1>
      <p className="page-subtitle">Your parking overview — book a slot, track sessions, and view payments.</p>

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

      {activeSession && (
        <div className="panel" style={{ marginBottom: "1.5rem", borderLeft: "4px solid #ffcc80" }}>
          <h2 className="panel-title" style={{ color: "#ffcc80" }}>🚗 You Have an Active Session</h2>
          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap", fontSize: "0.95rem" }}>
            <div><span style={{ color: "#78909c" }}>Zone: </span><strong>{activeSession.zone_name}</strong></div>
            <div><span style={{ color: "#78909c" }}>Slot: </span><strong>{activeSession.slot_number}</strong></div>
            <div><span style={{ color: "#78909c" }}>Vehicle: </span><strong>{activeSession.vehicle_plate}</strong></div>
            <div><span style={{ color: "#78909c" }}>Entry: </span><strong>{formatDateTime(activeSession.entry_time)}</strong></div>
          </div>
          <p style={{ marginTop: "0.75rem", color: "#78909c", fontSize: "0.85rem" }}>
            Go to <strong>My Sessions</strong> to end your session when you leave.
          </p>
        </div>
      )}

      <div className="dashboard-panels">
        <div className="panel">
          <h2 className="panel-title">Zone Availability</h2>
          {zones.map((z) => {
            const pct = z.total_slots > 0
              ? Math.round((z.available_slots / z.total_slots) * 100)
              : 0;
            return (
              <div key={z.zone_id} className="zone-bar-row">
                <div className="zone-bar-label">
                  <span>{z.zone_name}</span>
                  <span className="zone-bar-pct">{z.available_slots} free · ${z.hourly_rate.toFixed(2)}/hr</span>
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
          <h2 className="panel-title">My Recent Sessions</h2>
          {recentSessions.length === 0 ? (
            <p style={{ color: "#546e7a", fontSize: "0.9rem" }}>No sessions yet. Start one from My Sessions!</p>
          ) : (
            <table className="mini-table">
              <thead>
                <tr>
                  <th>Zone</th>
                  <th>Slot</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => (
                  <tr key={s._id}>
                    <td>{s.zone_name}</td>
                    <td>{s.slot_number}</td>
                    <td>
                      <span className={`badge ${s.status === "Active" ? "badge-active" : "badge-done"}`}>
                        {s.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
