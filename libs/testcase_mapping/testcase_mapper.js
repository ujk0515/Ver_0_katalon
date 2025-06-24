/**
 * 카탈론 스크립트 매핑 전용 모듈 (개선된 버전)
 * testcase_parser.js의 개선된 키워드 추출과 연동
 * 
 * 주요 개선사항:
 * - 키워드 우선순위 시스템
 * - 부정 표현 처리 로직
 * - 중복 액션 제거 로직
 * - 섹션별 액션 필터링
 * - 스마트 매핑 선택
 */

// ================================
// 개선된 매핑 검색 함수
// ================================

/**
 * 우선순위 기반 매핑 검색 (기존 함수 교체)
 * @param {array} keywords - 검색할 키워드 배열 또는 우선순위 객체 배열
 * @param {string} section - 섹션 타입 (선택적)
 * @returns {array} 우선순위 기반으로 정렬된 매핑 배열
 */
function findMappingsForKeywordsWithPriority(keywords, section = null) {
    console.log(`🔍 우선순위 기반 매핑 검색 시작 [${section || 'general'}]:`, keywords);
    
    // 매핑 데이터 가져오기
    const mappingData = getMappingData();
    
    if (!mappingData || !Array.isArray(mappingData) || mappingData.length === 0) {
        console.warn('⚠️ 매핑 데이터를 사용할 수 없습니다.');
        return [];
    }
    
    const foundMappings = [];
    const usedActions = new Set();
    
    // 키워드가 우선순위 객체 배열인지 확인
    const isKeywordObjects = keywords.length > 0 && typeof keywords[0] === 'object' && keywords[0].keyword;
    
    // 우선순위 기반 처리
    const sortedKeywords = isKeywordObjects 
        ? keywords.sort((a, b) => b.priority - a.priority)
        : keywords.map((keyword, index) => ({ keyword, priority: keywords.length - index }));
    
    console.log(`📊 정렬된 키워드 (우선순위순):`, sortedKeywords);
    
    sortedKeywords.forEach(keywordObj => {
        const keyword = keywordObj.keyword || keywordObj;
        const priority = keywordObj.priority || 0;
        const isNegative = keywordObj.isNegative || false;
        const isKeyAction = keywordObj.isKeyAction || false;
        
        console.log(`🔍 키워드 검색: "${keyword}" (우선순위: ${priority}, 부정: ${isNegative}, 핵심액션: ${isKeyAction})`);
        
        // 부정 표현 특별 처리
        if (isNegative) {
            const negativeMapping = createNegativeMapping(keyword, keywordObj);
            if (negativeMapping && !usedActions.has(negativeMapping.action)) {
                foundMappings.push({
                    ...negativeMapping,
                    priority: priority,
                    isNegative: true,
                    source: 'negative_conversion'
                });
                usedActions.add(negativeMapping.action);
                console.log(`🎯 부정 매핑 생성: "${keyword}" → ${negativeMapping.action}`);
                return; // 부정 표현은 하나만 처리
            }
        }
        
        // 일반 매핑 검색
        const mapping = mappingData.find(m => 
            m.keywords && Array.isArray(m.keywords) && m.keywords.some(k => 
                typeof k === 'string' && (
                    k.toLowerCase().includes(keyword.toLowerCase()) || 
                    keyword.toLowerCase().includes(k.toLowerCase())
                )
            )
        );
        
        if (mapping && !usedActions.has(mapping.action)) {
            // 섹션별 필터링 적용
            if (shouldIncludeActionInSection(mapping.action, section)) {
                foundMappings.push({
                    ...mapping,
                    priority: priority + (isKeyAction ? 100 : 0), // 핵심 액션 보너스
                    originalKeyword: keyword,
                    source: 'mapping_data'
                });
                usedActions.add(mapping.action);
                console.log(`🎯 매핑 발견: "${keyword}" → ${mapping.action} (우선순위: ${priority})`);
            } else {
                console.log(`🚫 섹션 필터링으로 제외: "${keyword}" → ${mapping.action} (섹션: ${section})`);
            }
        }
    });
    
    // 우선순위 순으로 정렬
    foundMappings.sort((a, b) => b.priority - a.priority);
    
    console.log(`📊 최종 매핑 결과 (${foundMappings.length}개):`, foundMappings.map(m => ({ action: m.action, priority: m.priority })));
    
    return foundMappings;
}

