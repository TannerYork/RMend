export const elelements = {
  status: undefined;,

  loadElements: () => {

    this.subContainer = document.querySelector('.sub-container');

    if (currentUser.IS_A_USER) {
      //Load the user elelements
      this.reportPhoto = document.querySelector('#issue-photo');
      this.reportLocation = document.querySelector('#issue-location');
      this.reportDetails = document.querySelector('#issue-details');
      this.reportButton = document.querySelector('.form-button');
      this.status = "user";
    } else {
      //Load the adim elements
      this.status = "admin"
    }
  },

  clearElements: () => {
    if (currentUser.IS_A_USER) {
      //Remove User Elements from elements.
      delete this.issue_photo;
      delete this.issue_location;
      delete this.issue_details;
    } else {
      //Remove Admin elements from elements.

    }
    this.status = undefined;
  },
}
