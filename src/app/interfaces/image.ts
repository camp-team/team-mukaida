import { Data } from '@angular/router';
import { User } from './user';

export interface Image {
  imageId?: string;
  uid?: string;
  imageURL: string;
  eventId?: string;
  createAt?: Data;
  likedUid?: string;
  likedCount?: string;
  comment?: string;
}

export interface ImageWithUser extends Image {
  user: User;
}
