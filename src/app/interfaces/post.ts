import { User } from './user';

export interface Post {
  videoId?: string;
  uid: string;
  videoURL?: string;
  eventId: string;
  thumbnailURL?: string;
  thumbnailId?: string;
  createdAt: firebase.default.firestore.Timestamp;
  imageId?: string;
  imageURL?: string;
  likedCount?: string;
}

export interface PostWithUser extends Post {
  user: User;
}
