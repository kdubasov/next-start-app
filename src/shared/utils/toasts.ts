import { toast } from 'react-toastify';

export const TOAST_SUCCESS = (text: string, id?: string) =>
  toast(text, {
    autoClose: 3000,
    type: 'success',
    toastId: id,
  });

export const TOAST_ERROR = (text: string, id?: string) =>
  toast(text, {
    autoClose: 3000,
    type: 'error',
    toastId: id,
  });

export const TOAST_WARNING = (text: string, id?: string) =>
  toast(text, {
    autoClose: 3000,
    type: 'warning',
    toastId: id,
  });

export const TOAST_INFO = (text: string) =>
  toast(text, {
    autoClose: 3000,
    type: 'info',
  });
