import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Apollo } from 'apollo-angular';
import gql from 'graphql-tag';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.css'],
})
export class CreateComponent implements OnInit {
  postForm!: FormGroup;

  constructor(private formBuilder: FormBuilder, private apollo: Apollo) {}

  ngOnInit() {
    this.postForm = this.formBuilder.group({
      title: ['', Validators.required],
      content: ['', Validators.required],
      author: ['', Validators.required],
    });
  }

  onSubmit() {
    const { title, content, author } = this.postForm.value;
    this.apollo
      .mutate({
        mutation: gql`
        mutation {
          createPost(title: "${title}", content: "${content}", author: "${author}") {
            id
            title
            content
            author
          }
        }
      `,
      })
      .subscribe(({ data }) => {
        console.log('created post:', data);
      });
  }
}
