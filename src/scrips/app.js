console.log('Connected to app.js');
import * as firestore from './firestore.js';
import Elements from './base.js';
import Report from './models/Report.js';
var elements = new Elements();

/**
* App Inisilization/Controll.
*/

// Registures service worker 
if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').then((registration) => {
        // Registration was successful
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      }, (err) => {
        // registration failed :(
        console.log('ServiceWorker registration failed: ', err);
      });
  }

  function checkBeforeInstallPromt(event) {
    console.log("Download is Avalible");
    event.preventDefault();
    elements.deferredPrompt = event;
    elements.downloadBtn.addEventListener("click", elements.addToHomeScreen.bind(elements));}
    window.addEventListener('beforeinstallprompt', checkBeforeInstallPromt);


  // Checks that Firebase has been imported.
  if (firestore.checkSetup()) {
        //if (firebase.auth().currentUser) {/* Do Nothing */} else {elements.loadLoginPage();}

      // Allow User to sign in vis sidebar or auth UI
      if (navigator.onLine) {
        firestore.setupAuthUi();         
        elements.sidebarLogin.addEventListener('click', firestore.signIn);
        elements.sidebarLogout.addEventListener('click', firestore.signOut);

        /**
         * Admin Event Listeners (These are currently placed here because on mobile they do not work anywhere else.
         */
        
         // Checks for sidebar admin buttons interaction and loads the correct page
        function checkForListChange(event) {
            const btn = event.target.closest('.sidebar__list-item');
            if (btn && btn.textContent == 'View Reports') {
                elements.renderReportsList();
            } else if (btn && btn.textContent == 'Users') { 
                elements.renderUsersList();
            } else if (btn && btn.textContent == 'Pending Users') { 
                elements.renderPendingUsersList();
            } else if (btn && btn.textContent == 'Report a Problem') { 
                elements.renderReportView(); 
                elements.initilizeReportDataForm(firestore.saveReport);
            } else if (btn && btn.textContent == 'Notifications') { 
                elements.renderSettingsView();
                elements.initilizeSettingsForm(firestore.toggleNotificationsOn, 
                                               firestore.toggleNotificationsOff,
                                               firestore.saveMessagingDeviceToken);
            }}
        elements.sidebar.addEventListener('click', checkForListChange);

        // Checks for admin settings page interaction and submits changes if needed
        function checkForSettingsInteraction(event) {
            const input = event.target.closest('.js-notiffication-input');
            if (input && input.value == true) {
                
            } 
        }
        elements.settingsPage.addEventListener('click', checkForSettingsInteraction);

        // Checks for admin list items interaction and acts as needed
        function checkForItemInteraction(event) {
            // If list item is a pending user, verify user
            const pendingUser = event.target.closest('.js-pendingUsers-list__item');
            if (pendingUser && pendingUser.dataset.email) elements.toggleOptions(pendingUser.querySelector(".options"));
            // If list item is a user, unverify the user
            const user = event.target.closest('.js-users-list__item');
            if (user && user.dataset.email) elements.toggleOptions(user.querySelector(".options"));
            
            // If list item is a reports delet button, remove the report from firebase
            const reportItemButtonDelete = event.target;
            if (reportItemButtonDelete.classList.contains('.js-report-item-delete') && reportItemButtonDelete.parentElement.dataset.id) {
                if (confirm("Are your sure you want to delete this report? You can not retrieve it once deleted.")) {
                    firestore.removeReportListItem(reportItemButtonDelete.parentElement.dataset.id);
                }
            }

            // If list item is a reports delet button, remove the report from firebase
            const reportItemButtonPrint = event.target;
            if (reportItemButtonPrint.classList.contains('.js-report-item-print') && reportItemButtonPrint.parentElement.dataset.id) {
                firestore.getReport(reportItemButtonPrint.parentElement.dataset.id).then((data) => {
                    if (data !== false) {
                        const report = new Report(data, data.timestamp);
                        elements.reviealReportPrintPage(report);
                    }
                });
            }

            // If list item is a reports delet button, remove the report from firebase
            const reportItemButtonPriority = event.target.closest('.checkbox');
            if (reportItemButtonPriority &&
                reportItemButtonPriority.parentElement.parentElement.dataset.id) {

                let id = reportItemButtonPriority.parentElement.parentElement.dataset.id;
                if (reportItemButtonPriority.checked == true) {
                    firestore.updatePriority(id, true);
                    elements.toggleBorder(id);
                } else {
                    firestore.updatePriority(id, false);
                    elements.toggleBorder(id);
                }
            }
            // If item is the report itsself, show the details of the report.
            const reportItem = event.target;
            if (reportItem.classList.contains('.js-report-item')) {
                elements.toggleDetials(reportItem);
            }
        }
        elements.reportsList.addEventListener('click', checkForItemInteraction);

        // Checks if user list item as user interaction and act as needed
        function checkForUserItemInteraction(event) {
            const target = event.target;
            if (target.textContent == 'Moderate') {
                 // If list item is a pending user, verify user
                const email = target.parentElement.parentElement.dataset.email;
                firestore.grantModeratorRole(email);
            } else if (target.textContent == 'Verifiy') {
                 // If list item is a user, unverify the user
                const email = target.parentElement.parentElement.dataset.email;
                firestore.validateUser(email);
            } else if (target.textContent == 'Unverify') {
                 // If list item is a reports delet button, remove the report from firebase
                const email = target.parentElement.parentElement.dataset.email;
                firestore.unvalidateUser(email);
            }}
        elements.reportsList.addEventListener('click', checkForUserItemInteraction);
       } else { 
           // Prompt User that they are offline and therfore can't perform firebase functions
           elements.showOfflineIndicator(); 
        }

        elements.sidebarHamburber.addEventListener('click', elements.toggleSidebar.bind(elements));
        elements.sidebarList.addEventListener('click', event => {
            const sidebarItem = event.target.closest('.sidebar__list-item');
            if (sidebarItem) elements.toggleSidebar();   
        });

      firebase.auth().onAuthStateChanged( async (user) => {
        if (user) { // User is signed in 
            console.log('User is signed in');
            const userName = firestore.getUserName();
            const imgUrl = firestore.getProfilePicUrl();
            elements.displayCurrentUserInfo(userName, imgUrl);

             // Check users allowNotifications property

             firebase.functions().httpsCallable('checkAllowNotifications')().then((results) => {
                if (results.data.error) {
                  console.log(results.data.error);
                } else {
                    if (results.data.result == true) {
                        // If user has previously set allowNotifications to true save device token for messaging
                        firestore.saveMessagingDeviceToken();
                        firestore.updateMessagingDeviceToken();
                    }
                }
              });
            
            // Load reports page and get users authToken
            await elements.loadReportsPage();
            // Load reports page innerHTML based on users id token
            const userIDToken = await firebase.auth().currentUser.getIdTokenResult(true);
            const userStatus = await elements.loadReportsPageInnerHTML(userIDToken);
            if (userStatus == 'moderator') {
                console.log("Moderatore");
                elements.renderReportsList();
                /**
                 * Currently all admin listeners are stated above due to the fact that on 
                 * mobile devices function inside double nested starting if staments do not 
                 * run at all. If you know a solution, please contact Tanner W York.
                */
            } else if (userStatus == 'verifiedUser') {
                // If reportform DOM is loaded, initilized the report form listener
                var reportForm = document.querySelector('.js-issue-form');
                if (reportForm) elements.initilizeReportDataForm(firestore.saveReport);
            } else if (userStatus == 'user') {
                elements.renderUserView();
            }
        } else { // User is signed out
            console.log('User is signed out');
            // Return user to login page
            elements.loadLoginPage();
        }
      });
  } else {
      console.log("Firebase is not setup");
  }
