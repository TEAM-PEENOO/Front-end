/**
 * 한국어 조사 자동 선택 유틸리티
 * 이름 마지막 글자의 받침 유무에 따라 올바른 조사를 반환
 */
export function josa(name: string, withBatchim: string, withoutBatchim: string): string {
  if (!name) return withoutBatchim;
  const last = name[name.length - 1];
  const code = last.charCodeAt(0);
  if (code < 0xAC00 || code > 0xD7A3) return withoutBatchim; // 한글 아닌 경우
  const hasBatchim = (code - 0xAC00) % 28 !== 0;
  return hasBatchim ? withBatchim : withoutBatchim;
}

/** 이름 + 이/가 → "우균이가", "나리가" */
export function nameIga(name: string): string {
  const particle = josa(name, '이가', '가');
  const prefix = josa(name, '이', '');
  return `${name}${prefix}${particle === '이가' ? '가' : '가'}`;
}
// 실제로는 이렇게 쓰세요:
// `${name}${josa(name, '이', '')}가` → 받침 있으면 "우균이가", 없으면 "나리가"

/** ${name}은/는 */
export function nameEunNeun(name: string): string {
  return `${name}${josa(name, '은', '는')}`;
}

/** ${name}이/가 (주격) */
export function nameIGa(name: string): string {
  return `${name}${josa(name, '이', '')}가`;
}

/** ${name}을/를 (목적격) */
export function nameEulReul(name: string): string {
  return `${name}${josa(name, '을', '를')}`;
}
