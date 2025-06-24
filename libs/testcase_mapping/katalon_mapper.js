/**
 * 카탈론 스크립트 매핑 전용 모듈
 * testcase_mapper.js에서 분리된 매핑 기능
 * 
 * 책임:
 * - 키워드 기반 매핑 검색
 * - 카탈론 스크립트 생성
 * - 섹션별 스크립트 생성
 * - 통합 스크립트 생성
 * 
 * 의존성: katalon_mapping_complete.js (KATALON_MAPPING_COMPLETE 배열)
 * 생성일: 2025년 6월 13일
 */

// ================================
// 카탈론 매핑 기능
// ================================

/**
 * 섹션별 스크립트 생성
 * @param {string} sectionName - 섹션 이름
 * @param {array} textArray - 텍스트 배열
 * @returns {string} 생성된 스크립트
 */
function generateSectionScript(sectionName, textArray) {
    if (!textArray || textArray.length === 0) {
        return `// === ${sectionName} Scripts ===\n// No content found for ${sectionName}\n\n`;
    }
    
    let script = `// === ${sectionName} Scripts ===\n`;
    
    textArray.forEach((text, index) => {
        if (!text || text.trim() === '') return;
        
        // 다중 라인 텍스트를 주석으로 처리 (각 줄마다 // 추가)
        const commentedText = text.split('\n').map(line => `// ${sectionName} ${index + 1}: ${line.trim()}`).join('\n');
        script += `${commentedText}\n`;
        
        const keywords = extractKeywordsForMapping(text);
        const mappings = findMappingsForKeywords(keywords);
        
        if (mappings.length > 0) {
            mappings.forEach(mapping => {
                script += generateKatalonScript(mapping, text);
            });
        } else {
            script += `// TODO: No mapping found for: "${text.replace(/\n/g, ' ')}"\n`;
            script += `// Keywords extracted: ${keywords.join(', ')}\n`;
        }
        
        script += '\n';
    });
    
    return script;
}

/**
 * 키워드에 대한 매핑 찾기
 * @param {array} keywords - 검색할 키워드 배열
 * @returns {array} 찾은 매핑 배열
 */
function findMappingsForKeywords(keywords) {
    console.log('🔍 매핑 검색 시작, 키워드:', keywords);
    
    // 여러 방식으로 매핑 데이터 접근 시도
    let mappingData = null;
    let dataSource = '';
    
    // 1순위: window 객체에서 확인
    if (typeof window !== 'undefined' && window.KATALON_MAPPING_COMPLETE) {
        mappingData = window.KATALON_MAPPING_COMPLETE;
        dataSource = 'window.KATALON_MAPPING_COMPLETE';
    }
    // 2순위: 직접 전역 변수 확인
    else if (typeof KATALON_MAPPING_COMPLETE !== 'undefined') {
        mappingData = KATALON_MAPPING_COMPLETE;
        dataSource = 'KATALON_MAPPING_COMPLETE';
    }
    // 3순위: 통합 매핑 데이터 확인
    else if (typeof window !== 'undefined' && window.FINAL_INTEGRATED_MAPPING) {
        mappingData = window.FINAL_INTEGRATED_MAPPING;
        dataSource = 'window.FINAL_INTEGRATED_MAPPING';
    }
    // 4순위: 강제로 재시도
    else {
        console.warn('⚠️ 매핑 데이터를 찾을 수 없습니다. 재시도 중...');
        
        // 0.5초 후 재시도
        setTimeout(() => {
            console.log('🔄 매핑 데이터 재시도...');
            return findMappingsForKeywords(keywords);
        }, 500);
        
        return [];
    }
    
    if (!mappingData || !Array.isArray(mappingData)) {
        console.error('❌ 매핑 데이터가 올바르지 않습니다:', mappingData);
        console.error('📋 현재 전역 변수들:');
        if (typeof window !== 'undefined') {
            Object.keys(window).filter(key => key.includes('KATALON')).forEach(key => {
                console.log('  -', key, ':', typeof window[key], window[key] ? `(${Array.isArray(window[key]) ? window[key].length : 'not array'})` : '');
            });
        }
        return [];
    }
    
    console.log('✅ 매핑 데이터 발견:', mappingData.length, '개 (출처:', dataSource, ')');
    
    const foundMappings = [];
    const usedActions = new Set();
    
    keywords.forEach(keyword => {
        if (!keyword || typeof keyword !== 'string') return;
        
        const mapping = mappingData.find(m => {
            if (!m || !m.keywords || !Array.isArray(m.keywords)) return false;
            
            return m.keywords.some(k => {
                if (!k || typeof k !== 'string') return false;
                return k.includes(keyword.toLowerCase()) || 
                       keyword.toLowerCase().includes(k);
            });
        });
        
        if (mapping && mapping.action && !usedActions.has(mapping.action)) {
            foundMappings.push(mapping);
            usedActions.add(mapping.action);
            console.log('🎯 매핑 발견:', keyword, '→', mapping.action);
        }
    });
    
    console.log('📊 총 매핑 결과:', foundMappings.length, '개');
    return foundMappings;
}

/**
 * 매핑용 키워드 추출 (TestcaseParser의 extractKeywords와 동일하지만 독립성을 위해 분리)
 * @param {string} text - 분석할 텍스트
 * @returns {array} 추출된 키워드 배열
 */
function extractKeywordsForMapping(text) {
    if (!text) return [];
    
    const words = text
        .replace(/[^\w\sㄱ-ㅎ가-힣]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1)
        .map(word => word.toLowerCase());
    
    return [...new Set(words)];
}

/**
 * 카탈론 스크립트 생성
 * @param {object} mapping - 매핑 객체
 * @param {string} originalText - 원본 텍스트
 * @returns {string} 생성된 카탈론 스크립트
 */
