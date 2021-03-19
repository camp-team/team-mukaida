import { Data } from '@angular/router';
import { User } from './user';

export interface Image {
  imageId: string;
  uid: string;
  imageURL: string;
  eventId: string;
  createdAt: firebase.default.firestore.Timestamp;
  likedUid?: string;
  likedCount?: string;
}

export interface ImageWithUser extends Image {
  user: User;
}
