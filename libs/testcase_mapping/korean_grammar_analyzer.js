/**
 * 한글 문법 분석기 (korean_grammar_analyzer.js)
 * 테스트케이스 매핑 시스템용 한글 문법 분석 모듈
 * 
 * 기능:
 * - 조사 분석 및 분리
 * - 어미 패턴 인식
 * - 동사 우선순위 판단
 * - 부정 표현 변환
 */

// ================================
// 한글 조사 및 어미 패턴 정의
// ================================

const KOREAN_PARTICLES = {
    object: ['을', '를'],           // 목적격 조사 (대상)
    method: ['로', '으로'],         // 방법/수단 조사 (핵심 액션!)
    location: ['에', '에서'],       // 위치 조사
    subject: ['이', '가'],          // 주격 조사
    possessive: ['의'],            // 소유격 조사
    and: ['와', '과', '랑', '이랑'] // 접속 조사
};

const KOREAN_ENDINGS = {
    negative: [
        '되지 않아야', '하지 않아야', '안되어야', 
        '되면 안된다', '하면 안된다', '없어야',
        '되지 않는다', '하지 않는다', '안된다'
    ],
    state: [
        '노출 중', '진행 중', '실행 중', '동작 중',
        '활성화 중', '비활성화 중', '로딩 중'
    ],
    action: [
        '한다', '된다', '한다면', '시도', '실행',
        '클릭', '입력', '확인', '검증', '선택'
    ],
    condition: [
        '해야', '되어야', '이어야', '여야',
        '하면', '되면', '이면', '라면'
    ]
};

const ACTION_PRIORITY = {
    // 구체적 동작 (우선순위 높음)
    specific: {
        '드래그': 10, '끌기': 10,
        '클릭': 9, '누르기': 9, '터치': 9,
        '입력': 8, '타이핑': 8,
        '선택': 7, '체크': 7,
        '스크롤': 6, '이동': 6
    },
    // 일반적 동작 (우선순위 보통)
    general: {
        '업로드': 5, '다운로드': 5,
        '저장': 4, '불러오기': 4,
        '설정': 3, '변경': 3
    },
    // 검증 동작 (우선순위 낮음)
    verification: {
        '확인': 2, '검증': 2, '체크': 2,
        '비교': 1, '검사': 1
    },
    // 의도 표현 (우선순위 최하)
    intent: {
        '시도': 0, '의도': 0, '목적': 0,
        '위해': 0, '하기': 0
    }
};

// ================================
// 조사 분석 함수
// ================================

/**
 * 텍스트에서 조사를 분리하고 분석
 * @param {string} text - 분석할 텍스트
 * @returns {object} 조사별 단어 분류 결과
 */
function analyzeParticles(text) {
    const result = {
        method: [],      // 방법/수단 (가장 중요!)
        object: [],      // 목적어
        subject: [],     // 주어
        location: [],    // 위치
        general: []      // 일반 단어
    };
    
    if (!text) return result;
    
    // 조사별 패턴 생성
    const patterns = {};
    Object.keys(KOREAN_PARTICLES).forEach(type => {
        patterns[type] = new RegExp(`(\\S+)(${KOREAN_PARTICLES[type].join('|')})`, 'g');
    });
    
    let processedText = text;
    
    // 방법/수단 조사 우선 처리 (가장 중요!)
    const methodMatches = [...text.matchAll(patterns.method)];
    methodMatches.forEach(match => {
        const word = match[1];
        const particle = match[2];
        result.method.push({
            word: word,
            particle: particle,
            priority: getActionPriority(word),
            isKeyAction: true // 핵심 액션 표시
        });
        processedText = processedText.replace(match[0], '');
    });
    
    // 목적격 조사 처리
    const objectMatches = [...processedText.matchAll(patterns.object)];
    objectMatches.forEach(match => {
        const word = match[1];
        result.object.push({
            word: word,
            particle: match[2],
            priority: getActionPriority(word),
            isKeyAction: false
        });
        processedText = processedText.replace(match[0], '');
    });
    
    // 위치 조사 처리
    const locationMatches = [...processedText.matchAll(patterns.location)];
    locationMatches.forEach(match => {
        result.location.push({
            word: match[1],
            particle: match[2],
            priority: getActionPriority(match[1]),
            isKeyAction: false
        });
        processedText = processedText.replace(match[0], '');
    });
    
    // 나머지 단어들을 일반 카테고리로
    const remainingWords = processedText
        .replace(/[^\w\sㄱ-ㅎ가-힣]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1);
        
    remainingWords.forEach(word => {
        result.general.push({
            word: word,
            particle: null,
            priority: getActionPriority(word),
            isKeyAction: false
        });
    });
    
    return result;
}

// ================================
// 어미 패턴 인식 함수
// ================================

/**
 * 부정 표현 패턴 감지 및 변환
 * @param {string} text - 분석할 텍스트
 * @returns {object} 부정 표현 분석 결과
 */
function analyzeNegativePatterns(text) {
    const result = {
        isNegative: false,
        baseAction: '',
        negativeType: '',
        convertedAction: ''
    };
    
    if (!text) return result;
    
    // 부정 패턴 검사
    for (const pattern of KOREAN_ENDINGS.negative) {
        if (text.includes(pattern)) {
            result.isNegative = true;
            result.negativeType = pattern;
            
            // 부정 표현 앞의 동사 추출
            const beforeNegative = text.split(pattern)[0].trim();
            const words = beforeNegative.split(/\s+/);
            result.baseAction = words[words.length - 1] || words[0];
            
            // 부정 액션으로 변환
            result.convertedAction = convertToNegativeAction(result.baseAction);
            break;
        }
    }
    
    return result;
}

