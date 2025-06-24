/**
 * 한글 조합 키워드 데이터 파일 (korean_combination_keywords.js)
 * 
 * Observer + Complete 키워드를 문법적으로 분류하고
 * 한글 조합 규칙을 정의하는 데이터 파일
 * 
 * 목표: 629개 기본 키워드 → 2000+ 조합 키워드 자동 생성
 * 생성일: 2025년 6월 24일
 */

// ================================
// Observer + Complete 키워드 분류
// ================================

/**
 * 기존 Observer/Complete 매핑에서 추출한 키워드를 
 * 한글 문법에 따라 분류
 */
const KOREAN_KEYWORD_CLASSIFICATION = {
  
  // === 명사 (Nouns) - 사물, 개념, 대상 ===
  nouns: {
    // UI 요소
    ui_elements: [
      "페이지", "화면", "버튼", "아이콘", "링크", "이미지", "텍스트", 
      "블록", "카드", "박스", "영역", "필드", "메뉴", "리스트", "항목",
      "드롭다운", "체크박스", "라디오버튼", "슬라이더", "탭", "모달", "팝업"
    ],
    
    // 데이터 관련
    data_items: [
      "개수", "수량", "내용", "데이터", "정보", "값", "결과", "숫자",
      "내역", "시간", "날짜", "문구", "메시지", "상태", "조건", "타입"
    ],
    
    // 파일 관련
    file_items: [
      "파일", "동영상", "영상", "이미지", "문서", "첨부파일", "업로드",
      "다운로드", "폴더", "디렉토리", "경로", "링크"
    ],
    
    // 블록체인/크립토
    crypto_items: [
      "토큰", "블록", "컨트랙트", "주소", "해시", "트랜잭션", "네트워크",
      "가스", "메소드", "코드", "지갑", "코인"
    ],
    
    // 수치 관련
    numeric_items: [
      "총량", "합계", "평균", "최대", "최소", "비율", "퍼센트", "점수",
      "등급", "순위", "개수", "수치", "가격", "비용", "수수료"
    ]
  },
  
  // === 동사 (Verbs) - 동작, 행위 ===
  verbs: {
    // 기본 액션
    basic_actions: [
      "확인", "검증", "체크", "클릭", "선택", "입력", "설정", "생성",
      "삭제", "수정", "변경", "추가", "제거", "복사", "붙여넣기"
    ],
    
    // 파일 액션
    file_actions: [
      "업로드", "다운로드", "첨부", "저장", "불러오기", "가져오기", "내보내기"
    ],
    
    // 네비게이션
    navigation_actions: [
      "이동", "진입", "전환", "뒤로", "앞으로", "새로고침", "닫기", "열기"
    ],
    
    // 검증 액션
    verification_actions: [
      "확인", "검증", "검사", "테스트", "비교", "계산", "집계", "합산"
    ]
  },
  
  // === 형용사/부사 (Modifiers) - 수식어 ===
  modifiers: {
    // 상태 수식어
    state_modifiers: [
      "정상적인", "올바른", "유효한", "활성", "비활성", "선택된", "해제된",
      "보이는", "숨겨진", "새로운", "기존", "최신", "이전"
    ],
    
    // 수량 수식어
    quantity_modifiers: [
      "전체", "모든", "각", "개별", "부분", "일부", "첫번째", "마지막",
      "총", "전체", "최대", "최소", "기본"
    ],
    
    // 품질 수식어
    quality_modifiers: [
      "좋은", "나쁜", "정확한", "부정확한", "완전한", "불완전한", "안전한", "위험한"
    ]
  },
  
  // === 상태/결과 (States) - 상태 표현 ===
  states: {
    // 존재 상태
    existence_states: [
      "있음", "없음", "존재", "미존재", "포함", "미포함", "발견", "미발견"
    ],
    
    // 동작 상태  
    action_states: [
      "되어야", "되지", "된다", "되는", "되어", "되었", "될", "되면"
    ],
    
    // 완료 상태
    completion_states: [
      "완료", "미완료", "성공", "실패", "통과", "미통과", "처리", "대기"
    ],
    
    // 표시 상태
    display_states: [
      "노출", "미노출", "표시", "미표시", "보임", "숨김", "활성화", "비활성화"
    ]
  },
  
  // === 조사/어미 (Particles) - 문법 요소 ===
  particles: {
    // 주격 조사
    subject_particles: ["이", "가"],
    
    // 목적격 조사
    object_particles: ["을", "를"],
    
    // 처격 조사
    location_particles: ["에", "에서", "으로", "로"],
    
    // 연결 조사
    connection_particles: ["와", "과", "하고", "및"],
    
    // 종결 어미
    ending_particles: ["다", "한다", "한다면", "해야", "하여", "하고"],
    
    // 기타 조사
    other_particles: ["의", "도", "만", "부터", "까지", "처럼", "같이"]
  }
};

