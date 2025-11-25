import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { routesAPI } from '../../services/api';
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
  const [loading, setLoading] = useState(true);
  const [selectedRoute, setSelectedRoute] = useState(null);

  useEffect(() => {
    fetchRoutes();
  }, []);

  const fetchRoutes = async () => {
    try {
      const res = await routesAPI.getAll();
      const active = res.data.filter(r => r.status === 'available' || r.status === 'in_progress');
      setRoutes(active);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
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
                  <Tooltip permanent direction="bottom" offset={[0, 20]}>
                    Origen: ({route.origin.coordinates[1].toFixed(4)}, {route.origin.coordinates[0].toFixed(4)})
                  </Tooltip>
                </Marker>

                {route.stops?.map((s, i) => (
                  <Marker
                    key={i}
                    icon={stopIcon}
                    position={[s.coordinates[1], s.coordinates[0]]}
                    onClick={() => setSelectedRoute(route)}
                  >
                    <Tooltip permanent direction="bottom" offset={[0, 20]}>
                      Parada {i + 1}: ({s.coordinates[1].toFixed(4)}, {s.coordinates[0].toFixed(4)})
                    </Tooltip>
                  </Marker>
                ))}

                <Marker
                  icon={destIcon}
                  position={[route.destination.coordinates[1], route.destination.coordinates[0]]}
                  onClick={() => setSelectedRoute(route)}
                >
                  <Tooltip permanent direction="bottom" offset={[0, 20]}>
                    Destino: ({route.destination.coordinates[1].toFixed(4)}, {route.destination.coordinates[0].toFixed(4)})
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
              <span className={styles.value}>{new Date(selectedRoute.schedule).toLocaleString()}</span>
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
                    Origen: ({selectedRoute.origin.coordinates[1].toFixed(4)}, {selectedRoute.origin.coordinates[0].toFixed(4)})
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
                    Destino: ({selectedRoute.destination.coordinates[1].toFixed(4)}, {selectedRoute.destination.coordinates[0].toFixed(4)})
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
