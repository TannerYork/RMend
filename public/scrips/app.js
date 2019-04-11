import * as reportsListView from '/scrips/views/reportsListView.js';
import * as reportView from '/scrips/views/reportView.js';
import * as firestore from '/scrips/firestore.js';
import ReportLocal from '/scrips/models/Report-local.js';
import ReportFirebase from '/scrips/models/Report-firebase.js';
import { elements } from '/scrips/views/base.js';


/**
* GLOABAL STATE OF APP
* -Report Objet or Recipe List
*/
const state = {}
console.log('Connected to app.js');


/**
* Report Controller
*/
const controllReport = async () => {
    //1. Render report view
        reportView.renderReportView();
    //2. Get user report data
        elements.reportButton.addEventListener('click', () => {
          //3. Create new report object
          const report = new ReportLocal(elements.reportImage,
                                         elements.reportLocation,
                                         elements.reportDetails)

          //4. Send data to firestore/storage
            firestore.sendReport(report);
        });
}


/**
* Reports List Controller
*/
const controllReportsList = async () => {
    //1. Render reports list
        reportsListView.renderReportsListView();
    //2. Get user input
        reportListElements.reportButton.addEventListener('click', () => {
          //3. Update firestore/storage
              firestore.updateReportsList();
          //4. Update UI.
              reportsListView.updateReportsList();

        });
}


/**
* App Inisilization/Controll.
*/

// Checks that the Firebase SDK has been correctly setup and configured.
function checkSetup() {
    if (!window.firebase || !(firebase.app instanceof Function) || !firebase.app().options) {
      window.alert('You have not configured and imported the Firebase SDK. ' +
          'Make sure you go through the codelab setup instructions and make ' +
          'sure you are running the codelab using `firebase serve`');
    } else {
        return true
    }
  }
  
  // Checks that Firebase has been imported.
  if (checkSetup()) {
      // 1. Allow User to sign in TODO: MAKE THE MAIN BUTTON WORK
      [elements.navLogin, elements.mainLogin].forEach(el => el.addEventListener('click', firestore.signIn));
      elements.navLogout.addEventListener('click', firestore.signOut);
      
      // 2. Initilize firebase auth
      firestore.initFirebaseAuth();

      //3. Load correct inner HTML based on users token.

      

  } 

