import React, { useState, useEffect } from 'react';
import { usersAPI } from '../../services/api';
import styles from './Users.module.css';

export function Users() {
  const [drivers, setDrivers] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [activeTab, setActiveTab] = useState('drivers');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      try {
        const [driversData, customersData] = await Promise.all([
          usersAPI.getDrivers(),
          usersAPI.getCustomers(),
        ]);
        setDrivers(driversData.data || []);
        setCustomers(customersData.data || []);
      } catch (error) {
        console.error('Error cargando usuarios:', error);
        setError(error.message || 'Error cargando usuarios');
      } finally {
        setLoading(false);
      }
    };
    loadUsers();
  }, []);

  if (loading) return <div className={styles.loading}>Cargando usuarios...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  return (
    <div className={styles.container}>
      <h2>Usuarios</h2>

      <div className={styles.tabs}>
        <button
          className={activeTab === 'drivers' ? styles.activeTab : ''}
          onClick={() => setActiveTab('drivers')}
        >
          Conductores ({drivers.length})
        </button>
        <button
          className={activeTab === 'customers' ? styles.activeTab : ''}
          onClick={() => setActiveTab('customers')}
        >
          Pasajeros ({customers.length})
        </button>
      </div>

      <div className={styles.content}>
        {activeTab === 'drivers' && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Licencia</th>
                <th>Vehículo</th>
                <th>Estado</th>
                <th>Calificación</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => {
                const rating = parseFloat(driver.rating_avg) || 0;
                const ratingDisplay = rating > 0 ? rating.toFixed(1) : 'N/A';
                return (
                  <tr key={driver.id}>
                    <td>{driver.full_name}</td>
                    <td>{driver.email}</td>
                    <td>{driver.phone_number}</td>
                    <td>{driver.license_number}</td>
                    <td>{driver.vehicle_brand} {driver.vehicle_model} ({driver.vehicle_year})</td>
                    <td>
                      <span className={`${styles.badge} ${styles[driver.status]}`}>
                        {driver.status}
                      </span>
                    </td>
                    <td>{ratingDisplay} ⭐</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {activeTab === 'customers' && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>País</th>
                <th>Estado</th>
                <th>Saldo</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.full_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone_number}</td>
                  <td>{customer.default_country}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[customer.status]}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td>${(customer.balance_cents / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
