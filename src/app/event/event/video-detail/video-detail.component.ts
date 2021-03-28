import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap, take } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { Video } from 'src/app/interfaces/video';
import { AuthService } from 'src/app/services/auth.service';
import { LikedService } from 'src/app/services/liked.service';
import { UserService } from 'src/app/services/user.service';
import { VideoService } from 'src/app/services/video.service';

@Component({
  selector: 'app-video-detail',
  templateUrl: './video-detail.component.html',
  styleUrls: ['./video-detail.component.scss'],
})
export class VideoDetailComponent implements OnInit {
  imageCreatedAt: any;
  uid: string;
  likedCount: number;
  isLiked: boolean;
  imageIds = [];
  eventId: string = this.route.snapshot.paramMap.get('eventId');
  videoId: string = this.route.snapshot.paramMap.get('videoId');
  video$: Observable<Video> = this.videoService.getVideo(
    this.eventId,
    this.videoId
  );
  provider$: Observable<User> = this.video$.pipe(
    switchMap((video) => {
      const uid: string = video.uid;
      return this.userService.getUserData(uid);
    })
  );

  constructor(
    private videoService: VideoService,
    private route: ActivatedRoute,
    private userService: UserService,
    private likedService: LikedService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.likedService
      .isLiked(this.eventId, this.authService.uid, this.videoId)
      .pipe(take(1))
      .subscribe((isLiked) => {
        this.isLiked = isLiked;
      });
    this.likedService
      .getLikedCount(this.eventId, this.videoId)
      .pipe(take(1))
      .subscribe((likedCount) => {
        this.likedCount = likedCount.length;
      });
  }

  likeVideo(videoId: string) {
    this.isLiked = true;
    this.likedCount++;
    this.imageIds.push(videoId);
    this.likedService.likeItem(this.eventId, this.authService.uid, videoId);
  }

  UnLikeVideo(videoId: string) {
    this.isLiked = false;
    this.likedCount--;
    this.likedService.unlike(this.eventId, this.authService.uid, videoId);
  }
}
