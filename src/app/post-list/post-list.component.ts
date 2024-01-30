import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Post } from '../models/post.model';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent {
  @Input() posts!: Post[];
  @Output() postSelected = new EventEmitter<Post>();

  onSelect(post: Post) {
    this.postSelected.emit(post);
  }
}
