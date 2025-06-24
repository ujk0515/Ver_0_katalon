/**
 * 테스트케이스 파싱 전용 모듈 (개선된 버전)
 * korean_grammar_analyzer.js와 연동하여 한글 문법 분석 기반 키워드 추출
 * 
 * 주요 개선사항:
 * - 한글 문법 분석 기반 키워드 추출
 * - 조사별 우선순위 시스템
 * - 부정 표현 자동 감지 및 변환
 * - 동사 우선순위 기반 스마트 키워드 선택
 */

// ================================
// 개선된 키워드 추출 함수
// ================================

/**
 * 한글 문법 분석을 활용한 키워드 추출 (기존 함수 교체)
 * @param {string} text - 분석할 텍스트
 * @returns {object} 분석된 키워드 정보 (기존 배열 → 객체로 변경)
 */
function extractKeywordsWithGrammar(text) {
    if (!text) return { keywords: [], analysis: null, priority: [] };
    
    // korean_grammar_analyzer.js의 분석 함수 사용
    let analysis = null;
    
    // 문법 분석기 사용 가능 여부 확인
    if (typeof window !== 'undefined' && window.KoreanGrammarAnalyzer) {
        analysis = window.KoreanGrammarAnalyzer.analyzeText(text);
    } else if (typeof KoreanGrammarAnalyzer !== 'undefined') {
        analysis = KoreanGrammarAnalyzer.analyzeText(text);
    } else {
        console.warn('⚠️ korean_grammar_analyzer.js를 찾을 수 없습니다. 기본 방식으로 진행합니다.');
        return extractKeywordsBasic(text);
    }
    
    // 분석 결과에서 키워드 추출
    const result = {
        keywords: [],           // 기존 호환성을 위한 배열
        analysis: analysis,     // 상세 분석 결과
        priority: [],           // 우선순위 정보
        negativeInfo: null,     // 부정 표현 정보
        stateInfo: null        // 상태 표현 정보
    };
    
    // 부정 표현 처리
    if (analysis.negative.isNegative) {
        result.negativeInfo = analysis.negative;
        // 부정 표현의 경우 변환된 액션을 최우선으로
        result.keywords.push(analysis.negative.convertedAction);
        result.priority.push({
            keyword: analysis.negative.convertedAction,
            priority: 1000, // 부정 표현 최우선
            source: 'negative_conversion',
            originalText: text,
            isNegative: true
        });
    }
    
    // 상태 표현 처리
    if (analysis.state.isState) {
        result.stateInfo = analysis.state;
        // 상태 표현을 검증 액션으로 변환
        const stateKeyword = `verify_${analysis.state.baseWord}_${analysis.state.stateType.replace(' ', '_')}`;
        result.keywords.push(stateKeyword);
        result.priority.push({
            keyword: stateKeyword,
            priority: 50,
            source: 'state_conversion',
            originalText: text,
            isState: true
        });
    }
    
    // 우선순위 기반 키워드 추출
    analysis.prioritizedKeywords.forEach((wordObj, index) => {
        if (wordObj.priority > 0) { // 우선순위가 있는 단어만
            result.keywords.push(wordObj.word);
            result.priority.push({
                keyword: wordObj.word,
                priority: wordObj.priority + (wordObj.isKeyAction ? 100 : 0), // 핵심 액션 보너스
                source: wordObj.source,
                originalText: text,
                isKeyAction: wordObj.isKeyAction || false,
                rank: index + 1
            });
        }
    });
    
    // 중복 제거 (우선순위 유지)
    result.keywords = [...new Set(result.keywords)];
    
    // 우선순위 정렬
    result.priority.sort((a, b) => b.priority - a.priority);
    
    console.log(`🔍 문법 분석 키워드 추출: "${text}" →`, result.keywords);
    console.log(`📊 우선순위 정보:`, result.priority);
    
    return result;
}

/**
 * 기존 방식의 키워드 추출 (폴백용)
 * @param {string} text - 분석할 텍스트
 * @returns {object} 기본 키워드 정보
 */
