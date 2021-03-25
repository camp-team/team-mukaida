import { Injectable } from '@angular/core';
import { AngularFirestore } from '@angular/fire/firestore';
import * as firebase from 'firebase';
import { Image } from '../interfaces/image';
import { Comment, CommentWithUser } from '../interfaces/comment';
import { Observable, of, combineLatest } from 'rxjs';
import { switchMap, map, take } from 'rxjs/operators';
import { User } from '../interfaces/user';
import { UserService } from './user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from './auth.service';
import { Post } from '../interfaces/post';

@Injectable({
  providedIn: 'root',
})
export class CommentService {
  constructor(
    private db: AngularFirestore,
    private userService: UserService,
    private snackBar: MatSnackBar,
    private authService: AuthService
  ) {}

  createComment(
    post: Post,
    comment: Omit<
      Comment,
      'uid' | 'imageId' | 'createdAt' | 'imageURL' | 'commentId' | 'eventId'
    >
  ): Promise<void> {
    const commentId: string = this.db.createId();
    if (post.imageId) {
      return this.db
        .doc<Comment>(
          `events/${post.eventId}/images/${post.imageId}/comments/${commentId}`
        )
        .set({
          ...comment,
          uid: this.authService.uid,
          imageId: post.imageId,
          imageURL: post.imageURL,
          commentId,
          eventId: post.eventId,
          createdAt: firebase.default.firestore.Timestamp.now(),
        });
    }

    if (post.videoId) {
      return this.db
        .doc<Comment>(
          `events/${post.eventId}/videos/${post.videoId}/comments/${commentId}`
        )
        .set({
          ...comment,
          uid: this.authService.uid,
          videoId: post.videoId,
          videoURL: post.videoURL,
          commentId,
          eventId: post.eventId,
          createdAt: firebase.default.firestore.Timestamp.now(),
        });
    }
  }

  getComments(eventId: string, imageId: string): Observable<Comment[]> {
    return this.db
      .collection<Comment>(`events/${eventId}/images/${imageId}/comments`)
      .valueChanges();
  }

  getCommentsWithUser(
    eventId: string,
    imageId?: string,
    videoId?: string
  ): Observable<CommentWithUser[]> {
    if (imageId === undefined && videoId === undefined) {
      return of(null);
    } else {
      if (imageId) {
        return this.db
          .collection<Comment>(
            `events/${eventId}/images/${imageId}/comments`,
            (ref) => ref.orderBy('createdAt', 'desc')
          )
          .valueChanges()
          .pipe(
            switchMap((comments: Comment[]) => {
              if (comments.length) {
                const unduplicatedUids: string[] = Array.from(
                  new Set(comments.map((comment) => comment.uid))
                );

                const users$: Observable<User[]> = combineLatest(
                  unduplicatedUids.map((uid) =>
                    this.userService.getUserData(uid)
                  )
                );
                return combineLatest([of(comments), users$]);
              } else {
                return of([]);
              }
            }),
            map(([comments, users]) => {
              if (comments?.length) {
                return comments.map((comment: Comment) => {
                  return {
                    ...comment,
                    user: users.find((user: User) => comment.uid === user?.uid),
                  };
                });
              } else {
                return [];
              }
            })
          );
      }
      if (videoId) {
        return this.db
          .collection<Comment>(
            `events/${eventId}/videos/${videoId}/comments`,
            (ref) => ref.orderBy('createdAt', 'desc')
          )
          .valueChanges()
          .pipe(
            switchMap((comments: Comment[]) => {
              if (comments.length) {
                const unduplicatedUids: string[] = Array.from(
                  new Set(comments.map((comment) => comment.uid))
                );

                const users$: Observable<User[]> = combineLatest(
                  unduplicatedUids.map((uid) =>
                    this.userService.getUserData(uid)
                  )
                );
                return combineLatest([of(comments), users$]);
              } else {
                return of([]);
              }
            }),
            map(([comments, users]) => {
              if (comments?.length) {
                return comments.map((comment: Comment) => {
                  return {
                    ...comment,
                    user: users.find((user: User) => comment.uid === user?.uid),
                  };
                });
              } else {
                return [];
              }
            })
          );
      }
    }
  }

  async deleteComment(
    eventId: string,
    commentId: string,
    imageId?: string,
    videoId?: string
  ): Promise<void> {
    if (imageId) {
      return this.db
        .doc<Comment>(
          `events/${eventId}/images/${imageId}/comments/${commentId}`
        )
        .delete()
        .then(() => {
          this.snackBar.open('コメントを1件削除しました');
        });
    }
    if (videoId) {
      return this.db
        .doc<Comment>(
          `events/${eventId}/videos/${videoId}/comments/${commentId}`
        )
        .delete()
        .then(() => {
          this.snackBar.open('コメントを1件削除しました');
        });
    }
  }

  async getMyCommentIds(uid: string): Promise<string[]> {
    const comments = await this.db
      .collectionGroup<Comment>('comments', (ref) =>
        ref.where('uid', '==', uid)
      )
      .valueChanges()
      .pipe(take(1))
      .toPromise();
    return comments.map((comment) => comment.commentId);
  }
}
