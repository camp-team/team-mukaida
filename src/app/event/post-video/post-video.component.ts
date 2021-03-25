import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { EventService } from 'src/app/services/event.service';
import { VideoService } from 'src/app/services/video.service';

@Component({
  selector: 'app-post-video',
  templateUrl: './post-video.component.html',
  styleUrls: ['./post-video.component.scss'],
})
export class PostVideoComponent implements OnInit {
  preview: string | ArrayBuffer;
  video: File;
  thumbnails = [];
  user$: Observable<User> = this.authService.user$;
  isloading: boolean;
  isUploading: boolean;
  selected = 0;
  fileControl = new FormControl('', [Validators.required]);

  eventId$: Observable<string> = this.route.paramMap.pipe(
    map((params) => {
      return params.get('eventId');
    })
  );

  constructor(
    private videoService: VideoService,
    private eventServise: EventService,
    private route: ActivatedRoute,
    private authService: AuthService
  ) {}

  ngOnInit(): void {}

  private convertVideo(file: File) {
    const reader = new FileReader();
    reader.onload = (e) => {
      this.preview = e.target.result;
      this.createThumbnails(this.preview).then(() => {
        this.isloading = false;
      });
    };
    reader.readAsDataURL(file);
  }

  selectVideo(event: any) {
    if (event.target.files.length) {
      this.isloading = true;
      this.video = event.target.files[0];
      return this.convertVideo(this.video);
    }
  }

  async createThumbnails(src) {
    const video = document.createElement('video');
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    video.onloadeddata = () => {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      video.currentTime = 0;
    };

    video.onseeked = () => {
      if (video.currentTime < video.duration) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        this.thumbnails.push(canvas.toDataURL('image/jpeg'));
        video.currentTime += Math.ceil(video.duration / 2);
      } else {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        this.thumbnails.push(canvas.toDataURL('image/jpeg'));
      }
    };

    video.src = src;
    video.load();
  }

  uploadVideo(eventId: string, uid: string): void {
    this.isUploading = true;
    const thumbnail = this.thumbnails[this.selected];
    this.videoService
      .uploadVideo(eventId, this.video, uid, thumbnail)
      .then(() => (this.isUploading = false));
  }
}
