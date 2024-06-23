import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from 'api/constants';

const generalApi = createApi({
  reducerPath: 'generalApi',
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    getParams: builder.query<string[], string>({
      query: (query) => '/some-link' + query,
    }),
  }),
});

export default generalApi;