/**
 * 상태 표현 패턴 감지
 * @param {string} text - 분석할 텍스트
 * @returns {object} 상태 표현 분석 결과
 */
function analyzeStatePatterns(text) {
    const result = {
        isState: false,
        stateType: '',
        baseWord: ''
    };
    
    if (!text) return result;
    
    for (const pattern of KOREAN_ENDINGS.state) {
        if (text.includes(pattern)) {
            result.isState = true;
            result.stateType = pattern;
            
            // 상태 표현 앞의 단어 추출
            const beforeState = text.split(pattern)[0].trim();
            const words = beforeState.split(/\s+/);
            result.baseWord = words[words.length - 1] || words[0];
            break;
        }
    }
    
    return result;
}

// ================================
// 동사 우선순위 판단 함수
// ================================

/**
 * 단어의 액션 우선순위 반환
 * @param {string} word - 우선순위를 확인할 단어
 * @returns {number} 우선순위 점수 (높을수록 중요)
 */
function getActionPriority(word) {
    if (!word) return 0;
    
    const normalizedWord = word.toLowerCase().trim();
    
    // 구체적 동작 확인
    if (ACTION_PRIORITY.specific[normalizedWord] !== undefined) {
        return ACTION_PRIORITY.specific[normalizedWord];
    }
    
    // 일반적 동작 확인
    if (ACTION_PRIORITY.general[normalizedWord] !== undefined) {
        return ACTION_PRIORITY.general[normalizedWord];
    }
    
    // 검증 동작 확인
    if (ACTION_PRIORITY.verification[normalizedWord] !== undefined) {
        return ACTION_PRIORITY.verification[normalizedWord];
    }
    
    // 의도 표현 확인
    if (ACTION_PRIORITY.intent[normalizedWord] !== undefined) {
        return ACTION_PRIORITY.intent[normalizedWord];
    }
    
    return 0; // 매핑되지 않은 단어
}

/**
 * 여러 단어 중 가장 높은 우선순위 단어 선택
 * @param {array} words - 단어 배열
 * @returns {object} 최고 우선순위 단어 정보
 */
function getHighestPriorityWord(words) {
    if (!words || words.length === 0) return null;
    
    let highest = null;
    let maxPriority = -1;
    
    words.forEach(wordObj => {
        const priority = wordObj.priority || getActionPriority(wordObj.word || wordObj);
        if (priority > maxPriority) {
            maxPriority = priority;
            highest = wordObj;
        }
    });
    
    return highest;
}

// ================================
// 부정 표현 변환 함수
// ================================

/**
 * 기본 액션을 부정 액션으로 변환
 * @param {string} baseAction - 기본 액션
 * @returns {string} 변환된 부정 액션
 */
function convertToNegativeAction(baseAction) {
    const negativeMapping = {
        '업로드': 'verifyUploadNotPresent',
        '클릭': 'verifyElementNotClickable',
        '표시': 'verifyElementNotVisible',
        '노출': 'verifyElementNotVisible',
        '존재': 'verifyElementNotPresent',
        '활성화': 'verifyElementDisabled',
        '선택': 'verifyElementNotSelected',
        '입력': 'verifyElementReadOnly'
    };
    
    return negativeMapping[baseAction] || `verifyNot${baseAction}`;
}

// ================================
// 통합 분석 함수
// ================================

/**
 * 텍스트를 종합적으로 분석하여 키워드와 우선순위 반환
 * @param {string} text - 분석할 텍스트
 * @returns {object} 종합 분석 결과
 */
function analyzeText(text) {
    const result = {
        originalText: text,
        particles: analyzeParticles(text),
        negative: analyzeNegativePatterns(text),
        state: analyzeStatePatterns(text),
        prioritizedKeywords: [],
        recommendedAction: null
    };
    
    // 모든 단어를 우선순위와 함께 수집
    const allWords = [];
    
    // 방법/수단 조사가 붙은 단어들 (최고 우선순위)
    result.particles.method.forEach(item => {
        allWords.push({
            word: item.word,
            priority: item.priority + 100, // 보너스 점수
            source: 'method',
            isKeyAction: true
        });
    });
    
    // 목적격 조사가 붙은 단어들
    result.particles.object.forEach(item => {
        allWords.push({
            word: item.word,
            priority: item.priority,
            source: 'object',
            isKeyAction: false
        });
    });
    
    // 일반 단어들
    result.particles.general.forEach(item => {
        allWords.push({
            word: item.word,
            priority: item.priority,
            source: 'general',
            isKeyAction: false
        });
    });
    
    // 우선순위 순으로 정렬
    allWords.sort((a, b) => b.priority - a.priority);
    
    result.prioritizedKeywords = allWords;
    result.recommendedAction = allWords[0] || null;
    
    return result;
}

// ================================
// Export 및 전역 함수 등록
// ================================

// 브라우저 환경에서 전역 객체에 함수들을 노출
if (typeof window !== 'undefined') {
    window.KoreanGrammarAnalyzer = {
        analyzeParticles,
        analyzeNegativePatterns,
        analyzeStatePatterns,
        getActionPriority,
        getHighestPriorityWord,
        convertToNegativeAction,
        analyzeText,
        
        // 상수들도 노출
        KOREAN_PARTICLES,
        KOREAN_ENDINGS,
        ACTION_PRIORITY
    };
}

// Node.js 환경 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        analyzeParticles,
        analyzeNegativePatterns,
        analyzeStatePatterns,
        getActionPriority,
        getHighestPriorityWord,
        convertToNegativeAction,
        analyzeText,
        KOREAN_PARTICLES,
        KOREAN_ENDINGS,
        ACTION_PRIORITY
    };
}

console.log('✅ korean_grammar_analyzer.js 모듈 로드 완료');
