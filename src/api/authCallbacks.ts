/**
 * 인터셉터 ↔ AuthContext 순환참조 없이 연결하는 콜백 레지스트리.
 * 401 발생 시 인터셉터가 여기 등록된 forceLogout을 호출 → AuthContext가 user를 null로 초기화.
 */
let _forceLogout: (() => void) | null = null;

export function registerForceLogout(cb: () => void) {
  _forceLogout = cb;
}

export function triggerForceLogout() {
  _forceLogout?.();
}
