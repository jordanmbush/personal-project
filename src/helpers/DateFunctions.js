module.exports =  {
  formatDate: (date) => {
    let d = date,
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    let formattedDate = [year, month, day].join('-');

    return formattedDate;
  },

  getMonthNum: (date) => {
    let month = date.getMonth() + 1;
  },

  getFirstDayOfMonth: (date) => {
    var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    return firstDay;
  },
  getLastDayOfMonth: (date) => {
    var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    return lastDay;
  },
  getDaysInMonth: (year, month) => {
    return new Date(year, month, 0).getDate();
  },

}