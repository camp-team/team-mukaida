import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, forkJoin, merge, Observable, of, zip } from 'rxjs';
import { map, mergeAll, mergeMap, mergeMapTo, switchMap } from 'rxjs/operators';
import { Event } from 'src/app/interfaces/event';
import { Image } from 'src/app/interfaces/image';
import { Post } from 'src/app/interfaces/post';
import { Video } from 'src/app/interfaces/video';
import { EventService } from 'src/app/services/event.service';
import { ImageService } from 'src/app/services/image.service';
import { VideoService } from 'src/app/services/video.service';

@Component({
  selector: 'app-image-list',
  templateUrl: './image-list.component.html',
  styleUrls: ['./image-list.component.scss'],
})
export class ImageListComponent implements OnInit {
  eventId: string;
  imageList: Image[];
  eventUrl: string = location.href.replace('event/', '');
  posts$ = of([]);

  event$: Observable<Event>;

  eventId$: Observable<string> = this.route.paramMap.pipe(
    map((param) => {
      return param.get('eventId');
    })
  );

  imageList$: Observable<Post[]> = this.eventId$.pipe(
    switchMap((id) => {
      return this.imageService.getImages(id);
    })
  );

  videoList$: Observable<Post[]> = this.eventId$.pipe(
    switchMap((id) => {
      return this.videoService.getVideos(id);
    })
  );

  postList$: Observable<Post[]> = combineLatest([
    this.imageList$,
    this.videoList$,
  ]).pipe(
    map(([images, videos]) => {
      return images.concat(videos);
    })
  );

  constructor(
    private route: ActivatedRoute,
    private imageService: ImageService,
    private eventService: EventService,
    private videoService: VideoService
  ) {}

  ngOnInit(): void {
    this.eventId$.subscribe((id) => {
      this.eventId = id;
      this.event$ = this.eventService.getEvent(this.eventId);
    });
    this.videoList$.subscribe((data) => {
      console.log(data);
    });
    this.imageList$.subscribe((data) => {
      console.log(data);
    });
    this.postList$.subscribe((data) => {
      console.log(data);
    });
  }

  deleteImage(imageId: string) {
    this.imageService.deleteImage(imageId, this.eventId);
  }

  deleteVideo(videoId: string) {
    this.videoService.deleteVideo(this.eventId, videoId);
  }
}
