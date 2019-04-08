import { elements } from '/scrips/views/base.js';


export const renderReportView = () => {
    elements.subContainer.insertAdjacentHTML('afterbegin', `
  <header class="issue-form-header">
    <h1>Issue Report</h1>
    <p><em>Make sure to fill out all of the required sections.</em></p>
  </header>
  <div class="issue-form">

    <div class="form-row form-row-photo">
      <label class="photo-label" for="issue-photo">
        <span>Picture of Issue</span>
        <input type="file" accept="image/*" name="issue-photo" id="issue-photo" required/>
      </label>
    </div>

    <div class="form-row">
      <label for="issue-location">Location</label>
      <input type="text" name="issue-location" id="issue-location" required/>
    </div>

    <div class='form-row'>
      <label for='issue-details'>Aditional Info</label>
      <textarea id='issue-details'></textarea>
      <div class='instructions'>Describe the issue and further details in 500 words or less</div>
    </div>

    <div class="form-row">
      <button class="form-submit">Submit</button>
    </div>

  </div>
  `);}
