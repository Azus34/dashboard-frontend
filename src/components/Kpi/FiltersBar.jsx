import React from 'react';
import styles from './FiltersBar.module.css';

export default function FiltersBar({ 
  period, 
  onPeriodChange, 
  year, 
  onYearChange,
  driverId,
  onDriverChange,
  drivers = []
}) {

  const currentYear = new Date().getFullYear();
  const years = [currentYear, currentYear -1, currentYear -2];

  return (
    <div className={styles.bar}>
      <label>
        Periodo:
        <select value={period} onChange={e => onPeriodChange(e.target.value)}>
          <option value="this_month">Este mes</option>
          <option value="last_3_months">Últimos 3 meses</option>
          <option value="last_6_months">Últimos 6 meses</option>
          <option value="this_year">Este año</option>
        </select>
      </label>

      <label>
        Año:
        <select value={year} onChange={e => onYearChange(parseInt(e.target.value))}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </label>

      <label>
        Conductor:
        <select value={driverId} onChange={e => onDriverChange(e.target.value)}>
          <option value="all">Todos los conductores</option>
          {drivers.map(driver => (
            <option key={driver.id} value={driver.id}>
              {driver.full_name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
