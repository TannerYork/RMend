import Report from './models/Report.js';
import * as firestore from './firestore.js';

export default class Elements {
    constructor() {

        //Main Elements and HTML
        this.page = document.querySelector('.page'),
        this.downloadBtn = document.querySelector('.download-btn'),

        //Sidebar Elements
        this.sidebar = document.querySelector('.sidebar'),
        this.sidebarList = document.querySelector('.sidebar__list'),
        this.sidebarHamburber = document.querySelector('.sidebar__hamburger'),

        this.sidebarCurrentUser = document.querySelector('.current-user__info'),
        this.sidebarCurrentUserName = document.querySelector('.current-user__name'),
        this.sidebarCurrentUserImg = document.querySelector('.current-user__img'),

        this.sidebarLogin = document.querySelector('.sidebar__login'),
        this.sidebarLogout = document.querySelector('.sidebar__logout'),
        this.sidebarPendingUsers = document.querySelector('.pendingUsers'),
        this.sidebarUsers = document.querySelector('.users'),
        this.sidebarReports = document.querySelector('.reports'),
        this.sidebarReport = document.querySelector('.report-issue'),
        this.sidebarSettings = document.querySelector('.user-settings'),

        // Login Page Elements
        this.loginPage = document.querySelector('.login-page');
        this.mainLoginButtons = document.querySelector('.main-buttons');

        // User Page Elements
        this.userPage = document.querySelector('.main-container');
        this.settingsPage = document.querySelector('.settings-page');
        this.settingsForm = document.querySelector('.js-settings-form');

            // Moderated User Elements
            this.adminPage = document.querySelector('.moderated-user-page');
            this.reportsList = document.querySelector('.reports-list');

            // Verified User Elements
            this.verifiedUserPage = document.querySelector('.verified-user-page');
            this.reportForm = document.querySelector('.js-issue-form');
            this.reportImageDisplay =  document.querySelector('.js-form-img-display');
            this.reportImage = document.querySelector('.js-issue-photo');
            this.reportRoadName = document.querySelector('.js-issue-roadName');
            this.reportDetails = document.querySelector('.js-issue-details');
            this.reportNearestStreet = document.querySelector('.js-issue-nearestStreet');
            this.reportMagistrialDistrict = document.querySelector('.js-issue-magistrialDistrict');
            this.reportPriorityTrue = document.querySelector('.js-issue-priority-input-true');
            this.reportPriorityFalse = document.querySelector('.js-issue-priority-input-false');

            // Unverifyed User Elements
            this.unverifedUserPage = document.querySelector('.unverifed-user-page');

            // Misc Elements
            this.reportPrintPage = document.querySelector('.js-report-print');
            this.reportPrintImg = document.querySelector('.js-report-print__img');
            this.reportPrintSender = document.querySelector('.js-report-print__sender');
            this.reportPrintMagistrialDistrict = document.querySelector('.js-report-print__MD');
            this.reportPrintRoadName = document.querySelector('.js-report-print__road-name');
            this.reportPrintNearestStreet = document.querySelector('.js-report-print__nearest-street');
            this.reportPrintDate = document.querySelector('.js-report-print__date');

        // Furebase listeners for updating UI
        this.listeners = [],

        // Client App Elements and Variables
        this.deferredPrompt = null

    }


/**
 *  Main DOM Functions
 */
    // Load the login page and remove reportsPage elements
     loadLoginPage() {
        this.listeners.forEach((listener) => listener());
        this.mainLoginButtons.style.display = "flex";
        this.loginPage.style.display = 'flex';
        this.userPage.style.display = 'none';
        this.sidebarCurrentUser.style.display = 'none';
        this.sidebarReports.style.display = 'none';
        this.sidebarReport.style.display = 'none';
        this.sidebarSettings.style.display = 'none';
        this.sidebarUsers.style.display = 'none';
        this.sidebarPendingUsers.style.display = 'none';
        this.sidebarLogout.style.display = 'none';
        this.sidebarLogin.style.display = 'flex';
    }

    // Loads the main elements for the reports/user page and removes the loginPage elements
     loadReportsPage() {
        this.sidebarLogin.style.display = 'none';
        this.sidebarLogout.style.display = 'flex';
        this.mainLoginButtons.style.display = "none";
        this.loginPage.style.display = "none";
        this.userPage.style.display = 'flex';
    }

