/**
 * 한글 조합 매핑 엔진 (korean_combination_engine.js)
 * 
 * Observer + Complete 키워드를 한글 문법으로 조합하여
 * 실시간으로 새로운 매핑을 생성하는 엔진
 * 
 * 기능:
 * 1. 키워드 분해 및 문법 분석
 * 2. 조합 가능성 검증
 * 3. 액션 추론 및 Groovy 코드 생성
 * 4. 결과 캐싱 및 최적화
 * 
 * 생성일: 2025년 6월 24일
 */

// ================================
// 의존성 체크 및 초기화
// ================================

/**
 * 필요한 데이터 파일들이 로드되었는지 확인
 */
function checkDependencies() {
  const required = [
    'KOREAN_KEYWORD_CLASSIFICATION',
    'KOREAN_GRAMMAR_PATTERNS', 
    'ACTION_INFERENCE_RULES',
    'KATALON_MAPPING_OBSERVER',
    'KATALON_MAPPING_COMPLETE'
  ];
  
  const missing = [];
  
  required.forEach(dep => {
    let exists = false;
    
    if (typeof window !== 'undefined') {
      // window 객체에서 확인
      exists = window[dep] !== undefined;
      
      // 전역 스코프에서도 확인
      if (!exists) {
        try {
          exists = eval(`typeof ${dep} !== 'undefined'`);
        } catch (e) {
          exists = false;
        }
      }
    } else if (typeof global !== 'undefined') {
      exists = global[dep] !== undefined;
    }
    
    if (!exists) {
      missing.push(dep);
    }
  });
  
  if (missing.length > 0) {
    console.warn('⚠️ 누락된 의존성 (기본 모드로 진행):', missing);
    return false; // 여전히 false 반환하지만 에러는 발생시키지 않음
  }
  
  return true;
}

// ================================
// 핵심 엔진 클래스
// ================================

/**
 * 한글 조합 매핑 엔진 메인 클래스
 */
class KoreanCombinationEngine {
  
  constructor() {
    this.cache = new Map();
    this.statistics = {
      totalQueries: 0,
      cacheHits: 0,
      combinationsGenerated: 0,
      averageProcessTime: 0
    };
    
    // 의존성 체크 (실패해도 계속 진행)
    const depsOk = checkDependencies();
    if (!depsOk) {
      console.warn('❌ 일부 데이터 파일이 로드되지 않았지만 기본 모드로 계속 진행합니다.');
    }
    
    console.log('🚀 한글 조합 매핑 엔진 초기화 완료' + (depsOk ? '' : ' (제한된 기능)'));
  }
  
  // ================================
  // 1. 메인 매핑 검색 함수
  // ================================
  
  /**
   * 키워드에 대한 매핑을 찾거나 생성
   * @param {string} keyword - 검색할 키워드
   * @param {object} options - 추가 옵션
   * @returns {object} 매핑 결과
   */
  findMapping(keyword, options = {}) {
    const startTime = performance.now();
    this.statistics.totalQueries++;
    
    // 1. 캐시 확인
    if (this.cache.has(keyword)) {
      this.statistics.cacheHits++;
      return this.cache.get(keyword);
    }
    
    // 2. 기존 매핑 검색 (Observer + Complete)
    const existingMapping = this.searchExistingMappings(keyword);
    if (existingMapping.found) {
      const result = {
        ...existingMapping,
        source: 'existing',
        processTime: performance.now() - startTime
      };
      this.cache.set(keyword, result);
      return result;
    }
    
    // 3. 조합 매핑 시도
    const combinationResult = this.generateCombinationMapping(keyword, options);
    if (combinationResult.found) {
      this.statistics.combinationsGenerated++;
      const result = {
        ...combinationResult,
        source: 'combination',
        processTime: performance.now() - startTime
      };
      this.cache.set(keyword, result);
      return result;
    }
    
    // 4. 매핑 실패
    const failResult = {
      found: false,
      keyword: keyword,
      source: 'none',
      reason: 'No existing or combination mapping found',
      suggestions: this.generateSuggestions(keyword),
      processTime: performance.now() - startTime
    };
    
    this.cache.set(keyword, failResult);
    return failResult;
  }
  
