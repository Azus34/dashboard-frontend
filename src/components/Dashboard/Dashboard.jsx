import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transactionsAPI, financesAPI, routesAPI, usersAPI, analyticsAPI, earningsAPI } from '../../services/api';
import styles from './Dashboard.module.css';

export function Dashboard() {
  const [stats, setStats] = useState(null);
  const [retention, setRetention] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [transactions, finances, routes, drivers, customers, dailyActive, retentionData, earnings] = await Promise.all([
          transactionsAPI.getAll(),
          financesAPI.getStats(),
          routesAPI.getAll(),
          usersAPI.getDrivers(),
          usersAPI.getCustomers(),
          analyticsAPI.getDailyActiveUsers(),
          analyticsAPI.getRetention(),
          earningsAPI.getTotal(),
        ]);

        // Obtener usuarios activos hoy
        const today = new Date().toISOString().split('T')[0];
        const todayActive = dailyActive.data?.find(d => d.date === today);

        setStats({
          totalRecharges: (finances.data?.total_recharges || 0) / 100,
          totalWithdrawals: (finances.data?.total_withdrawals || 0) / 100,
          rechargeCount: finances.data?.recharge_count || 0,
          withdrawalCount: finances.data?.withdrawal_count || 0,
          totalRoutes: routes.data?.length || 0,
          totalDrivers: drivers.data?.length || 0,
          totalCustomers: customers.data?.length || 0,
          earnings: (earnings.data?.totalEarnings || 0).toFixed(2),
          dailyActiveUsers: todayActive?.active_users || 0,
        });

        setRetention({
          totalUsers: retentionData.data?.total_users || 0,
          day1: retentionData.data?.retention_day_1 || 0,
          day7: retentionData.data?.retention_day_7 || 0,
          day30: retentionData.data?.retention_day_30 || 0,
        });

        setRecentTransactions(transactions.data?.slice(0, 5) || []);
      } catch (error) {
        console.error('Error cargando datos:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className={styles.loading}>Cargando dashboard...</div>;

  return (
    <div className={styles.container}>
      <h1>Panel Principal</h1>

      <div className={styles.welcomeSection}>
        <h2>Bienvenido a Colibri Arroyo Seco</h2>
        <p>Sistema de gestión integral de transporte compartido</p>
      </div>

      <div className={styles.statsGrid}>
        <Link to="/finances" className={styles.statCard}>
          <div className={styles.icon}>💰</div>
          <h3>Recargas</h3>
          <p className={styles.amount}>${stats?.totalRecharges.toFixed(2)}</p>
          <span>{stats?.rechargeCount} transacciones</span>
        </Link>

        <Link to="/finances" className={styles.statCard}>
          <div className={styles.icon}>💳</div>
          <h3>Retiros</h3>
          <p className={styles.amount}>${stats?.totalWithdrawals.toFixed(2)}</p>
          <span>{stats?.withdrawalCount} transacciones</span>
        </Link>

        <Link to="/analytics" className={styles.statCard}>
          <div className={styles.icon}>📈</div>
          <h3>Ganancias</h3>
          <p className={styles.amount}>${stats?.earnings}</p>
          <span>Comisión (15%)</span>
        </Link>

        <Link to="/" className={styles.statCard}>
          <div className={styles.icon}>🗺️</div>
          <h3>Viajes Totales</h3>
          <p className={styles.amount}>{stats?.totalRoutes}</p>
          <span>Rutas registradas</span>
        </Link>

        <Link to="/users" className={styles.statCard}>
          <div className={styles.icon}>🚗</div>
          <h3>Conductores</h3>
          <p className={styles.amount}>{stats?.totalDrivers}</p>
          <span>Activos en plataforma</span>
        </Link>

        <Link to="/users" className={styles.statCard}>
          <div className={styles.icon}>👤</div>
          <h3>Pasajeros</h3>
          <p className={styles.amount}>{stats?.totalCustomers}</p>
          <span>Usuarios registrados</span>
        </Link>

        <Link to="/analytics" className={styles.statCard}>
          <div className={styles.icon}>👥</div>
          <h3>Usuarios Activos Hoy</h3>
          <p className={styles.amount}>{stats?.dailyActiveUsers}</p>
          <span>Con viajes realizados</span>
        </Link>
      </div>

      <div className={styles.retentionSection}>
        <h2>Retención de Usuarios</h2>
        <div className={styles.retentionGrid}>
          <div className={styles.retentionCard}>
            <div className={styles.retentionIcon}>📊</div>
            <h4>Total Usuarios</h4>
            <p className={styles.retentionValue}>{retention?.totalUsers || 0}</p>
            <span>Con al menos un viaje</span>
          </div>

          <div className={styles.retentionCard}>
            <div className={styles.retentionIcon}>📍</div>
            <h4>Retención Día 1</h4>
            <p className={`${styles.retentionValue} ${styles.retentionPercent}`}>{retention?.day1 || 0}%</p>
            <span>Usuarios que volvieron</span>
          </div>

          <div className={styles.retentionCard}>
            <div className={styles.retentionIcon}>📈</div>
            <h4>Retención Día 7</h4>
            <p className={`${styles.retentionValue} ${styles.retentionPercent}`}>{retention?.day7 || 0}%</p>
            <span>Actividad en semana</span>
          </div>

          <div className={styles.retentionCard}>
            <div className={styles.retentionIcon}>🎯</div>
            <h4>Retención Día 30</h4>
            <p className={`${styles.retentionValue} ${styles.retentionPercent}`}>{retention?.day30 || 0}%</p>
            <span>Usuarios activos al mes</span>
          </div>
        </div>
      </div>

      <div className={styles.recentSection}>
        <div className={styles.recentTransactions}>
          <h3>Últimas Transacciones</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Moneda</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.id?.substring(0, 8)}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[transaction.type]}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td>${(transaction.amount_cents / 100).toFixed(2)}</td>
                  <td>{transaction.currency}</td>
                  <td>{new Date(transaction.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <Link to="/transactions" className={styles.viewAllLink}>
            Ver todas las transacciones →
          </Link>
        </div>
      </div>
    </div>
  );
}
