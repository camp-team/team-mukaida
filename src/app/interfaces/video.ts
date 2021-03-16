export interface Video {
  videoId: string;
  uid: string;
  videoURL: string;
  eventId: string;
  createdAt: firebase.default.firestore.Timestamp;
}
