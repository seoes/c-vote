-- 로컬 개발용 시드 데이터
-- 실행: wrangler d1 execute church-vote-db --local --file=./seed.sql

-- 관리자 계정 (전화번호: 010-0000-0000, 비밀번호: admin1234)
-- 관리자는 position이 NULL (투표에서 완전히 배제)
INSERT INTO members (id, name, phone, password_hash, church, region, sigchal, position, status, is_admin, can_vote, created_at)
VALUES (
    'admin_001',
    '관리자',
    '010-0000-0000',
    '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244',
    '관리자교회',
    '경북서부노회',
    '구미동시찰',
    NULL,
    'approved',
    1,
    1,
    strftime('%s', 'now')
);

-- ============================================
-- 승인된 목사 (12명)
-- 비밀번호: test1234
-- ============================================
INSERT INTO members (id, name, phone, password_hash, church, region, sigchal, position, status, is_admin, can_vote, created_at) VALUES
    -- 구미동시찰
    ('pastor_001', '김목사', '010-1001-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미제일교회', '경북서부노회', '구미동시찰', '목사', 'approved', 0, 1, strftime('%s', 'now')),
    ('pastor_002', '박목사', '010-1001-0002', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미중앙교회', '경북서부노회', '구미동시찰', '목사', 'approved', 0, 1, strftime('%s', 'now')),
    ('pastor_003', '최목사', '010-1001-0003', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미성광교회', '경북서부노회', '구미동시찰', '목사', 'approved', 0, 1, strftime('%s', 'now')),
    -- 구미서시찰
    ('pastor_004', '이목사', '010-1002-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미서부교회', '경북서부노회', '구미서시찰', '목사', 'approved', 0, 1, strftime('%s', 'now')),
    ('pastor_005', '정목사', '010-1002-0002', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미은혜교회', '경북서부노회', '구미서시찰', '목사', 'approved', 0, 1, strftime('%s', 'now')),
    -- 김천시찰
    ('pastor_006', '강목사', '010-1003-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '김천제일교회', '경북서부노회', '김천시찰', '목사', 'approved', 0, 1, strftime('%s', 'now')),
    ('pastor_007', '윤목사', '010-1003-0002', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '김천중앙교회', '경북서부노회', '김천시찰', '목사', 'approved', 0, 1, strftime('%s', 'now')),
    ('pastor_008', '임목사', '010-1003-0003', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '김천교회', '경북서부노회', '김천시찰', '목사', 'approved', 0, 1, strftime('%s', 'now')),
    -- 상주시찰
    ('pastor_009', '한목사', '010-1004-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '상주제일교회', '경북서부노회', '상주시찰', '목사', 'approved', 0, 1, strftime('%s', 'now')),
    ('pastor_010', '오목사', '010-1004-0002', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '상주중앙교회', '경북서부노회', '상주시찰', '목사', 'approved', 0, 1, strftime('%s', 'now')),
    -- 문경시찰
    ('pastor_011', '서목사', '010-1005-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '문경교회', '경북서부노회', '문경시찰', '목사', 'approved', 0, 1, strftime('%s', 'now')),
    ('pastor_012', '신목사', '010-1005-0002', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '문경제일교회', '경북서부노회', '문경시찰', '목사', 'approved', 0, 1, strftime('%s', 'now'));

-- ============================================
-- 승인된 장로 (12명)
-- 비밀번호: test1234
-- ============================================
INSERT INTO members (id, name, phone, password_hash, church, region, sigchal, position, status, is_admin, can_vote, created_at) VALUES
    -- 구미동시찰
    ('elder_001', '김장로', '010-2001-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미제일교회', '경북서부노회', '구미동시찰', '장로', 'approved', 0, 1, strftime('%s', 'now')),
    ('elder_002', '박장로', '010-2001-0002', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미제일교회', '경북서부노회', '구미동시찰', '장로', 'approved', 0, 1, strftime('%s', 'now')),
    ('elder_003', '최장로', '010-2001-0003', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미중앙교회', '경북서부노회', '구미동시찰', '장로', 'approved', 0, 1, strftime('%s', 'now')),
    -- 구미서시찰
    ('elder_004', '이장로', '010-2002-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미서부교회', '경북서부노회', '구미서시찰', '장로', 'approved', 0, 1, strftime('%s', 'now')),
    ('elder_005', '정장로', '010-2002-0002', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미은혜교회', '경북서부노회', '구미서시찰', '장로', 'approved', 0, 1, strftime('%s', 'now')),
    -- 김천시찰
    ('elder_006', '강장로', '010-2003-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '김천제일교회', '경북서부노회', '김천시찰', '장로', 'approved', 0, 1, strftime('%s', 'now')),
    ('elder_007', '윤장로', '010-2003-0002', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '김천중앙교회', '경북서부노회', '김천시찰', '장로', 'approved', 0, 1, strftime('%s', 'now')),
    ('elder_008', '임장로', '010-2003-0003', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '김천교회', '경북서부노회', '김천시찰', '장로', 'approved', 0, 1, strftime('%s', 'now')),
    -- 상주시찰
    ('elder_009', '한장로', '010-2004-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '상주제일교회', '경북서부노회', '상주시찰', '장로', 'approved', 0, 1, strftime('%s', 'now')),
    ('elder_010', '오장로', '010-2004-0002', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '상주중앙교회', '경북서부노회', '상주시찰', '장로', 'approved', 0, 1, strftime('%s', 'now')),
    -- 문경시찰
    ('elder_011', '서장로', '010-2005-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '문경교회', '경북서부노회', '문경시찰', '장로', 'approved', 0, 1, strftime('%s', 'now')),
    ('elder_012', '신장로', '010-2005-0002', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '문경제일교회', '경북서부노회', '문경시찰', '장로', 'approved', 0, 1, strftime('%s', 'now'));

-- ============================================
-- 승인된 회원 중 투표 권한 없는 경우 (2명)
-- ============================================
INSERT INTO members (id, name, phone, password_hash, church, region, sigchal, position, status, is_admin, can_vote, created_at) VALUES
    ('pastor_nv_001', '권목사', '010-1101-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미제일교회', '경북서부노회', '구미동시찰', '목사', 'approved', 0, 0, strftime('%s', 'now')),
    ('elder_nv_001', '권장로', '010-2101-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미서부교회', '경북서부노회', '구미서시찰', '장로', 'approved', 0, 0, strftime('%s', 'now'));

-- ============================================
-- 승인 대기 중인 회원 (3명) - 정식 가입 신청
-- ============================================
INSERT INTO members (id, name, phone, password_hash, church, region, sigchal, position, security_answer, status, is_admin, can_vote, created_at) VALUES
    ('pending_001', '홍목사', '010-3001-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미새교회', '경북서부노회', '구미동시찰', '목사', '다윗', 'pending', 0, 1, strftime('%s', 'now')),
    ('pending_002', '백장로', '010-3001-0002', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '김천새교회', '경북서부노회', '김천시찰', '장로', '모세', 'pending', 0, 1, strftime('%s', 'now')),
    ('pending_003', '남목사', '010-3001-0003', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '상주새교회', '경북서부노회', '상주시찰', '목사', '베드로', 'pending', 0, 1, strftime('%s', 'now'));

-- ============================================
-- 후보자 계정 (password_hash = NULL, 5명)
-- 관리자가 미리 등록, 아직 회원가입 안 함
-- ============================================
INSERT INTO members (id, name, phone, password_hash, church, region, sigchal, position, status, is_admin, can_vote, created_at) VALUES
    ('candidate_001', '후보목사1', '010-4001-0001', NULL, '구미동산교회', '경북서부노회', '구미동시찰', '목사', 'pending', 0, 0, strftime('%s', 'now')),
    ('candidate_002', '후보목사2', '010-4001-0002', NULL, '김천동산교회', '경북서부노회', '김천시찰', '목사', 'pending', 0, 0, strftime('%s', 'now')),
    ('candidate_003', '후보장로1', '010-4002-0001', NULL, '구미동산교회', '경북서부노회', '구미동시찰', '장로', 'pending', 0, 0, strftime('%s', 'now')),
    ('candidate_004', '후보장로2', '010-4002-0002', NULL, '상주동산교회', '경북서부노회', '상주시찰', '장로', 'pending', 0, 0, strftime('%s', 'now')),
    ('candidate_005', '후보장로3', '010-4002-0003', NULL, '문경동산교회', '경북서부노회', '문경시찰', '장로', 'pending', 0, 0, strftime('%s', 'now'));

-- ============================================
-- 가입 거절된 회원 (2명)
-- ============================================
INSERT INTO members (id, name, phone, password_hash, church, region, sigchal, position, status, is_admin, can_vote, created_at) VALUES
    ('rejected_001', '거절목사', '010-5001-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '거절교회', '경북서부노회', '구미동시찰', '목사', 'rejected', 0, 0, strftime('%s', 'now')),
    ('rejected_002', '거절장로', '010-5001-0002', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '거절교회', '경북서부노회', '구미서시찰', '장로', 'rejected', 0, 0, strftime('%s', 'now'));

-- ============================================
-- 동명이인 테스트 케이스 (같은 이름, 다른 전화번호)
-- ============================================
INSERT INTO members (id, name, phone, password_hash, church, region, sigchal, position, status, is_admin, can_vote, created_at) VALUES
    ('same_name_001', '김목사', '010-6001-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '다른교회1', '경북서부노회', '김천시찰', '목사', 'approved', 0, 1, strftime('%s', 'now')),
    ('same_name_002', '김장로', '010-6002-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '다른교회2', '경북서부노회', '김천시찰', '장로', 'approved', 0, 1, strftime('%s', 'now'));

-- ============================================
-- 투표 데이터
-- ============================================

-- 1. 활성화된 목사 선출 투표 (PIN: 1234)
INSERT INTO votes (id, title, description, vote_type, max_selections, result_display_count, pin, end_time, status, created_at)
VALUES (
    'vote_001',
    '2026년 노회 목사 선출',
    '2026년 노회 목사 선출 투표입니다. 최대 5명까지 선택 가능합니다.',
    'pastor',
    5,
    10,
    '1234',
    strftime('%s', 'now', '+7 days'),
    'active',
    strftime('%s', 'now')
);

-- 2. 활성화된 장로 선출 투표 (PIN: 5678)
INSERT INTO votes (id, title, description, vote_type, max_selections, result_display_count, pin, end_time, status, created_at)
VALUES (
    'vote_002',
    '2026년 노회 장로 선출',
    '2026년 노회 장로 선출 투표입니다. 최대 7명까지 선택 가능합니다.',
    'elder',
    7,
    10,
    '5678',
    strftime('%s', 'now', '+14 days'),
    'active',
    strftime('%s', 'now')
);

-- 3. 활성화된 일반의제 투표 - 찬반 (PIN: 1111)
INSERT INTO votes (id, title, description, vote_type, max_selections, result_display_count, pin, end_time, status, created_at)
VALUES (
    'vote_003',
    '노회관 증축 찬반 투표',
    '노회관 증축에 대한 찬반 투표입니다.',
    'general',
    1,
    2,
    '1111',
    strftime('%s', 'now', '+3 days'),
    'active',
    strftime('%s', 'now')
);
-- 일반의제 후보 (찬성/반대)
INSERT INTO candidates (id, vote_id, name, church, `order`) VALUES
    ('cand_001', 'vote_003', '찬성', NULL, 0),
    ('cand_002', 'vote_003', '반대', NULL, 1);

-- 4. 활성화된 일반의제 투표 - 다중선택 (PIN: 2222)
INSERT INTO votes (id, title, description, vote_type, max_selections, result_display_count, pin, end_time, status, created_at)
VALUES (
    'vote_004',
    '2026년 노회 사업 우선순위',
    '2026년 노회 사업 중 우선적으로 추진할 항목을 선택하세요. 최대 3개까지 선택 가능합니다.',
    'general',
    3,
    5,
    '2222',
    strftime('%s', 'now', '+5 days'),
    'active',
    strftime('%s', 'now')
);
-- 일반의제 후보 (사업 항목)
INSERT INTO candidates (id, vote_id, name, church, `order`) VALUES
    ('cand_003', 'vote_004', '청년부 활성화', NULL, 0),
    ('cand_004', 'vote_004', '선교지원 확대', NULL, 1),
    ('cand_005', 'vote_004', '교육관 건축', NULL, 2),
    ('cand_006', 'vote_004', '노회관 리모델링', NULL, 3),
    ('cand_007', 'vote_004', '해외선교사 파송', NULL, 4);

-- 5. 종료된 목사 선출 투표 (PIN: 3333)
INSERT INTO votes (id, title, description, vote_type, max_selections, result_display_count, pin, end_time, status, created_at)
VALUES (
    'vote_005',
    '2025년 노회 목사 선출',
    '2025년 노회 목사 선출 투표였습니다.',
    'pastor',
    3,
    5,
    '3333',
    strftime('%s', 'now', '-7 days'),
    'ended',
    strftime('%s', 'now', '-14 days')
);

-- 6. 종료된 일반의제 투표 (PIN: 4444)
INSERT INTO votes (id, title, description, vote_type, max_selections, result_display_count, pin, end_time, status, created_at)
VALUES (
    'vote_006',
    '2025년 하반기 사업계획 승인',
    '2025년 하반기 사업계획 승인 투표였습니다.',
    'general',
    1,
    2,
    '4444',
    strftime('%s', 'now', '-3 days'),
    'ended',
    strftime('%s', 'now', '-10 days')
);
INSERT INTO candidates (id, vote_id, name, church, `order`) VALUES
    ('cand_008', 'vote_006', '승인', NULL, 0),
    ('cand_009', 'vote_006', '반대', NULL, 1);

-- 7. 곧 종료되는 투표 (1시간 후) (PIN: 9999)
INSERT INTO votes (id, title, description, vote_type, max_selections, result_display_count, pin, end_time, status, created_at)
VALUES (
    'vote_007',
    '긴급 안건 투표',
    '긴급하게 처리해야 할 안건입니다.',
    'general',
    1,
    2,
    '9999',
    strftime('%s', 'now', '+1 hours'),
    'active',
    strftime('%s', 'now')
);
INSERT INTO candidates (id, vote_id, name, church, `order`) VALUES
    ('cand_010', 'vote_007', '찬성', NULL, 0),
    ('cand_011', 'vote_007', '반대', NULL, 1);

-- ============================================
-- 투표 참여 기록 (vote_005 - 종료된 목사선출에 일부 참여)
-- ============================================
INSERT INTO vote_records (id, vote_id, member_id, voted_at) VALUES
    ('vr_001', 'vote_005', 'pastor_001', strftime('%s', 'now', '-8 days')),
    ('vr_002', 'vote_005', 'pastor_002', strftime('%s', 'now', '-8 days')),
    ('vr_003', 'vote_005', 'elder_001', strftime('%s', 'now', '-8 days')),
    ('vr_004', 'vote_005', 'elder_002', strftime('%s', 'now', '-8 days')),
    ('vr_005', 'vote_005', 'pastor_003', strftime('%s', 'now', '-7 days'));

-- 투표 선택 내역
INSERT INTO vote_selections (id, record_id, candidate_id) VALUES
    -- pastor_001의 투표
    ('vs_001', 'vr_001', 'pastor_001'),
    ('vs_002', 'vr_001', 'pastor_004'),
    ('vs_003', 'vr_001', 'pastor_006'),
    -- pastor_002의 투표
    ('vs_004', 'vr_002', 'pastor_001'),
    ('vs_005', 'vr_002', 'pastor_005'),
    ('vs_006', 'vr_002', 'pastor_007'),
    -- elder_001의 투표
    ('vs_007', 'vr_003', 'pastor_002'),
    ('vs_008', 'vr_003', 'pastor_006'),
    ('vs_009', 'vr_003', 'pastor_008'),
    -- elder_002의 투표
    ('vs_010', 'vr_004', 'pastor_001'),
    ('vs_011', 'vr_004', 'pastor_003'),
    ('vs_012', 'vr_004', 'pastor_009'),
    -- pastor_003의 투표
    ('vs_013', 'vr_005', 'pastor_002'),
    ('vs_014', 'vr_005', 'pastor_006'),
    ('vs_015', 'vr_005', 'pastor_010');

-- ============================================
-- 종료된 일반의제 투표 참여 기록 (vote_006)
-- ============================================
INSERT INTO vote_records (id, vote_id, member_id, voted_at) VALUES
    ('vr_006', 'vote_006', 'pastor_001', strftime('%s', 'now', '-5 days')),
    ('vr_007', 'vote_006', 'elder_001', strftime('%s', 'now', '-5 days')),
    ('vr_008', 'vote_006', 'pastor_002', strftime('%s', 'now', '-4 days')),
    ('vr_009', 'vote_006', 'elder_002', strftime('%s', 'now', '-4 days')),
    ('vr_010', 'vote_006', 'pastor_003', strftime('%s', 'now', '-4 days')),
    ('vr_011', 'vote_006', 'elder_003', strftime('%s', 'now', '-3 days'));

INSERT INTO vote_selections (id, record_id, candidate_id) VALUES
    ('vs_016', 'vr_006', 'cand_008'), -- 승인
    ('vs_017', 'vr_007', 'cand_008'), -- 승인
    ('vs_018', 'vr_008', 'cand_008'), -- 승인
    ('vs_019', 'vr_009', 'cand_009'), -- 반대
    ('vs_020', 'vr_010', 'cand_008'), -- 승인
    ('vs_021', 'vr_011', 'cand_008'); -- 승인

-- ============================================
-- 현재 활성 투표에 일부 참여 (vote_001 - 목사선출)
-- ============================================
INSERT INTO vote_records (id, vote_id, member_id, voted_at) VALUES
    ('vr_012', 'vote_001', 'pastor_001', strftime('%s', 'now', '-1 days')),
    ('vr_013', 'vote_001', 'elder_001', strftime('%s', 'now', '-1 days')),
    ('vr_014', 'vote_001', 'pastor_002', strftime('%s', 'now'));

INSERT INTO vote_selections (id, record_id, candidate_id) VALUES
    ('vs_022', 'vr_012', 'pastor_002'),
    ('vs_023', 'vr_012', 'pastor_004'),
    ('vs_024', 'vr_012', 'pastor_006'),
    ('vs_025', 'vr_012', 'pastor_008'),
    ('vs_026', 'vr_012', 'pastor_010'),
    ('vs_027', 'vr_013', 'pastor_001'),
    ('vs_028', 'vr_013', 'pastor_003'),
    ('vs_029', 'vr_013', 'pastor_005'),
    ('vs_030', 'vr_013', 'pastor_007'),
    ('vs_031', 'vr_013', 'pastor_009'),
    ('vs_032', 'vr_014', 'pastor_002'),
    ('vs_033', 'vr_014', 'pastor_005'),
    ('vs_034', 'vr_014', 'pastor_008'),
    ('vs_035', 'vr_014', 'pastor_011'),
    ('vs_036', 'vr_014', 'pastor_012');
