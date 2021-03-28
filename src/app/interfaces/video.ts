export interface Video {
  videoId: string;
  uid: string;
  videoURL: string;
  eventId: string;
  thumbnailURL: string;
  thumbnailId: string;
  createdAt: firebase.default.firestore.Timestamp;
}
