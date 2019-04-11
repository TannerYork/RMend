export const elements = {
    navLogin: document.querySelector('.main-nav__login'),
    navLogout: document.querySelector('.main-nav__logout'),
    mainLogin: document.querySelector('.main-button__img'),
    page: document.querySelector('.page'),


    loadReportElement: () => {
        this.reportImage = document.querySelector('#report-photo'),
        this.reportLocation = document.querySelector('#report-location'),
        this.reportDetails = document.querySelector('#report-details'),
        this.reportSubmit = document.querySelector('.form-submit')},
    
    loadReportListElements: () => {},

    loginPage: `
        <div class="main-buttons">
            <div class="main-button">
                <div class="main-button__wrapper">
                    <img class="main-button__img" src="images/logo__icon.svg" alt="LOGIN"/>
                </div>
            </div>
         </div>`,

 reportsPage: `
        <div class="main-container">
            <div class="sub-container">
                
            </div>
        </div>`
}
