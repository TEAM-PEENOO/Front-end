// src/api/client.ts
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../constants';
import { triggerForceLogout } from './authCallbacks';

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

// 백엔드 미들웨어가 성공 응답을 {"data": ...} 형태로 래핑함 → 자동 언래핑
apiClient.interceptors.response.use(
  (response) => {
    if (
      response.data &&
      typeof response.data === 'object' &&
      !Array.isArray(response.data) &&
      'data' in response.data
    ) {
      response.data = response.data.data;
    }
    return response;
  },
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('access_token');
      triggerForceLogout(); // AuthContext에 등록된 logout 호출 → 로그인 화면으로 이동
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
        if (parsed.text) onDelta(parsed.text);
      } catch {
        // 파싱 실패는 무시
      }
    }
  }
}