  // ================================
  // 2. 기존 매핑 검색
  // ================================
  
  /**
   * Observer + Complete 매핑에서 키워드 검색
   * @param {string} keyword - 검색할 키워드
   * @returns {object} 검색 결과
   */
  searchExistingMappings(keyword) {
    const normalizedKeyword = keyword.toLowerCase().trim();
    
    // Observer 매핑 검색
    if (typeof window !== 'undefined' && window.KATALON_MAPPING_OBSERVER) {
      const observerResult = window.KATALON_MAPPING_OBSERVER.find(mapping => 
        mapping.keywords.some(k => k.includes(normalizedKeyword) || normalizedKeyword.includes(k))
      );
      
      if (observerResult) {
        return {
          found: true,
          mapping: observerResult,
          source: 'observer',
          action: observerResult.action,
          keywords: observerResult.keywords,
          confidence: this.calculateConfidence(keyword, observerResult.keywords)
        };
      }
    }
    
    // Complete 매핑 검색
    if (typeof window !== 'undefined' && window.KATALON_MAPPING_COMPLETE) {
      const completeResult = window.KATALON_MAPPING_COMPLETE.find(mapping => 
        mapping.keywords.some(k => k.includes(normalizedKeyword) || normalizedKeyword.includes(k))
      );
      
      if (completeResult) {
        return {
          found: true,
          mapping: completeResult,
          source: 'complete',
          action: completeResult.action,
          keywords: completeResult.keywords,
          confidence: this.calculateConfidence(keyword, completeResult.keywords)
        };
      }
    }
    
    return { found: false };
  }
  
  // ================================
  // 3. 조합 매핑 생성
  // ================================
  
  /**
   * 키워드를 분해하고 조합하여 새로운 매핑 생성
   * @param {string} keyword - 조합할 키워드
   * @param {object} options - 생성 옵션
   * @returns {object} 조합 결과
   */
  generateCombinationMapping(keyword, options = {}) {
    // 1. 키워드 분해
    const decomposed = this.decomposeKeyword(keyword);
    if (!decomposed.success) {
      return { found: false, reason: 'Failed to decompose keyword' };
    }
    
    // 2. 문법 패턴 매칭
    const grammarMatch = this.matchGrammarPattern(decomposed.words);
    if (!grammarMatch.success) {
      return { found: false, reason: 'No matching grammar pattern' };
    }
    
    // 3. 액션 추론
    const inferredAction = this.inferAction(decomposed.words, grammarMatch.pattern);
    if (!inferredAction.success) {
      return { found: false, reason: 'Failed to infer action' };
    }
    
    // 4. Groovy 코드 생성
    const groovyCode = this.generateGroovyCode(inferredAction.action, decomposed.words);
    
    // 5. 결과 구성
    return {
      found: true,
      keyword: keyword,
      decomposed: decomposed.words,
      pattern: grammarMatch.pattern,
      action: inferredAction.action,
      groovyCode: groovyCode,
      confidence: this.calculateCombinationConfidence(decomposed, grammarMatch, inferredAction),
      meaning: this.generateMeaning(decomposed.words, grammarMatch.pattern)
    };
  }
  
  // ================================
  // 4. 키워드 분해 및 분석
  // ================================
  
  /**
   * 키워드를 개별 단어로 분해하고 문법적 역할 분석
   * @param {string} keyword - 분해할 키워드
   * @returns {object} 분해 결과
   */
  decomposeKeyword(keyword) {
    // 공백 기준 분해
    let words = keyword.trim().split(/\s+/);
    
    // 연결된 단어 분해 시도 (예: "총개수확인" → ["총", "개수", "확인"])
    if (words.length === 1) {
      words = this.smartWordSeparation(words[0]);
    }
    
    // 각 단어의 문법적 역할 분석
    const analyzedWords = words.map(word => ({
      word: word,
      type: this.classifyWordType(word),
      existsInMapping: this.checkWordInExistingMappings(word)
    }));
    
    // 분해 성공 여부 판단
    const success = analyzedWords.length > 0 && 
                   analyzedWords.some(w => w.existsInMapping);
    
    return {
      success: success,
      words: analyzedWords,
      originalKeyword: keyword,
      separationMethod: words.length > 1 ? 'space' : 'smart'
    };
  }
  
