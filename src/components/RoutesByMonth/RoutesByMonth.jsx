import React, { useState, useEffect } from 'react';
import { routesAPI, reservationsAPI } from '../../services/api';
import styles from './RoutesByMonth.module.css';

export function RoutesByMonth() {
  const [allRoutes, setAllRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
  const [filteredRoutes, setFilteredRoutes] = useState([]);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const response = await routesAPI.getAll();
        // Aplicar lógica de cancelación automática como en el mapa
        const routesWithUpdatedStatus = await Promise.all(
          response.data.map(async (route) => {
            // Obtener horario de pickup
            const schedule = await getRouteSchedule(route);
            
            // Verificar si la ruta debe marcarse como cancelada por horario expirado
            let updatedStatus = route.status;
            if (schedule && route.status !== 'completed' && route.status !== 'cancelled') {
              const pickupTime = new Date(schedule);
              const now = new Date();
              if (pickupTime < now) {
                updatedStatus = 'cancelled';
              }
            }
            
            return {
              ...route,
              status: updatedStatus,
              schedule: schedule || route.schedule
            };
          })
        );
        
        setAllRoutes(routesWithUpdatedStatus);
      } catch (error) {
        console.error('Error cargando rutas:', error);
      } finally {
        setLoading(false);
      }
    };
    loadRoutes();
  }, []);

  const getRouteSchedule = async (route) => {
    try {
      // Primero intentar obtener de reservations (para rutas con reservas)
      const response = await reservationsAPI.getByRoute(route._id);
      if (response.data && response.data.length > 0) {
        return response.data[0].pickup_at;
      }
      
      // Si no hay reservations, usar el schedule del route mismo
      return route.schedule || null;
    } catch (error) {
      console.error('Error obteniendo horario:', error);
      // Fallback: usar el schedule del route
      return route.schedule || null;
    }
  };

  // Filtrar rutas por mes seleccionado
  useEffect(() => {
    if (selectedMonth) {
      const [year, month] = selectedMonth.split('-');
      const filtered = allRoutes.filter(route => {
        const routeDate = new Date(route.schedule);
        return (
          routeDate.getFullYear().toString() === year &&
          (routeDate.getMonth() + 1).toString().padStart(2, '0') === month
        );
      });
      setFilteredRoutes(filtered);
    }
  }, [selectedMonth, allRoutes]);

  const getStatusColor = (status) => {
    const colors = {
      available: '#28a745',
      in_progress: '#ffc107',
      completed: '#007bff',
      cancelled: '#dc3545'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusLabel = (status) => {
    const labels = {
      available: 'Disponible',
      in_progress: 'En Progreso',
      completed: 'Completada',
      cancelled: 'Cancelada'
    };
    return labels[status] || status;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const monthName = new Date(selectedMonth + '-01').toLocaleDateString('es-MX', {
    month: 'long',
    year: 'numeric'
  });

  if (loading) return <div className={styles.loading}>Cargando rutas...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>📅 Rutas por Mes</h1>
        <p>Visualiza todas las rutas de un mes específico</p>
      </div>

      <div className={styles.controls}>
        <div className={styles.monthSelector}>
          <label htmlFor="monthInput">Selecciona un mes:</label>
          <input
            id="monthInput"
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={styles.monthInput}
          />
          <span className={styles.monthDisplay}>{monthName}</span>
        </div>
        
        <div className={styles.stats}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Total de Rutas</span>
            <span className={styles.statValue}>{filteredRoutes.length}</span>
          </div>
          
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Disponibles</span>
            <span className={styles.statValue} style={{color: '#28a745'}}>
              {filteredRoutes.filter(r => r.status === 'available').length}
            </span>
          </div>
          
          <div className={styles.statCard}>
            <span className={styles.statLabel}>En Progreso</span>
            <span className={styles.statValue} style={{color: '#ffc107'}}>
              {filteredRoutes.filter(r => r.status === 'in_progress').length}
            </span>
          </div>
          
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Completadas</span>
            <span className={styles.statValue} style={{color: '#007bff'}}>
              {filteredRoutes.filter(r => r.status === 'completed').length}
            </span>
          </div>
        </div>
      </div>

      <div className={styles.routesContainer}>
        {filteredRoutes.length > 0 ? (
          <div className={styles.routesList}>
            {filteredRoutes.map((route) => (
              <div key={route._id} className={styles.routeCard}>
                <div className={styles.cardHeader}>
                  <div className={styles.titleSection}>
                    <h3>Ruta #{route._id.substring(0, 8)}</h3>
                    <span 
                      className={styles.statusBadge}
                      style={{backgroundColor: getStatusColor(route.status)}}
                    >
                      {getStatusLabel(route.status)}
                    </span>
                  </div>
                  <span className={styles.date}>{formatDate(route.schedule)}</span>
                </div>

                <div className={styles.cardContent}>
                  <div className={styles.contentRow}>
                    <div className={styles.contentItem}>
                      <label>Conductor:</label>
                      <span>{route.driverId.substring(0, 8)}</span>
                    </div>
                    <div className={styles.contentItem}>
                      <label>Asientos:</label>
                      <span>{route.availableSeats}</span>
                    </div>
                    <div className={styles.contentItem}>
                      <label>Precio Base:</label>
                      <span className={styles.price}>${route.prices[0]}</span>
                    </div>
                  </div>

                  <div className={styles.routePath}>
                    <label>Ruta:</label>
                    <div className={styles.pathDisplay}>
                      <div className={styles.pathPoint}>
                        <span className={styles.pathMarker} style={{backgroundColor: '#28a745'}}>●</span>
                        <span className={styles.pathLabel}>Origen</span>
                      </div>
                      
                      {route.stops && route.stops.length > 0 && (
                        <>
                          <span className={styles.pathArrow}>→</span>
                          {route.stops.map((stop, idx) => (
                            <div key={idx} className={styles.pathPoint}>
                              <span className={styles.pathMarker} style={{backgroundColor: '#ffc107'}}>●</span>
                              <span className={styles.pathLabel}>Parada {idx + 1}</span>
                            </div>
                          ))}
                        </>
                      )}
                      
                      <span className={styles.pathArrow}>→</span>
                      <div className={styles.pathPoint}>
                        <span className={styles.pathMarker} style={{backgroundColor: '#dc3545'}}>●</span>
                        <span className={styles.pathLabel}>Destino</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>📭</div>
            <h2>No hay rutas en {monthName}</h2>
            <p>Selecciona otro mes para ver rutas disponibles</p>
          </div>
        )}
      </div>
    </div>
  );
}
