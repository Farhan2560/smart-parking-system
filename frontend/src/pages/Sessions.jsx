import { sessions } from "../data/mockData";
import "./Dashboard.css";
import "./Slots.css";

function formatDateTime(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString();
}

export default function Sessions() {
  return (
    <div className="page">
      <h1 className="page-title">Parking Sessions</h1>
      <p className="page-subtitle">Record of all vehicle parking sessions (entry / exit)</p>

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
            </tr>
          </thead>
          <tbody>
            {sessions.map((s) => (
              <tr key={s.session_id}>
                <td>{s.session_id}</td>
                <td>{s.driver_name}</td>
                <td>{s.vehicle_plate}</td>
                <td>{s.zone_name}</td>
                <td>{s.slot_number}</td>
                <td>{formatDateTime(s.entry_time)}</td>
                <td>{formatDateTime(s.exit_time)}</td>
                <td>{s.duration_hours != null ? `${s.duration_hours}h` : "—"}</td>
                <td>{s.amount_due != null ? `$${s.amount_due.toFixed(2)}` : "—"}</td>
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
  );
}