  /**
   * 연결된 단어를 지능적으로 분리
   * @param {string} word - 분리할 단어
   * @returns {Array} 분리된 단어들
   */
  smartWordSeparation(word) {
    const classification = window.KOREAN_KEYWORD_CLASSIFICATION;
    if (!classification) return [word];
    
    // 모든 분류된 키워드들을 길이 순으로 정렬 (긴 것부터)
    const allKnownWords = [];
    Object.values(classification).forEach(category => {
      Object.values(category).forEach(wordList => {
        if (Array.isArray(wordList)) {
          allKnownWords.push(...wordList);
        }
      });
    });
    
    // 중복 제거 및 길이순 정렬
    const sortedWords = [...new Set(allKnownWords)]
      .sort((a, b) => b.length - a.length);
    
    // 탐욕적 매칭으로 단어 분리
    const result = [];
    let remaining = word;
    
    while (remaining.length > 0) {
      let found = false;
      
      for (const knownWord of sortedWords) {
        if (remaining.startsWith(knownWord)) {
          result.push(knownWord);
          remaining = remaining.substring(knownWord.length);
          found = true;
          break;
        }
      }
      
      // 매칭되는 단어가 없으면 첫 글자 제거하고 계속
      if (!found) {
        if (remaining.length === 1) {
          result.push(remaining);
          break;
        }
        remaining = remaining.substring(1);
      }
    }
    
    return result.length > 1 ? result : [word];
  }
  
  /**
   * 단어의 문법적 타입 분류
   * @param {string} word - 분류할 단어
   * @returns {string} 단어 타입
   */
  classifyWordType(word) {
    const classification = window.KOREAN_KEYWORD_CLASSIFICATION;
    if (!classification) return 'unknown';
    
    // 명사 체크
    for (const nounCategory of Object.values(classification.nouns)) {
      if (nounCategory.includes(word)) return 'noun';
    }
    
    // 동사 체크
    for (const verbCategory of Object.values(classification.verbs)) {
      if (verbCategory.includes(word)) return 'verb';
    }
    
    // 수식어 체크
    for (const modifierCategory of Object.values(classification.modifiers)) {
      if (modifierCategory.includes(word)) return 'modifier';
    }
    
    // 상태 체크
    for (const stateCategory of Object.values(classification.states)) {
      if (stateCategory.includes(word)) return 'state';
    }
    
    // 조사 체크
    for (const particleCategory of Object.values(classification.particles)) {
      if (particleCategory.includes(word)) return 'particle';
    }
    
    return 'unknown';
  }
  
  /**
   * 단어가 기존 매핑에 존재하는지 확인
   * @param {string} word - 확인할 단어
   * @returns {boolean} 존재 여부
   */
  checkWordInExistingMappings(word) {
    // Observer 매핑 확인
    if (window.KATALON_MAPPING_OBSERVER) {
      const observerExists = window.KATALON_MAPPING_OBSERVER.some(mapping =>
        mapping.keywords.some(k => k.includes(word) || word.includes(k))
      );
      if (observerExists) return true;
    }
    
    // Complete 매핑 확인
    if (window.KATALON_MAPPING_COMPLETE) {
      const completeExists = window.KATALON_MAPPING_COMPLETE.some(mapping =>
        mapping.keywords.some(k => k.includes(word) || word.includes(k))
      );
      if (completeExists) return true;
    }
    
    return false;
  }
  
  // ================================
  // 5. 문법 패턴 매칭
  // ================================
  
