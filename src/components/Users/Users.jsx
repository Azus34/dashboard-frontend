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
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Fecha de Nacimiento</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha de Registro</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <td>{driver.id}</td>
                  <td>{driver.full_name}</td>
                  <td>{driver.email}</td>
                  <td>{driver.date_birth ? new Date(driver.date_birth).toLocaleDateString('es-MX') : 'N/A'}</td>
                  <td>{driver.role_label || driver.role}</td>
                  <td>
                    <span className={`${styles.badge} ${driver.is_active ? styles.active : styles.inactive}`}>
                      {driver.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{new Date(driver.created_at).toLocaleDateString('es-MX')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {activeTab === 'customers' && (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Fecha de Nacimiento</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha de Registro</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>{customer.full_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.date_birth ? new Date(customer.date_birth).toLocaleDateString('es-MX') : 'N/A'}</td>
                  <td>{customer.role_label || customer.role}</td>
                  <td>
                    <span className={`${styles.badge} ${customer.is_active ? styles.active : styles.inactive}`}>
                      {customer.is_active ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>{new Date(customer.created_at).toLocaleDateString('es-MX')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