/**
 * 기존 호환성을 위한 함수 (기존 코드 영향 최소화)
 * @param {array} keywords - 키워드 배열
 * @returns {array} 매핑 배열 (기존 형식)
 */
function findMappingsForKeywords(keywords) {
    const mappings = findMappingsForKeywordsWithPriority(keywords);
    return mappings; // 기존 호환성 유지
}

// ================================
// 부정 표현 처리 함수
// ================================

/**
 * 부정 키워드를 위한 매핑 생성
 * @param {string} keyword - 부정 키워드
 * @param {object} keywordObj - 키워드 객체 (부가 정보 포함)
 * @returns {object} 부정 매핑 객체
 */
function createNegativeMapping(keyword, keywordObj) {
    const negativeActionMap = {
        'verifyUploadNotPresent': {
            action: 'Verify Element Not Present',
            type: 'verification',
            description: '업로드 요소가 존재하지 않음을 확인'
        },
        'verifyElementNotClickable': {
            action: 'Verify Element Not Clickable', 
            type: 'verification',
            description: '요소가 클릭 불가능함을 확인'
        },
        'verifyElementNotVisible': {
            action: 'Verify Element Not Visible',
            type: 'verification', 
            description: '요소가 보이지 않음을 확인'
        },
        'verifyElementNotPresent': {
            action: 'Verify Element Not Present',
            type: 'verification',
            description: '요소가 존재하지 않음을 확인'
        },
        'verifyElementDisabled': {
            action: 'Verify Element Not Enabled',
            type: 'verification',
            description: '요소가 비활성화됨을 확인'
        },
        'verifyElementNotSelected': {
            action: 'Verify Element Not Selected',
            type: 'verification',
            description: '요소가 선택되지 않음을 확인'
        },
        'verifyElementReadOnly': {
            action: 'Verify Element Read Only',
            type: 'verification',
            description: '요소가 읽기 전용임을 확인'
        }
    };
    
    // 키워드에서 액션 이름 추출
    const actionKey = keyword.toLowerCase();
    
    if (negativeActionMap[actionKey]) {
        return {
            keywords: [keyword],
            action: negativeActionMap[actionKey].action,
            type: negativeActionMap[actionKey].type,
            status: 'negative_generated',
            description: negativeActionMap[actionKey].description,
            originalText: keywordObj.originalText || ''
        };
    }
    
    // 일반적인 부정 매핑 생성
    return {
        keywords: [keyword],
        action: 'Verify Element Not Present',
        type: 'verification',
        status: 'negative_fallback',
        description: '일반적인 부정 검증',
        originalText: keywordObj.originalText || ''
    };
}

// ================================
// 섹션별 액션 필터링 함수
// ================================

/**
 * 섹션에 따라 액션을 포함할지 결정
 * @param {string} action - 액션 이름
 * @param {string} section - 섹션 타입
 * @returns {boolean} 포함 여부
 */
