import * as echarts from 'echarts';

const chart = (status) => {
  try {
    let billable;
    let nonBillable;
    if (status) {
      billable = 100;
      nonBillable = 0;
    } else {
      billable = 0;
      nonBillable = 100;
    }
    const chartDom = document.getElementById('chart-container');
    const myChart = echarts.init(chartDom);
    const option = {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'right',
      },
      series: [
        {
          name: 'Access From',
          type: 'pie',
          radius: ['50%', '80%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 4,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
            position: 'center',
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '10',
              fontWeight: 'bold',
            },
          },
          labelLine: {
            show: false,
          },
          data: [
            { value: billable, name: 'Billable' },
            { value: nonBillable, name: 'Non-Billable' },
          ],
        },
      ],
    };
    if (option) myChart.setOption(option);
  } catch (error) {
    console.log('error: ', error);
  }
};
export default chart;
