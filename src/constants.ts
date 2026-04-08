// src/constants.ts
// 백엔드 Railway 배포 주소로 변경하세요.
export const API_BASE_URL =
  (process.env.EXPO_PUBLIC_API_BASE_URL as string) || 'http://localhost:8000/api/v1';
