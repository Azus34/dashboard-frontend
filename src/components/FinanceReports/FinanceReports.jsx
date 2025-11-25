import React, { useState, useEffect } from 'react';
import { financesAPI } from '../../services/api';
import styles from './FinanceReports.module.css';

export function FinanceReports() {
  const [recharges, setRecharges] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [activeTab, setActiveTab] = useState('recharges');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [rechargesData, withdrawalsData] = await Promise.all([
          financesAPI.getRecharges(),
          financesAPI.getWithdrawals(),
        ]);
        setRecharges(rechargesData.data || []);
        setWithdrawals(withdrawalsData.data || []);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(error.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className={styles.loading}>Cargando datos...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  // Calcular totales de forma segura
  const totalRecharges = Math.max(0, (recharges || []).reduce((sum, r) => {
    const amount = parseFloat(r.amount_cents) || 0;
    return sum + Math.abs(amount);
  }, 0) / 100);
  
  const totalWithdrawals = Math.max(0, (withdrawals || []).reduce((sum, w) => {
    const amount = parseFloat(w.amount_cents) || 0;
    return sum + Math.abs(amount);
  }, 0) / 100);
  
  const safeTotalRecharges = isFinite(totalRecharges) ? totalRecharges : 0;
  const safeTotalWithdrawals = isFinite(totalWithdrawals) ? totalWithdrawals : 0;
  const safeDifference = safeTotalRecharges - safeTotalWithdrawals;

  return (
    <div className={styles.container}>
      <h2>Recargas y Retiros</h2>

      <div className={styles.summaryCards}>
        <div className={styles.card}>
          <h3>Total Recargas</h3>
          <p className={styles.amount}>${safeTotalRecharges.toFixed(2)}</p>
          <span>{recharges.length} transacciones</span>
        </div>
        <div className={styles.card}>
          <h3>Total Retiros</h3>
          <p className={styles.amount}>${safeTotalWithdrawals.toFixed(2)}</p>
          <span>{withdrawals.length} transacciones</span>
        </div>
        <div className={styles.card}>
          <h3>Diferencia</h3>
          <p className={styles.amount}>${safeDifference.toFixed(2)}</p>
          <span>Saldo positivo</span>
        </div>
      </div>

      <div className={styles.tabs}>
        <button
          className={activeTab === 'recharges' ? styles.activeTab : ''}
          onClick={() => setActiveTab('recharges')}
        >
          Recargas ({recharges.length})
        </button>
        <button
          className={activeTab === 'withdrawals' ? styles.activeTab : ''}
          onClick={() => setActiveTab('withdrawals')}
        >
          Retiros ({withdrawals.length})
        </button>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Monto</th>
              <th>Moneda</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            {(activeTab === 'recharges' ? recharges : withdrawals).map((item) => (
              <tr key={item.id}>
                <td>{item.id?.substring(0, 8)}</td>
                <td>{item.user_id?.substring(0, 8)}</td>
                <td>{item.full_name}</td>
                <td>{item.email}</td>
                <td className={`${styles.amount} ${activeTab === 'withdrawals' ? styles.withdrawal : ''}`}>
                  ${(item.amount_cents / 100).toFixed(2)}
                </td>
                <td>{item.currency}</td>
                <td>{new Date(item.created_at).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
