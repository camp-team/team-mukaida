import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Image } from 'src/app/interfaces/image';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-recent-posts',
  templateUrl: './recent-posts.component.html',
  styleUrls: ['./recent-posts.component.scss'],
})
export class RecentPostsComponent implements OnInit {
  @Input() image: Image;

  constructor() {}

  ngOnInit(): void {}
}
