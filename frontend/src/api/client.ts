import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 300000, // 5 minutos
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Sequel {
  base_id: number;
  base_title: string;
  base_status: string;
  base_score?: number;
  missing_id: number;
  missing_title: string;
  missing_cover?: string;
  missing_score?: number;
  missing_episodes?: number;
  missing_year?: number;
  missing_status?: string;
  missing_next_airing?: {
    episode: number;
    airingAt: number;
  };
  format: string;
  depth: number;
}

export interface UserProfile {
  id: number;
  name: string;
  avatar: {
    large: string;
  };
  bannerImage?: string;
  statistics: {
    anime: {
      count: number;
      minutesWatched: number;
      episodesWatched: number;
    };
  };
}

export interface FindSequelsResponse {
  user: UserProfile;
  missing_sequels: Sequel[];
  count: number;
}

export const findSequels = async (username: string, forceRefresh: boolean = false): Promise<FindSequelsResponse> => {
  const response = await apiClient.get<FindSequelsResponse>('/sequels/find', {
    params: { 
      username,
      force_refresh: forceRefresh 
    },
  });
  return response.data;
};

export const addToList = async (mediaId: number, status: string = 'PLANNING') => {
  const response = await apiClient.post('/sequels/add', {
    media_id: mediaId,
    status
  });
  return response.data;
};

export const verifyToken = async (accessToken: string) => {
  const response = await apiClient.post('/auth/verify-token', {
    access_token: accessToken
  });
  return response.data;
};