function generateKatalonScript(mapping, originalText) {
    const action = mapping.action;
    const type = mapping.type;
    
    let script = '';
    
    switch (type) {
        case 'action':
            if (action === 'Click') {
                script += `WebUI.click(findTestObject('Object Repository/Page_/btn_click'))\n`;
            } else if (action === 'Submit') {
                script += `WebUI.click(findTestObject('Object Repository/Page_/btn_submit'))\n`;
            } else if (action === 'Upload File') {
                script += `WebUI.uploadFile(findTestObject('Object Repository/Page_/input_file'), '/path/to/file')\n`;
            } else if (action === 'Open Browser') {
                script += `WebUI.openBrowser('')\n`;
            } else {
                script += `WebUI.${action.toLowerCase().replace(/\s+/g, '')}(findTestObject('Object Repository/Page_/element'))\n`;
            }
            break;
            
        case 'input':
            if (action === 'Set Text') {
                script += `WebUI.setText(findTestObject('Object Repository/Page_/input_text'), 'test_value')\n`;
            } else if (action === 'Set Encrypted Text') {
                script += `WebUI.setEncryptedText(findTestObject('Object Repository/Page_/input_password'), 'encrypted_password')\n`;
            }
            break;
            
        case 'verification':
            if (action === 'Get Text') {
                script += `String actualText = WebUI.getText(findTestObject('Object Repository/Page_/text_element'))\n`;
                script += `WebUI.verifyMatch(actualText, 'expected_text', false)\n`;
            } else if (action === 'Get Attribute') {
                script += `String attributeValue = WebUI.getAttribute(findTestObject('Object Repository/Page_/element'), 'attribute_name')\n`;
                script += `WebUI.verifyMatch(attributeValue, 'expected_value', false)\n`;
            } else if (action === 'Verify Element Attribute Value') {
                script += `WebUI.verifyElementAttributeValue(findTestObject('Object Repository/Page_/element'), 'attribute', 'expected_value', 30)\n`;
            }
            break;
            
        case 'selection':
            if (action === 'Select Option By Label') {
                script += `WebUI.selectOptionByLabel(findTestObject('Object Repository/Page_/select_dropdown'), 'option_label', false)\n`;
            }
            break;
            
        case 'checkbox':
            if (action === 'Check') {
                script += `WebUI.check(findTestObject('Object Repository/Page_/checkbox_element'))\n`;
            }
            break;
            
        case 'alert':
            if (action === 'Accept Alert') {
                script += `WebUI.acceptAlert()\n`;
            }
            break;
            
        case 'navigation':
            if (action === 'Navigate To') {
                script += `WebUI.navigateToUrl('https://example.com')\n`;
            } else if (action === 'Back') {
                script += `WebUI.back()\n`;
            } else if (action === 'Forward') {
                script += `WebUI.forward()\n`;
            }
            break;
            
        default:
            script += `// ${action} - Implementation needed\n`;
    }
    
    return script;
}

/**
 * 통합 스크립트 생성
 * @param {string} preconditionScript - Precondition 스크립트
 * @param {string} summaryScript - Summary 스크립트
 * @param {string} expectedResultScript - Expected Result 스크립트
 * @returns {string} 통합된 스크립트
 */
function createIntegratedScript(preconditionScript, summaryScript, expectedResultScript) {
    const header = `// ========================================\n// Katalon Mapping Script Generated\n// Generated at: ${new Date().toLocaleString()}\n// ========================================\n\n`;
    
    const testCaseStart = `@Test\ndef testCase() {\n    try {\n        // Test case execution\n\n`;
    
    const testCaseEnd = `\n    } catch (Exception e) {\n        WebUI.comment("Test failed: " + e.getMessage())\n        throw e\n    } finally {\n        WebUI.closeBrowser()\n    }\n}\n`;
    
    const indentedPrecondition = indentScript(preconditionScript);
    const indentedSummary = indentScript(summaryScript);
    const indentedExpectedResult = indentScript(expectedResultScript);
    
    return header + testCaseStart + indentedPrecondition + indentedSummary + indentedExpectedResult + testCaseEnd;
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

/**
 * 매핑 가능 여부 체크
 * @param {array} keywords - 키워드 배열
 * @returns {boolean} 매핑 가능 여부
 */
function hasAvailableMappings(keywords) {
    const mappings = findMappingsForKeywords(keywords);
    return mappings.length > 0;
}

/**
 * 매핑 통계 정보
 * @param {array} keywords - 키워드 배열
 * @returns {object} 매핑 통계
 */
function getMappingStatistics(keywords) {
    const mappings = findMappingsForKeywords(keywords);
    return {
        totalKeywords: keywords.length,
        mappedKeywords: mappings.length,
        mappingRate: keywords.length > 0 ? (mappings.length / keywords.length * 100).toFixed(1) : 0,
        mappings: mappings
    };
}

// ================================
// Export (브라우저 환경용)
// ================================

// 브라우저 환경에서 전역 객체에 함수들을 노출
if (typeof window !== 'undefined') {
    window.KatalonMapper = {
        generateSectionScript,
        findMappingsForKeywords,
        extractKeywordsForMapping,
        generateKatalonScript,
        createIntegratedScript,
        indentScript,
        hasAvailableMappings,
        getMappingStatistics
    };
}

// Node.js 환경 지원
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        generateSectionScript,
        findMappingsForKeywords,
        extractKeywordsForMapping,
        generateKatalonScript,
        createIntegratedScript,
        indentScript,
        hasAvailableMappings,
        getMappingStatistics
    };
}

console.log('✅ katalon_mapper.js 모듈 로드 완료');