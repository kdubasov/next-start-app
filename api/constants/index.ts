import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from '@reduxjs/toolkit/query';
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Mutex } from 'async-mutex';
import { toast } from 'react-toastify';

const mutex = new Mutex();

const baseQuery = fetchBaseQuery({
  baseUrl: 'TODO: add link',
  prepareHeaders: (headers) => {
    const token = 'TODO: add token';
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  await mutex.waitForUnlock();
  let result = await baseQuery(args, api, extraOptions);
  const refreshToken = 'TODO: add refresh token';

  if (result?.error?.status === 401 && refreshToken) {
    if (!mutex.isLocked()) {
      const release = await mutex.acquire();
      try {
        const refreshResult = await fetch('TODO: add link', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
        const refreshResJSON = await refreshResult.json();
        if (
          refreshResJSON &&
          refreshResJSON.refresh_token &&
          refreshResJSON.access_token
        ) {
          // console.log('%cTOKEN WAS SUCCESS UPDATED!', 'color: green');
          // setLocalAccessToken(refreshResJSON.access_token);
          // setLocalRefreshToken(refreshResJSON.refresh_token);
          result = await baseQuery(args, api, extraOptions);
        } else {
          toast(
            'Ошибка обн. пользователя! Пожалуйста, войдите в систему заново!',
            {
              toastId: 'err_refresh_token',
              type: 'error',
              autoClose: 3000,
            },
          );
          // removeUser();
          location.reload();
        }
      } finally {
        release();
      }
    } else {
      await mutex.waitForUnlock();
      result = await baseQuery(args, api, extraOptions);
    }
  }

  return result;
};
