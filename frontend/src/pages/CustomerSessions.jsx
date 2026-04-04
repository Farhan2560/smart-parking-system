import { useState } from "react";
import { useData } from "../data/useData";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";
import "./Slots.css";

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

  const [formData, setFormData] = useState({
    driver_name: auth?.full_name || "",
    vehicle_plate: "",
    zone_name: "",
    slot_type: ""
  });
  const [filterStatus, setFilterStatus] = useState("All");
  const [formError, setFormError] = useState("");

  if (loading) return <div className="page"><p>Loading data...</p></div>;
  if (error) return <div className="page"><p>Error: {error}</p></div>;
  if (!zones || !slots || !mySessions) return <div className="page"><p>No data available.</p></div>;

  const selectedZone = zones.find(z => z.zone_name === formData.zone_name);
  const availableSlotsList = slots.filter(s =>
    s.status === "Available" &&
    (!selectedZone || s.zone_id === selectedZone.zone_id)
  );
  const availableSlotTypes = [...new Set(availableSlotsList.map(s => s.slot_type))];

  const hasActiveSession = mySessions.some(s => s.status === "Active");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "zone_name") {
      setFormData({ ...formData, zone_name: value, slot_type: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    setFormError("");
  };

  const handleStartSession = async (e) => {
    e.preventDefault();
    setFormError("");

    if (hasActiveSession) {
      setFormError("You already have an active session. Please end it before starting a new one.");
      return;
    }

    const eligibleSlots = availableSlotsList.filter(s => s.slot_type === formData.slot_type);
    if (eligibleSlots.length === 0) {
      setFormError("No available slots found for this type in the selected zone.");
      return;
    }

    const assignedSlot = eligibleSlots.sort((a, b) => a.slot_number.localeCompare(b.slot_number))[0];

    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        driver_name: formData.driver_name,
        vehicle_plate: formData.vehicle_plate,
        zone_name: formData.zone_name,
        slot_type: formData.slot_type,
        slot_id: assignedSlot.slot_id,
        zone_id: selectedZone.zone_id,
        slot_number: assignedSlot.slot_number,
        entry_time: new Date().toISOString(),
        status: "Active"
      })
    });

    if (!res.ok) {
      const data = await res.json();
      setFormError(data.error || "Failed to start session.");
      return;
    }

    setFormData({ driver_name: auth?.full_name || "", vehicle_plate: "", zone_name: "", slot_type: "" });
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
      <p className="page-subtitle">Start a new session or manage your current parking.</p>

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
        <form onSubmit={handleStartSession} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input
            name="driver_name"
            placeholder="Driver Name"
            value={formData.driver_name}
            onChange={handleInputChange}
            required
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", background: "#1e1e1e", color: "#fff" }}
          />
          <input
            name="vehicle_plate"
            placeholder="Vehicle Plate"
            value={formData.vehicle_plate}
            onChange={handleInputChange}
            required
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", background: "#1e1e1e", color: "#fff" }}
          />
          <select
            name="zone_name"
            value={formData.zone_name}
            onChange={handleInputChange}
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
          <select
            name="slot_type"
            value={formData.slot_type}
            onChange={handleInputChange}
            required
            disabled={!formData.zone_name || availableSlotTypes.length === 0}
            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", background: "#1e1e1e", color: "#fff" }}
          >
            <option value="" disabled>Select Space Type</option>
            {availableSlotTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <button
            type="submit"
            disabled={hasActiveSession}
            style={{ padding: "8px 16px", background: hasActiveSession ? "#444" : "#81c784", color: hasActiveSession ? "#888" : "#1e1e1e", border: "none", borderRadius: "4px", cursor: hasActiveSession ? "not-allowed" : "pointer", fontWeight: "bold" }}
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