function shouldIncludeActionInSection(action, section) {
    if (!section) return true; // 섹션 정보가 없으면 모두 포함
    
    const sectionActionRules = {
        'precondition': {
            allowed: [
                'Verify Element Present', 'Verify Element Visible', 'Verify Element Not Visible',
                'Verify Element Enabled', 'Verify Element Disabled', 'Get Text', 'Get Attribute',
                'Navigate To Url', 'Wait For Element Present', 'Verify Element Not Present'
            ],
            forbidden: ['Click', 'Set Text', 'Upload File', 'Submit', 'Drag And Drop']
        },
        'steps': {
            allowed: [
                'Click', 'Set Text', 'Drag And Drop', 'Upload File', 'Select Option By Label',
                'Check', 'Mouse Over', 'Scroll To Element', 'Navigate To Url', 'Submit',
                'Clear Text', 'Double Click', 'Right Click', 'Send Keys'
            ],
            forbidden: ['Verify Element Present', 'Verify Element Visible', 'Get Text']
        },
        'expectedResult': {
            allowed: [
                'Verify Element Present', 'Verify Element Not Present', 'Verify Element Visible',
                'Verify Element Not Visible', 'Verify Element Text', 'Verify Element Attribute Value',
                'Get Text', 'Get Attribute', 'Verify Element Enabled', 'Verify Element Disabled'
            ],
            forbidden: ['Click', 'Set Text', 'Upload File', 'Drag And Drop', 'Submit']
        },
        'summary': {
            allowed: [], // Summary는 모든 액션 허용
            forbidden: []
        }
    };
    
    const rules = sectionActionRules[section];
    if (!rules) return true;
    
    // 금지된 액션 확인
    if (rules.forbidden.length > 0 && rules.forbidden.includes(action)) {
        return false;
    }
    
    // 허용된 액션만 있는 경우
    if (rules.allowed.length > 0) {
        return rules.allowed.includes(action);
    }
    
    return true;
}

// ================================
// 중복 제거 함수
// ================================

/**
 * 같은 액션의 중복 제거
 * @param {array} mappings - 매핑 배열
 * @param {number} maxPerAction - 액션당 최대 개수 (기본값: 1)
 * @returns {array} 중복 제거된 매핑 배열
 */
function removeDuplicateActions(mappings, maxPerAction = 1) {
    const actionCounts = new Map();
    const filtered = [];
    
    mappings.forEach(mapping => {
        const count = actionCounts.get(mapping.action) || 0;
        
        if (count < maxPerAction) {
            filtered.push(mapping);
            actionCounts.set(mapping.action, count + 1);
        } else {
            console.log(`🚫 중복 제거: ${mapping.action} (${mapping.originalKeyword})`);
        }
    });
    
    return filtered;
}

// ================================
// 섹션별 스크립트 생성 (개선된 버전)
// ================================

/**
 * 섹션별 스크립트 생성 (개선된 버전)
 * @param {string} sectionName - 섹션 이름
 * @param {array} textArray - 텍스트 배열
 * @returns {string} 생성된 스크립트
 */
function generateSectionScriptWithPriority(sectionName, textArray) {
    if (!textArray || textArray.length === 0) {
        return `// === ${sectionName} Scripts ===\n// No content found for ${sectionName}\n\n`;
    }
    
    let script = `// === ${sectionName} Scripts ===\n`;
    
    textArray.forEach((text, index) => {
        if (!text || text.trim() === '') return;
        
        // 다중 라인 텍스트를 주석으로 처리
        const commentedText = text.split('\n').map(line => `// ${sectionName} ${index + 1}: ${line.trim()}`).join('\n');
        script += `${commentedText}\n`;
        
        // 개선된 키워드 추출 시도
        let keywordResult;
        const sectionLower = sectionName.toLowerCase().replace(/\s+/g, '');
        
        // testcase_parser.js의 개선된 함수 사용 시도
        if (typeof window !== 'undefined' && window.TestcaseParser && window.TestcaseParser.extractKeywordsBySection) {
            keywordResult = window.TestcaseParser.extractKeywordsBySection(text, sectionLower);
        } else if (typeof extractKeywordsBySection !== 'undefined') {
            keywordResult = extractKeywordsBySection(text, sectionLower);
        } else {
            // 폴백: 기존 방식
            console.warn('⚠️ 개선된 키워드 추출 함수를 찾을 수 없습니다. 기본 방식 사용.');
            const keywords = extractKeywords ? extractKeywords(text) : [];
            keywordResult = { keywords, priority: [] };
        }
        
        // 우선순위 기반 매핑 검색
        const mappings = findMappingsForKeywordsWithPriority(
            keywordResult.priority.length > 0 ? keywordResult.priority : keywordResult.keywords,
            sectionLower
        );
        
        // 중복 제거 (섹션당 최대 3개 액션)
        const filteredMappings = removeDuplicateActions(mappings, 3);
        
        if (filteredMappings.length > 0) {
            filteredMappings.forEach(mapping => {
                script += generateKatalonScriptWithContext(mapping, text, sectionName);
            });
        } else {
            script += `// TODO: No mapping found for: "${text.replace(/\n/g, ' ')}"\n`;
            if (keywordResult.keywords) {
                script += `// Keywords extracted: ${keywordResult.keywords.join(', ')}\n`;
            }
        }
        
        script += '\n';
    });
    
    return script;
}

