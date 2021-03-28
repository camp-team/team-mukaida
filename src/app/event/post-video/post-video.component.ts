import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';
import { VideoService } from 'src/app/services/video.service';

@Component({
  selector: 'app-post-video',
  templateUrl: './post-video.component.html',
  styleUrls: ['./post-video.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: PostVideoComponent,
      multi: true,
    },
  ],
})
export class PostVideoComponent implements OnInit, ControlValueAccessor {
  preview: string | ArrayBuffer;
  video: File;
  thumbnails = [];
  user$: Observable<User> = this.authService.user$;
  isloading: boolean;
  isUploading: boolean;
  selected = 0;
  private file: File | null = null;
  fileControl = new FormControl('', [Validators.required]);
  onChange: Function;
  fileSizeError: boolean;
  fileTypeError: boolean;

  eventId$: Observable<string> = this.route.paramMap.pipe(
    map((params) => {
      return params.get('eventId');
    })
  );

  constructor(
    private videoService: VideoService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private host: ElementRef<HTMLInputElement>
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

  @HostListener('change', ['$event.target.files']) emitFiles(event: FileList) {
    const file = event && event.item(0);
    this.file = file;

    this.validateFileSize(this.file?.size);
    this.validateFileType(this.file?.type);

    this.convertVideo(this.file);
  }

  writeValue(value: null) {
    this.host.nativeElement.value = '';
    this.file = null;
  }

  registerOnChange(fn: Function) {
    this.onChange = fn;
  }

  registerOnTouched(fn: Function) {}

  validateFileSize(size: number) {
    const fileSizeInMB = Math.round(size / 1024 / 1024);
    if (fileSizeInMB >= 10) {
      this.fileSizeError = true;
    } else {
      return null;
    }
  }

  validateFileType(type: any) {
    if (type != 'video/mp4') {
      this.fileTypeError = true;
    } else {
      return null;
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
      .uploadVideo(eventId, this.file, uid, thumbnail)
      .then(() => (this.isUploading = false));
  }
}
