import { User } from './user';

export interface Event {
  eventId: string;
  title: string;
  descliption: string;
  thumbnailURL: string;
  ownerId: string;
  createdAt: firebase.default.firestore.Timestamp;
  joinedUserCount: number;
}

export interface EventWithOwner extends Event {
  user: User;
}
