// ============================================
// 시찰 및 직분 상수
// ============================================
export const SIGCHALS = ["구미동시찰", "구미서시찰", "김천시찰", "상주시찰", "문경시찰"] as const;
export type Sigchal = (typeof SIGCHALS)[number];

export const POSITIONS = ["목사", "장로"] as const;
export type Position = (typeof POSITIONS)[number];

// ============================================
// 투표 종류
// ============================================
export const VOTE_TYPES = ["pastor", "elder", "general"] as const;
export type VoteType = (typeof VOTE_TYPES)[number];

export const VOTE_TYPE_LABELS: Record<VoteType, string> = {
    pastor: "목사선출",
    elder: "장로선출",
    general: "일반의제",
};

// ============================================
// 회원 상태
// ============================================
export type MemberStatus = "pending" | "approved" | "rejected";

// ============================================
// API 응답 타입
// ============================================
export interface Member {
    id: string;
    name: string;
    phone: string;
    church: string;
    sigchal: Sigchal;
    position: Position | null; // 관리자는 null
    status: MemberStatus;
    isAdmin: boolean;
    createdAt: Date;
}

export interface Vote {
    id: string;
    title: string;
    description: string | null;
    voteType: VoteType;
    maxSelections: number;
    pin: string;
    endTime: Date;
    status: "active" | "ended";
    createdAt: Date;
    candidates?: Candidate[];
    participantCount?: number;
    userVoted?: boolean;
}

export interface Candidate {
    id: string;
    name: string;
    church: string | null;
}

export interface VoteResult {
    candidateId: string;
    candidateName: string;
    church: string | null;
    count: number;
}

export interface VoteResultsResponse {
    vote: {
        id: string;
        title: string;
        description: string | null;
        voteType: VoteType;
        status: string;
        endTime: Date;
    };
    participantCount: number;
    totalVoters: number;
    participationRate: number;
    results: VoteResult[];
}

// ============================================
// 현재 사용자 정보
// ============================================
export interface CurrentUser {
    id: string;
    name: string;
    isAdmin: boolean;
    sigchal: Sigchal;
    position: Position | null; // 관리자는 null
    church: string;
    status?: MemberStatus;
}