// ================================
// 개선된 카탈론 스크립트 생성
// ================================

/**
 * 컨텍스트를 고려한 카탈론 스크립트 생성
 * @param {object} mapping - 매핑 객체
 * @param {string} originalText - 원본 텍스트
 * @param {string} sectionName - 섹션 이름
 * @returns {string} 생성된 카탈론 스크립트
 */
function generateKatalonScriptWithContext(mapping, originalText, sectionName) {
    const action = mapping.action;
    const type = mapping.type;
    const isNegative = mapping.isNegative || false;
    
    let script = '';
    
    // 부정 표현 처리
    if (isNegative) {
        script += generateNegativeActionScript(action, originalText);
        return script;
    }
    
    // 일반 액션 처리 (기존 로직 확장)
    switch (type) {
        case 'action':
            script += generateActionScript(action, originalText, sectionName);
            break;
            
        case 'input':
            script += generateInputScript(action, originalText, sectionName);
            break;
            
        case 'verification':
            script += generateVerificationScript(action, originalText, sectionName);
            break;
            
        case 'selection':
            script += generateSelectionScript(action, originalText);
            break;
            
        case 'checkbox':
            script += generateCheckboxScript(action, originalText);
            break;
            
        case 'alert':
            script += generateAlertScript(action, originalText);
            break;
            
        case 'navigation':
            script += generateNavigationScript(action, originalText, sectionName);
            break;
            
        case 'wait':
            script += generateWaitScript(action, originalText);
            break;
            
        default:
            script += `// ${action} - Implementation needed (${type})\n`;
    }
    
    return script;
}

/**
 * 부정 액션 스크립트 생성
 * @param {string} action - 액션 이름
 * @param {string} originalText - 원본 텍스트
 * @returns {string} 부정 액션 스크립트
 */
function generateNegativeActionScript(action, originalText) {
    let script = '';
    
    switch (action) {
        case 'Verify Element Not Present':
            script += `WebUI.verifyElementNotPresent(findTestObject('Object Repository/Page_/element'), 5)\n`;
            break;
        case 'Verify Element Not Visible':
            script += `WebUI.verifyElementNotVisible(findTestObject('Object Repository/Page_/element'))\n`;
            break;
        case 'Verify Element Not Clickable':
            script += `WebUI.verifyElementNotClickable(findTestObject('Object Repository/Page_/element'))\n`;
            break;
        case 'Verify Element Not Enabled':
            script += `WebUI.verifyElementNotPresent(findTestObject('Object Repository/Page_/element'), 5) // Element should be disabled\n`;
            break;
        case 'Verify Element Not Selected':
            script += `WebUI.verifyElementNotChecked(findTestObject('Object Repository/Page_/element'))\n`;
            break;
        default:
            script += `WebUI.verifyElementNotPresent(findTestObject('Object Repository/Page_/element'), 5) // ${action}\n`;
    }
    
    return script;
}

/**
 * 액션 스크립트 생성 (확장된 버전)
 * @param {string} action - 액션 이름
 * @param {string} originalText - 원본 텍스트
 * @param {string} sectionName - 섹션 이름
 * @returns {string} 액션 스크립트
 */
