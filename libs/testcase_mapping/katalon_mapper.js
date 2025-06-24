/**
 * 카탈론 스크립트 매핑 전용 모듈
 * 통합 매핑 시스템(unifiedMappingSystem) 적용
 * 
 * 주요 변경사항:
 * - 모든 매핑 검색을 unifiedMappingSystem.findMapping()으로 통일
 * - 성능 최적화 및 일관성 향상
 * 
 * 수정일: 2025년 6월 24일
 */

// ================================
// 카탈론 매핑 기능 (통합 시스템 적용)
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
        
        // 다중 라인 텍스트를 주석으로 처리
        const commentedText = text.split('\n').map(line => `// ${sectionName} ${index + 1}: ${line.trim()}`).join('\n');
        script += `${commentedText}\n`;
        
        const keywords = extractKeywordsForMapping(text);
        
        // 🎯 통합 시스템 사용
        const mappingResults = keywords.map(keyword => {
            const result = unifiedMappingSystem.findMapping(keyword);
            return result.found ? result : null;
        }).filter(Boolean);
        
        if (mappingResults.length > 0) {
            mappingResults.forEach(result => {
                script += generateKatalonScript(result, text);
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
 * 키워드에 대한 매핑 찾기 (통합 시스템 적용)
 * @param {array} keywords - 검색할 키워드 배열
 * @returns {array} 찾은 매핑 배열
 */
function findMappingsForKeywords(keywords) {
    console.log('🔍 통합 매핑 시스템으로 키워드 검색:', keywords);
    
    const foundMappings = [];
    const usedActions = new Set();
    
    keywords.forEach(keyword => {
        if (!keyword || typeof keyword !== 'string') return;
        
        // 🎯 통합 시스템 사용
        const result = unifiedMappingSystem.findMapping(keyword);
        
        if (result.found && result.action && !usedActions.has(result.action)) {
            foundMappings.push({
                ...result.mapping,
                action: result.action,
                originalKeyword: keyword,
                confidence: result.confidence || 1.0,
                source: result.source || 'unified'
            });
            usedActions.add(result.action);
            console.log('🎯 매핑 발견:', keyword, '→', result.action, `(${result.source})`);
        }
    });
    
    console.log('📊 총 매핑 결과:', foundMappings.length, '개');
    return foundMappings;
}

/**
 * 매핑용 키워드 추출
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
    // 통합 시스템에서 Groovy 코드가 이미 생성된 경우 우선 사용
    if (mapping.groovyCode) {
        return mapping.groovyCode + '\n';
    }
    
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
 * @param {string} stepsScript - Steps 스크립트
 * @param {string} expectedResultScript - Expected Result 스크립트
 * @returns {string} 통합된 스크립트
 */
function createIntegratedScript(preconditionScript, summaryScript, stepsScript, expectedResultScript) {
    const header = `// ========================================\n// Katalon Mapping Script (통합 시스템)\n// Generated at: ${new Date().toLocaleString()}\n// Unified Mapping System: Active\n// ========================================\n\n`;
    
    const testCaseStart = `@Test\ndef testCase() {\n    try {\n        // Test case execution with Unified Mapping System\n\n`;
    
    const testCaseEnd = `\n    } catch (Exception e) {\n        WebUI.comment("Test failed: " + e.getMessage())\n        throw e\n    } finally {\n        WebUI.closeBrowser()\n    }\n}\n`;
    
    const indentedPrecondition = indentScript(preconditionScript);
    const indentedSummary = indentScript(summaryScript);
    const indentedSteps = indentScript(stepsScript);
    const indentedExpectedResult = indentScript(expectedResultScript);
    
    return header + testCaseStart + indentedPrecondition + indentedSummary + indentedSteps + indentedExpectedResult + testCaseEnd;
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
 * 매핑 가능 여부 체크 (통합 시스템 적용)
 * @param {array} keywords - 키워드 배열
 * @returns {boolean} 매핑 가능 여부
 */
function hasAvailableMappings(keywords) {
    if (!unifiedMappingSystem || !unifiedMappingSystem.isInitialized) {
        console.warn('⚠️ 통합 매핑 시스템이 초기화되지 않았습니다.');
        return false;
    }
    
    return keywords.some(keyword => {
        const result = unifiedMappingSystem.findMapping(keyword);
        return result.found;
    });
}

/**
 * 매핑 통계 정보 (통합 시스템 활용)
 * @param {array} keywords - 키워드 배열
 * @returns {object} 매핑 통계
 */
function getMappingStatistics(keywords) {
    if (!unifiedMappingSystem || !unifiedMappingSystem.isInitialized) {
        return {
            totalKeywords: keywords.length,
            mappedKeywords: 0,
            mappingRate: 0,
            systemStatus: 'not_initialized'
        };
    }
    
    let mappedCount = 0;
    const mappings = [];
    
    keywords.forEach(keyword => {
        const result = unifiedMappingSystem.findMapping(keyword);
        if (result.found) {
            mappedCount++;
            mappings.push(result);
        }
    });
    
    return {
        totalKeywords: keywords.length,
        mappedKeywords: mappedCount,
        mappingRate: keywords.length > 0 ? (mappedCount / keywords.length * 100).toFixed(1) : 0,
        mappings: mappings,
        systemStatus: 'active',
        systemStats: unifiedMappingSystem.getStatistics()
    };
}

// ================================
// Export (브라우저 환경용) - 통합 시스템 포함
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

console.log('✅ katalon_mapper.js (통합 시스템 적용) 모듈 로드 완료');