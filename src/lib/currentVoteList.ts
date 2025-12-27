interface Vote {
    id: number; // 투표 고유 번호
    title: string; // 투표 제목
    description: string; // 투표 설명
    option: VoteOption[]; // 투표 옵션
}

interface VoteOption {
    id: number; // 투표 옵션 고유 번호
    optionText: string; // 투표 옵션 텍스트
}

export const currentVoteList: Vote[] = [
    {
        id: 0,
        title: "OO교단 OOO 선출",
        description: "---를 위한 OOO 선출 투표입니다 ",
        option: [
            { id: 1, optionText: "홍길동" },
            { id: 2, optionText: "이순신" },
            { id: 3, optionText: "강감찬" },
            { id: 4, optionText: "김유신" },
            { id: 5, optionText: "유관순" },
            { id: 6, optionText: "이성계" },
        ],
    },
    {
        id: 1,
        title: "XXX 예산 관련 안건",
        description: "XXX 예산과 관련한 긴급 안건입니다.",
        option: [
            { id: 1, optionText: "찬성" },
            { id: 2, optionText: "반대" },
        ],
    },
];
