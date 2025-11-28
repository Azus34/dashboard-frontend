import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';
import { routesAPI, reservationsAPI } from '../../services/api';
import styles from './Map.module.css';

export function Map() {
  // --- Icon factory ---
  const createIcon = (symbol, className) =>
  L.divIcon({
    className: `custom-marker ${className}-marker`, // clase en el contenedor si la necesitas
    html: `<div class="marker-icon ${className}">${symbol}</div>`,
    iconSize: [40, 40], // ahora coincide con CSS
    iconAnchor: [20, 20], // centro real
    popupAnchor: [0, -20],
  });

const originIcon = createIcon('▲', 'origin');
const stopIcon   = createIcon('◆', 'stop');
const destIcon   = createIcon('▼', 'dest');

  const [routes, setRoutes] = useState([]);
  const [allRoutes, setAllRoutes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [filters, setFilters] = useState({
    available: true,
    in_progress: true,
    completed: true,
    cancelled: true
  });
  const [locationNames, setLocationNames] = useState({});
  const [routeSchedules, setRouteSchedules] = useState({});

  useEffect(() => {
    fetchRoutes();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [allRoutes, filters]);

  const fetchRoutes = async () => {
    try {
      const res = await routesAPI.getAll();
      const routesWithInfo = await Promise.all(
        res.data.map(async (route) => {
          // Obtener nombre del lugar para origen
          const originName = await getLocationName(route.origin.coordinates);
          
          // Obtener nombre del lugar para destino
          const destName = await getLocationName(route.destination.coordinates);
          
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
            originName,
            destName,
            schedule
          };
        })
      );
      
      setAllRoutes(routesWithInfo);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getLocationName = async (coordinates) => {
    try {
      const [lng, lat] = coordinates;
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ColibriDashboard/1.0'
          }
        }
      );
      
      if (response.data && response.data.display_name) {
        // Extraer solo la parte más relevante de la dirección
        const address = response.data.address || {};
        const city = address.city || address.town || address.village || address.municipality;
        const suburb = address.suburb || address.neighbourhood;
        const road = address.road || address.highway;
        
        if (city && road) {
          return `${road}, ${city}`;
        } else if (suburb && city) {
          return `${suburb}, ${city}`;
        } else {
          return response.data.display_name.split(',')[0] || 'Ubicación desconocida';
        }
      }
      
      return 'Ubicación desconocida';
    } catch (error) {
      console.error('Error obteniendo nombre de ubicación:', error);
      return 'Ubicación desconocida';
    }
  };

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

  const applyFilters = () => {
    const filtered = allRoutes.filter(route => filters[route.status]);
    setRoutes(filtered);
  };

  const handleFilterChange = (status) => {
    setFilters(prev => ({
      ...prev,
      [status]: !prev[status]
    }));
  };

  const getPath = (route) => {
    const path = [];
    path.push([route.origin.coordinates[1], route.origin.coordinates[0]]);
    if (route.stops?.length) {
      route.stops.forEach(s => path.push([s.coordinates[1], s.coordinates[0]]));
    }
    path.push([route.destination.coordinates[1], route.destination.coordinates[0]]);
    return path;
  };

  if (loading) return <div className={styles.loading}>Cargando...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.filters}>
        <h3>Filtros de Rutas</h3>
        <div className={styles.filterOptions}>
          <label className={styles.filterOption}>
            <input
              type="checkbox"
              checked={filters.available}
              onChange={() => handleFilterChange('available')}
            />
            <span className={`${styles.filterLabel} ${styles.available}`}>Disponibles</span>
          </label>
          <label className={styles.filterOption}>
            <input
              type="checkbox"
              checked={filters.in_progress}
              onChange={() => handleFilterChange('in_progress')}
            />
            <span className={`${styles.filterLabel} ${styles.in_progress}`}>En Progreso</span>
          </label>
          <label className={styles.filterOption}>
            <input
              type="checkbox"
              checked={filters.completed}
              onChange={() => handleFilterChange('completed')}
            />
            <span className={`${styles.filterLabel} ${styles.completed}`}>Completadas</span>
          </label>
          <label className={styles.filterOption}>
            <input
              type="checkbox"
              checked={filters.cancelled}
              onChange={() => handleFilterChange('cancelled')}
            />
            <span className={`${styles.filterLabel} ${styles.cancelled}`}>Canceladas</span>
          </label>
        </div>
      </div>

      <div className={styles.mapWrapper}>
        <MapContainer
          center={[20.6595, -100.3161]}
          zoom={12}
          scrollWheelZoom
          className={styles.map}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {routes.map(route => {
            const path = getPath(route);
            const color = {
              available: '#28a745',
              in_progress: '#ffc107',
              completed: '#007bff',
              cancelled: '#dc3545'
            }[route.status] || '#6c757d';

            return (
              <React.Fragment key={route._id}>
                <Polyline
                  positions={path}
                  color={color}
                  weight={3}
                  opacity={0.7}
                  dashArray={route.status === 'available' ? '5,5' : ''}
                  onClick={() => setSelectedRoute(route)}
                />

                <Marker
                  icon={originIcon}
                  position={[route.origin.coordinates[1], route.origin.coordinates[0]]}
                  onClick={() => setSelectedRoute(route)}
                >
                  <Tooltip direction="bottom" offset={[0, 20]}>
                    <div>
                      <strong>Origen:</strong> {route.originName || 'Cargando...'}<br/>
                      <small>({route.origin.coordinates[1].toFixed(4)}, {route.origin.coordinates[0].toFixed(4)})</small>
                      {route.schedule && (
                        <div><small><strong>Hora:</strong> {new Date(route.schedule).toLocaleString()}</small></div>
                      )}
                    </div>
                  </Tooltip>
                </Marker>

                {route.stops?.map((s, i) => (
                  <Marker
                    key={i}
                    icon={stopIcon}
                    position={[s.coordinates[1], s.coordinates[0]]}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <Tooltip direction="bottom" offset={[0, 20]}>
                      Parada {i + 1}: ({s.coordinates[1].toFixed(4)}, {s.coordinates[0].toFixed(4)})
                    </Tooltip>
                  </Marker>
                ))}

                <Marker
                  icon={destIcon}
                  position={[route.destination.coordinates[1], route.destination.coordinates[0]]}
                  onClick={() => setSelectedRoute(route)}
                >
                  <Tooltip direction="bottom" offset={[0, 20]}>
                    <div>
                      <strong>Destino:</strong> {route.destName || 'Cargando...'}<br/>
                      <small>({route.destination.coordinates[1].toFixed(4)}, {route.destination.coordinates[0].toFixed(4)})</small>
                    </div>
                  </Tooltip>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapContainer>
      </div>

      {selectedRoute && (
        <div className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <h3>Detalles</h3>
            <button className={styles.closeBtn} onClick={() => setSelectedRoute(null)}>✕</button>
          </div>

          <div className={styles.routeDetails}>
            <div className={styles.detailItem}>
              <span className={styles.label}>ID:</span>
              <span className={styles.value}>{selectedRoute._id.substring(0, 8)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Conductor:</span>
              <span className={styles.value}>{selectedRoute.driverId.substring(0, 8)}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Estado:</span>
              <span className={`${styles.status} ${styles[selectedRoute.status]}`}>{selectedRoute.status}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Asientos:</span>
              <span className={styles.value}>{selectedRoute.availableSeats}</span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Horario:</span>
              <span className={styles.value}>
                {selectedRoute.schedule ? new Date(selectedRoute.schedule).toLocaleString() : 'No programado'}
              </span>
            </div>
            <div className={styles.detailItem}>
              <span className={styles.label}>Precios:</span>
              <span className={styles.value}>${selectedRoute.prices.join(', $')}</span>
            </div>

            <div className={styles.routePath}>
              <h4>Ruta</h4>
              <div className={styles.pathItems}>
                <div className={styles.pathItem}>
                  <span className={styles.pathMarker} style={{ backgroundColor: '#28a745' }}>●</span>
                  <span>
                    <strong>Origen:</strong> {selectedRoute.originName || 'Cargando...'}<br/>
                    <small>({selectedRoute.origin.coordinates[1].toFixed(4)}, {selectedRoute.origin.coordinates[0].toFixed(4)})</small>
                  </span>
                </div>

                {selectedRoute.stops?.map((s, i) => (
                  <div key={i} className={styles.pathItem}>
                    <span className={styles.pathMarker} style={{ backgroundColor: '#ffc107' }}>●</span>
                    <span>
                      Parada {i + 1}: ({s.coordinates[1].toFixed(4)}, {s.coordinates[0].toFixed(4)})
                    </span>
                  </div>
                ))}

                <div className={styles.pathItem}>
                  <span className={styles.pathMarker} style={{ backgroundColor: '#dc3545' }}>●</span>
                  <span>
                    <strong>Destino:</strong> {selectedRoute.destName || 'Cargando...'}<br/>
                    <small>({selectedRoute.destination.coordinates[1].toFixed(4)}, {selectedRoute.destination.coordinates[0].toFixed(4)})</small>
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
