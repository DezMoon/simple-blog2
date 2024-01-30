import { Component } from '@angular/core';
import { Post } from './models/post.model';
//import { PostDetailComponent } from './post-detail/post-detail.component';
import { PostListComponent } from './post-list/post-list.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  posts: Post[] = [
    {
      id: 1,
      title: 'Post 1',
      content: 'This is the first post.',
      author: 'John Doe',
      date: new Date('2022-01-01'),
    },
    {
      id: 2,
      title: 'Post 2',
      content: 'This is the second post.',
      author: 'Jane Smith',
      date: new Date('2022-01-02'),
    },
    {
      id: 3,
      title: 'Post 3',
      content: 'This is the third post.',
      author: 'Bob Johnson',
      date: new Date('2022-01-03'),
    },
  ];

  selectedPost!: Post;

  onPostSelected(post: Post) {
    this.selectedPost = post;
  }
}
