import React from 'react';
import styles from './RecentReservationsTable.module.css';

const money = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);

export default function RecentReservationsTable({ data = [], loading }) {
  if (loading) return <div>Cargando viajes recientes...</div>;
  
  if (data.length === 0) {
    return (
      <div className={styles.container}>
        <h3>Viajes recientes</h3>
        <p style={{ padding: '1rem', color: 'var(--color-text-light)' }}>
          No hay viajes en este período
        </p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3>Viajes recientes</h3>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Pasajero</th>
              <th>Conductor</th>
              <th>Pickup</th>
              <th>Estado</th>
              <th>Monto</th>
            </tr>
          </thead>
          <tbody>
            {data.map(row => (
              <tr key={row.id}>
                <td>
                  {row.code || `#${row.id.substring(0, 8)}`}
                </td>

                <td>
                  {row.passenger_name || row.passenger_email || 'N/A'}
                </td>

                <td>
                  {row.driver_name || row.driver_email || 'N/A'}
                </td>

                <td>
                  {row.pickup_at 
                    ? new Date(row.pickup_at).toLocaleString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : '—'
                  }
                </td>

                <td>
                  <span className={styles[`status${row.status}`] || styles.statusDefault}>
                    {row.status}
                  </span>
                </td>

                <td>{money(row.price)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}