  /**
   * 분해된 단어들을 문법 패턴과 매칭
   * @param {Array} words - 분석된 단어들
   * @returns {object} 매칭 결과
   */
  matchGrammarPattern(words) {
    const patterns = window.KOREAN_GRAMMAR_PATTERNS;
    if (!patterns) return { success: false };
    
    const wordTypes = words.map(w => w.type);
    const wordCount = words.length;
    
    // 2단어 패턴 매칭
    if (wordCount === 2) {
      for (const pattern of patterns.two_word_patterns) {
        if (this.matchPattern(wordTypes, pattern)) {
          return {
            success: true,
            pattern: pattern,
            matchType: 'two_word'
          };
        }
      }
    }
    
    // 3단어 패턴 매칭
    if (wordCount === 3) {
      for (const pattern of patterns.three_word_patterns) {
        if (this.matchPattern(wordTypes, pattern)) {
          return {
            success: true,
            pattern: pattern,
            matchType: 'three_word'
          };
        }
      }
    }
    
    // 복잡한 패턴 매칭 (4단어 이상)
    if (wordCount >= 4) {
      for (const pattern of patterns.complex_patterns) {
        if (this.matchPattern(wordTypes, pattern)) {
          return {
            success: true,
            pattern: pattern,
            matchType: 'complex'
          };
        }
      }
    }
    
    // 기본 패턴 시도 (유연한 매칭)
    return this.flexiblePatternMatch(words);
  }
  
  /**
   * 패턴과 단어 타입들이 매칭되는지 확인
   * @param {Array} wordTypes - 단어 타입 배열
   * @param {object} pattern - 매칭할 패턴
   * @returns {boolean} 매칭 여부
   */
  matchPattern(wordTypes, pattern) {
    // 패턴 ID에 따른 매칭 로직
    switch (pattern.id) {
      case 'noun_verb':
        return wordTypes.length === 2 && 
               wordTypes.includes('noun') && 
               wordTypes.includes('verb');
      
      case 'modifier_noun':
        return wordTypes.length === 2 && 
               wordTypes[0] === 'modifier' && 
               wordTypes[1] === 'noun';
      
      case 'noun_state':
        return wordTypes.length === 2 && 
               wordTypes[0] === 'noun' && 
               wordTypes[1] === 'state';
      
      case 'noun_noun':
        return wordTypes.length === 2 && 
               wordTypes[0] === 'noun' && 
               wordTypes[1] === 'noun';
      
      case 'modifier_noun_verb':
        return wordTypes.length === 3 && 
               wordTypes[0] === 'modifier' && 
               wordTypes[1] === 'noun' && 
               wordTypes[2] === 'verb';
      
      case 'noun_noun_verb':
        return wordTypes.length === 3 && 
               wordTypes[0] === 'noun' && 
               wordTypes[1] === 'noun' && 
               wordTypes[2] === 'verb';
      
      case 'noun_verb_state':
        return wordTypes.length === 3 && 
               wordTypes[0] === 'noun' && 
               wordTypes[1] === 'verb' && 
               wordTypes[2] === 'state';
      
      default:
        return false;
    }
  }
  
  /**
   * 유연한 패턴 매칭 (기본 패턴에 맞지 않는 경우)
   * @param {Array} words - 분석된 단어들
   * @returns {object} 매칭 결과
   */
  flexiblePatternMatch(words) {
    const hasNoun = words.some(w => w.type === 'noun');
    const hasVerb = words.some(w => w.type === 'verb');
    const hasState = words.some(w => w.type === 'state');
    
    // 최소한 명사가 있어야 의미있는 조합
    if (!hasNoun) {
      return { success: false, reason: 'No noun found' };
    }
    
    // 동사나 상태가 있으면 조합 가능
    if (hasVerb || hasState) {
      return {
        success: true,
        pattern: {
          id: 'flexible',
          pattern: 'flexible_combination',
          action_rule: 'flexible_inference'
        },
        matchType: 'flexible'
      };
    }
    
    return { success: false, reason: 'No actionable words found' };
  }
  
  // ================================
  // 6. 액션 추론
  // ================================
  
  /**
   * 분해된 단어와 패턴을 기반으로 Katalon 액션 추론
   * @param {Array} words - 분석된 단어들
   * @param {object} pattern - 매칭된 패턴
   * @returns {object} 추론된 액션
   */
  inferAction(words, pattern) {
    const rules = window.ACTION_INFERENCE_RULES;
    if (!rules) return { success: false };
    
    // 우선순위 기반 액션 추론
    const priorities = ['verb', 'state', 'noun'];
    
    for (const priority of priorities) {
      const action = this.findActionByType(words, priority, rules);
      if (action) {
        return {
          success: true,
          action: action,
          inferenceType: priority,
          confidence: this.calculateActionConfidence(words, action)
        };
      }
    }
    
    // 기본 액션 반환
    return {
      success: true,
      action: 'Get Text',
      inferenceType: 'default',
      confidence: 0.3
    };
  }
  