    // Loads the user specific elements for the reports page
    async loadReportsPageInnerHTML(idTokenResult) {
        if (idTokenResult.claims && idTokenResult.claims.moderator == true) {
          // Load Admin HTML
            await this.loadAdminHTML();
            return 'moderator';
        } else if (idTokenResult.claims && idTokenResult.claims.verified == true) {
          // Load User HTML
            await this.renderReportView();
            return 'verifiedUser';
        } else {
          // Load Unvalidated User HTML
          this.listeners.forEach((listener) => listener());
            await this.renderUserView();
            return 'user';
        }
    }

    displayCurrentUserInfo(name, imgUrl) {
        this.sidebarCurrentUser.style.display = 'flex';
        this.sidebarCurrentUserName.textContent = name;
        this.sidebarCurrentUserImg.style.backgroundImage = `url(${imgUrl})`;
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('is-visible');
    }

    toggleOptions(element) {
        element.classList.toggle('visible');
    }

    toggleDetials(element) {
        element.classList.toggle('visible');
    }


/**
 * Unverified User DOM Functions
 */
    // Render unverified user page
    renderUserView() {
        this.listeners.forEach((listener) => listener());
        this.unverifedUserPage.style.display = 'flex';
    }

/**
 * Verified User DOM Functions
 */
    // Render the report form
    renderReportView() {
        this.listeners.forEach((listener) => listener());
        this.adminPage.style.display = 'none';
        this.settingsPage.style.display = 'none';
        this.verifiedUserPage.style.display = 'flex';
        this.sidebarReports.style.display = 'flex';
        this.sidebarReport.style.display = 'flex';
    }

    // Initilize report form
    async initilizeReportDataForm(reportUploadFunction) {
        if (this.reportForm) {
            // If the report form elements initilized properly, listen for user to submit the report
            let imageDisplay = document.querySelector('.js-form-img-display');

            //Diaplays the selected image wuth the correct orientation to be turned into a blob when submited
            this.reportImage.onchange = function (e) {
              loadImage(
                e.target.files[0],
                function (img) {
                    if (imageDisplay.hasChildNodes()) {
                      imageDisplay.removeChild(imageDisplay.childNodes[0]); 
                    }
                  imageDisplay.appendChild(img);
                },
                {maxWidth: 300,
                 orientation: true,
                 canvas: true} // Options
              );
            };

            this.reportForm.addEventListener('submit', async (event) => {
                console.log('Submited');
                event.preventDefault();
                event.stopPropagation();
                const data ={}
                // Convert image to blob from canvas
                if (this.reportImage.files.length > 0) {
                    console.log("Image found");
                    var canvas = imageDisplay.childNodes[0];
                    if (canvas.toBlob) {
                        await canvas.toBlob(
                            async function (blob) {
                                console.log(blob);
                                data.image = blob;
                                data.imageURL = document.querySelector('.js-issue-photo').value;
                                data.roadName = document.querySelector('.js-issue-roadName').value;
                                data.details = document.querySelector('.js-issue-details').value;
                                data.nearestStreet = document.querySelector('.js-issue-nearestStreet').value;
                                data.magistrialDistrict = document.querySelector('.js-issue-magistrialDistrict').value;

                                if (document.querySelector('.js-issue-priority-input-true').checked == true) {
                                    data.priority = true;
                                } else {
                                    data.priority = false;
                                }

                                if (data.image) {
                                    // If all fields are filled, create a new report from data and save the report
                                    let imageDisplay = document.querySelector('.js-form-img-display');
                                    const report = new Report(data);
                                    document.querySelector('.loading-overlay').classList.toggle('loading-overlay__is-visible');
                                    if (imageDisplay.hasChildNodes()) imageDisplay.removeChild(imageDisplay.childNodes[0]);
                                    document.querySelector('.js-issue-photo').value = null;
                                    document.querySelector('.js-issue-roadName').value = '';
                                    document.querySelector('.js-issue-details').value = '';
                                    document.querySelector('.js-issue-nearestStreet').value = '';
                                    document.querySelector('.js-issue-magistrialDistrict').value = '';
                                    const results = await reportUploadFunction(report)
                                    if (results && results.error) {
                                        document.querySelector('.loading-overlay').classList.toggle('loading-overlay__is-visible');
                                        console.log(error);
                                    } else if (results && results.result) {
                                        document.querySelector('.loading-overlay').classList.toggle('loading-overlay__is-visible');
                                    }
                                } else {
                                    console.log("data.img not found");
                                }
                            },
                            'image/jpeg'
                        );
                    } else {
                        console.log("canvas to blob failed");
                    }
                } else {
                    console.log("Image was not found");
                }
            });
        } else {
            console.log("Could not find form");
        }
    }


