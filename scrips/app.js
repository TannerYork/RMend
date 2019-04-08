import * as reportsListView from '/scrips/views/reportsListView.js';
import * as reportView from '/scrips/views/reportView.js';
import * as firebase from '/scrips/firebase.js';
import ReportLocal from '/scrips/models/Report-local.js';
import ReportFirebase from '/scrips/models/Report-firebase.js';
import { elements } from '/scrips/views/base.js';


/**
* GLOABAL STATE OF APP
* -Report Objet or Recipe List
*/
const state = {}


/**
* Report Controller
*/
const controllReport = async () => {
    //1. Render report view
        reportView.renderReportView();
    //2. Get user report data
        elements.reportButton.addEventListener('click', () => {
          //3. Create new report object
          const report = new ReportLocal(firebase.getCurrentUser(),
                                         elements.reportSender,
                                         elements.reportTimestamp,
                                         elements.reportImg,
                                         elements.reportLocation,
                                         elements.reportDetails)

          //4. Send data to firestore/storage
            firebase.sendReport(report);
        });
}


/**
* Reports List Controller
*/
const controllReportsList = async () => {
    //1. Render reports list
        reportsListView.renderReportsListView();
    //2. Get user input
        elements.reportButton.addEventListener('click', () => {
          //3. Update firestore/storage
              firebase.updateReportsList();
          //4. Update UI.
              reportsListView.updateReportsList();

        });
}


/**
* App Inisilization/Controll.
*/
const controllApp = async () => {
  //1. Check is user is an admin or not
  
  //2. Deploy controller based on users status

}
