import React, { useState, useEffect } from 'react';
import { reservationsAPI } from '../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import styles from './TripReports.module.css';

export function TripReports() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [filteredReservations, setFilteredReservations] = useState([]);

  useEffect(() => {
    const loadReservations = async () => {
      try {
        const response = await reservationsAPI.getAll();
        setReservations(response.data);
      } catch (error) {
        console.error('Error cargando reservas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadReservations();
  }, []);

  // Filtrar reservas por período seleccionado
  useEffect(() => {
    if (selectedPeriod === 'all') {
      setFilteredReservations(reservations);
    } else {
      const now = new Date();
      let filterDate;

      switch (selectedPeriod) {
        case 'today':
          filterDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          filterDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          filterDate = new Date(0);
      }

      const filtered = reservations.filter(reservation => {
        const reservationDate = new Date(reservation.created_at);
        return reservationDate >= filterDate;
      });
      setFilteredReservations(filtered);
    }
  }, [selectedPeriod, reservations]);

  const getStatusColor = (status) => {
    const colors = {
      pending: '#ffc107',
      confirmed: '#28a745',
      completed: '#007bff',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      confirmed: 'Confirmada',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const calculateStats = () => {
    const total = filteredReservations.length;
    const completed = filteredReservations.filter(r => r.status?.toLowerCase() === 'completed').length;
    const pending = filteredReservations.filter(r => r.status?.toLowerCase() === 'pending').length;
    const cancelled = filteredReservations.filter(r => r.status?.toLowerCase() === 'cancelled').length;
    const totalRevenue = filteredReservations
      .filter(r => r.status?.toLowerCase() === 'completed')
      .reduce((sum, r) => sum + (parseFloat(r.price) || 0), 0);

    const platformCommission = totalRevenue * 0.15; // 15% de comisión
    const activeReservations = completed + pending; // Reservas activas

    return { total, completed, pending, cancelled, totalRevenue, platformCommission, activeReservations };
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(20);
    doc.text('Reporte de Viajes', 20, 20);
    doc.setFontSize(12);
    doc.text('Análisis detallado de todas las reservas y viajes', 20, 30);
    
    // Período
    const periodLabels = {
      all: 'Todo el tiempo',
      today: 'Hoy',
      week: 'Última semana',
      month: 'Este mes'
    };
    doc.text(`Período: ${periodLabels[selectedPeriod]}`, 20, 40);
    
    // Estadísticas
    doc.setFontSize(14);
    doc.text('Estadísticas:', 20, 55);
    doc.setFontSize(10);
    doc.text(`Total Reservas: ${stats.total}`, 20, 65);
    doc.text(`Completadas: ${stats.completed}`, 20, 72);
    doc.text(`Pendientes: ${stats.pending}`, 20, 79);
    doc.text(`Canceladas: ${stats.cancelled}`, 20, 86);
    doc.text(`Ingresos Totales: $${stats.totalRevenue.toFixed(2)}`, 20, 93);
    doc.text(`Comisión Plataforma (15%): $${stats.platformCommission.toFixed(2)}`, 20, 100);
    doc.text(`Reservas Activas: ${stats.activeReservations}`, 20, 107);
    
    // Tabla de reservas
    const tableData = filteredReservations.map(reservation => [
      reservation.id || reservation.reservation_id || 'N/A',
      reservation.route_id || 'N/A',
      reservation.user_name || reservation.user_email || 'N/A',
      getStatusLabel(reservation.status),
      `$${(parseFloat(reservation.price) || 0).toFixed(2)}`,
      formatDate(reservation.created_at),
      reservation.pickup_at ? formatDate(reservation.pickup_at) : 'No programado'
    ]);
    
    autoTable(doc, {
      head: [['ID Reserva', 'ID Ruta', 'Usuario', 'Estado', 'Precio', 'Fecha Creación', 'Hora Pickup']],
      body: tableData,
      startY: 120,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
    });
    
    // Fecha de generación
    const now = new Date();
    doc.setFontSize(8);
    doc.text(`Generado el: ${now.toLocaleDateString('es-MX')} ${now.toLocaleTimeString('es-MX')}`, 20, doc.lastAutoTable.finalY + 10);
    
    // Descargar PDF
    doc.save(`reporte-viajes-${selectedPeriod}-${now.getTime()}.pdf`);
  };

  const stats = calculateStats();

  if (loading) return <div className={styles.loading}>Cargando reportes...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📊 Reporte de Viajes</h1>
        <p>Análisis detallado de todas las reservas y viajes</p>
        <p>Período: Todo el tiempo</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.periodSelector}>
          <label htmlFor="periodSelect">Período:</label>
          <select
            id="periodSelect"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={styles.periodSelect}
          >
            <option value="all">Todo el tiempo</option>
            <option value="today">Hoy</option>
            <option value="week">Última semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>

        <button onClick={exportToPDF} className={styles.exportButton}>
          📄 Exportar PDF
        </button>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total Reservas</span>
            <span className={styles.statValue}>{stats.total}</span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Completadas</span>
            <span className={styles.statValue} style={{color: '#007bff'}}>
              {stats.completed}
            </span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pendientes</span>
            <span className={styles.statValue} style={{color: '#ffc107'}}>
              {stats.pending}
            </span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Canceladas</span>
            <span className={styles.statValue} style={{color: '#dc3545'}}>
              {stats.cancelled}
            </span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Ingresos Totales</span>
            <span className={styles.statValue} style={{color: '#28a745'}}>
              ${stats.totalRevenue.toFixed(2)}
            </span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Comisión Plataforma (15%)</span>
            <span className={styles.statValue} style={{color: '#17a2b8'}}>
              ${stats.platformCommission.toFixed(2)}
            </span>
          </div>

          <div className={styles.statCard}>
            <span className={styles.statLabel}>Reservas Activas</span>
            <span className={styles.statValue} style={{color: '#6f42c1'}}>
              {stats.activeReservations}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.reservationsContainer}>
        {filteredReservations.length > 0 ? (
          <div className={styles.reservationsTable}>
            <div className={styles.tableHeader}>
              <div>ID Reserva</div>
              <div>ID Ruta</div>
              <div>Usuario</div>
              <div>Estado</div>
              <div>Precio</div>
              <div>Fecha Creación</div>
              <div>Hora Pickup</div>
            </div>

            {filteredReservations.map((reservation) => (
              <div key={reservation.id || reservation.reservation_id} className={styles.tableRow}>
                <div className={styles.reservationId}>
                  {reservation.id || reservation.reservation_id || 'N/A'}
                </div>
                <div>{reservation.route_id || 'N/A'}</div>
                <div>{reservation.user_name || reservation.user_email || 'N/A'}</div>
                <div>
                  <span
                    className={styles.statusBadge}
                    style={{backgroundColor: getStatusColor(reservation.status)}}
                  >
                    {getStatusLabel(reservation.status)}
                  </span>
                </div>
                <div className={styles.price}>${(parseFloat(reservation.price) || 0).toFixed(2)}</div>
                <div>{formatDate(reservation.created_at)}</div>
                <div>{reservation.pickup_at ? formatDate(reservation.pickup_at) : 'No programado'}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h2>No hay reservas en el período seleccionado</h2>
            <p>Selecciona otro período para ver reservas disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}