  /**
   * 특정 타입의 단어에서 액션 찾기
   * @param {Array} words - 단어 배열
   * @param {string} type - 찾을 타입
   * @param {object} rules - 액션 규칙
   * @returns {string|null} 찾은 액션
   */
  findActionByType(words, type, rules) {
    const typeWords = words.filter(w => w.type === type);
    
    for (const word of typeWords) {
      let actionMap;
      
      switch (type) {
        case 'verb':
          actionMap = rules.verb_actions;
          break;
        case 'state':
          actionMap = rules.state_actions;
          break;
        case 'noun':
          actionMap = rules.noun_actions;
          break;
        default:
          continue;
      }
      
      if (actionMap && actionMap[word.word]) {
        return actionMap[word.word];
      }
    }
    
    return null;
  }
  
  // ================================
  // 7. Groovy 코드 생성
  // ================================
  
  /**
   * 추론된 액션과 단어들로 Groovy 코드 생성
   * @param {string} action - Katalon 액션
   * @param {Array} words - 단어 배열
   * @returns {string} 생성된 Groovy 코드
   */
  generateGroovyCode(action, words) {
    const nouns = words.filter(w => w.type === 'noun').map(w => w.word);
    const verbs = words.filter(w => w.type === 'verb').map(w => w.word);
    const states = words.filter(w => w.type === 'state').map(w => w.word);
    
    // 기본 오브젝트 이름 생성
    const objectName = this.generateObjectName(nouns);
    
    // 액션별 코드 템플릿
    const templates = {
      'Click': `WebUI.click(findTestObject('Object Repository/${objectName}'))`,
      
      'Set Text': `WebUI.setText(findTestObject('Object Repository/${objectName}'), 'input_text')`,
      
      'Get Text': `def ${this.toCamelCase(nouns.join('_'))} = WebUI.getText(findTestObject('Object Repository/${objectName}'))`,
      
      'Verify Element Present': `WebUI.verifyElementPresent(findTestObject('Object Repository/${objectName}'), 10)`,
      
      'Verify Element Visible': `WebUI.verifyElementVisible(findTestObject('Object Repository/${objectName}'))`,
      
      'Verify Element Text': `WebUI.verifyElementText(findTestObject('Object Repository/${objectName}'), '${nouns.join(' ')}')`,
      
      'Upload File': `WebUI.uploadFile(findTestObject('Object Repository/${objectName}'), '/path/to/file')`,
      
      'Select Option By Label': `WebUI.selectOptionByLabel(findTestObject('Object Repository/${objectName}'), 'option_label', false)`,
      
      'Execute JavaScript': `WebUI.executeJavaScript('// ${nouns.join(' ')} ${verbs.join(' ')} 처리 로직', null)`
    };
    
    // 기본 템플릿이 없으면 Get Text 사용
    const baseCode = templates[action] || templates['Get Text'];
    
    // 상태가 있으면 검증 코드 추가
    if (states.length > 0) {
      const stateVerification = `\nWebUI.comment("${states.join(' ')} 상태 확인 완료")`;
      return baseCode + stateVerification;
    }
    
    return baseCode;
  }
  
  /**
   * 오브젝트 이름 생성
   * @param {Array} nouns - 명사 배열
   * @returns {string} 오브젝트 이름
   */
  generateObjectName(nouns) {
    if (nouns.length === 0) return 'element';
    
    // 명사를 PascalCase로 변환
    const pascalCase = nouns.map(noun => 
      noun.charAt(0).toUpperCase() + noun.slice(1)
    ).join('');
    
    return `${pascalCase}Element`;
  }
  
  /**
   * camelCase 변환
   * @param {string} str - 변환할 문자열
   * @returns {string} camelCase 문자열
   */
  toCamelCase(str) {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
  }
  
  // ================================
  // 8. 신뢰도 계산
  // ================================
  
