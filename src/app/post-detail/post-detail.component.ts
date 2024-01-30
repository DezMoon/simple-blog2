import { Component, Input } from '@angular/core';
import { Post } from '../models/post.model';

@Component({
  selector: 'app-post-detail',

  templateUrl: './post-detail.component.html',
  styleUrls: ['./post-detail.component.css'],
})
export class PostDetailComponent {
  @Input() post!: Post;
}
