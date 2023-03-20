export const toHours = (value) => {
  if (value) {
    const data = `${value}  `.split(':');
    let total = (data[1] * 100) / 60;
    if (total < 10) {
      total = `0${total}`;
    }
    const total_sec = `${total}`.split('.');
    return `${data[0]}.${total_sec[0]}`;
  }
  return '00.00';
};

export const totalAmounts = (values, billRate) => {
  let total_money = 0;
  const datas = `${values}`.split(':');
  const totals = datas[1];
  const chunk = `${datas[0]}.${parseInt(totals, 10)}`;
  total_money = chunk * billRate;
  return total_money;
};
