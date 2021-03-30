import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Comment } from 'src/app/interfaces/comment';
import { Event } from 'src/app/interfaces/event';
import { Image } from 'src/app/interfaces/image';
import { Post } from 'src/app/interfaces/post';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { CommentService } from 'src/app/services/comment.service';
import { ImageService } from 'src/app/services/image.service';
import { LikedService } from 'src/app/services/liked.service';
import { VideoService } from 'src/app/services/video.service';
import { DeleteDialogComponent } from 'src/app/shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-image-card',
  templateUrl: './image-card.component.html',
  styleUrls: ['./image-card.component.scss'],
})
export class ImageCardComponent implements OnInit {
  @Input() post: Post;
  @Input() event: Event;
  likedCount: number;
  isLiked: boolean;
  uid: string;

  private eventId = this.route.snapshot.paramMap.get('eventId');
  comments: Comment[];

  user$: Observable<User> = this.authService.user$;
  image$: Observable<Image[]> = this.imageService.getImages(this.eventId);

  eventId$: Observable<string> = this.route.paramMap.pipe(
    map((param) => {
      return param.get('eventId');
    })
  );

  imageList$: Observable<Image[]> = this.eventId$.pipe(
    switchMap((eventId) => {
      return this.imageService.getImages(eventId);
    })
  );

  comments$: Observable<Comment[]> = this.eventId$.pipe(
    switchMap((params) => {
      const eventId = params;
      return this.commentService.getComments(eventId, this.post.eventId);
    })
  );

  constructor(
    private imageService: ImageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private likedService: LikedService,
    private authServise: AuthService,
    private route: ActivatedRoute,
    private commentService: CommentService,
    private videoService: VideoService,
    private router: Router
  ) {
    this.authServise.user$.subscribe((user) => {
      this.uid = user?.uid;
    });
  }

  ngOnInit(): void {
    this.comments$.subscribe((comments) => {
      this.comments = comments;
    });
    // 自分がいいねをしたか、していないかを判定する。

    // 各画像のいいね数を取得する。
    if (this.post.imageId) {
      this.likedService
        .isLiked(this.eventId, this.uid, this.post.imageId, 'image')
        .pipe(take(1))
        .subscribe((isLiked) => {
          this.isLiked = isLiked;
        });

      this.likedService
        .getLikedCount(this.eventId, this.post.imageId, 'image')
        .pipe(take(1))
        .subscribe((likedCount) => {
          this.likedCount = likedCount.length;
        });
    }

    if (this.post.videoId) {
      this.likedService
        .isLiked(this.eventId, this.uid, this.post.videoId, 'video')
        .pipe(take(1))
        .subscribe((isLiked) => {
          this.isLiked = isLiked;
        });

      this.likedService
        .getLikedCount(this.eventId, this.post.videoId, 'video')
        .pipe(take(1))
        .subscribe((likedCount) => {
          this.likedCount = likedCount.length;
        });
    }
  }

  isEditMode() {}

  navigateDetail(post: Post) {
    if (post.imageId) {
      this.router.navigateByUrl(
        `/event/${post.eventId}/images/${post.imageId}`
      );
    }
    if (post.videoId) {
      this.router.navigateByUrl(
        `/event/${post.eventId}/videos/${post.videoId}`
      );
    }
  }

  openDeleteImageDialog(imageId: string) {
    this.dialog
      .open(DeleteDialogComponent, {
        minWidth: 300,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.imageService
            .deleteImage(this.event.eventId, imageId)
            .then(() => this.snackBar.open('画像を削除しました'));
        } else {
          return;
        }
      });
  }

  openDeleteVideoDialog(videoId: string, thumbnailId: string) {
    this.dialog
      .open(DeleteDialogComponent, {
        minWidth: 300,
      })
      .afterClosed()
      .subscribe((result) => {
        if (result) {
          this.videoService.deleteVideo(
            this.event.eventId,
            videoId,
            thumbnailId
          );
        } else {
          return;
        }
      });
  }

  likePost(post: Post, type: 'image' | 'video') {
    this.isLiked = true;
    this.likedCount++;
    this.likedService.likeItem(
      this.eventId,
      this.uid,
      type === 'image' ? post.imageId : post.videoId,
      type
    );
  }

  UnLikePost(post: Post, type: 'image' | 'video') {
    this.isLiked = false;
    this.likedCount--;
    this.likedService.unlike(
      this.eventId,
      this.uid,
      type === 'image' ? post.imageId : post.videoId,
      type
    );
  }
}
