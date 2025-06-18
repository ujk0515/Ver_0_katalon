/**
 * 테스트케이스 매핑 도구
 * testcase_mapper_main.html에서 추출된 JavaScript 기능
 * 
 * 의존성: katalon_mapping_complete.js (KATALON_MAPPING_COMPLETE 배열 사용)
 * 생성일: 2024년
 */

// ================================
// 전역 변수
// ================================
window.parsedTestcaseData = null;
window.generatedScript = null;

// ================================
// PARSER 기능 - 테스트케이스 파싱
// ================================

/**
 * 테스트케이스 데이터 추출 메인 함수
 */
function extractTestcaseData() {
    const input = document.getElementById('testcaseInput').value.trim();
    console.log('입력된 텍스트:', input);
    
    if (!input) {
        alert('테스트케이스 내용을 입력해주세요.');
        return;
    }
    
    try {
        const parsedData = parseTestcase(input);
        console.log('파싱된 데이터:', parsedData);
        displayParsedData(parsedData);
        document.getElementById('convertBtn').disabled = false;
        console.log('파싱 완료:', parsedData);
    } catch (error) {
        console.error('파싱 오류:', error);
        alert('파싱 중 오류가 발생했습니다. 입력 형식을 확인해주세요.');
    }
}

/**
 * 테스트케이스 텍스트 파싱
 * @param {string} text - 입력된 테스트케이스 텍스트
 * @returns {object} 파싱된 데이터 객체
 */
