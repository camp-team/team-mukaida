import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { Video } from 'src/app/interfaces/video';
import { UserService } from 'src/app/services/user.service';
import { VideoService } from 'src/app/services/video.service';

@Component({
  selector: 'app-video-detail',
  templateUrl: './video-detail.component.html',
  styleUrls: ['./video-detail.component.scss'],
})
export class VideoDetailComponent implements OnInit {
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
    private userService: UserService
  ) {}

  ngOnInit(): void {}
}