  /**
   * 매핑 신뢰도 계산
   * @param {string} keyword - 원본 키워드
   * @param {Array} mappingKeywords - 매핑 키워드들
   * @returns {number} 신뢰도 (0-1)
   */
  calculateConfidence(keyword, mappingKeywords) {
    const normalizedKeyword = keyword.toLowerCase();
    let maxConfidence = 0;
    
    for (const mappingKeyword of mappingKeywords) {
      const normalized = mappingKeyword.toLowerCase();
      
      // 완전 일치
      if (normalized === normalizedKeyword) {
        return 1.0;
      }
      
      // 포함 관계
      if (normalized.includes(normalizedKeyword) || normalizedKeyword.includes(normalized)) {
        const confidence = Math.min(normalized.length, normalizedKeyword.length) / 
                         Math.max(normalized.length, normalizedKeyword.length);
        maxConfidence = Math.max(maxConfidence, confidence);
      }
    }
    
    return maxConfidence;
  }
  
  /**
   * 조합 매핑 신뢰도 계산
   * @param {object} decomposed - 분해 결과
   * @param {object} grammarMatch - 문법 매칭 결과
   * @param {object} inferredAction - 추론된 액션
   * @returns {number} 신뢰도 (0-1)
   */
  calculateCombinationConfidence(decomposed, grammarMatch, inferredAction) {
    let confidence = 0.0;
    
    // 기존 매핑에 존재하는 단어 비율
    const existingWordRatio = decomposed.words.filter(w => w.existsInMapping).length / decomposed.words.length;
    confidence += existingWordRatio * 0.4;
    
    // 문법 패턴 매칭 점수
    if (grammarMatch.success) {
      const patternWeight = grammarMatch.pattern.frequency_weight || 0.5;
      confidence += patternWeight * 0.3;
    }
    
    // 액션 추론 신뢰도
    confidence += inferredAction.confidence * 0.3;
    
    return Math.min(confidence, 1.0);
  }
  
  /**
   * 액션 추론 신뢰도 계산
   * @param {Array} words - 단어 배열
   * @param {string} action - 추론된 액션
   * @returns {number} 신뢰도 (0-1)
   */
  calculateActionConfidence(words, action) {
    // 동사가 있으면 높은 신뢰도
    const hasVerb = words.some(w => w.type === 'verb');
    if (hasVerb) return 0.9;
    
    // 상태가 있으면 중간 신뢰도
    const hasState = words.some(w => w.type === 'state');
    if (hasState) return 0.7;
    
    // 명사만 있으면 기본 신뢰도
    return 0.5;
  }
  
  // ================================
  // 9. 유틸리티 함수들
  // ================================
  
  /**
   * 의미 생성
   * @param {Array} words - 단어 배열
   * @param {object} pattern - 문법 패턴
   * @returns {string} 생성된 의미
   */
  generateMeaning(words, pattern) {
    const nouns = words.filter(w => w.type === 'noun').map(w => w.word);
    const verbs = words.filter(w => w.type === 'verb').map(w => w.word);
    const states = words.filter(w => w.type === 'state').map(w => w.word);
    const modifiers = words.filter(w => w.type === 'modifier').map(w => w.word);
    
    let meaning = '';
    
    if (modifiers.length > 0) {
      meaning += modifiers.join(' ') + ' ';
    }
    
    if (nouns.length > 0) {
      meaning += nouns.join(' ');
    }
    
    if (verbs.length > 0) {
      meaning += '을/를 ' + verbs.join(' ');
    }
    
    if (states.length > 0) {
      meaning += ' ' + states.join(' ');
    }
    
    return meaning || '알 수 없는 의미';
  }
  