    async initilizeSettingsForm(notificationsOn, notificationsOff, saveDeviceToken) {
        if (this.settingsForm) {
           const settingsNotificationsTrue = document.querySelector('.js-notiffication-input.true');
           const settingsNotificationsFalse = document.querySelector('.js-notiffication-input.false');
            // If the report form elements initilized properly, listen for user to submit the report
            this.settingsForm.addEventListener('submit', async (event) => {
                event.preventDefault();
                event.stopPropagation();
                if (settingsNotificationsTrue.checked) {
                    notificationsOn();
                    saveDeviceToken();
                } else if (settingsNotificationsFalse.checked){
                    notificationsOff();
                }
            });
        }
    }

    // Clear report form data
    clearReportData() {
        this.reportImage.reset(),
        this.reportRoadName.value = '';
        this.reportDetails.value = '';
        this.reportNearestStreet.value = '';
        this.reportMagistrialDistrict.value = '';
    }

/**
 * Admin DOM Functions
 */
    // Set variables for admin html listeners and load the users previously left list or reports-list my default
    async loadAdminHTML() {
        this.adminPage.style.display = 'flex';
        this.sidebarReports.style.display = 'flex';
        this.sidebarReport.style.display = 'flex';
        this.sidebarSettings.style.display = 'flex';
        this.sidebarUsers.style.display = 'flex';
        this.sidebarPendingUsers.style.display = 'flex';
        this.sidebarLogin.style.display = 'none';
        this.renderModeratorReportsList();
    }

    // Remove listeners for list and render the setting form
    renderSettingsView() {
        this.reportsList.innerHTML = '';
        this.verifiedUserPage.style.display = 'none';
        this.adminPage.style.display = 'none';
        this.settingsPage.style.display = 'flex'
    }

    // Remove Listeners for other list and setup report list listener to render report list items
    async renderModeratorReportsList() {
        this.verifiedUserPage.style.display = 'none';
        this.settingsPage.style.display = 'none';
        this.adminPage.style.display = 'flex';
        this.reportsList.style.display = 'flex';
        this.reportsList.innerHTML = '';

        await this.listeners.forEach((listener) => listener());
        const listener = await firebase.firestore().collection("reports")
            .onSnapshot(async (snapshot) => {
                var numberOfReports = 0;
                await snapshot.docChanges().forEach(async (change) => {
                    numberOfReports += 1;
                    await this.checkChangeType(change, this.createModeratorReport, numberOfReports);
                });
            }, (error) => { console.log(error); });
        this.listeners.push(listener);
    }

    async renderVerifiedUserReportsList() {
        this.verifiedUserPage.style.display = 'none';
        this.settingsPage.style.display = 'none';
        this.adminPage.style.display = 'flex';
        this.reportsList.style.display = 'flex';
        this.reportsList.innerHTML = '';

        await this.listeners.forEach((listener) => listener());
        const listener = await firebase.firestore().collection("reports")
            .onSnapshot(async (snapshot) => {
                var numberOfReports = 0;
                await snapshot.docChanges().forEach(async (change) => {
                    numberOfReports += 1;
                    await this.checkChangeType(change, this.createVerifiedUserReport, numberOfReports);
                });
            }, (error) => { console.log(error); });
        this.listeners.push(listener);
    }

