import React from 'react';
import styles from './OccupancyByDriver.module.css';

const money = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(n || 0);

export default function OccupancyByDriver({ data = [], loading }) {
  if (loading) return <div className={styles.loading}>Cargando...</div>;
  
  if (data.length === 0) {
    return (
      <div className={styles.container}>
        <h3>Ocupación por Conductor en el período</h3>
        <p className={styles.empty}>No hay datos disponibles</p>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3>Ocupación por Conductor en el período</h3>
      <div className={styles.list}>
        {data.slice(0, 5).map((driver, index) => (
          <div key={driver.id || index} className={styles.item}>
            <div className={styles.info}>
              <div className={styles.name}>{driver.driver_name}</div>
              <div className={styles.detail}>
                {money(driver.total_income)} • {driver.total_trips} reservaciones
              </div>
            </div>
            <div className={styles.barContainer}>
              <div 
                className={styles.bar} 
                style={{ width: `${driver.completion_rate}%` }}
              />
            </div>
            <div className={styles.percentage}>
              {driver.completion_rate.toFixed(0)}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}