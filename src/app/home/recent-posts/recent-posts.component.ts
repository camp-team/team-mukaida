import { Component, Input, OnInit } from '@angular/core';
import { Image, ImageWithUser } from 'src/app/interfaces/image';

@Component({
  selector: 'app-recent-posts',
  templateUrl: './recent-posts.component.html',
  styleUrls: ['./recent-posts.component.scss'],
})
export class RecentPostsComponent implements OnInit {
  @Input() image: ImageWithUser;

  constructor() {}

  ngOnInit(): void {}
}