function generateActionScript(action, originalText, sectionName) {
    let script = '';
    
    switch (action) {
        case 'Click':
            script += `WebUI.click(findTestObject('Object Repository/Page_/btn_element'))\n`;
            break;
        case 'Double Click':
            script += `WebUI.doubleClick(findTestObject('Object Repository/Page_/element'))\n`;
            break;
        case 'Right Click':
            script += `WebUI.rightClick(findTestObject('Object Repository/Page_/element'))\n`;
            break;
        case 'Drag And Drop':
            script += `WebUI.dragAndDropToObject(findTestObject('Object Repository/Page_/source'), findTestObject('Object Repository/Page_/target'))\n`;
            break;
        case 'Upload File':
            script += `WebUI.uploadFile(findTestObject('Object Repository/Page_/input_file'), '/path/to/file')\n`;
            break;
        case 'Mouse Over':
            script += `WebUI.mouseOver(findTestObject('Object Repository/Page_/element'))\n`;
            break;
        case 'Scroll To Element':
            script += `WebUI.scrollToElement(findTestObject('Object Repository/Page_/element'), 5)\n`;
            break;
        case 'Submit':
            script += `WebUI.submit(findTestObject('Object Repository/Page_/form_element'))\n`;
            break;
        default:
            script += `WebUI.click(findTestObject('Object Repository/Page_/element')) // ${action}\n`;
    }
    
    return script;
}

/**
 * 입력 스크립트 생성
 * @param {string} action - 액션 이름
 * @param {string} originalText - 원본 텍스트
 * @param {string} sectionName - 섹션 이름
 * @returns {string} 입력 스크립트
 */
function generateInputScript(action, originalText, sectionName) {
    let script = '';
    
    switch (action) {
        case 'Set Text':
            if (originalText.includes('비밀번호') || originalText.includes('패스워드')) {
                script += `WebUI.setEncryptedText(findTestObject('Object Repository/Page_/input_password'), 'encrypted_password')\n`;
            } else {
                script += `WebUI.setText(findTestObject('Object Repository/Page_/input_text'), 'test_value')\n`;
            }
            break;
        case 'Set Encrypted Text':
            script += `WebUI.setEncryptedText(findTestObject('Object Repository/Page_/input_password'), 'encrypted_password')\n`;
            break;
        case 'Clear Text':
            script += `WebUI.clearText(findTestObject('Object Repository/Page_/input_text'))\n`;
            break;
        case 'Send Keys':
            script += `WebUI.sendKeys(findTestObject('Object Repository/Page_/input_text'), 'test_keys')\n`;
            break;
        default:
            script += `WebUI.setText(findTestObject('Object Repository/Page_/input_element'), 'value') // ${action}\n`;
    }
    
    return script;
}

/**
 * 검증 스크립트 생성
 * @param {string} action - 액션 이름
 * @param {string} originalText - 원본 텍스트
 * @param {string} sectionName - 섹션 이름
 * @returns {string} 검증 스크립트
 */
function generateVerificationScript(action, originalText, sectionName) {
    let script = '';
    
    switch (action) {
        case 'Verify Element Present':
            script += `WebUI.verifyElementPresent(findTestObject('Object Repository/Page_/element'), 5)\n`;
            break;
        case 'Verify Element Visible':
            script += `WebUI.verifyElementVisible(findTestObject('Object Repository/Page_/element'))\n`;
            break;
        case 'Verify Element Text':
            script += `WebUI.verifyElementText(findTestObject('Object Repository/Page_/element'), 'expected_text')\n`;
            break;
        case 'Verify Element Attribute Value':
            script += `WebUI.verifyElementAttributeValue(findTestObject('Object Repository/Page_/element'), 'attribute', 'expected_value', 30)\n`;
            break;
        case 'Get Text':
            if (sectionName && sectionName.toLowerCase().includes('expected')) {
                script += `String actualText = WebUI.getText(findTestObject('Object Repository/Page_/element'))\n`;
                script += `WebUI.verifyMatch(actualText, 'expected_text', false)\n`;
            } else {
                script += `String actualText = WebUI.getText(findTestObject('Object Repository/Page_/element'))\n`;
            }
            break;
        case 'Get Attribute':
            script += `String attributeValue = WebUI.getAttribute(findTestObject('Object Repository/Page_/element'), 'attribute_name')\n`;
            break;
        default:
            script += `WebUI.verifyElementPresent(findTestObject('Object Repository/Page_/element'), 5) // ${action}\n`;
    }
    
    return script;
}

