import { Component, Input, OnInit } from '@angular/core';
import { ImageWithUser } from 'src/app/interfaces/image';
import { PostWithUser } from 'src/app/interfaces/post';

@Component({
  selector: 'app-recent-posts',
  templateUrl: './recent-posts.component.html',
  styleUrls: ['./recent-posts.component.scss'],
})
export class RecentPostsComponent implements OnInit {
  @Input() post: PostWithUser;

  constructor() {
    console.log(this.post);
  }

  ngOnInit(): void {}
}
