import { Component, OnInit, Input } from '@angular/core';
import { ImageService } from 'src/app/services/image.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/interfaces/user';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-comment-header',
  templateUrl: './comment-header.component.html',
  styleUrls: ['./comment-header.component.scss'],
})
export class CommentHeaderComponent implements OnInit {
  @Input() provider: User;

  constructor(public authService: AuthService) {}

  ngOnInit(): void {}

  back() {
    history.back();
  }
}
