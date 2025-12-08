import React, { useEffect, useState, useCallback } from 'react';
import { kpiAPI } from '../../services/api';
import SummaryCards from './SummaryCards';
import IncomeChart from './IncomeChart';
import ReservationsPie from './ReservationsPie';
import TrendsChart from './TrendsChart';
import OccupancyByDriver from './OccupancyByDriver';
import RecentReservationsTable from './RecentReservationsTable';
import FiltersBar from './FiltersBar';
import styles from './KpiDashboard.module.css';

// Función para decodificar el JWT manualmente 
function parseJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error parsing JWT:', error);
    return null;
  }
}

// Función para obtener usuario actual de localStorage
function getCurrentUser() {
  try {
    const userStr = localStorage.getItem('colibri:user');
    if (!userStr) {
      console.log('No hay usuario en localStorage');
      return { id: null, rol: 'ADMIN' };
    }
    
    const userData = JSON.parse(userStr);
    console.log('Usuario desde localStorage:', userData);
    
    // Extraer ID del token si existe
    let userId = userData.id || userData.userId;
    
    // Si no hay ID directo, intentar decodificar el token
    if (!userId && userData.token) {
      try {
        const decoded = parseJwt(userData.token);
        userId = decoded.id;
        console.log('ID extraído del token:', userId);
      } catch (e) {
        console.error('Error decodificando token:', e);
      }
    }
    
    return {
      id: userId,
      email: userData.email,
      rol: userData.role || userData.rol || 'ADMIN'
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return { id: null, rol: 'ADMIN' };
  }
}

export default function KpiDashboard() {
  const [period, setPeriod] = useState('this_month');
  const [year, setYear] = useState(new Date().getFullYear());
  const [driverId, setDriverId] = useState('all');
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [incomeDataYear, setIncomeDataYear] = useState([]);
  const [reservationsStatus, setReservationsStatus] = useState(null);
  const [trends, setTrends] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [recent, setRecent] = useState([]);

  // Obtener usuario actual de localStorage
  const currentUser = getCurrentUser();
  const isDriver = currentUser.rol === 'DRIVER' || currentUser.rol === 'CONDUCTOR' || currentUser.rol === 'Conductor';
  const effectiveDriverId = isDriver ? currentUser.id : driverId;

  console.log('Current User:', currentUser);
  console.log('Is Driver:', isDriver);
  console.log('Effective Driver ID:', effectiveDriverId);

  // Cargar lista de conductores (solo si es ADMIN)
  useEffect(() => {
    if (isDriver) {
      console.log('Usuario es conductor, no se carga lista de conductores');
      return;
    }

    async function loadDrivers() {
      try {
        console.log('Cargando lista de conductores...');
        const response = await kpiAPI.getDriversList();
        console.log('Conductores cargados:', response.data);
        setDrivers(response.data || []);
      } catch (err) {
        console.error('Error loading drivers:', err);
      }
    }
    loadDrivers();
  }, [isDriver]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = { 
        period, 
        driverId: effectiveDriverId === 'all' ? undefined : effectiveDriverId 
      };
      const yearParams = { 
        year, 
        driverId: effectiveDriverId === 'all' ? undefined : effectiveDriverId 
      };

      console.log('Cargando datos con params:', params);
      console.log('Year params:', yearParams);

      const [s, inc, rs, tr, occ, r] = await Promise.all([
        kpiAPI.getSummary(params),
        kpiAPI.getIncome(yearParams),
        kpiAPI.getReservationsStatus(params),
        kpiAPI.getTrends(params),
        kpiAPI.getOccupancyByDriver(params),
        kpiAPI.getRecent({ ...params, limit: 10 })
      ]);

      console.log('Datos cargados exitosamente');
      console.log('Summary:', s.data);
      console.log('Trends:', tr.data);
      console.log('Recent:', r.data);

      setSummary(s.data);
      setIncomeDataYear(inc.data);
      setReservationsStatus(rs.data);
      setTrends(tr.data);
      setOccupancy(occ.data);
      setRecent(r.data);
    } catch (err) {
      console.error('KPI load error', err);
    } finally {
      setLoading(false);
    }
  }, [period, year, effectiveDriverId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  return (
    <div className={styles.container}>
      <h1>
        {isDriver ? 'Mis Estadísticas' : 'KPI'}
      </h1>

      <FiltersBar 
        period={period} 
        onPeriodChange={setPeriod} 
        year={year} 
        onYearChange={setYear}
        driverId={driverId}
        onDriverChange={setDriverId}
        drivers={drivers}
        isDriver={isDriver}
      />

      <SummaryCards data={summary} loading={loading} />

      <div className={styles.grid}>
        <div className={styles.chartBox}>
          <IncomeChart data={incomeDataYear} year={year} />
        </div>

        <div className={styles.chartBox}>
          <ReservationsPie data={reservationsStatus} />
        </div>
      </div>

      <div className={styles.grid}>
        {!isDriver && (
          <div className={styles.chartBox}>
            <OccupancyByDriver data={occupancy} loading={loading} />
          </div>
        )}

        <div className={styles.chartBox}>
          <TrendsChart data={trends} />
        </div>
      </div>

      <RecentReservationsTable data={recent} loading={loading} />
    </div>
  );
}