function extractKeywordsBasic(text) {
    if (!text) return { keywords: [], analysis: null, priority: [] };
    
    const words = text
        .replace(/[^\w\sㄱ-ㅎ가-힣]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1)
        .map(word => word.toLowerCase());
    
    const keywords = [...new Set(words)];
    
    return {
        keywords: keywords,
        analysis: null,
        priority: keywords.map((keyword, index) => ({
            keyword: keyword,
            priority: keywords.length - index, // 순서 기반 우선순위
            source: 'basic',
            originalText: text,
            isKeyAction: false,
            rank: index + 1
        }))
    };
}

/**
 * 호환성을 위한 기존 함수명 유지 (기존 코드 영향 최소화)
 * @param {string} text - 분석할 텍스트
 * @returns {array} 키워드 배열 (기존 호환성)
 */
function extractKeywords(text) {
    const result = extractKeywordsWithGrammar(text);
    return result.keywords; // 기존 코드 호환성을 위해 배열만 반환
}

// ================================
// 테스트케이스 파싱 함수 (Steps 포함) - 기존 유지
// ================================

/**
 * 테스트케이스 텍스트 파싱 (Steps 필드 포함)
 * @param {string} text - 입력된 테스트케이스 텍스트
 * @returns {object} 파싱된 데이터 객체
 */
function parseTestcase(text) {
    console.log('🔍 파싱 시작, 입력 텍스트:', text);
    
    const result = {
        summary: '',
        precondition: [],
        steps: [],
        expectedResult: ''
    };
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    console.log('분리된 라인들:', lines);
    
    let currentSection = null;
    let preconditionBuffer = [];
    let stepsBuffer = [];
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        console.log(`라인 ${i}: "${line}"`);
        
        if (line.toLowerCase().includes('summary')) {
            currentSection = 'summary';
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                result.summary = line.substring(colonIndex + 1).trim();
                console.log('Summary 발견:', result.summary);
            }
            continue;
        }
        
        if (line.toLowerCase().includes('precondition')) {
            currentSection = 'precondition';
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const preconditionText = line.substring(colonIndex + 1).trim();
                if (preconditionText) {
                    preconditionBuffer.push(preconditionText);
                }
            }
            console.log('Precondition 섹션 시작');
            continue;
        }
        
        if (line.toLowerCase().includes('steps')) {
            currentSection = 'steps';
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const stepsText = line.substring(colonIndex + 1).trim();
                if (stepsText) {
                    stepsBuffer.push(stepsText);
                }
            }
            console.log('Steps 섹션 시작');
            continue;
        }
        
        if (line.toLowerCase().includes('expected result')) {
            currentSection = 'expectedResult';
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                result.expectedResult = line.substring(colonIndex + 1).trim();
                console.log('Expected Result 발견:', result.expectedResult);
            }
            continue;
        }
        
        // 현재 섹션에 내용 추가
        if (currentSection === 'precondition') {
            if (line.match(/^\d+\./) || line) {
                preconditionBuffer.push(line);
                console.log('Precondition에 추가:', line);
            }
        } else if (currentSection === 'steps') {
            if (line.match(/^\d+\./) || line) {
                stepsBuffer.push(line);
                console.log('Steps에 추가:', line);
            }
        } else if (currentSection === 'expectedResult' && line) {
            if (result.expectedResult) {
                result.expectedResult += '\n' + line;
            } else {
                result.expectedResult = line;
            }
            console.log('Expected Result에 추가:', line);
        } else if (currentSection === 'summary' && line) {
            if (result.summary) {
                result.summary += '\n' + line;
            } else {
                result.summary = line;
            }
            console.log('Summary에 추가:', line);
        }
    }
    
    result.precondition = preconditionBuffer;
    result.steps = stepsBuffer;
    console.log('✅ 최종 파싱 결과 (Steps 포함):', result);
    return result;
}

/**
 * 파싱된 데이터를 화면에 표시 (Steps 포함)
 * @param {object} data - 파싱된 데이터
 */
