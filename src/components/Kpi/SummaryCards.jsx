import React from 'react';
import styles from './SummaryCards.module.css';

const money = (n) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN'}).format(n || 0);

export default function SummaryCards({ data, loading }){
    if (loading) return <div>Loading KPI...</div>;
    if (!data) return null;

    return (
        <div className={styles.cards}>
            <div className={styles.card}>
                <div className={styles.title}>Conductores</div>
                <div className={styles.value}>{data.totalDrivers ?? 0}</div>
            </div>

            <div className={styles.card}>
                <div className={styles.title}>Pasajeros</div>
                <div className={styles.value}>{data.totalPassengers ?? 0}</div>
            </div>

            <div className={styles.card}>
                <div className={styles.title}>Viajes</div>
                <div className={styles.value}>{data.totalReservations ?? 0}</div>
            </div>

            <div className={styles.card}>
                <div className={styles.title}>Pendientes (mes)</div>
                <div className={styles.value}>{money(data.pendingReservations || 0)}</div>
            </div>

            <div className={styles.card}>
                <div className={styles.title}>Ingresos (mes)</div>
                <div className={styles.value}>{money(data.totalIncome || 0)}</div>
            </div>

            <div className={styles.card}>
                <div className={styles.title}>Ocupación</div>
                <div className={styles.value}>{(data.occupancyRate || 0).toFixed(1)}%</div>
            </div>
        </div>
    );
}