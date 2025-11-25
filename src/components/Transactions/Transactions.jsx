import React, { useState, useEffect } from 'react';
import { transactionsAPI, usersAPI } from '../../services/api';
import styles from './Transactions.module.css';

export function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const response = await transactionsAPI.getAll();
        setTransactions(response.data);
      } catch (error) {
        console.error('Error cargando transacciones:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTransactions();
  }, []);

  const handleSelectTransaction = async (transaction) => {
    setSelectedTransaction(transaction);
    try {
      if (transaction.user_id) {
        const response = await usersAPI.getCustomer(transaction.user_id);
        setUserDetails(response.data);
      }
    } catch (error) {
      console.error('Error cargando detalles:', error);
    }
  };

  const isWithdrawal = (type) => {
    const withdrawalTypes = ['WITHDRAW', 'HOLD', 'TRIP_PAYMENT'];
    return withdrawalTypes.includes(type);
  };

  const filteredTransactions = transactions.filter((t) => {
    if (filter === 'all') return true;
    
    // Agrupar tipos de depósitos (ingresos positivos)
    const depositTypes = ['TOPUP', 'REFUND', 'RELEASE', 'TRIP_EARNINGS'];
    // Agrupar tipos de retiros (egresos negativos)
    const withdrawalTypes = ['WITHDRAW', 'HOLD', 'TRIP_PAYMENT'];
    
    if (filter === 'deposit') return depositTypes.includes(t.type);
    if (filter === 'withdrawal') return withdrawalTypes.includes(t.type);
    
    return false;
  });

  const exportToCSV = () => {
    const headers = ['ID', 'Usuario', 'Tipo', 'Monto', 'Moneda', 'Fecha'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.user_id,
      t.type,
      (t.amount_cents / 100).toFixed(2),
      t.currency,
      new Date(t.created_at).toLocaleString()
    ]);

    let csvContent = 'data:text/csv;charset=utf-8,' + headers.join(',') + '\n';
    rows.forEach((row) => {
      csvContent += row.map((cell) => `"${cell}"`).join(',') + '\n';
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `transacciones_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    const headers = ['ID', 'Usuario', 'Tipo', 'Monto', 'Moneda', 'Fecha'];
    const rows = filteredTransactions.map((t) => [
      t.id,
      t.user_id,
      t.type,
      (t.amount_cents / 100).toFixed(2),
      t.currency,
      new Date(t.created_at).toLocaleString()
    ]);

    let excelContent = headers.join('\t') + '\n';
    rows.forEach((row) => {
      excelContent += row.join('\t') + '\n';
    });

    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `transacciones_${new Date().getTime()}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className={styles.loading}>Cargando transacciones...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <div className={styles.header}>
          <h2>Transacciones</h2>
          <div className={styles.filters}>
            <button
              className={filter === 'all' ? styles.activeFilter : ''}
              onClick={() => setFilter('all')}
            >
              Todas
            </button>
            <button
              className={filter === 'deposit' ? styles.activeFilter : ''}
              onClick={() => setFilter('deposit')}
            >
              Depósitos
            </button>
            <button
              className={filter === 'withdrawal' ? styles.activeFilter : ''}
              onClick={() => setFilter('withdrawal')}
            >
              Retiros
            </button>
          </div>
          <div className={styles.exportButtons}>
            <button className={styles.exportBtn} onClick={exportToCSV}>
              📥 CSV
            </button>
            <button className={styles.exportBtn} onClick={exportToExcel}>
              📊 Excel
            </button>
          </div>
        </div>

        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuario</th>
                <th>Tipo</th>
                <th>Monto</th>
                <th>Moneda</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction) => (
                <tr key={transaction.id} className={styles.row}>
                  <td>{transaction.id?.substring(0, 8)}</td>
                  <td>{transaction.user_id?.substring(0, 8)}</td>
                  <td>
                    <span className={`${styles.badge} ${styles[transaction.type]}`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className={isWithdrawal(transaction.type) ? styles.amountWithdrawal : styles.amountDeposit}>
                    {isWithdrawal(transaction.type) ? '-' : '+'}${Math.abs(transaction.amount_cents / 100).toFixed(2)}
                  </td>
                  <td>{transaction.currency}</td>
                  <td>
                    <button
                      className={styles.viewBtn}
                      onClick={() => handleSelectTransaction(transaction)}
                      title={new Date(transaction.created_at).toLocaleString()}
                    >
                      {new Date(transaction.created_at).toLocaleDateString('es-MX')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedTransaction && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3>Detalles de Transacción</h3>
              <button
                className={styles.closeBtn}
                onClick={() => {
                  setSelectedTransaction(null);
                  setUserDetails(null);
                }}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.detailGroup}>
                <h4>Información de Transacción</h4>
                <p><strong>ID:</strong> {selectedTransaction.id}</p>
                <p><strong>Tipo:</strong> {selectedTransaction.type}</p>
                <p><strong>Monto:</strong> {selectedTransaction.amount_cents / 100} {selectedTransaction.currency}</p>
                <p><strong>Fecha:</strong> {new Date(selectedTransaction.created_at).toLocaleString()}</p>
              </div>

              {userDetails && (
                <div className={styles.detailGroup}>
                  <h4>Información del Usuario</h4>
                  <p><strong>Nombre:</strong> {userDetails.full_name}</p>
                  <p><strong>Email:</strong> {userDetails.email}</p>
                  <p><strong>Teléfono:</strong> {userDetails.phone_number}</p>
                  <p><strong>Estado:</strong> {userDetails.status}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
