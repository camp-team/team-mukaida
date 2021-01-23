import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { Image } from 'src/app/interfaces/image';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
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

  comments: any[] = [
    {
      coment: '',
    },
    {
      coment: '',
    },
    {
      coment: '',
    },
  ];

  user$: Observable<User> = this.authService.user$;
  image$: Observable<Image[]> = this.imageService.getImages(this.eventId);
  imageIds = [];

  constructor(
    private imageService: ImageService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private authService: AuthService,
    private likedService: LikedService,
    private authServise: AuthService,
    private route: ActivatedRoute
  ) {
    this.authServise.user$.subscribe((user) => {
      this.uid = user.uid;
    });
  }

  ngOnInit(): void {
    this.likedService
      .isLiked(this.eventId)
      .pipe(take(1))
      .subscribe((isLiked) => {
        this.isLiked = isLiked;
        console.log(isLiked);
      });
    console.log(this.eventId);
    this.likedService
      .getLikedCount(this.eventId)
      .pipe(take(1))
      .subscribe((likedCount) => {
        this.likedCount = likedCount.length;
        console.log(likedCount);
      });
  }

  isEditMode() {}

  openDeleteDialog(imageId: string) {
    this.dialog
      .open(DeleteDialogComponent, {
        minWidth: 300,
        maxHeight: 320,
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
    console.log(this.likedCount);
    this.likedService.unlike(this.eventId, imageId, this.uid);
  }
}
