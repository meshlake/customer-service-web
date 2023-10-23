import request from '@/utils/request';

export function getConversationList(params: DEFAULT_API.PageParams & { userId: string }) {
  return request<DEFAULT_API.Paginate<Conversation_API.Conversation>>(`/conversation`, {
    params,
    headers: {
      authorization: 'Bearer ' + localStorage.getItem('access_token'),
    },
  });
}

export function getConversation(id: string) {
  return request<Conversation_API.Conversation>(`/conversation/${id}`, {
    headers: {
      authorization: 'Bearer ' + localStorage.getItem('access_token'),
    },
  });
}

export function createConversation(data: Conversation_API.ConversationCteate) {
  return request<Conversation_API.Conversation>('/conversation', {
    method: 'POST',
    data,
    headers: {
      authorization: 'Bearer ' + localStorage.getItem('access_token'),
    },
  });
}

export function sendMessage(data: Conversation_API.MessageCreate) {
  return request<DEFAULT_API.Paginate<Conversation_API.Message>>(`/message`, {
    method: 'POST',
    data,
    headers: {
      authorization: 'Bearer ' + localStorage.getItem('access_token'),
    },
  });
}

export function deleteConversation(id: string) {
  return request(`/conversation/${id}`, {
    method: 'DELETE',
    headers: {
      authorization: 'Bearer ' + localStorage.getItem('access_token'),
    },
  });
}
