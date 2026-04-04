import { useState } from "react";
import { useData } from "../data/useData";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";
import "./Slots.css";

const SLOT_TYPE_ICON = {
  "Standard": "🚗",
  "Handicapped": "♿",
  "EV Charging": "⚡",
};

function formatDateTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString();
}

export default function CustomerSessions() {
  const { auth } = useAuth();
  const result = useData(['zones', 'slots', 'sessions/my']);
  const zones = result.zones;
  const slots = result.slots;
  const mySessions = result['sessions/my'];
  const { loading, error, refreshData } = result;

  const [driverName, setDriverName] = useState(auth?.full_name || "");
  const [vehiclePlate, setVehiclePlate] = useState("");
  const [zoneName, setZoneName] = useState("");
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [filterStatus, setFilterStatus] = useState("All");
  const [formError, setFormError] = useState("");

  if (loading) return <div className="page"><p>Loading data...</p></div>;
  if (error) return <div className="page"><p>Error: {error}</p></div>;
  if (!zones || !slots || !mySessions) return <div className="page"><p>No data available.</p></div>;

  const selectedZone = zones.find(z => z.zone_name === zoneName);
  const zoneSlots = selectedZone
    ? [...slots.filter(s => s.zone_id === selectedZone.zone_id)]
        .sort((a, b) => a.slot_number.localeCompare(b.slot_number))
    : [];

  const hasActiveSession = mySessions.some(s => s.status === "Active");

  const handleZoneChange = (e) => {
    setZoneName(e.target.value);
    setSelectedSlot(null);
    setFormError("");
  };

  const handleSlotClick = (slot) => {
    if (slot.status !== "Available") return;
    setSelectedSlot(prev => prev?.slot_id === slot.slot_id ? null : slot);
    setFormError("");
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    setFormError("");

    if (hasActiveSession) {
      setFormError("You already have an active session. Please end it before starting a new one.");
      return;
    }
    if (!selectedSlot) {
      setFormError("Please select a parking slot from the map below.");
      return;
    }

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        driver_name: driverName,
        vehicle_plate: vehiclePlate,
        zone_name: zoneName,
        slot_type: selectedSlot.slot_type,
        slot_id: selectedSlot.slot_id,
        zone_id: selectedZone.zone_id,
        slot_number: selectedSlot.slot_number,
        entry_time: new Date().toISOString(),
        status: "Active"
      })
    });

    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error || "Failed to start session.");
      return;
    }

    setDriverName(auth?.full_name || "");
    setVehiclePlate("");
    setZoneName("");
    setSelectedSlot(null);
    refreshData();
  };

  const handleEndSession = async (sessionId, entry_time) => {
    const exitTime = new Date();
    const durationMs = (exitTime - new Date(entry_time)) / (1000 * 60 * 60);

    const res = await fetch(`/api/sessions/${sessionId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        exit_time: exitTime.toISOString(),
        duration_hours: Math.max(0.5, parseFloat(durationMs.toFixed(1))),
        amount_due: parseFloat(Math.max(2, durationMs * 3.5).toFixed(2)),
        status: "Completed"
      })
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to end session.");
      return;
    }
    refreshData();
  };

  const filteredSessions = [...mySessions]
    .sort((a, b) => String(b._id).localeCompare(String(a._id)))
    .filter(s => filterStatus === "All" || s.status === filterStatus);

  return (
    <div className="page">
      <h1 className="page-title">My Parking Sessions</h1>
      <p className="page-subtitle">Pick a zone, select your slot on the map, then start your session.</p>

      <div className="panel" style={{ marginBottom: "20px" }}>
        <h2 className="panel-title">Start a New Parking Session</h2>
        {hasActiveSession && (
          <div style={{ background: "#3e2a00", border: "1px solid #f57f17", borderRadius: "8px", padding: "0.7rem 1rem", marginBottom: "1rem", color: "#ffcc80", fontSize: "0.88rem" }}>
            ⚠️ You already have an active session. End it before starting a new one.
          </div>
        )}
        {formError && (
          <div style={{ background: "#3e1a1a", border: "1px solid #c62828", borderRadius: "8px", padding: "0.7rem 1rem", marginBottom: "1rem", color: "#ef9a9a", fontSize: "0.88rem" }}>
            {formError}
          </div>
        )}
        <form onSubmit={handleStartSession}>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginBottom: "1rem" }}>
            <input
              placeholder="Driver Name"
              value={driverName}
              onChange={e => { setDriverName(e.target.value); setFormError(""); }}
              required
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", background: "#1e1e1e", color: "#fff" }}
            />
            <input
              placeholder="Vehicle Plate"
              value={vehiclePlate}
              onChange={e => { setVehiclePlate(e.target.value); setFormError(""); }}
              required
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", background: "#1e1e1e", color: "#fff" }}
            />
            <select
              value={zoneName}
              onChange={handleZoneChange}
              required
              style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", background: "#1e1e1e", color: "#fff" }}
            >
              <option value="" disabled>Select Zone</option>
              {zones.map((z) => (
                <option key={z.zone_id} value={z.zone_name}>
                  {z.zone_name} (Free: {z.available_slots} · ${z.hourly_rate.toFixed(2)}/hr)
                </option>
              ))}
            </select>
          </div>

          {/* Slot map */}
          {zoneName && (
            <div className="slot-map-wrap">
              <div className="slot-map-legend">
                <span className="slot-legend-item"><span className="slot-legend-dot slot-legend-available" />Available</span>
                <span className="slot-legend-item"><span className="slot-legend-dot slot-legend-occupied" />Occupied</span>
                <span className="slot-legend-item"><span className="slot-legend-dot slot-legend-selected" />Selected</span>
                <span className="slot-legend-item">🚗 Standard</span>
                <span className="slot-legend-item">♿ Handicapped</span>
                <span className="slot-legend-item">⚡ EV Charging</span>
              </div>
              <div className="slot-grid" role="group" aria-label="Parking slot selection grid">
                {zoneSlots.map(slot => {
                  const isSelected = selectedSlot?.slot_id === slot.slot_id;
                  const isOccupied = slot.status !== "Available";
                  const disabledReason = hasActiveSession
                    ? "You already have an active session"
                    : isOccupied
                    ? "This slot is occupied"
                    : undefined;
                  return (
                    <button
                      type="button"
                      key={slot.slot_id}
                      title={`${slot.slot_number} — ${slot.slot_type} — ${slot.status}`}
                      aria-label={`${slot.slot_number}, ${slot.slot_type}, ${slot.status}${isSelected ? ", selected" : ""}${disabledReason ? ". " + disabledReason : ""}`}
                      aria-pressed={isSelected}
                      aria-disabled={!!(isOccupied || hasActiveSession)}
                      className={
                        "slot-tile" +
                        (isOccupied ? " slot-tile--occupied" : "") +
                        (isSelected ? " slot-tile--selected" : "") +
                        (!isOccupied && !isSelected ? " slot-tile--available" : "")
                      }
                      onClick={() => handleSlotClick(slot)}
                      disabled={isOccupied || hasActiveSession}
                    >
                      <span className="slot-tile-icon" aria-hidden="true">{SLOT_TYPE_ICON[slot.slot_type] || "🚗"}</span>
                      <span className="slot-tile-number">{slot.slot_number}</span>
                    </button>
                  );
                })}
              </div>
              {selectedSlot && (
                <div className="slot-selection-info" aria-live="polite">
                  Selected: <strong>{selectedSlot.slot_number}</strong> &nbsp;·&nbsp; {selectedSlot.slot_type} <span aria-hidden="true">{SLOT_TYPE_ICON[selectedSlot.slot_type]}</span>
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={hasActiveSession || !selectedSlot}
            style={{ marginTop: "1rem", padding: "8px 20px", background: (hasActiveSession || !selectedSlot) ? "#444" : "#81c784", color: (hasActiveSession || !selectedSlot) ? "#888" : "#1e1e1e", border: "none", borderRadius: "4px", cursor: (hasActiveSession || !selectedSlot) ? "not-allowed" : "pointer", fontWeight: "bold" }}
          >
            Start Session
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="panel-title" style={{ margin: 0 }}>My Sessions</h2>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", background: "#1e1e1e", color: "#fff" }}
        >
          <option value="All">All Statuses</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
        </select>
      </div>

      <div className="slots-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Plate</th>
              <th>Zone</th>
              <th>Slot</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Duration</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: "center", color: "#546e7a", padding: "1.5rem" }}>
                  No sessions found.
                </td>
              </tr>
            ) : (
              filteredSessions.map((s) => (
                <tr key={s._id}>
                  <td title={s._id}>{String(s._id).slice(-6)}</td>
                  <td>{s.vehicle_plate}</td>
                  <td>{s.zone_name}</td>
                  <td>{s.slot_number}</td>
                  <td>{formatDateTime(s.entry_time)}</td>
                  <td>{formatDateTime(s.exit_time)}</td>
                  <td>{s.duration_hours != null ? `${s.duration_hours}h` : "—"}</td>
                  <td>{s.amount_due != null ? `$${s.amount_due}` : "—"}</td>
                  <td>
                    <span className={`badge ${s.status === "Active" ? "badge-active" : "badge-done"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    {s.status === "Active" ? (
                      <button
                        onClick={() => handleEndSession(s._id, s.entry_time)}
                        style={{ padding: "4px 8px", background: "#e57373", color: "#fff", border: "none", borderRadius: "4px", cursor: "pointer" }}
                      >
                        End
                      </button>
                    ) : (
                      <span style={{ color: "#aaa" }}>Done</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