// ================================
// 한글 문법 조합 규칙
// ================================

/**
 * 한글 문법에 기반한 키워드 조합 규칙
 * 각 패턴은 의미있는 조합을 생성하는 규칙을 정의
 */
const KOREAN_GRAMMAR_PATTERNS = {
  
  // === 2단어 조합 패턴 ===
  two_word_patterns: [
    {
      id: "noun_verb",
      pattern: "[명사] + [동사]",
      template: "{noun}{verb}",
      examples: ["개수확인", "파일업로드", "버튼클릭"],
      action_rule: "verb가 동사인 경우 해당 동사의 액션 사용",
      frequency_weight: 0.9
    },
    
    {
      id: "modifier_noun", 
      pattern: "[수식어] + [명사]",
      template: "{modifier} {noun}",
      examples: ["전체 개수", "정상적인 파일", "최신 데이터"],
      action_rule: "명사의 기본 액션 사용 (주로 Get Text)",
      frequency_weight: 0.8
    },
    
    {
      id: "noun_state",
      pattern: "[명사] + [상태]", 
      template: "{noun}{state}",
      examples: ["노출되어야", "표시완료", "업로드성공"],
      action_rule: "상태에 따른 검증 액션 사용",
      frequency_weight: 0.85
    },
    
    {
      id: "noun_noun",
      pattern: "[명사] + [명사]",
      template: "{noun1}{noun2}",
      examples: ["파일개수", "버튼상태", "데이터내용"],
      action_rule: "두 번째 명사의 액션 우선 적용",
      frequency_weight: 0.7
    }
  ],
  
  // === 3단어 조합 패턴 ===
  three_word_patterns: [
    {
      id: "modifier_noun_verb",
      pattern: "[수식어] + [명사] + [동사]",
      template: "{modifier} {noun} {verb}",
      examples: ["전체 개수 확인", "정상 파일 업로드"],
      action_rule: "동사 액션 + 수식어 조건 추가",
      frequency_weight: 0.75
    },
    
    {
      id: "noun_noun_verb",
      pattern: "[명사] + [명사] + [동사]",
      template: "{noun1} {noun2} {verb}",
      examples: ["파일 개수 확인", "버튼 상태 검증"],
      action_rule: "동사 액션으로 두 명사 조합 처리",
      frequency_weight: 0.8
    },
    
    {
      id: "noun_verb_state",
      pattern: "[명사] + [동사] + [상태]",
      template: "{noun} {verb}{state}",
      examples: ["파일 업로드되어야", "데이터 표시완료"],
      action_rule: "동사 + 상태 검증 조합",
      frequency_weight: 0.7
    }
  ],
  
  // === 4단어 이상 조합 패턴 ===
  complex_patterns: [
    {
      id: "full_sentence",
      pattern: "[수식어] + [명사] + [동사] + [상태]",
      template: "{modifier} {noun} {verb}{state}",
      examples: ["전체 파일 업로드되어야 한다"],
      action_rule: "전체 문장의 의미 분석하여 복합 액션 생성",
      frequency_weight: 0.6
    }
  ]
};

// ================================
// 액션 매핑 추론 규칙
// ================================

/**
 * 조합된 키워드에서 Katalon 액션을 추론하는 규칙
 */
const ACTION_INFERENCE_RULES = {
  
  // 동사 기반 액션 매핑
  verb_actions: {
    "확인": "Verify Element Present",
    "검증": "Verify Element Attribute Value", 
    "체크": "Verify Element Present",
    "클릭": "Click",
    "선택": "Select Option By Label",
    "입력": "Set Text",
    "설정": "Set Text",
    "업로드": "Upload File",
    "다운로드": "Click",
    "이동": "Navigate To Url",
    "새로고침": "Refresh",
    "삭제": "Clear Text",
    "복사": "Execute JavaScript"
  },
  
  // 상태 기반 액션 매핑
  state_actions: {
    "되어야": "Verify Element Visible",
    "되지": "Verify Element Not Visible", 
    "완료": "Verify Element Present",
    "성공": "Verify Element Text",
    "실패": "Verify Element Text",
    "통과": "Verify Element Attribute Value",
    "노출": "Verify Element Visible",
    "표시": "Verify Element Visible",
    "숨김": "Verify Element Not Visible"
  },
  
  // 명사 기반 액션 매핑 (기본값)
  noun_actions: {
    "개수": "Get Text",
    "내용": "Get Text",
    "데이터": "Get Text",
    "정보": "Get Text",
    "상태": "Get Attribute",
    "값": "Get Text",
    "결과": "Get Text",
    "버튼": "Click",
    "링크": "Click",
    "페이지": "Navigate To Url"
  },
  
  // 조합 우선순위 규칙
  priority_rules: {
    // 동사가 있으면 동사 액션 우선
    "has_verb": "verb_action_priority",
    
    // 상태가 있으면 검증 액션으로 변환
    "has_state": "verification_action_priority",
    
    // 수식어가 있으면 조건 추가
    "has_modifier": "add_condition_to_action"
  }
};