function parseTestcase(text) {
    console.log('파싱 시작, 입력 텍스트:', text);
    
    const result = {
        summary: '',
        precondition: [],
        expectedResult: ''
    };
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    console.log('분리된 라인들:', lines);
    
    let currentSection = null;
    let preconditionBuffer = [];
    
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
        
        if (line.toLowerCase().includes('expected result')) {
            currentSection = 'expectedResult';
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                result.expectedResult = line.substring(colonIndex + 1).trim();
                console.log('Expected Result 발견:', result.expectedResult);
            }
            continue;
        }
        
        if (line.toLowerCase().includes('steps')) {
            currentSection = 'expectedResult';
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                result.expectedResult = line.substring(colonIndex + 1).trim();
            }
            continue;
        }
        
        if (currentSection === 'precondition') {
            if (line.match(/^\d+\./) || line) {
                preconditionBuffer.push(line);
                console.log('Precondition에 추가:', line);
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
    console.log('최종 파싱 결과:', result);
    return result;
}

/**
 * 파싱된 데이터를 화면에 표시
 * @param {object} data - 파싱된 데이터
 */
function displayParsedData(data) {
    console.log('displayParsedData 호출됨:', data);
    console.log('Summary 값:', data.summary, '타입:', typeof data.summary, '길이:', data.summary ? data.summary.length : 'null');
    console.log('Precondition 값:', data.precondition, '타입:', typeof data.precondition, '길이:', data.precondition ? data.precondition.length : 'null');
    console.log('Expected Result 값:', data.expectedResult, '타입:', typeof data.expectedResult, '길이:', data.expectedResult ? data.expectedResult.length : 'null');
    
    const summaryElement = document.getElementById('summaryResult');
    const preconditionElement = document.getElementById('preconditionResult');
    const expectedElement = document.getElementById('expectedResult');
    
    if (data.summary) {
        summaryElement.innerHTML = data.summary;
        console.log('Summary 설정됨:', data.summary);
    } else {
        summaryElement.innerHTML = '<span class="placeholder-text">Summary를 찾을 수 없습니다</span>';
        console.log('Summary 없음');
    }
    
    if (data.precondition && data.precondition.length > 0) {
        preconditionElement.innerHTML = data.precondition.join('<br>');
        console.log('Precondition 설정됨:', data.precondition);
    } else {
        preconditionElement.innerHTML = '<span class="placeholder-text">Precondition을 찾을 수 없습니다</span>';
        console.log('Precondition 없음');
    }
    
    if (data.expectedResult) {
        expectedElement.innerHTML = data.expectedResult;
        console.log('Expected Result 설정됨:', data.expectedResult);
    } else {
        expectedElement.innerHTML = '<span class="placeholder-text">Expected Result를 찾을 수 없습니다</span>';
        console.log('Expected Result 없음');
    }
    
    window.parsedTestcaseData = data;
    console.log('전역 변수에 저장 완료');
}

/**
 * 텍스트에서 키워드 추출
 * @param {string} text - 분석할 텍스트
 * @returns {array} 추출된 키워드 배열
 */
function extractKeywords(text) {
    if (!text) return [];
    
    const words = text
        .replace(/[^\w\sㄱ-ㅎ가-힣]/g, ' ')
        .split(/\s+/)
        .filter(word => word.length > 1)
        .map(word => word.toLowerCase());
    
    return [...new Set(words)];
}

// ================================
// MAPPER 기능 - 카탈론 스크립트 생성
// ================================

/**
 * 매핑 스크립트 생성 메인 함수
 */
function generateMappingScript() {
    if (!window.parsedTestcaseData) {
        alert('먼저 테스트케이스 데이터를 추출해주세요.');
        return;
    }
    
    try {
        const data = window.parsedTestcaseData;
        
        const preconditionScript = generateSectionScript('Precondition', data.precondition);
        const summaryScript = generateSectionScript('Summary', [data.summary]);
        const expectedResultScript = generateSectionScript('Expected Result', [data.expectedResult]);
        
        const fullScript = createIntegratedScript(preconditionScript, summaryScript, expectedResultScript);
        
        displayMappingScript(fullScript);
        updateMappingStatus(true);
        
        console.log('매핑 스크립트 생성 완료');
    } catch (error) {
        console.error('매핑 오류:', error);
        alert('매핑 스크립트 생성 중 오류가 발생했습니다.');
    }
}

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
        
        const keywords = extractKeywords(text);
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
    // katalon_mapping_complete.js의 KATALON_MAPPING_COMPLETE 배열 사용
    if (typeof KATALON_MAPPING_COMPLETE === 'undefined') {
        console.error('KATALON_MAPPING_COMPLETE가 정의되지 않았습니다. katalon_mapping_complete.js 파일을 먼저 로드해주세요.');
        return [];
    }
    
    const foundMappings = [];
    const usedActions = new Set();
    
    keywords.forEach(keyword => {
        const mapping = KATALON_MAPPING_COMPLETE.find(m => 
            m.keywords.some(k => 
                k.includes(keyword.toLowerCase()) || 
                keyword.toLowerCase().includes(k)
            )
        );
        
        if (mapping && !usedActions.has(mapping.action)) {
            foundMappings.push(mapping);
            usedActions.add(mapping.action);
        }
    });
    
    return foundMappings;
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
 * 매핑 스크립트를 화면에 표시
 * @param {string} script - 표시할 스크립트
 */
function displayMappingScript(script) {
    const scriptElement = document.getElementById('scriptResult');
    scriptElement.textContent = script;
    window.generatedScript = script;
}

/**
 * 매핑 상태 업데이트
 * @param {boolean} hasMappings - 매핑 존재 여부
 */
function updateMappingStatus(hasMappings) {
    const indicator = document.getElementById('mappingIndicator');
    
    if (hasMappings) {
        indicator.classList.remove('no-mapping');
    } else {
        indicator.classList.add('no-mapping');
    }
}

// ================================
// UI 제어 기능
// ================================

/**
 * 스크립트 복사 기능
 */
function copyScript() {
    if (!window.generatedScript) {
        alert('복사할 스크립트가 없습니다.');
        return;
    }
    
    navigator.clipboard.writeText(window.generatedScript).then(() => {
        const copyBtn = document.querySelector('.copy-btn');
        const originalText = copyBtn.textContent;
        copyBtn.textContent = '✅ 복사됨';
        copyBtn.style.background = '#10b981';
        
        setTimeout(() => {
            copyBtn.textContent = originalText;
            copyBtn.style.background = '#6366f1';
        }, 2000);
    }).catch(err => {
        console.error('복사 실패:', err);
        
        const scriptElement = document.getElementById('scriptResult');
        const range = document.createRange();
        range.selectNode(scriptElement);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        
        alert('스크립트가 선택되었습니다. Ctrl+C로 복사하세요.');
    });
}

/**
 * 입력 영역 초기화
 */
function resetInput() {
    if (confirm('입력된 테스트케이스를 초기화하시겠습니까?')) {
        document.getElementById('testcaseInput').value = '';
        console.log('입력 영역 초기화 완료');
    }
}

/**
 * 파싱 결과 초기화
 */
function resetParsing() {
    if (confirm('파싱 결과를 초기화하시겠습니까?')) {
        document.getElementById('summaryResult').innerHTML = '<span class="placeholder-text">추출된 Summary가 여기에 표시됩니다</span>';
        document.getElementById('preconditionResult').innerHTML = '<span class="placeholder-text">추출된 Precondition이 여기에 표시됩니다</span>';
        document.getElementById('expectedResult').innerHTML = '<span class="placeholder-text">추출된 Expected Result가 여기에 표시됩니다</span>';
        
        // 스크립트 전환 버튼 비활성화
        document.getElementById('convertBtn').disabled = true;
        
        // 전역 변수 초기화
        window.parsedTestcaseData = null;
        
        console.log('파싱 결과 초기화 완료');
    }
}

/**
 * 생성된 스크립트 초기화
 */
function resetScript() {
    if (confirm('생성된 매핑 스크립트를 초기화하시겠습니까?')) {
        document.getElementById('scriptResult').innerHTML = '<span class="placeholder-text">// 통합 카탈론 매핑 스크립트가 여기에 생성됩니다\n// \n// === Precondition Scripts ===\n// Precondition 매핑 스크립트가 여기에 표시됩니다\n//\n// === Summary Scripts ===  \n// Summary 매핑 스크립트가 여기에 표시됩니다\n//\n// === Expected Result Scripts ===\n// Expected Result 매핑 스크립트가 여기에 표시됩니다</span>';
        
        // 매핑 상태 초기화
        updateMappingStatus(false);
        
        // 전역 변수 초기화
        window.generatedScript = null;
        
        console.log('매핑 스크립트 초기화 완료');
    }
}

// ================================
// 초기화 및 로드 확인
// ================================

/**
 * 페이지 로드 시 의존성 확인
 */
document.addEventListener('DOMContentLoaded', function() {
    // katalon_mapping_complete.js 로드 확인
    if (typeof KATALON_MAPPING_COMPLETE === 'undefined') {
        console.warn('경고: KATALON_MAPPING_COMPLETE가 정의되지 않았습니다. katalon_mapping_complete.js 파일을 먼저 로드해주세요.');
    } else {
        console.log('✅ katalon_mapping_complete.js 로드 완료. 매핑 데이터:', KATALON_MAPPING_COMPLETE.length, '개');
    }
    
    console.log('✅ testcase_mapper.js 로드 완료');
});