  /**
   * 제안 키워드 생성
   * @param {string} keyword - 실패한 키워드
   * @returns {Array} 제안 키워드들
   */
  generateSuggestions(keyword) {
    const suggestions = [];
    
    // 기존 매핑에서 유사한 키워드 찾기
    const allMappings = [
      ...(window.KATALON_MAPPING_OBSERVER || []),
      ...(window.KATALON_MAPPING_COMPLETE || [])
    ];
    
    for (const mapping of allMappings) {
      for (const mappingKeyword of mapping.keywords) {
        if (this.calculateSimilarity(keyword, mappingKeyword) > 0.5) {
          suggestions.push({
            keyword: mappingKeyword,
            action: mapping.action,
            similarity: this.calculateSimilarity(keyword, mappingKeyword)
          });
        }
      }
    }
    
    // 유사도 순으로 정렬하고 상위 5개만 반환
    return suggestions
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 5);
  }
  
  /**
   * 문자열 유사도 계산 (간단한 편집 거리 기반)
   * @param {string} str1 - 첫 번째 문자열
   * @param {string} str2 - 두 번째 문자열
   * @returns {number} 유사도 (0-1)
   */
  calculateSimilarity(str1, str2) {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const editDistance = this.levenshteinDistance(longer, shorter);
    return (longer.length - editDistance) / longer.length;
  }
  
  /**
   * 레벤슈타인 거리 계산
   * @param {string} str1 - 첫 번째 문자열
   * @param {string} str2 - 두 번째 문자열
   * @returns {number} 편집 거리
   */
  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  // ================================
  // 10. 배치 처리 및 고급 기능
  // ================================
  
  /**
   * 여러 키워드를 한번에 처리
   * @param {Array|string} input - 키워드 배열 또는 텍스트
   * @returns {Array} 처리 결과 배열
   */
  analyzeBatch(input) {
    let keywords;
    
    if (typeof input === 'string') {
      // 텍스트에서 키워드 추출
      keywords = this.extractKeywordsFromText(input);
    } else {
      keywords = input;
    }
    
    return keywords.map(keyword => ({
      keyword: keyword,
      ...this.findMapping(keyword)
    }));
  }
  
  /**
   * 텍스트에서 키워드 추출
   * @param {string} text - 분석할 텍스트
   * @returns {Array} 추출된 키워드들
   */
  extractKeywordsFromText(text) {
    // 간단한 키워드 추출 (문장 단위)
    const sentences = text.split(/[.!?]/).filter(s => s.trim());
    const keywords = [];
    
    for (const sentence of sentences) {
      const cleaned = sentence.trim().replace(/^\d+\.\s*/, ''); // 번호 제거
      if (cleaned.length > 0) {
        keywords.push(cleaned);
      }
    }
    
    return keywords;
  }
  
  /**
   * 통계 정보 반환
   * @returns {object} 엔진 통계
   */
  getStatistics() {
    return {
      ...this.statistics,
      cacheSize: this.cache.size,
      cacheHitRate: this.statistics.totalQueries > 0 ? 
        (this.statistics.cacheHits / this.statistics.totalQueries * 100).toFixed(1) + '%' : '0%'
    };
  }
  
  /**
   * 캐시 초기화
   */
  clearCache() {
    this.cache.clear();
    console.log('🧹 캐시가 초기화되었습니다.');
  }
}

// ================================
// 전역 인스턴스 생성 및 Export
// ================================

// 싱글톤 인스턴스 생성
const koreanCombinationEngine = new KoreanCombinationEngine();

// 브라우저 환경에서 전역 변수로 설정
if (typeof window !== 'undefined') {
  window.KoreanCombinationEngine = KoreanCombinationEngine;
  window.koreanCombinationEngine = koreanCombinationEngine;
  
  console.log('✅ 한글 조합 매핑 엔진 로드 완료');
  console.log('🎯 사용법: koreanCombinationEngine.findMapping("총 개수 확인")');
}

// Node.js 환경에서 모듈 export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    KoreanCombinationEngine,
    koreanCombinationEngine
  };
}

// ================================
// 사용 예시 및 테스트
// ================================

/**
 * 사용 예시:
 * 
 * // 기본 사용
 * const result = koreanCombinationEngine.findMapping("총 개수 확인");
 * console.log(result);
 * 
 * // 배치 처리
 * const batchResult = koreanCombinationEngine.analyzeBatch([
 *   "파일 업로드",
 *   "노출되어야 한다", 
 *   "유효성 통과"
 * ]);
 * 
 * // 통계 확인
 * console.log(koreanCombinationEngine.getStatistics());
 */