    // Create a report list item to be displayed
    createModeratorReport(data, id) { return `
            <div class="report-item js-report-item ${id}" data-id="${id}">
                <figure class="report-item__figure">
                <img class="report-item__img" src="${data.imageUrl || "images/Spin-1s-80px.svg"}"/>
                </figure>
                <div class="report-item__data disable-scrollbars">
                <h4><span class= report-item__subheader>Sender:</span> ${data.sender}</h4>
                <p><span class= report-item__subheader>Date:</span> ${data.timestamp}</p>
                <p><span class= report-item__subheader>Road Name:</span> ${data.roadName}</p>
                <p><span class= report-item__subheader>Description:</span> ${data.details}</p>
                <p><span class= report-item__subheader>Nearest Street:</span> ${data.nearestStreet}</p>
                <p><span class= report-item__subheader>Magistrial District:</span> ${data.magistrialDistrict}</p>
                </div>
                <button class="report-item__button report-item__button-delete .js-report-item-delete" title="Delete"></button>
                <button class="report-item__button report-item__button-print .js-report-item-print" title="Print"></button>
                <label class="report-item__button-prioritize .js-report-item-prioritize" title="Prioritize">
                    <input type="checkbox" class="checkbox" ${data.priority ? "checked" : ""}>
                    <span class="checkmark"></span>
                </label>
            </div>`};

    createVerifiedUserReport(data, id) { return `
    <div class="report-item js-report-item ${id}" data-id="${id}">
        <figure class="report-item__figure">
        <img class="report-item__img" src="${data.imageUrl || "images/Spin-1s-80px.svg"}"/>
        </figure>
        <div class="report-item__data disable-scrollbars">
        <h4><span class= report-item__subheader>Sender:</span> ${data.sender}</h4>
        <p><span class= report-item__subheader>Date:</span> ${data.timestamp}</p>
        <p><span class= report-item__subheader>Road Name:</span> ${data.roadName}</p>
        <p><span class= report-item__subheader>Description:</span> ${data.details}</p>
        <p><span class= report-item__subheader>Nearest Street:</span> ${data.nearestStreet}</p>
        <p><span class= report-item__subheader>Magistrial District:</span> ${data.magistrialDistrict}</p>
        </div>
    </div>`};

    toggleBorder(id) {
        document.querySelector(`.${id}`).classList.toggle("priority-border");
    }

    // Remove listeners for other list and setup users list listener to render user list items
    async renderUsersList() {
        this.toggleLoadingOverlay();
        this.verifiedUserPage.style.display = 'none';
        this.settingsPage.style.display = 'none';
        this.adminPage.style.display = 'flex';
        this.reportsList.style.display = 'flex';
        this.reportsList.innerHTML = '';

        await this.listeners.forEach((listener) => listener());
        const listener = await firebase.firestore().collection("users")
            .onSnapshot(async (snapshot) => {
               await snapshot.docChanges().forEach(async (change) => {
                    await this.checkChangeType(change, this.createUserCard);
                });
            }, (error) => { console.log(error); });
        this.listeners.push(listener);
        this.toggleLoadingOverlay();
    }

    // Create a user list item to be displayed
    createUserCard(data) { return `
        <div class="user-list__item-container js-users-list__item" data-email="${data.email}">
         <div class="users-list__item top js-users-list__item">
            <h4>${data.displayName}</h4>
         </div>
         <div class="options">
            <div class="options-btn start js-moderate-btn">Moderate</div>
            <div class="options-btn js-verify-btn">Verifiy</div>
            <div class="options-btn end js-unverify-btn">Unverify</div>
          </div>
          <div class="users-list__item bottom"></div>
        </div>`;}

    // Remove listeners for other list and setup pending users list listener to render pending users list items
    async renderPendingUsersList() {
        this.verifiedUserPage.style.display = 'none';
        this.settingsPage.style.display = 'none';
        this.adminPage.style.display = 'flex';
        this.reportsList.style.display = 'flex';
        this.reportsList.innerHTML = '';
        await this.listeners.forEach((listener) => listener());
        const listener = await firebase.firestore().collection('pendingUsers')
            .onSnapshot(async (snapshot) => {
               await snapshot.docChanges().forEach(async (change) => {
                  await this.checkChangeType(change, this.createPenndingUserCard);
                });
            }, (error) => { console.log(error); });
        this.listeners.push(listener);
    }

