export default class ReportFirebase {
  constructor(data) {
    this.sender = data.sender,
    this.timestamp = data.timestamp,
    this.img = data.img,
    this.location = data.location,
    this.details = data.details
  }
}