/**
 * 선택 스크립트 생성
 * @param {string} action - 액션 이름
 * @param {string} originalText - 원본 텍스트
 * @returns {string} 선택 스크립트
 */
function generateSelectionScript(action, originalText) {
    let script = '';
    
    switch (action) {
        case 'Select Option By Label':
            script += `WebUI.selectOptionByLabel(findTestObject('Object Repository/Page_/select_element'), 'option_value', false)\n`;
            break;
        case 'Select Option By Value':
            script += `WebUI.selectOptionByValue(findTestObject('Object Repository/Page_/select_element'), 'option_value', false)\n`;
            break;
        case 'Select Option By Index':
            script += `WebUI.selectOptionByIndex(findTestObject('Object Repository/Page_/select_element'), 0)\n`;
            break;
        default:
            script += `WebUI.selectOptionByLabel(findTestObject('Object Repository/Page_/select_element'), 'option_value', false) // ${action}\n`;
    }
    
    return script;
}

/**
 * 체크박스 스크립트 생성
 * @param {string} action - 액션 이름
 * @param {string} originalText - 원본 텍스트
 * @returns {string} 체크박스 스크립트
 */
function generateCheckboxScript(action, originalText) {
    let script = '';
    
    switch (action) {
        case 'Check':
            script += `WebUI.check(findTestObject('Object Repository/Page_/checkbox_element'))\n`;
            break;
        case 'Uncheck':
            script += `WebUI.uncheck(findTestObject('Object Repository/Page_/checkbox_element'))\n`;
            break;
        default:
            script += `WebUI.check(findTestObject('Object Repository/Page_/checkbox_element')) // ${action}\n`;
    }
    
    return script;
}

/**
 * 알럿 스크립트 생성
 * @param {string} action - 액션 이름
 * @param {string} originalText - 원본 텍스트
 * @returns {string} 알럿 스크립트
 */
function generateAlertScript(action, originalText) {
    let script = '';
    
    switch (action) {
        case 'Accept Alert':
            script += `WebUI.acceptAlert()\n`;
            break;
        case 'Dismiss Alert':
            script += `WebUI.dismissAlert()\n`;
            break;
        case 'Get Alert Text':
            script += `String alertText = WebUI.getAlertText()\n`;
            break;
        default:
            script += `WebUI.acceptAlert() // ${action}\n`;
    }
    
    return script;
}

/**
 * 네비게이션 스크립트 생성
 * @param {string} action - 액션 이름
 * @param {string} originalText - 원본 텍스트
 * @param {string} sectionName - 섹션 이름
 * @returns {string} 네비게이션 스크립트
 */
function generateNavigationScript(action, originalText, sectionName) {
    let script = '';
    
    switch (action) {
        case 'Navigate To Url':
            script += `WebUI.navigateToUrl('https://example.com')\n`;
            break;
        case 'Back':
            script += `WebUI.back()\n`;
            break;
        case 'Forward':
            script += `WebUI.forward()\n`;
            break;
        case 'Refresh':
            script += `WebUI.refresh()\n`;
            break;
        case 'Switch To Window':
            script += `WebUI.switchToWindowTitle('Window Title')\n`;
            break;
        case 'Switch To Frame':
            script += `WebUI.switchToFrame(findTestObject('Object Repository/Page_/iframe_element'), 30)\n`;
            break;
        default:
            script += `WebUI.navigateToUrl('https://example.com') // ${action}\n`;
    }
    
    return script;
}

/**
 * 대기 스크립트 생성
 * @param {string} action - 액션 이름
 * @param {string} originalText - 원본 텍스트
 * @returns {string} 대기 스크립트
 */
function generateWaitScript(action, originalText) {
    let script = '';
    
    switch (action) {
        case 'Wait For Element Present':
            script += `WebUI.waitForElementPresent(findTestObject('Object Repository/Page_/element'), 10)\n`;
            break;
        case 'Wait For Element Visible':
            script += `WebUI.waitForElementVisible(findTestObject('Object Repository/Page_/element'), 10)\n`;
            break;
        case 'Wait For Element Clickable':
            script += `WebUI.waitForElementClickable(findTestObject('Object Repository/Page_/element'), 10)\n`;
            break;
        case 'Delay':
            script += `WebUI.delay(2) // Wait 2 seconds\n`;
            break;
        default:
            script += `WebUI.waitForElementPresent(findTestObject('Object Repository/Page_/element'), 10) // ${action}\n`;
    }
    
    return script;
}

