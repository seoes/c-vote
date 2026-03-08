import { writable } from "svelte/store";
import type { CurrentUser } from "./types";

// 현재 로그인된 사용자 (클라이언트 사이드 캐시)
export const currentUser = writable<CurrentUser | null>(null);
