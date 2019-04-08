import { elements } from '/scrips/views/base.js';


export const renderReportsListView = (reports) => {
  elements.subContainer.insertAdjacentHTML('beforebegin', `
  <ul class="reports-list">
    ${reports.forEach(report => createReportItem(report))}
  </ul>
  `);}

const createReportItem = (report) => {
  return `
    <li class="report-item">
        <figure class="report-item__figure">
          <img class="report-item__img" src="${report.img}"/>
        </figure>
        <div class="report-item__data">
          <h4>${report.sender}</h4>
          <p>${report.location}</p>
          <p>${report.timestamp}</p>
          <p>${report.details}</p>
        </div>
    </li>
  `};
