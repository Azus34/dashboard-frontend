import React, { useState, useEffect } from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';
import HighchartsMore from 'highcharts/highcharts-more';
import { earningsAPI, financesAPI, routesAPI } from '../../services/api';
import styles from './Analytics.module.css';

// Initialize modules
HighchartsMore(Highcharts);

export function Analytics() {
  const [earningsData, setEarningsData] = useState([]);
  const [earningsTotal, setEarningsTotal] = useState({ totalEarnings: 0, totalTrips: 0 });
  const [financesStats, setFinancesStats] = useState(null);
  const [routesStats, setRoutesStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [earningsPeriod, earningsTot, finances, routes] = await Promise.all([
          earningsAPI.getByPeriod(),
          earningsAPI.getTotal(),
          financesAPI.getStats(),
          routesAPI.getAll(),
        ]);
        setEarningsData(earningsPeriod.data || []);
        setEarningsTotal(earningsTot.data || { totalEarnings: 0, totalTrips: 0 });
        setFinancesStats(finances.data || {});
        setRoutesStats(routes.data || []);
      } catch (error) {
        console.error('Error cargando datos:', error);
        setError(error.message || 'Error cargando datos');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) return <div className={styles.loading}>Cargando análisis...</div>;
  if (error) return <div className={styles.error}>Error: {error}</div>;

  // Ensure financesStats is an object
  const safFinancesStats = financesStats || {
    total_recharges: 0,
    total_withdrawals: 0,
    recharge_count: 0,
    withdrawal_count: 0,
  };

  // Prepare safe data with defaults
  const safeEarningsData = earningsData && Array.isArray(earningsData) ? earningsData : [];
  const chartEarningsData = safeEarningsData.slice(0, 15).map((e) => parseFloat((e.earnings || 0).toFixed(2)));
  const chartCategoriesData = safeEarningsData.slice(0, 15).map((e) => new Date(e.date).toLocaleDateString());
  const chartTripsData = safeEarningsData.slice(0, 15).map((e) => e.trips || 0);

  // Gráfica de ganancias por período - Área
  const earningsChartOptions = {
    chart: { type: 'area', backgroundColor: 'transparent', height: 350 },
    title: { text: 'Ganancias Diarias (15% Comisión)', style: { color: 'white' } },
    xAxis: {
      categories: chartCategoriesData.length > 0 ? chartCategoriesData : ['Sin datos'],
      crosshair: true,
      labels: { style: { color: 'white' } }
    },
    yAxis: { 
      title: { text: 'Monto ($)', style: { color: 'white' } },
      labels: { style: { color: 'white' } },
      plotLines: [{ value: 0, width: 1, color: '#808080' }],
    },
    tooltip: { 
      formatter: function() {
        return '<b>Ganancias</b>: $' + this.y.toFixed(2);
      },
      shared: true,
    },
    legend: { itemStyle: { color: 'white' } },
    plotOptions: {
      area: {
        stacking: 'normal',
        lineColor: '#666666',
        lineWidth: 1,
        marker: {
          lineWidth: 1,
          lineColor: '#666666'
        }
      }
    },
    series: [
      {
        name: 'Ganancias',
        data: chartEarningsData.length > 0 ? chartEarningsData : [0],
        color: '#28a745',
        fillOpacity: 0.5,
      },
    ],
  };

  // Gráfica de transacciones por día - Columnas
  const transactionsByDayOptions = {
    chart: { type: 'column', backgroundColor: 'transparent', height: 350 },
    title: { text: 'Viajes Completados por Día', style: { color: 'white' } },
    xAxis: {
      categories: chartCategoriesData.length > 0 ? chartCategoriesData : ['Sin datos'],
      labels: { style: { color: 'white' } }
    },
    yAxis: { 
      title: { text: 'Cantidad', style: { color: 'white' } },
      labels: { style: { color: 'white' } }
    },
    legend: { itemStyle: { color: 'white' } },
    plotOptions: {
      column: { dataLabels: { enabled: true } },
    },
    series: [
      {
        name: 'Viajes',
        data: chartTripsData.length > 0 ? chartTripsData : [0],
        color: '#007bff',
      },
    ],
  };

  // Gráfica de recargas vs retiros - Barras
  const safeRechargesValue = parseFloat(((safFinancesStats.total_recharges || 0) / 100).toFixed(2)) || 0;
  const safeWithdrawalsValue = parseFloat(((safFinancesStats.total_withdrawals || 0) / 100).toFixed(2)) || 0;
  
  const financesChartOptions = {
    chart: { type: 'bar', backgroundColor: 'transparent', height: 300 },
    title: { text: 'Recargas vs Retiros', style: { color: 'white' } },
    xAxis: {
      categories: ['Recargas', 'Retiros'],
      labels: { style: { color: 'white' } }
    },
    yAxis: { 
      title: { text: 'Monto ($)', style: { color: 'white' } },
      labels: { style: { color: 'white' } }
    },
    legend: { itemStyle: { color: 'white' } },
    plotOptions: { series: { dataLabels: { enabled: true } } },
    series: [
      {
        name: 'Monto',
        data: [safeRechargesValue, safeWithdrawalsValue],
        colorByPoint: true,
        colors: ['#007bff', '#dc3545'],
      },
    ],
  };

  // Gráfica de transacciones - Pie
  const safeRechargeCount = parseInt(safFinancesStats.recharge_count || 0) || 0;
  const safeWithdrawalCount = parseInt(safFinancesStats.withdrawal_count || 0) || 0;
  
  const transactionChartOptions = {
    chart: { type: 'pie', backgroundColor: 'transparent', height: 350 },
    title: { text: 'Distribución de Transacciones', style: { color: 'white' } },
    tooltip: { 
      formatter: function() {
        return '<b>' + this.point.name + '</b>: ' + this.y + ' (' + this.percentage.toFixed(1) + '%)';
      }
    },
    legend: { itemStyle: { color: 'white' } },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          formatter: function() {
            return '<b>' + this.point.name + '</b>: ' + this.percentage.toFixed(1) + '%';
          },
          style: { color: 'white' }
        },
        showInLegend: true,
      },
    },
    series: [
      {
        name: 'Cantidad',
        colorByPoint: true,
        data: [
          {
            name: 'Recargas',
            y: safeRechargeCount,
            color: '#007bff',
          },
          {
            name: 'Retiros',
            y: safeWithdrawalCount,
            color: '#dc3545',
          },
        ],
      },
    ],
  };

  // Gráfica de estado de viajes - Pie simple (sin doughnut)
  const routeStatusOptions = {
    chart: { type: 'pie', backgroundColor: 'transparent', height: 350 },
    title: { text: 'Estado de Viajes', style: { color: 'white' } },
    tooltip: { 
      formatter: function() {
        return '<b>' + this.point.name + '</b>: ' + this.y;
      }
    },
    legend: { itemStyle: { color: 'white' } },
    plotOptions: {
      pie: {
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          formatter: function() {
            return '<b>' + this.point.name + '</b>: ' + this.y;
          },
          style: { color: 'white' }
        },
      },
    },
    series: [
      {
        name: 'Viajes',
        colorByPoint: true,
        data: [
          {
            name: 'Disponibles',
            y: routesStats.filter(r => r.status === 'available').length,
            color: '#28a745',
          },
          {
            name: 'En Progreso',
            y: routesStats.filter(r => r.status === 'in_progress').length,
            color: '#ffc107',
          },
          {
            name: 'Completados',
            y: routesStats.filter(r => r.status === 'completed').length,
            color: '#007bff',
          },
        ],
      },
    ],
  };

  return (
    <div className={styles.container}>
      <h2>Análisis y Reportes</h2>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h4>Total Recargas</h4>
          <p className={styles.amount}>${((safFinancesStats.total_recharges || 0) / 100).toFixed(2)}</p>
          <span className={styles.count}>{safFinancesStats.recharge_count || 0} transacciones</span>
        </div>
        <div className={styles.statCard}>
          <h4>Total Retiros</h4>
          <p className={styles.amount}>${((safFinancesStats.total_withdrawals || 0) / 100).toFixed(2)}</p>
          <span className={styles.count}>{safFinancesStats.withdrawal_count || 0} transacciones</span>
        </div>
        <div className={styles.statCard}>
          <h4>Ganancias (15%)</h4>
          <p className={styles.amount}>${(earningsTotal.totalEarnings || 0).toFixed(2)}</p>
          <span className={styles.count}>{earningsTotal.totalTrips || 0} viajes completados</span>
        </div>
        <div className={styles.statCard}>
          <h4>Total Viajes</h4>
          <p className={styles.amount}>{routesStats.length}</p>
          <span className={styles.count}>Rutas registradas</span>
        </div>
      </div>

      <div className={styles.chartsGrid}>
        {chartEarningsData.length > 0 && (
          <div className={styles.chartContainer}>
            <HighchartsReact highcharts={Highcharts} options={earningsChartOptions} />
          </div>
        )}
        {chartTripsData.length > 0 && (
          <div className={styles.chartContainer}>
            <HighchartsReact highcharts={Highcharts} options={transactionsByDayOptions} />
          </div>
        )}
        <div className={styles.chartContainer}>
          <HighchartsReact highcharts={Highcharts} options={financesChartOptions} />
        </div>
        {(safFinancesStats.recharge_count > 0 || safFinancesStats.withdrawal_count > 0) && (
          <div className={styles.chartContainer}>
            <HighchartsReact highcharts={Highcharts} options={transactionChartOptions} />
          </div>
        )}
        {routesStats.length > 0 && (
          <div className={styles.chartContainer}>
            <HighchartsReact highcharts={Highcharts} options={routeStatusOptions} />
          </div>
        )}
      </div>
    </div>
  );
}
