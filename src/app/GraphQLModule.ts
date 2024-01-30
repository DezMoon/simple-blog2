import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { InMemoryCache } from '@apollo/client/core';
import { HttpLink } from '@apollo/client/link/http';

@NgModule({
  imports: [ApolloModule, HttpClientModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: (httpLink: HttpLink) => ({
        link: new HttpLink({ uri: '/graphql' }),
        cache: new InMemoryCache(),
      }),
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule {}
