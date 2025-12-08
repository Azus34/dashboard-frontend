import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default function TrendsChart({ data = [] }) {
  const dates = data.map(d => new Date(d.date).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }));
  const totals = data.map(d => parseInt(d.total_reservations || 0));

  const options = {
    chart: {
      type: 'line',
      backgroundColor: 'transparent',
      height: 300
    },
    title: {
      text: 'Tendencia en las reservaciones',
      style: {
        color: '#e5e7eb',
        fontSize: '16px',
        fontWeight: '600'
      }
    },
    xAxis: {
      categories: dates,
      labels: {
        style: {
          color: '#9ca3af'
        }
      },
      lineColor: '#374151',
      tickColor: '#374151'
    },
    yAxis: {
      title: {
        text: 'Reservaciones',
        style: {
          color: '#9ca3af'
        }
      },
      labels: {
        style: {
          color: '#9ca3af'
        }
      },
      gridLineColor: '#374151'
    },
    legend: {
      itemStyle: {
        color: '#e5e7eb'
      }
    },
    tooltip: {
      backgroundColor: '#1f2937',
      borderColor: '#374151',
      style: {
        color: '#e5e7eb'
      },
      formatter: function() {
        return `<b>${this.x}</b><br/>${this.y} reservaciones`;
      }
    },
    plotOptions: {
      line: {
        dataLabels: { enabled: false },
        enableMouseTracking: true
      }
    },
    series: [{
      name: 'Reservaciones',
      data: totals,
      color: '#3b82f6'
    }]
  };

  return <HighchartsReact highcharts={Highcharts} options={options} />;
}