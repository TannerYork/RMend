export default class Report {
  constructor(data, date = undefined) {
    this.sender = data.sender;
    this.image = data.image,
    this.imageURL = data.imageUrl,
    this.roadName = data.roadName,
    this.details = data.details,
    this.nearestStreet = data.nearestStreet,
    this.magistrialDistrict = data.magistrialDistrict,
    this.priority = data.priority
    this.date = date;
  }
}
