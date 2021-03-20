import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { Comment } from 'src/app/interfaces/comment';
import { Event } from 'src/app/interfaces/event';
import { Image } from 'src/app/interfaces/image';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { CommentService } from 'src/app/services/comment.service';
import { ImageService } from 'src/app/services/image.service';
import { LikedService } from 'src/app/services/liked.service';
import { DeleteDialogComponent } from 'src/app/shared/delete-dialog/delete-dialog.component';

@Component({
  selector: 'app-image-card',
  templateUrl: './image-card.component.html',
  styleUrls: ['./image-card.component.scss'],
})
export class ImageCardComponent implements OnInit {
  @Input() image: Image;
  @Input() event: Event;
  likedCount: number;
  isLiked: boolean;
  uid: string;

  private eventId = this.route.snapshot.paramMap.get('eventId');
  comments: Comment[];

  user$: Observable<User> = this.authService.user$;
  image$: Observable<Image[]> = this.imageService.getImages(this.eventId);
  imageIds = [];

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
      return this.commentService.getComments(eventId, this.image.imageId);
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
    private commentService: CommentService
  ) {
    this.authServise.user$.subscribe((user) => {
      this.uid = user.uid;
    });
  }

  ngOnInit(): void {
    this.comments$.subscribe((comments) => {
      this.comments = comments;
    });
    // 自分がいいねをしたか、していないかを判定する。
    this.likedService
      .isLiked(this.eventId, this.image.imageId, this.uid)
      .pipe(take(1))
      .subscribe((isLiked) => {
        this.isLiked = isLiked;
      });
    // 各画像のいいね数を取得する。
    this.likedService
      .getLikedCount(this.eventId, this.image.imageId)
      .pipe(take(1))
      .subscribe((likedCount) => {
        this.likedCount = likedCount.length;
      });
  }

  isEditMode() {}

  openDeleteDialog(imageId: string) {
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

  likeImage(imageId: string) {
    this.isLiked = true;
    this.likedCount++;
    this.imageIds.push(imageId);
    this.likedService.likeItem(this.eventId, imageId, this.uid);
  }

  UnLikeImage(imageId: string) {
    this.isLiked = false;
    this.likedCount--;
    this.likedService.unlike(this.eventId, imageId, this.uid);
  }
}