function displayParsedData(data) {
    console.log('displayParsedData 호출됨 (Steps 포함):', data);
    
    const summaryElement = document.getElementById('summaryResult');
    const preconditionElement = document.getElementById('preconditionResult');
    const stepsElement = document.getElementById('stepsResult');
    const expectedElement = document.getElementById('expectedResult');
    
    if (summaryElement) {
        summaryElement.innerHTML = data.summary || '<span class="placeholder-text">Summary를 찾을 수 없습니다</span>';
        console.log('Summary 설정됨:', data.summary);
    }
    
    if (preconditionElement) {
        if (data.precondition && data.precondition.length > 0) {
            preconditionElement.innerHTML = data.precondition.join('<br>');
            console.log('Precondition 설정됨:', data.precondition);
        } else {
            preconditionElement.innerHTML = '<span class="placeholder-text">Precondition을 찾을 수 없습니다</span>';
        }
    }
    
    if (stepsElement) {
        if (data.steps && data.steps.length > 0) {
            stepsElement.innerHTML = data.steps.join('<br>');
            console.log('✅ Steps 설정됨:', data.steps);
        } else {
            stepsElement.innerHTML = '<span class="placeholder-text">Steps를 찾을 수 없습니다</span>';
            console.log('⚠️ Steps 없음');
        }
    }
    
    if (expectedElement) {
        expectedElement.innerHTML = data.expectedResult || '<span class="placeholder-text">Expected Result를 찾을 수 없습니다</span>';
        console.log('Expected Result 설정됨:', data.expectedResult);
    }
    
    console.log('✅ 화면 표시 완료 (Steps 포함)');
}

// ================================
// 개선된 키워드 분석 유틸리티 함수들
// ================================

/**
 * 섹션별 키워드 분석 (섹션에 따른 다른 우선순위 적용)
 * @param {string} text - 분석할 텍스트
 * @param {string} section - 섹션 타입 (precondition, summary, steps, expectedResult)
 * @returns {object} 섹션별 최적화된 키워드 분석 결과
 */
function extractKeywordsBySection(text, section) {
    const baseResult = extractKeywordsWithGrammar(text);
    
    // 섹션별 우선순위 조정
    const sectionPriorityBonus = {
        'precondition': {
            // Precondition은 상태 확인 우선
            '노출': 10, '존재': 10, '활성화': 10, '비활성화': 10,
            '표시': 8, '보이기': 8, '숨김': 8
        },
        'steps': {
            // Steps는 액션 우선
            '드래그': 15, '클릭': 12, '입력': 10, '선택': 8,
            '이동': 6, '스크롤': 6
        },
        'expectedResult': {
            // Expected Result는 검증 우선
            '확인': 10, '검증': 10, '체크': 8,
            '되어야': 12, '않아야': 15 // 부정 표현 강화
        },
        'summary': {
            // Summary는 균형잡힌 우선순위
            '확인': 5, '드래그': 8, '업로드': 6
        }
    };
    
    // 섹션별 보너스 점수 적용
    if (sectionPriorityBonus[section]) {
        baseResult.priority.forEach(item => {
            const bonus = sectionPriorityBonus[section][item.keyword];
            if (bonus) {
                item.priority += bonus;
                item.sectionBonus = bonus;
            }
        });
        
        // 우선순위 재정렬
        baseResult.priority.sort((a, b) => b.priority - a.priority);
    }
    
    console.log(`🎯 섹션별 키워드 분석 [${section}]: "${text}"`, baseResult.priority);
    
    return baseResult;
}

/**
 * 중복 키워드 제거 (같은 섹션 내에서)
 * @param {array} keywordResults - 키워드 분석 결과 배열
 * @returns {array} 중복 제거된 키워드 결과
 */
function removeDuplicateKeywords(keywordResults) {
    const seen = new Set();
    const filtered = [];
    
    keywordResults.forEach(result => {
        const uniqueKey = `${result.keyword}_${result.source}`;
        if (!seen.has(uniqueKey)) {
            seen.add(uniqueKey);
            filtered.push(result);
        }
    });
    
    return filtered;
}

// ================================
// Export (브라우저 환경용)
// ================================

// 브라우저 환경에서 전역 객체에 함수들을 노출
if (typeof window !== 'undefined') {
    window.TestcaseParser = {
        // 새로운 함수들
        extractKeywordsWithGrammar,
        extractKeywordsBySection,
        removeDuplicateKeywords,
        
        // 기존 함수들 (호환성)
        parseTestcase,
        displayParsedData,
        extractKeywords, // 기존 호환성
        extractKeywordsBasic
    };
}

// Node.js 환경 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        extractKeywordsWithGrammar,
        extractKeywordsBySection,
        removeDuplicateKeywords,
        parseTestcase,
        displayParsedData,
        extractKeywords,
        extractKeywordsBasic
    };
}

console.log('✅ testcase_parser.js (개선된 버전) 모듈 로드 완료');
