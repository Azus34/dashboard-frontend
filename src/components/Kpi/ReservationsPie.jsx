import React from 'react';
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts';

export default function ReservationsPie({ data }) {
    
    const safe = {
        accepted: data?.accepted ?? 0,
        pending: data?.pending ?? 0,
        rejected: data?.rejected ?? 0,
        completed: data?.completed ?? 0
    };
    const options = {
        chart: { type: 'pie', backgroundColor: 'transparent', height: 300 },
        title: { text: 'Viajes por estado', style: {
        color: '#e5e7eb',
        fontSize: '16px',
        fontWeight: '600'
    } },
        tooltip: {
        pointFormat: '{series.name}: <b>{point.y}</b>'
    },
    series: [{
        name: 'Viajes',
        colorByPoint: true,
        data: [
        { name: 'Aceptadas', y: safe.accepted || 0 },
        { name: 'Pendientes', y: safe.pending || 0 },
        { name: 'Rechazadas', y: safe.rejected || 0 },
        { name: 'Completadas', y: safe.completed || 0 },
        ]
    }]
};
return <HighchartsReact highcharts={Highcharts} options={options} />
}