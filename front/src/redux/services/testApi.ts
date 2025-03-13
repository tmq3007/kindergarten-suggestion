import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const testApi = createApi({
  reducerPath: 'testApi',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://randomuser.me/api' }),
  endpoints: (builder) => ({
    searchUsers: builder.query<any, string>({
        query: () => `?results=5`,
    }),
  }),
});

export const { useLazySearchUsersQuery } = testApi;