// ================================
// 특수 도메인 조합 규칙
// ================================

/**
 * 특정 도메인(블록체인, UI테스트 등)에 특화된 조합 규칙
 */
const DOMAIN_SPECIFIC_COMBINATIONS = {
  
  // 블록체인/크립토 도메인
  blockchain: {
    base_words: ["토큰", "블록", "컨트랙트", "주소", "해시"],
    common_combinations: [
      { words: ["토큰", "전송"], action: "Execute JavaScript" },
      { words: ["컨트랙트", "호출"], action: "Execute JavaScript" },
      { words: ["주소", "복사"], action: "Execute JavaScript" },
      { words: ["해시", "확인"], action: "Get Text" }
    ]
  },
  
  // 파일 업로드 도메인
  file_upload: {
    base_words: ["파일", "업로드", "첨부", "선택"],
    common_combinations: [
      { words: ["파일", "선택"], action: "Upload File" },
      { words: ["드래그", "업로드"], action: "Drag And Drop" },
      { words: ["첨부", "시도"], action: "Upload File" },
      { words: ["업로드", "완료"], action: "Verify Element Present" }
    ]
  },
  
  // UI 테스트 도메인
  ui_testing: {
    base_words: ["버튼", "클릭", "입력", "선택", "확인"],
    common_combinations: [
      { words: ["버튼", "클릭"], action: "Click" },
      { words: ["텍스트", "입력"], action: "Set Text" },
      { words: ["옵션", "선택"], action: "Select Option By Label" },
      { words: ["요소", "확인"], action: "Verify Element Present" }
    ]
  }
};

// ================================
// 금지 조합 필터
// ================================

/**
 * 의미가 없거나 부적절한 조합을 필터링하는 규칙
 */
const FORBIDDEN_COMBINATIONS = {
  
  // 의미상 맞지 않는 조합
  meaningless_combinations: [
    ["버튼", "업로드"],  // 버튼을 업로드한다는 의미 없음
    ["개수", "클릭"],    // 개수를 클릭한다는 의미 없음
    ["확인", "입력"]     // 확인을 입력한다는 의미 없음
  ],
  
  // 중복 의미 조합
  redundant_combinations: [
    ["확인", "검증"],    // 확인과 검증은 유사한 의미
    ["표시", "노출"],    // 표시와 노출은 유사한 의미
    ["선택", "클릭"]     // 선택과 클릭은 유사한 동작
  ],
  
  // 문법적으로 부자연스러운 조합
  unnatural_grammar: [
    // 조사 없이 명사만 나열된 경우의 일부
    ["파일", "데이터", "정보"]  // 너무 많은 명사 나열
  ]
};

// ================================
// Export 및 초기화
// ================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    KOREAN_KEYWORD_CLASSIFICATION,
    KOREAN_GRAMMAR_PATTERNS,
    ACTION_INFERENCE_RULES,
    DOMAIN_SPECIFIC_COMBINATIONS,
    FORBIDDEN_COMBINATIONS
  };
}

// 브라우저 환경에서 전역 변수로 설정
if (typeof window !== 'undefined') {
  window.KOREAN_KEYWORD_CLASSIFICATION = KOREAN_KEYWORD_CLASSIFICATION;
  window.KOREAN_GRAMMAR_PATTERNS = KOREAN_GRAMMAR_PATTERNS;
  window.ACTION_INFERENCE_RULES = ACTION_INFERENCE_RULES;
  window.DOMAIN_SPECIFIC_COMBINATIONS = DOMAIN_SPECIFIC_COMBINATIONS;
  window.FORBIDDEN_COMBINATIONS = FORBIDDEN_COMBINATIONS;
  
  console.log('✅ 한글 조합 키워드 데이터 로드 완료');
  console.log('📊 분류된 키워드 통계:');
  console.log('- 명사:', Object.values(KOREAN_KEYWORD_CLASSIFICATION.nouns).flat().length, '개');
  console.log('- 동사:', Object.values(KOREAN_KEYWORD_CLASSIFICATION.verbs).flat().length, '개');
  console.log('- 수식어:', Object.values(KOREAN_KEYWORD_CLASSIFICATION.modifiers).flat().length, '개');
  console.log('- 상태:', Object.values(KOREAN_KEYWORD_CLASSIFICATION.states).flat().length, '개');
}