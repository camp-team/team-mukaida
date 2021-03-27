import { Component, Input, OnInit } from '@angular/core';
import { ImageService } from 'src/app/services/image.service';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { Image } from 'src/app/interfaces/image';
import { User } from 'src/app/interfaces/user';
import { switchMap, take } from 'rxjs/operators';
import { UserService } from 'src/app/services/user.service';
import { LikedService } from 'src/app/services/liked.service';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-image-detail',
  templateUrl: './image-detail.component.html',
  styleUrls: ['./image-detail.component.scss'],
})
export class ImageDetailComponent implements OnInit {
  @Input() image: Image;
  imageCreatedAt: any;
  uid: string;
  likedCount: number;
  isLiked: boolean;
  imageIds = [];
  eventId: string = this.route.snapshot.paramMap.get('eventId');
  imageId: string = this.route.snapshot.paramMap.get('imageId');
  image$: Observable<Image> = this.imageService.getImage(
    this.eventId,
    this.imageId
  );
  imageProvider$: Observable<User> = this.image$.pipe(
    switchMap((image) => {
      const uid: string = image?.uid;
      return this.userService.getUserData(uid);
    })
  );
  constructor(
    private imageService: ImageService,
    private route: ActivatedRoute,
    private userService: UserService,
    private likedService: LikedService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    // 自分がいいねをしたか、していないかを判定する。
    this.likedService
      .isLiked(this.eventId, this.imageId, this.authService.uid)
      .pipe(take(1))
      .subscribe((isLiked) => {
        this.isLiked = isLiked;
      });
    // 各画像のいいね数を取得する。
    this.likedService
      .getLikedCount(this.eventId, this.imageId)
      .pipe(take(1))
      .subscribe((likedCount) => {
        this.likedCount = likedCount.length;
      });
  }

  likeImage(imageId: string) {
    this.isLiked = true;
    this.likedCount++;
    this.imageIds.push(imageId);
    this.likedService.likeItem(this.eventId, imageId, this.authService.uid);
  }

  UnLikeImage(imageId: string) {
    this.isLiked = false;
    this.likedCount--;
    this.likedService.unlike(this.eventId, imageId, this.authService.uid);
  }
}
