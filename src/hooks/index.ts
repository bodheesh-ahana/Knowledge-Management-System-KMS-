import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useArticles(page = 1) {
  return useQuery({
    queryKey: ['articles', page],
    queryFn: async () => {
      const res = await fetch(`/api/knowledge?page=${page}`);
      if (!res.ok) throw new Error('Failed to fetch articles');
      return res.json();
    },
  });
}

export function useArticle(id: string) {
  return useQuery({
    queryKey: ['article', id],
    queryFn: async () => {
      const res = await fetch(`/api/knowledge/${id}`);
      if (!res.ok) throw new Error('Failed to fetch article');
      return res.json();
    },
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch('/api/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create article');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
    },
  });
}

export function useTickets(page = 1) {
  return useQuery({
    queryKey: ['tickets', page],
    queryFn: async () => {
      const res = await fetch(`/api/tickets?page=${page}`);
      if (!res.ok) throw new Error('Failed to fetch tickets');
      return res.json();
    },
  });
}

export function useTicket(id: string) {
  return useQuery({
    queryKey: ['ticket', id],
    queryFn: async () => {
      const res = await fetch(`/api/tickets/${id}`);
      if (!res.ok) throw new Error('Failed to fetch ticket');
      return res.json();
    },
  });
}

export function useSession() {
  return useQuery({
    queryKey: ['session'],
    queryFn: async () => {
      const res = await fetch('/api/auth/session');
      if (!res.ok) throw new Error('Failed to fetch session');
      return res.json();
    },
  });
}
