// 현재 사용자 정보 (프론트엔드용)
export interface CurrentUser {
    id: string;
    name: string;
    isAdmin: boolean;
    sigchal: string;
    position: string;
    church: string;
}

// 로그인된 사용자 (서버사이드)
export interface LoggedInUser {
    id: string;
    name: string;
    isAdmin: boolean;
}
