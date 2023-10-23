import request from '@/utils/request';

export function generateInviteMail(data: Mail_API.InviteMail) {
  return request<DEFAULT_API.Response<{data: string}>>('/mail/invite', {
    method: 'POST',
    data,
    headers: {
      authorization: 'Bearer ' + localStorage.getItem('access_token'),
    },
  });
}
