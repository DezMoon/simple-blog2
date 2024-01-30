import { Component, Input } from '@angular/core';
import { Post } from '../models/post.model';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-post-list',
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css'],
})
export class PostListComponent {
  @Input() posts!: Post[];

  constructor(private apollo: Apollo) {}

  // Example: You can add more Apollo logic for fetching posts
  fetchPosts() {
    this.apollo
      .watchQuery<any>({
        query: gql`
          query {
            posts {
              id
              title
              content
              author
            }
          }
        `,
      })
      .valueChanges.subscribe(({ data }) => {
        this.posts = data.posts;
      });
  }
}
