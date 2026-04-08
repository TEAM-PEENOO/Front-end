// src/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// 요청마다 저장된 JWT 토큰 자동 주입
apiClient.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 401 응답 시 토큰 제거 (앱에서 로그아웃 처리는 AuthContext에서)
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('access_token');
    }
    return Promise.reject(error);
  }
);

/** SSE 스트리밍용 fetch 래퍼 (chat 엔드포인트에서 사용) */
export async function streamFetch(
  path: string,
  body: object,
  onDelta: (delta: string) => void
): Promise<void> {
  const token = await AsyncStorage.getItem('access_token');
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error(`SSE error: ${response.status}`);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error('스트림을 읽을 수 없습니다.');

  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      if (!line.startsWith('data: ')) continue;
      const raw = line.slice(6).trim();
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        if (parsed.done) return;
        if (parsed.delta) onDelta(parsed.delta);
      } catch {
        // 파싱 실패는 무시
      }
    }
  }
}
