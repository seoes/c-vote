-- 로컬 개발용 시드 데이터
-- 실행: wrangler d1 execute church-vote-db --local --file=./seed.sql

-- 관리자 계정 (전화번호: 010-0000-0000, 비밀번호: admin1234)
-- 관리자는 position이 NULL (투표에서 완전히 배제)
INSERT INTO members (id, name, phone, password_hash, church, sigchal, position, status, is_admin, created_at)
VALUES (
    'admin_001',
    '관리자',
    '010-0000-0000',
    'ac9689e2272427085e35b9d3e3e8bed88cb3434828b43b86fc0596cad4c6e270',
    '관리자교회',
    '구미동시찰',
    NULL,
    'approved',
    1,
    strftime('%s', 'now')
);

-- 테스트 회원들 (비밀번호: test1234)
-- 직분은 목사, 장로만
INSERT INTO members (id, name, phone, password_hash, church, sigchal, position, status, is_admin, created_at) VALUES
    ('member_001', '김목사', '010-1111-0001', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미제일교회', '구미동시찰', '목사', 'approved', 0, strftime('%s', 'now')),
    ('member_002', '이장로', '010-1111-0002', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미중앙교회', '구미동시찰', '장로', 'approved', 0, strftime('%s', 'now')),
    ('member_003', '박목사', '010-1111-0003', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '김천제일교회', '김천시찰', '목사', 'approved', 0, strftime('%s', 'now')),
    ('member_004', '최장로', '010-1111-0004', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '상주교회', '상주시찰', '장로', 'approved', 0, strftime('%s', 'now')),
    ('member_005', '정목사', '010-1111-0005', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '문경교회', '문경시찰', '목사', 'approved', 0, strftime('%s', 'now'));

-- 승인 대기 회원 (테스트용)
INSERT INTO members (id, name, phone, password_hash, church, sigchal, position, status, is_admin, created_at) VALUES
    ('member_006', '홍장로', '010-1111-0006', '937e8d5fbb48bd4949536cd65b8d35c426b80d2f830c5c308e2cdec422ae2244', '구미교회', '구미서시찰', '장로', 'pending', 0, strftime('%s', 'now'));

-- 테스트 투표 (PIN: 1234)
INSERT INTO votes (id, title, description, vote_type, max_selections, pin, end_time, status, created_at)
VALUES (
    'vote_001',
    '2026년 목사선출',
    '2026년 노회 목사 선출 투표입니다.',
    'pastor',
    5,
    '1234',
    strftime('%s', 'now', '+7 days'),
    'active',
    strftime('%s', 'now')
);

-- 테스트 일반의제 투표
INSERT INTO votes (id, title, description, vote_type, max_selections, pin, end_time, status, created_at)
VALUES (
    'vote_002',
    '교회 증축 찬반 투표',
    '교회 증축에 대한 찬반 투표입니다.',
    'general',
    1,
    '5678',
    strftime('%s', 'now', '+7 days'),
    'active',
    strftime('%s', 'now')
);

-- 일반의제 후보 (찬성/반대)
INSERT INTO candidates (id, vote_id, name, church, `order`) VALUES
    ('cand_001', 'vote_002', '찬성', NULL, 0),
    ('cand_002', 'vote_002', '반대', NULL, 1);
