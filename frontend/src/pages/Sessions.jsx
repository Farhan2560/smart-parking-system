import { useState } from "react";
import { useData } from "../data/useData";
import "./Dashboard.css";
import "./Slots.css";

function formatDateTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString();
}

export default function Sessions() {
  const { sessions, zones, slots, loading, error, refreshData } = useData(['sessions', 'zones', 'slots']);
  const [formData, setFormData] = useState({ driver_name: "", vehicle_plate: "", zone_name: "", slot_type: "" });
  const [filterStatus, setFilterStatus] = useState("All");

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error loading database: {error}. Please ensure your MongoDB Atlas IP is whitelisted and your backend is connected.</div>;
  if (!sessions || !zones || !slots) return <div>No data available.</div>;

  const selectedZone = zones.find(z => z.zone_name === formData.zone_name);     
  const availableSlotsList = slots.filter(s =>
    s.status === "Available" &&
    (!selectedZone || s.zone_id === selectedZone.zone_id)
  );
  
  const availableSlotTypes = [...new Set(availableSlotsList.map(s => s.slot_type))];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "zone_name") {
      setFormData({ ...formData, zone_name: value, slot_type: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleAddSession = async (e) => {
    e.preventDefault();

    const eligibleSlots = availableSlotsList.filter(s => s.slot_type === formData.slot_type);
    if (eligibleSlots.length === 0) {
      alert("No available slots found for this type in the selected zone.");
      return;
    }
    
    const assignedSlot = eligibleSlots.sort((a, b) => a.slot_number.localeCompare(b.slot_number))[0];

    await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...formData,
        slot_number: assignedSlot.slot_number,
        entry_time: new Date().toISOString(),
        status: "Active"
      })
    });
    setFormData({ driver_name: "", vehicle_plate: "", zone_name: "", slot_type: "" });
    refreshData();
  };

  const handleEndSession = async (sessionId, entry_time) => {
    const exitTime = new Date();
    const entryDate = new Date(entry_time);
    const durationObj = (exitTime - entryDate) / (1000 * 60 * 60);
    
    await fetch(`/api/sessions/${sessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        exit_time: exitTime.toISOString(),
        duration_hours: Math.max(0.5, durationObj.toFixed(1)),
        amount_due: Math.max(2, (durationObj * 3.5).toFixed(2)),
        status: "Completed"
      })
    });
    refreshData();
  };

  const filteredSessions = [...sessions]
    .sort((a, b) => String(b._id).localeCompare(String(a._id)))
    .filter(s => filterStatus === "All" || s.status === filterStatus);

  return (
    <div className="page">
      <h1 className="page-title">Parking Sessions</h1>
      <p className="page-subtitle">Record of all vehicle parking sessions (entry / exit)</p>

      <div className="panel" style={{ marginBottom: "20px" }}>
        <h2 className="panel-title">Add New Parking Session</h2>
        <form onSubmit={handleAddSession} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
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
                {z.zone_name} (Free: {z.available_slots})
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
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>

          <button type="submit" style={{ padding: "8px 16px", background: "#81c784", color: "#1e1e1e", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
            Start Session
          </button>
        </form>
      </div>

      <div className="panel" style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="panel-title" style={{ margin: 0 }}>All Sessions</h2>
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
              <th>Driver</th>
              <th>Plate</th>
              <th>Zone</th>
              <th>Slot</th>
              <th>Entry</th>
              <th>Exit</th>
              <th>Duration</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredSessions.map((s) => (
              <tr key={s._id}>
                <td title={s._id}>{String(s._id).slice(-6)}</td>
                <td>{s.driver_name}</td>
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
                    <span style={{ color: "#aaa" }}>None</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