    // Creaate a pending user list item to be displayed
    createPenndingUserCard(data) { return `
            <div class="user-list__item-container js-pendingUsers-list__item" data-email="${data.email}">
                <div class="users-list__item top js-pendingUsers-list__item" data-email="${data.email}">
                    <h4>${data.displayName}</h4>
                </div>
                <div class="options">
                    <div class="options-btn start js-moderate-btn">Moderate</div>
                    <div class="options-btn js-verify-btn">Verifiy</div>
                    <div class="options-btn end js-unverify-btn">Unverify</div>
                </div>
                <div class="users-list__item bottom" data-email="${data.email}">
                </div>
            </div>`};

    // Check changes for list listeners above and render elements as needed
     checkChangeType(change, cardCreator) {
        if (change.type === "added") {
            if (cardCreator == this.createModeratorReport && change.doc.data().priority == true) {
                this.reportsList.insertAdjacentHTML('afterbegin', cardCreator(change.doc.data(), change.doc.id));
                this.toggleBorder(change.doc.id);
            } else if (cardCreator == this.createModeratorReport) {
                this.reportsList.insertAdjacentHTML('beforeend', cardCreator(change.doc.data(), change.doc.id));
            } else if (cardCreator == this.createVerifiedUserReport && change.doc.data().priority == true) {
                this.reportsList.insertAdjacentHTML('afterbegin', cardCreator(change.doc.data(), change.doc.id));
                this.toggleBorder(change.doc.id);
            } else if (cardCreator == this.createVerifiedUserReport) {
                this.reportsList.insertAdjacentHTML('beforeend', cardCreator(change.doc.data(), change.doc.id));
            } else {
                this.reportsList.insertAdjacentHTML('beforeend', cardCreator(change.doc.data()));
            }
        }
        if (change.type === "modified") {
            if (this.reportsList.hasChildNodes()) {
                var array = Array.from(this.reportsList.children);
               array.forEach((element) => {
                    if (element.dataset.id === `${change.doc.data().id}`) {
                        const figure =  element.querySelector('.report-item__figure');
                        figure.querySelector('.report-item__img').src = `${change.doc.data().imageUrl}`;
                    }
                });
              }
        }
        if (change.type === "removed") {
            if (this.reportsList.hasChildNodes()) {
                var array = Array.from(this.reportsList.children);
                if (cardCreator == this.createModeratorReport) {
                    array.forEach((element, index) => {
                        if (element.dataset && element.dataset.id === `${change.doc.data().id}`) {
                            this.reportsList.removeChild(this.reportsList.children[index]);
                        }
                    });
                } else {
                    array.forEach((element, index) => {
                        if (element.dataset.email === `${change.doc.data().email}`) {
                           this.reportsList.removeChild(this.reportsList.children[index]);
                        }
                    });
                }
              }
        }
    }



/**
 * Misc DOM Functions
 */

    // Display the onlife indicator
    showOfflineIndicator() {
        this.offlineIndicator.style.display = 'flex';
    }

     // Toggle the loading overlay html element
     toggleLoadingOverlay() {
        document.querySelector('.loading-overlay').classList.toggle('loading-overlay__is-visible');
    }

    // Remove download button and download web app locally
    addToHomeScreen() {
        console.log("Download button clicked");
        this.deferredPrompt.prompt();
        this.deferredPrompt.userChoice.then((choiceResult) => {
            if (choiceResult.outcome === 'accepted') {
                console.log('User accepted the download prompt');
            } else {
                console.log('User dismissed the download prompt');
            }
            this.deferredPrompt = null;
        });
    }

    reviealReportPrintPage(report) {
        console.log("Showing report print page");

        this.reportPrintImg.src = "";
        this.reportPrintSender.textContent = "";
        this.reportPrintMagistrialDistrict.textContent = "";
        this.reportPrintRoadName.textContent = "";
        this.reportPrintNearestStreet.textContent = "";
        this.reportPrintDate.textContent = "";

        this.reportPrintImg.src = `${report.imageURL}`;
        this.reportPrintSender.textContent = `Sender: ${report.sender}`;
        this.reportPrintMagistrialDistrict.textContent = `Magistrial District: ${report.magistrialDistrict}`;
        this.reportPrintRoadName.textContent = `Road Name: ${report.roadName}`;
        this.reportPrintNearestStreet.textContent = `Nearest Street: ${report.nearestStreet}`;
        this.reportPrintDate.textContent = `Date: ${report.date}`;
        window.print();
        console.log("Printing Window");
    }
}
