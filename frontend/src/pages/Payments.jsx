import { useData } from "../data/useData";
import "./Dashboard.css";
import "./Slots.css";
import "./Payments.css";

function formatDateTime(dt) {
  if (!dt) return "â€”";
  return new Date(dt).toLocaleString();
}

export default function Payments() {
  const { payments, loading, error } = useData(['payments']);

  if (loading) return <div>Loading data...</div>;
  if (error) return <div>Error loading database: {error}. Please ensure your MongoDB Atlas IP is whitelisted and your backend is connected.</div>;
  if (!payments) return <div>No data available.</div>;

  const totalPaid = payments
    .filter((p) => p.status === "Paid")
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  return (
    <div className="page">
      <h1 className="page-title">Payments</h1>
      <p className="page-subtitle">Payment records linked to parking sessions</p>

      <div className="payments-summary">
        <div className="pay-stat">
          <span className="pay-stat-label">Total Collected</span>
          <span className="pay-stat-value">${totalPaid.toFixed(2)}</span>
        </div>
        <div className="pay-stat">
          <span className="pay-stat-label">Paid</span>
          <span className="pay-stat-value" style={{ color: "#a5d6a7" }}>
            {payments.filter((p) => p.status === "Paid").length}
          </span>
        </div>
        <div className="pay-stat">
          <span className="pay-stat-label">Pending</span>
          <span className="pay-stat-value" style={{ color: "#ffcc80" }}>
            {payments.filter((p) => p.status === "Pending").length}
          </span>
        </div>
      </div>

      <div className="slots-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Session</th>
              <th>Driver</th>
              <th>Plate</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Paid At</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.payment_id}>
                <td>{p.payment_id}</td>
                <td>#{p.session_id}</td>
                <td>{p.driver_name}</td>
                <td>{p.vehicle_plate}</td>
                <td>{p.amount != null ? `$${p.amount.toFixed(2)}` : "—"}</td>
                <td>{p.method || "—"}</td>
                <td>{formatDateTime(p.payment_time)}</td>
                <td>
                  <span
                    className={`badge ${p.status === "Paid" ? "badge-paid" : "badge-pending"}`}
                  >
                    {p.status}
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
