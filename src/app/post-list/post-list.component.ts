// post-list.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '../models/post.model';

@Component({
  selector: 'app-post-list',

  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent {
  @Input() post?: Post[];
  @Output() postSelected: EventEmitter<Post> = new EventEmitter<Post>();

  selectPost(post: Post) {
    this.postSelected.emit(post);
  }
}
