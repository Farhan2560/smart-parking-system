import { useState } from "react";
import { useData } from "../data/useData";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";
import "./Zones.css";

export default function Zones() {
  const { auth } = useAuth();
  const { zones, loading, error, refreshData } = useData(['zones']);
  const [formData, setFormData] = useState({ zone_name: "", location: "", total_slots: "", hourly_rate: "" });

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error loading database: {error}. Please ensure your MongoDB Atlas IP is whitelisted and your backend is connected.</div>;
  if (!zones) return <div>No data available.</div>;

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    await fetch("/api/zones", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${auth.token}`
      },
      body: JSON.stringify({
        zone_id: Math.floor(Math.random() * 10000),
        zone_name: formData.zone_name,
        location: formData.location,
        total_slots: parseInt(formData.total_slots),
        available_slots: parseInt(formData.total_slots), // starts fully available
        hourly_rate: parseFloat(formData.hourly_rate)
      })
    });
    setFormData({ zone_name: "", location: "", total_slots: "", hourly_rate: "" });
    refreshData();
  };

  return (
    <div className="page">
      <h1 className="page-title">Parking Zones</h1>
      <p className="page-subtitle">All registered parking zones and their current availability</p>

      <div className="panel" style={{ marginBottom: "20px" }}>
        <h2 className="panel-title">Add New Parking Zone</h2>
        <form onSubmit={handleAddZone} style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <input name="zone_name" placeholder="Zone Name" value={formData.zone_name} onChange={handleInputChange} required style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", background: "#1e1e1e", color: "#fff" }} />
          <input name="location" placeholder="Location" value={formData.location} onChange={handleInputChange} required style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", background: "#1e1e1e", color: "#fff" }} />
          <input name="total_slots" placeholder="Total Slots" type="number" value={formData.total_slots} onChange={handleInputChange} required style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", background: "#1e1e1e", color: "#fff" }} />
          <input name="hourly_rate" placeholder="Hourly Rate ($)" type="number" step="0.01" value={formData.hourly_rate} onChange={handleInputChange} required style={{ padding: "8px", borderRadius: "4px", border: "1px solid #333", background: "#1e1e1e", color: "#fff" }} />
          <button type="submit" style={{ padding: "8px 16px", background: "#81c784", color: "#1e1e1e", border: "none", borderRadius: "4px", cursor: "pointer", fontWeight: "bold" }}>
            Create Zone
          </button>
        </form>
      </div>

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
