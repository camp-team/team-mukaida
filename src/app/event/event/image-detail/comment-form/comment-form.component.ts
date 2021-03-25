import { Component, OnInit, Input } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { CommentService } from 'src/app/services/comment.service';
import { Image } from 'src/app/interfaces/image';
import { Comment } from 'src/app/interfaces/comment';
import { Video } from 'src/app/interfaces/video';

@Component({
  selector: 'app-comment-form',
  templateUrl: './comment-form.component.html',
  styleUrls: ['./comment-form.component.scss'],
})
export class CommentFormComponent implements OnInit {
  @Input() image: Image;
  @Input() video: Video;
  commentForm = new FormControl('', [Validators.maxLength(400)]);

  constructor(private commentService: CommentService) {}

  createComment(image?: Image, video?: Video) {
    if (this.commentForm.value) {
      const comment: Omit<
        Comment,
        'uid' | 'createdAt' | 'imageId' | 'imageURL' | 'commentId' | 'eventId'
      > = {
        commentBody: this.commentForm.value,
      };
      this.commentService.createComment(image || video, comment);
      this.commentForm.reset();
    }
  }

  ngOnInit(): void {}
}