// ================================
// 매핑 데이터 접근 함수 (기존 유지)
// ================================

/**
 * 매핑 데이터 가져오기 (기존 함수 활용)
 * @returns {array} 통합 매핑 데이터
 */
function getMappingData() {
    // testcase_mapper_main.js의 함수 활용
    if (typeof window !== 'undefined' && window.CURRENT_MAPPING_DATA) {
        return window.CURRENT_MAPPING_DATA;
    }
    
    // 직접 매핑 데이터 수집
    let mappingData = [];
    
    // Complete 데이터 추가
    if (typeof window !== 'undefined' && window.KATALON_MAPPING_COMPLETE) {
        mappingData = [...mappingData, ...window.KATALON_MAPPING_COMPLETE];
    } else if (typeof KATALON_MAPPING_COMPLETE !== 'undefined') {
        mappingData = [...mappingData, ...KATALON_MAPPING_COMPLETE];
    }
    
    // Observer 데이터 추가
    if (typeof window !== 'undefined' && window.KATALON_MAPPING_OBSERVER) {
        mappingData = [...mappingData, ...window.KATALON_MAPPING_OBSERVER];
    } else if (typeof KATALON_MAPPING_OBSERVER !== 'undefined') {
        mappingData = [...mappingData, ...KATALON_MAPPING_OBSERVER];
    }
    
    return mappingData;
}

// ================================
// 통합 스크립트 생성 함수
// ================================

/**
 * 통합 스크립트 생성 (개선된 버전)
 * @param {string} preconditionScript - Precondition 스크립트
 * @param {string} summaryScript - Summary 스크립트
 * @param {string} stepsScript - Steps 스크립트
 * @param {string} expectedResultScript - Expected Result 스크립트
 * @returns {string} 통합된 스크립트
 */
function createIntegratedScriptWithPriority(preconditionScript, summaryScript, stepsScript, expectedResultScript) {
    const timestamp = new Date().toLocaleString();
    const mappingCount = getMappingData().length;
    
    const header = `// ========================================
// Katalon Mapping Script Generated (우선순위 기반)
// Generated at: ${timestamp}
// Total Mappings: ${mappingCount}
// Features: Priority-based, Grammar Analysis, Negative Handling
// ========================================

`;
    
    const testCaseStart = `@Test
def testCase() {
    try {
        // Test case execution with priority-based mapping
        
`;
    
    const testCaseEnd = `
    } catch (Exception e) {
        WebUI.comment("Test failed: " + e.getMessage())
        throw e
    } finally {
        WebUI.closeBrowser()
    }
}
`;
    
    // 스크립트 들여쓰기
    const indentedPrecondition = indentScript(preconditionScript);
    const indentedSummary = indentScript(summaryScript);
    const indentedSteps = indentScript(stepsScript);
    const indentedExpectedResult = indentScript(expectedResultScript);
    
    return header + testCaseStart + 
           indentedPrecondition + 
           indentedSummary + 
           indentedSteps + 
           indentedExpectedResult + 
           testCaseEnd;
}

/**
 * 스크립트 들여쓰기
 * @param {string} script - 들여쓰기할 스크립트
 * @returns {string} 들여쓰기된 스크립트
 */
function indentScript(script) {
    return script.split('\n').map(line => {
        if (line.trim() === '') return line;
        return '        ' + line;
    }).join('\n');
}

// ================================
// 매핑 통계 및 분석 함수
// ================================

/**
 * 매핑 성공률 분석
 * @param {array} keywords - 키워드 배열
 * @param {array} mappings - 매핑 결과 배열
 * @returns {object} 매핑 통계
 */
