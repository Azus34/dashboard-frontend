import React from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

export default function IncomeChart ({ data = [], year }) {
    const seriesData = Array.from({length:12}, (_, i) => {
        const m = data.find(x => x.month === i+1);
        return parseFloat(m ? m.income : 0);
    });

    const options = {
        chart: {
            type: 'column', 
            backgroundColor: 'transparent',
            height: 300
        },
        title: {
            text: `Ingresos ${year}`,
            style: {
                color: '#e5e7eb',
                fontSize: '16px',
                fontWeight: '600'
            }
        },
        xAxis: {
            categories: ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'],
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
                text: 'MXN',
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
                return `<b>${this.x}</b><br/>${new Intl.NumberFormat('es-MX',{style:'currency',currency:'MXN'}).format(this.y)}`;
            }
        },
        plotOptions: {
            column: {
                color: '#3b82f6'
            }
        },
        series: [{
            name: 'Ingresos',
            data: seriesData,
            color: '#3b82f6'
        }]
    };

    return <HighchartsReact highcharts={Highcharts} options={options} />
}