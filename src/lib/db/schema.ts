import { sqliteTable, text, integer, index, uniqueIndex } from "drizzle-orm/sqlite-core";

// ============================================
// 시찰 및 직분 상수
// ============================================
export const SIGCHALS = ["구미동시찰", "구미서시찰", "김천시찰", "상주시찰", "문경시찰"] as const;
export type Sigchal = (typeof SIGCHALS)[number];

export const POSITIONS = ["목사", "장로"] as const;
export type Position = (typeof POSITIONS)[number];

export type MemberStatus = "pending" | "approved" | "rejected";
export type VoteStatus = "active" | "ended";

// ============================================
// Members 테이블
// ============================================
export const members = sqliteTable(
    "members",
    {
        id: text("id").primaryKey(),
        name: text("name").notNull(),
        phone: text("phone").notNull(),
        passwordHash: text("password_hash").notNull(),
        church: text("church").notNull(),
        sigchal: text("sigchal", { enum: SIGCHALS }).notNull(),
        position: text("position", { enum: POSITIONS }), // 관리자는 null, 일반 회원은 목사/장로
        securityAnswer: text("security_answer"), // 비밀번호 찾기용 보안 질문 답변
        status: text("status", { enum: ["pending", "approved", "rejected"] })
            .notNull()
            .default("pending"),
        isAdmin: integer("is_admin", { mode: "boolean" }).notNull().default(false),
        createdAt: integer("created_at", { mode: "timestamp" })
            .notNull()
            .$defaultFn(() => new Date()),
    },
    (table) => ({
        phoneIdx: uniqueIndex("members_phone_idx").on(table.phone),
        statusIdx: index("members_status_idx").on(table.status),
    }),
);

// ============================================
// Votes 테이블
// ============================================
export const votes = sqliteTable(
    "votes",
    {
        id: text("id").primaryKey(),
        title: text("title").notNull(),
        description: text("description"),
        voteType: text("vote_type", { enum: ["pastor", "elder", "general"] }).notNull(),
        maxSelections: integer("max_selections").notNull().default(1),
        pin: text("pin").notNull(), // 4자리 PIN
        endTime: integer("end_time", { mode: "timestamp" }).notNull(),
        status: text("status", { enum: ["active", "ended"] })
            .notNull()
            .default("active"),
        createdAt: integer("created_at", { mode: "timestamp" })
            .notNull()
            .$defaultFn(() => new Date()),
    },
    (table) => ({
        statusIdx: index("votes_status_idx").on(table.status),
        voteTypeIdx: index("votes_type_idx").on(table.voteType),
    }),
);

// ============================================
// Candidates 테이블 (일반의제용)
// 목사/장로 선출은 회원 테이블에서 자동 조회
// ============================================
export const candidates = sqliteTable(
    "candidates",
    {
        id: text("id").primaryKey(),
        voteId: text("vote_id")
            .notNull()
            .references(() => votes.id, { onDelete: "cascade" }),
        memberId: text("member_id"), // 일반의제는 null, 목사/장로 선출 시 회원 ID
        name: text("name").notNull(),
        church: text("church"),
        order: integer("order").notNull().default(0), // 표시 순서
    },
    (table) => ({
        voteIdx: index("candidates_vote_idx").on(table.voteId),
    }),
);

// ============================================
// Vote Records 테이블 (투표 참여 기록)
// ============================================
export const voteRecords = sqliteTable(
    "vote_records",
    {
        id: text("id").primaryKey(),
        voteId: text("vote_id")
            .notNull()
            .references(() => votes.id, { onDelete: "cascade" }),
        memberId: text("member_id")
            .notNull()
            .references(() => members.id, { onDelete: "cascade" }),
        votedAt: integer("voted_at", { mode: "timestamp" })
            .notNull()
            .$defaultFn(() => new Date()),
    },
    (table) => ({
        voteIdx: index("vote_records_vote_idx").on(table.voteId),
        memberIdx: index("vote_records_member_idx").on(table.memberId),
        voteMemberIdx: uniqueIndex("vote_records_vote_member_idx").on(table.voteId, table.memberId),
    }),
);

// ============================================
// Vote Selections 테이블 (투표 내역 - 감사용)
// ============================================
export const voteSelections = sqliteTable(
    "vote_selections",
    {
        id: text("id").primaryKey(),
        recordId: text("record_id")
            .notNull()
            .references(() => voteRecords.id, { onDelete: "cascade" }),
        candidateId: text("candidate_id").notNull(), // 후보 ID 또는 회원 ID
    },
    (table) => ({
        recordIdx: index("vote_selections_record_idx").on(table.recordId),
        candidateIdx: index("vote_selections_candidate_idx").on(table.candidateId),
    }),
);

// ============================================
// Refresh Tokens 테이블 (토큰 갱신용)
// ============================================
export const refreshTokens = sqliteTable(
    "refresh_tokens",
    {
        id: text("id").primaryKey(),
        memberId: text("member_id")
            .notNull()
            .references(() => members.id, { onDelete: "cascade" }),
        token: text("token").notNull(),
        expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
        createdAt: integer("created_at", { mode: "timestamp" })
            .notNull()
            .$defaultFn(() => new Date()),
    },
    (table) => ({
        tokenIdx: uniqueIndex("refresh_tokens_token_idx").on(table.token),
        memberIdx: index("refresh_tokens_member_idx").on(table.memberId),
    }),
);

// ============================================
// TypeScript 타입
// ============================================
export type Member = typeof members.$inferSelect;
export type NewMember = typeof members.$inferInsert;
export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
export type Candidate = typeof candidates.$inferSelect;
export type NewCandidate = typeof candidates.$inferInsert;
export type VoteRecord = typeof voteRecords.$inferSelect;
export type VoteSelection = typeof voteSelections.$inferSelect;
export type RefreshToken = typeof refreshTokens.$inferSelect;