function analyzeMappingSuccess(keywords, mappings) {
    const totalKeywords = keywords.length;
    const mappedKeywords = mappings.length;
    const successRate = totalKeywords > 0 ? (mappedKeywords / totalKeywords * 100).toFixed(1) : 0;
    
    return {
        totalKeywords,
        mappedKeywords,
        successRate: successRate + '%',
        failedKeywords: totalKeywords - mappedKeywords,
        mappings: mappings.map(m => ({
            action: m.action,
            priority: m.priority || 0,
            source: m.source || 'unknown'
        }))
    };
}

/**
 * 섹션별 매핑 품질 평가
 * @param {string} sectionName - 섹션 이름
 * @param {array} textArray - 텍스트 배열
 * @returns {object} 품질 평가 결과
 */
function evaluateSectionMappingQuality(sectionName, textArray) {
    if (!textArray || textArray.length === 0) {
        return { quality: 'N/A', score: 0, details: 'No content to analyze' };
    }
    
    let totalScore = 0;
    let totalTexts = 0;
    const details = [];
    
    textArray.forEach(text => {
        if (!text || text.trim() === '') return;
        
        // 키워드 추출 및 매핑 시도
        const keywords = extractKeywords ? extractKeywords(text) : [];
        const mappings = findMappingsForKeywordsWithPriority(keywords, sectionName.toLowerCase());
        
        // 점수 계산
        let textScore = 0;
        if (keywords.length > 0) {
            textScore = (mappings.length / keywords.length) * 100;
        }
        
        totalScore += textScore;
        totalTexts++;
        
        details.push({
            text: text.substring(0, 50) + (text.length > 50 ? '...' : ''),
            keywords: keywords.length,
            mappings: mappings.length,
            score: textScore.toFixed(1) + '%'
        });
    });
    
    const averageScore = totalTexts > 0 ? totalScore / totalTexts : 0;
    
    let quality = 'Poor';
    if (averageScore >= 80) quality = 'Excellent';
    else if (averageScore >= 60) quality = 'Good';
    else if (averageScore >= 40) quality = 'Fair';
    
    return {
        quality,
        score: averageScore.toFixed(1) + '%',
        details
    };
}

// ================================
// Export (브라우저 환경용)
// ================================

// 브라우저 환경에서 전역 객체에 함수들을 노출
if (typeof window !== 'undefined') {
    window.KatalonMapper = {
        // 새로운 우선순위 기반 함수들
        findMappingsForKeywordsWithPriority,
        generateSectionScriptWithPriority,
        createIntegratedScriptWithPriority,
        generateKatalonScriptWithContext,
        
        // 부정 표현 처리
        createNegativeMapping,
        generateNegativeActionScript,
        
        // 섹션별 필터링
        shouldIncludeActionInSection,
        removeDuplicateActions,
        
        // 분석 및 통계
        analyzeMappingSuccess,
        evaluateSectionMappingQuality,
        
        // 기존 호환성 함수들
        findMappingsForKeywords,
        generateKatalonScript: generateKatalonScriptWithContext, // 기존 함수명 호환
        indentScript,
        getMappingData,
        
        // 개별 스크립트 생성 함수들
        generateActionScript,
        generateInputScript,
        generateVerificationScript,
        generateSelectionScript,
        generateCheckboxScript,
        generateAlertScript,
        generateNavigationScript,
        generateWaitScript
    };
}

// Node.js 환경 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        findMappingsForKeywordsWithPriority,
        generateSectionScriptWithPriority,
        createIntegratedScriptWithPriority,
        generateKatalonScriptWithContext,
        createNegativeMapping,
        generateNegativeActionScript,
        shouldIncludeActionInSection,
        removeDuplicateActions,
        analyzeMappingSuccess,
        evaluateSectionMappingQuality,
        findMappingsForKeywords,
        indentScript,
        getMappingData,
        generateActionScript,
        generateInputScript,
        generateVerificationScript,
        generateSelectionScript,
        generateCheckboxScript,
        generateAlertScript,
        generateNavigationScript,
        generateWaitScript
    };
}

console.log('✅ katalon_mapper.js (우선순위 기반 개선 버전) 모듈 로드 완료');