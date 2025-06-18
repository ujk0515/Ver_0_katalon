/**
 * 테스트케이스 매퍼 메인 컨트롤러 (Observer 데이터 통합 + 폴백 제거)
 * 
 * 수정사항:
 * - Observer 300개 매핑 데이터 통합 사용
 * - 하드코딩 폴백 데이터 완전 제거
 * - Complete + Observer 데이터 우선순위 재정립
 */

// ================================
// 하드코딩 폴백 데이터 제거 (기존 FALLBACK_MAPPING_DATA 삭제)
// ================================

// ================================
// 전역 변수 관리
// ================================
window.parsedTestcaseData = null;
window.generatedScript = null;

// ================================
// 통합 매핑 데이터 접근 (Observer 포함)
// ================================

/**
 * 매핑 데이터 가져오기 (모든 매핑 통합)
 */
function getMappingData() {
    console.log('🔍 매핑 데이터 검색 시작...');
    
    let mappingData = [];
    let dataSources = [];
    
    // Complete 데이터 추가
    try {
        if (typeof window !== 'undefined' && window.KATALON_MAPPING_COMPLETE && Array.isArray(window.KATALON_MAPPING_COMPLETE)) {
            mappingData = [...mappingData, ...window.KATALON_MAPPING_COMPLETE];
            dataSources.push(`Complete(${window.KATALON_MAPPING_COMPLETE.length})`);
            console.log('✅ Complete 데이터 추가:', window.KATALON_MAPPING_COMPLETE.length, '개');
        } else if (typeof KATALON_MAPPING_COMPLETE !== 'undefined' && Array.isArray(KATALON_MAPPING_COMPLETE)) {
            mappingData = [...mappingData, ...KATALON_MAPPING_COMPLETE];
            dataSources.push(`Complete(${KATALON_MAPPING_COMPLETE.length})`);
            console.log('✅ 전역 Complete 데이터 추가:', KATALON_MAPPING_COMPLETE.length, '개');
        }
    } catch (e) {
        console.log('⚠️ Complete 데이터 접근 실패:', e.message);
    }
    
    // Observer 데이터 추가
    try {
        if (typeof window !== 'undefined' && window.KATALON_MAPPING_OBSERVER && Array.isArray(window.KATALON_MAPPING_OBSERVER)) {
            mappingData = [...mappingData, ...window.KATALON_MAPPING_OBSERVER];
            dataSources.push(`Observer(${window.KATALON_MAPPING_OBSERVER.length})`);
            console.log('✅ Observer 데이터 추가:', window.KATALON_MAPPING_OBSERVER.length, '개');
        } else if (typeof KATALON_MAPPING_OBSERVER !== 'undefined' && Array.isArray(KATALON_MAPPING_OBSERVER)) {
            mappingData = [...mappingData, ...KATALON_MAPPING_OBSERVER];
            dataSources.push(`Observer(${KATALON_MAPPING_OBSERVER.length})`);
            console.log('✅ 전역 Observer 데이터 추가:', KATALON_MAPPING_OBSERVER.length, '개');
        }
    } catch (e) {
        console.log('⚠️ Observer 데이터 접근 실패:', e.message);
    }
    
    // Observer 조합 데이터 추가
    try {
        if (typeof window !== 'undefined' && window.OBSERVER_COMBINATION_MAPPINGS && Array.isArray(window.OBSERVER_COMBINATION_MAPPINGS)) {
            const observerCombinations = window.OBSERVER_COMBINATION_MAPPINGS.flatMap(pattern => 
                pattern.combinations.map(combo => ({
                    keywords: [combo.result, combo.meaning, ...combo.words],
                    action: combo.action,
                    type: combo.type || "combination",
                    status: "observer_combination_mapped",
                    originalWords: combo.words,
                    combinedResult: combo.result,
                    meaning: combo.meaning
                }))
            );
            mappingData = [...mappingData, ...observerCombinations];
            dataSources.push(`ObserverCombination(${observerCombinations.length})`);
            console.log('✅ Observer 조합 데이터 추가:', observerCombinations.length, '개');
        } else if (typeof OBSERVER_COMBINATION_MAPPINGS !== 'undefined' && Array.isArray(OBSERVER_COMBINATION_MAPPINGS)) {
            const observerCombinations = OBSERVER_COMBINATION_MAPPINGS.flatMap(pattern => 
                pattern.combinations.map(combo => ({
                    keywords: [combo.result, combo.meaning, ...combo.words],
                    action: combo.action,
                    type: combo.type || "combination",
                    status: "observer_combination_mapped",
                    originalWords: combo.words,
                    combinedResult: combo.result,
                    meaning: combo.meaning
                }))
            );
            mappingData = [...mappingData, ...observerCombinations];
            dataSources.push(`ObserverCombination(${observerCombinations.length})`);
            console.log('✅ 전역 Observer 조합 데이터 추가:', observerCombinations.length, '개');
        }
    } catch (e) {
        console.log('⚠️ Observer 조합 데이터 접근 실패:', e.message);
    }
    
    // Complete 조합 데이터 추가 (FINAL_INTEGRATED_MAPPING에서)
    try {
        if (typeof window !== 'undefined' && window.FINAL_INTEGRATED_MAPPING && Array.isArray(window.FINAL_INTEGRATED_MAPPING)) {
            // Complete에는 이미 조합이 포함되어 있으므로 추가 처리 불필요
            console.log('✅ Complete 조합은 FINAL_INTEGRATED_MAPPING에 포함됨');
        }
    } catch (e) {
        console.log('⚠️ Complete 조합 데이터 접근 실패:', e.message);
    }
    
    // 결과 확인
    if (mappingData.length > 0) {
        console.log(`🎯 총 통합 매핑 데이터: ${mappingData.length}개`);
        console.log(`📊 데이터 출처: ${dataSources.join(' + ')}`);
        
        // window에 통합 데이터 캐시 저장
        if (typeof window !== 'undefined') {
            window.CURRENT_MAPPING_DATA = mappingData;
            window.MAPPING_SOURCES = dataSources;
        }
        
        return mappingData;
    }
    
    // 매핑 데이터가 전혀 없으면 에러
    console.error('❌ 사용 가능한 매핑 데이터가 없습니다!');
    console.error('필요한 파일들:');
    console.error('- katalon_mapping_complete.js (Complete 379개)');
    console.error('- katalon_mapping_observer.js (Observer 300개)');
    
    return [];
}

/**
 * 매핑 데이터 존재 확인 (엄격한 검증)
 */
function checkMappingData() {
    console.log('🔍 매핑 데이터 유효성 검사...');
    
    const mappingData = getMappingData();
    
    if (!mappingData || mappingData.length === 0) {
        console.error('❌ 매핑 데이터 없음 - 스크립트 생성 불가능');
        return false;
    }
    
    // 데이터 품질 검사
    const validMappings = mappingData.filter(m => 
        m && 
        m.keywords && 
        Array.isArray(m.keywords) && 
        m.keywords.length > 0 &&
        m.action && 
        typeof m.action === 'string'
    );
    
    console.log(`✅ 유효한 매핑: ${validMappings.length}/${mappingData.length}개`);
    
    if (validMappings.length === 0) {
        console.error('❌ 유효한 매핑 데이터가 없습니다');
        return false;
    }
    
    // 통계 출력
    const typeStats = {};
    validMappings.forEach(m => {
        const type = m.type || 'unknown';
        typeStats[type] = (typeStats[type] || 0) + 1;
    });
    
    console.log('📊 매핑 타입별 분포:', typeStats);
    console.log('🔄 매핑 소스:', window.MAPPING_SOURCES || 'Unknown');
    
    return true;
}

// ================================
// 메인 워크플로우 제어
// ================================

/**
 * 테스트케이스 데이터 추출 메인 함수
 */
function extractTestcaseData() {
    const input = document.getElementById('testcaseInput').value.trim();
    console.log('📝 입력된 텍스트:', input);
    
    if (!input) {
        alert('테스트케이스 내용을 입력해주세요.');
        return;
    }
    
    try {
        const parsedData = parseTestcase(input);
        console.log('✅ 파싱된 데이터:', parsedData);
        
        displayParsedData(parsedData);
        window.parsedTestcaseData = parsedData;
        
        // 스크립트 전환 버튼 활성화
        const convertBtn = document.getElementById('convertBtn');
        if (convertBtn) {
            convertBtn.disabled = false;
        }
        
        console.log('🎉 파싱 완료');
        
    } catch (error) {
        console.error('❌ 파싱 오류:', error);
        alert('파싱 중 오류가 발생했습니다: ' + error.message);
    }
}

/**
 * 매핑 스크립트 생성 메인 함수 (엄격한 검증 추가)
 */
function generateMappingScript() {
    console.log('🚀 매핑 스크립트 생성 시작 (Steps 포함)...');
    
    if (!window.parsedTestcaseData) {
        alert('먼저 테스트케이스 데이터를 추출해주세요.');
        return;
    }
    
    if (!checkMappingData()) {
        alert('❌ 매핑 데이터를 로드할 수 없습니다!\n\n필요한 파일들을 확인해주세요:\n- katalon_mapping_complete.js\n- katalon_mapping_observer.js');
        return;
    }
    
    try {
        const data = window.parsedTestcaseData;
        
        console.log('📋 처리할 데이터 (Steps 포함):', {
            summary: data.summary ? '✅' : '❌',
            precondition: data.precondition?.length || 0,
            steps: data.steps?.length || 0, // ✅ Steps 확인 추가
            expectedResult: data.expectedResult ? '✅' : '❌'
        });
        
        // ✅ Steps 스크립트 생성 추가
        const preconditionScript = generateSectionScript('Precondition', data.precondition);
        const summaryScript = generateSectionScript('Summary', [data.summary]);
        const stepsScript = generateStepsScript(data.steps); // ✅ Steps 전용 함수 사용
        const expectedResultScript = generateSectionScript('Expected Result', [data.expectedResult]);
        
        // ✅ Steps 포함하여 통합 스크립트 생성
        const fullScript = createIntegratedScriptWithSteps(preconditionScript, summaryScript, stepsScript, expectedResultScript);
        
        // UI에 스크립트 표시
        displayMappingScript(fullScript);
        updateMappingStatus(true);
        
        console.log('🎉 매핑 스크립트 생성 완료 (Steps 포함)');
        console.log('📊 사용된 매핑 데이터:', window.CURRENT_MAPPING_DATA?.length || 0, '개');
        
    } catch (error) {
        console.error('❌ 매핑 스크립트 생성 오류:', error);
        alert('매핑 스크립트 생성 중 오류가 발생했습니다: ' + error.message);
    }
}

// ================================
// 파싱 기능
// ================================

/**
 * 테스트케이스 텍스트 파싱
 */
// testcase_mapper_main.js 파일에서 parseTestcase 함수만 교체하세요

/**
 * 테스트케이스 텍스트 파싱 (Steps 추가)
 */
function parseTestcase(text) {
    console.log('🔍 파싱 시작, 입력 텍스트:', text);
    
    const result = {
        summary: '',
        precondition: [],
        steps: [], // ✅ Steps 필드 추가
        expectedResult: ''
    };
    
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentSection = null;
    let preconditionBuffer = [];
    let stepsBuffer = []; // ✅ Steps 버퍼 추가
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
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
        
        // ✅ Steps 섹션 파싱 추가
        if (line.toLowerCase().includes('steps')) {
            currentSection = 'steps';
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
                const stepsText = line.substring(colonIndex + 1).trim();
                if (stepsText) {
                    stepsBuffer.push(stepsText);
                }
            }
            console.log('✅ Steps 섹션 시작');
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
            preconditionBuffer.push(line);
            console.log('Precondition에 추가:', line);
        } else if (currentSection === 'steps') { // ✅ Steps 처리 추가
            stepsBuffer.push(line);
            console.log('✅ Steps에 추가:', line);
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
    result.steps = stepsBuffer; // ✅ Steps 결과 설정
    console.log('✅ 최종 파싱 결과 (Steps 포함):', result);
    return result;
}

/**
 * 파싱된 데이터를 화면에 표시
 */
// testcase_mapper_main.js 파일에서 displayParsedData 함수도 교체하세요

/**
 * 파싱된 데이터를 화면에 표시 (Steps 추가)
 */
function displayParsedData(data) {
    console.log('displayParsedData 호출됨 (Steps 포함):', data);
    
    const summaryElement = document.getElementById('summaryResult');
    const preconditionElement = document.getElementById('preconditionResult');
    const stepsElement = document.getElementById('stepsResult'); // ✅ Steps 요소 추가
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
    
    // ✅ Steps 표시 로직 추가
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

/**
 * 텍스트에서 키워드 추출
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
// 매핑 기능 (Observer 데이터 통합)
// ================================

/**
 * 섹션별 스크립트 생성
 */
function generateSectionScript(sectionName, textArray) {
    if (!textArray || textArray.length === 0) {
        return `// === ${sectionName} Scripts ===\n// No content found for ${sectionName}\n\n`;
    }
    
    let script = `// === ${sectionName} Scripts ===\n`;
    
    textArray.forEach((text, index) => {
        if (!text || text.trim() === '') return;
        
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
 * 키워드에 대한 매핑 찾기 (Observer + Complete 통합 검색)
 */
function findMappingsForKeywords(keywords) {
    const mappingData = getMappingData(); // 통합 매핑 데이터 사용
    
    if (!mappingData || !Array.isArray(mappingData) || mappingData.length === 0) {
        console.warn('⚠️ 매핑 데이터를 사용할 수 없습니다.');
        return [];
    }
    
    console.log(`🔍 키워드 검색: [${keywords.join(', ')}]`);
    console.log(`📊 검색 대상 매핑: ${mappingData.length}개`);
    
    const foundMappings = [];
    const usedActions = new Set();
    
    keywords.forEach(keyword => {
        const mapping = mappingData.find(m => 
            m.keywords && Array.isArray(m.keywords) && m.keywords.some(k => 
                typeof k === 'string' && (
                    k.includes(keyword.toLowerCase()) || 
                    keyword.toLowerCase().includes(k)
                )
            )
        );
        
        if (mapping && !usedActions.has(mapping.action)) {
            foundMappings.push(mapping);
            usedActions.add(mapping.action);
            console.log(`🎯 매핑 발견: "${keyword}" → ${mapping.action} (${mapping.status || mapping.type})`);
        }
    });
    
    console.log(`📊 매핑 결과: ${foundMappings.length}개 발견`);
    return foundMappings;
}

/**
 * 카탈론 스크립트 생성 (확장된 버전)
 */
function generateKatalonScript(mapping, originalText) {
    const action = mapping.action;
    const type = mapping.type;
    
    let script = '';
    
    switch (type) {
        case 'action':
            if (action === 'Click') {
                script += `WebUI.click(findTestObject('Object Repository/Page_/btn_element'))\n`;
            } else if (action === 'Navigate To Url') {
                script += `WebUI.navigateToUrl('https://example.com')\n`;
            } else if (action === 'Upload File') {
                script += `WebUI.uploadFile(findTestObject('Object Repository/Page_/input_file'), '/path/to/file')\n`;
            } else if (action === 'Scroll To Element') {
                script += `WebUI.scrollToElement(findTestObject('Object Repository/Page_/element'), 5)\n`;
            } else if (action === 'Mouse Over') {
                script += `WebUI.mouseOver(findTestObject('Object Repository/Page_/element'))\n`;
            } else if (action === 'Tap') {
                script += `Mobile.tap(findTestObject('Object Repository/Page_/element'), 5)\n`;
            } else if (action === 'Drag And Drop') {
                script += `WebUI.dragAndDropToObject(findTestObject('Object Repository/Page_/source'), findTestObject('Object Repository/Page_/target'))\n`;
            } else {
                script += `WebUI.click(findTestObject('Object Repository/Page_/element')) // ${action}\n`;
            }
            break;
            
        case 'input':
            if (action === 'Set Text') {
                script += `WebUI.setText(findTestObject('Object Repository/Page_/input_text'), 'test_value')\n`;
            } else {
                script += `WebUI.setText(findTestObject('Object Repository/Page_/input_element'), 'value') // ${action}\n`;
            }
            break;
            
        case 'verification':
            if (action === 'Verify Element Present') {
                script += `WebUI.verifyElementPresent(findTestObject('Object Repository/Page_/element'), 5)\n`;
            } else if (action === 'Verify Element Visible') {
                script += `WebUI.verifyElementVisible(findTestObject('Object Repository/Page_/element'))\n`;
            } else if (action === 'Verify Element Text') {
                script += `WebUI.verifyElementText(findTestObject('Object Repository/Page_/element'), 'expected_text')\n`;
            } else if (action === 'Get Text') {
                script += `String actualText = WebUI.getText(findTestObject('Object Repository/Page_/element'))\n`;
            } else {
                script += `WebUI.verifyElementPresent(findTestObject('Object Repository/Page_/element'), 5) // ${action}\n`;
            }
            break;
            
        case 'selection':
            script += `WebUI.selectOptionByLabel(findTestObject('Object Repository/Page_/select_element'), 'option_value', false)\n`;
            break;
            
        case 'wait':
            if (action === 'Delay') {
                script += `WebUI.delay(2) // Wait 2 seconds\n`;
            } else {
                script += `WebUI.waitForElementPresent(findTestObject('Object Repository/Page_/element'), 10)\n`;
            }
            break;
            
        case 'alert':
            script += `WebUI.acceptAlert()\n`;
            break;
            
        case 'navigation':
            if (action === 'Switch To Window') {
                script += `WebUI.switchToWindowTitle('Window Title')\n`;
            } else if (action === 'Back') {
                script += `WebUI.back()\n`;
            } else if (action === 'Forward') {
                script += `WebUI.forward()\n`;
            } else if (action === 'Refresh') {
                script += `WebUI.refresh()\n`;
            } else {
                script += `WebUI.navigateToUrl('https://example.com') // ${action}\n`;
            }
            break;
            
        case 'combination':
        case 'observer_mapped':
        case 'observer_combination_mapped':
            // Observer 시리즈 특수 처리
            script += generateObserverScript(action, mapping, originalText);
            break;
            
        default:
            script += `// ${action} - Implementation needed (${type})\n`;
    }
    
    return script;
}

/**
 * Observer 시리즈 전용 스크립트 생성
 */
function generateObserverScript(action, mapping, originalText) {
    let script = '';
    
    switch (action) {
        case 'If Element Present Then Click':
            script += `if (WebUI.verifyElementPresent(findTestObject('Object Repository/Page_/element'), 2, FailureHandling.OPTIONAL)) {\n`;
            script += `    WebUI.click(findTestObject('Object Repository/Page_/element'))\n`;
            script += `}\n`;
            break;
            
        case 'Execute JavaScript':
            script += `WebUI.executeJavaScript('/* Custom JavaScript for: ${originalText.substring(0, 30)}... */', null)\n`;
            break;
            
        case 'Batch Process':
            script += `// Batch processing for multiple elements\n`;
            script += `def elements = WebUI.findTestObjects('Object Repository/Page_/batch_elements')\n`;
            script += `elements.each { element -> WebUI.click(element) }\n`;
            break;
            
        case 'Measure Performance':
            script += `long startTime = System.currentTimeMillis()\n`;
            script += `// Perform action here\n`;
            script += `long endTime = System.currentTimeMillis()\n`;
            script += `println("Performance: " + (endTime - startTime) + "ms")\n`;
            break;
            
        default:
            script += `// Observer action: ${action}\n`;
            script += `WebUI.comment("Observer mapping: ${mapping.meaning || action}")\n`;
    }
    
    return script;
}

/**
 * 통합 스크립트 생성
 */
function createIntegratedScript(preconditionScript, summaryScript, expectedResultScript) {
    const header = `// ========================================\n// Katalon Mapping Script Generated\n// Generated at: ${new Date().toLocaleString()}\n// Mapping Sources: ${window.MAPPING_SOURCES?.join(' + ') || 'Unknown'}\n// Total Mappings: ${window.CURRENT_MAPPING_DATA?.length || 0}\n// ========================================\n\n`;
    
    return header + preconditionScript + summaryScript + expectedResultScript;
}

/**
 * 매핑 스크립트를 화면에 표시
 */
// testcase_mapper_main.js 파일에서 displayMappingScript 함수를 찾아서 이것으로 교체

/**
 * 매핑 스크립트를 스타일링하여 화면에 표시 (색상 구분)
 * @param {string} script - 표시할 스크립트
 */
function displayMappingScript(script) {
    const scriptElement = document.getElementById('scriptResult');
    if (!scriptElement) {
        console.error('scriptResult 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 스크립트를 라인별로 분리
    const lines = script.split('\n');
    let styledHTML = '';
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // HTML 이스케이프 처리
        const escapedLine = line
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // 1. No mapping found 라인 - 빨간색
        if (trimmedLine.includes('TODO: No mapping found') || trimmedLine.includes('No mapping found')) {
            styledHTML += `<span class="no-mapping-line">${escapedLine}</span>\n`;
        }
        // 2. Keywords extracted 라인 - 주황색
        else if (trimmedLine.includes('Keywords extracted:')) {
            styledHTML += `<span class="keywords-line">${escapedLine}</span>\n`;
        }
        // 3. WebUI 매핑 코드 라인 - 볼드 검은색
        else if (trimmedLine.startsWith('WebUI.') || trimmedLine.startsWith('String ') || trimmedLine.includes('findTestObject')) {
            styledHTML += `<span class="mapped-code-line">${escapedLine}</span>\n`;
        }
        // 4. Action detected 라인 - 녹색
        else if (trimmedLine.includes('Action detected:') || trimmedLine.includes('General mapping found:')) {
            styledHTML += `<span class="action-detected-line">${escapedLine}</span>\n`;
        }
        // 5. 섹션 헤더 라인 - 파란색
        else if (trimmedLine.includes('=== ') && trimmedLine.includes(' Scripts ===')) {
            styledHTML += `<span class="section-header-line">${escapedLine}</span>\n`;
        }
        // 6. 일반 주석 라인 - 회색
        else if (trimmedLine.startsWith('//')) {
            styledHTML += `<span class="comment-line">${escapedLine}</span>\n`;
        }
        // 7. 기타 라인 - 기본 색상
        else {
            styledHTML += `<span class="default-line">${escapedLine}</span>\n`;
        }
    });
    
    // HTML로 설정
    scriptElement.innerHTML = styledHTML;
    window.generatedScript = script; // 원본 스크립트는 복사용으로 보관
    
    console.log('✅ 스타일링된 스크립트 표시 완료');
}

/**
 * 매핑 상태 업데이트
 */
function updateMappingStatus(hasMappings) {
    const indicator = document.getElementById('mappingIndicator');
    if (indicator) {
        if (hasMappings) {
            indicator.classList.remove('no-mapping');
        } else {
            indicator.classList.add('no-mapping');
        }
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
        if (copyBtn) {
            const originalText = copyBtn.textContent;
            copyBtn.textContent = '✅ 복사됨';
            copyBtn.style.background = '#10b981';
            
            setTimeout(() => {
                copyBtn.textContent = originalText;
                copyBtn.style.background = '#6366f1';
            }, 2000);
        }
        console.log('✅ 스크립트 복사 완료');
    }).catch(err => {
        console.error('복사 실패:', err);
        alert('복사에 실패했습니다. 수동으로 복사해주세요.');
    });
}

/**
 * 입력 영역 초기화
 */
function resetInput() {
    if (confirm('입력된 테스트케이스를 초기화하시겠습니까?')) {
        const inputElement = document.getElementById('testcaseInput');
        if (inputElement) {
            inputElement.value = '';
        }
        console.log('✅ 입력 영역 초기화 완료');
    }
}

/**
 * 파싱 결과 초기화
 */
function resetParsing() {
    if (confirm('파싱 결과를 초기화하시겠습니까?')) {
        const summaryElement = document.getElementById('summaryResult');
        const preconditionElement = document.getElementById('preconditionResult');
        const expectedElement = document.getElementById('expectedResult');
        
        if (summaryElement) {
            summaryElement.innerHTML = '<span class="placeholder-text">추출된 Summary가 여기에 표시됩니다</span>';
        }
        if (preconditionElement) {
            preconditionElement.innerHTML = '<span class="placeholder-text">추출된 Precondition이 여기에 표시됩니다</span>';
        }
        if (expectedElement) {
            expectedElement.innerHTML = '<span class="placeholder-text">추출된 Expected Result가 여기에 표시됩니다</span>';
        }
        
        // 스크립트 전환 버튼 비활성화
        const convertBtn = document.getElementById('convertBtn');
        if (convertBtn) {
            convertBtn.disabled = true;
        }
        
        // 전역 변수 초기화
        window.parsedTestcaseData = null;
        
        console.log('✅ 파싱 결과 초기화 완료');
    }
}

/**
 * 생성된 스크립트 초기화
 */
function resetScript() {
    if (confirm('생성된 매핑 스크립트를 초기화하시겠습니까?')) {
        const scriptElement = document.getElementById('scriptResult');
        if (scriptElement) {
            scriptElement.innerHTML = '<span class="placeholder-text">// 통합 카탈론 매핑 스크립트가 여기에 생성됩니다</span>';
        }
        
        // 매핑 상태 초기화
        updateMappingStatus(false);
        
        // 전역 변수 초기화
        window.generatedScript = null;
        
        console.log('✅ 매핑 스크립트 초기화 완료');
    }
}

// ================================
// 전역 함수 노출 (HTML에서 호출용)
// ================================

// HTML에서 직접 호출할 수 있도록 전역 함수로 노출
window.extractTestcaseData = extractTestcaseData;
window.generateMappingScript = generateMappingScript;
window.copyScript = copyScript;
window.resetInput = resetInput;
window.resetParsing = resetParsing;
window.resetScript = resetScript;

// ================================
// 초기화
// ================================

/**
 * 시스템 초기화 (매핑 데이터 검증 포함)
 */
function initializeSystem() {
    console.log('🚀 테스트케이스 매퍼 시스템 초기화...');
    
    // 매핑 데이터 사전 검증
    const mappingCheck = checkMappingData();
    
    if (mappingCheck) {
        console.log('✅ 시스템 초기화 성공');
        console.log(`📊 로드된 매핑: ${window.CURRENT_MAPPING_DATA?.length || 0}개`);
        console.log(`🔄 데이터 출처: ${window.MAPPING_SOURCES?.join(' + ') || 'Unknown'}`);
        
        // Observer 데이터가 포함되었는지 확인
        const hasObserver = window.MAPPING_SOURCES?.some(source => source.includes('Observer'));
        const hasComplete = window.MAPPING_SOURCES?.some(source => source.includes('Complete'));
        
        console.log(`🎯 Complete 시리즈: ${hasComplete ? '✅' : '❌'}`);
        console.log(`🎯 Observer 시리즈: ${hasObserver ? '✅' : '❌'}`);
        
        if (hasObserver && hasComplete) {
            console.log('🎉 Complete + Observer 통합 매핑 활성화!');
        } else if (hasComplete) {
            console.log('⚠️ Complete 매핑만 활성화됨 (Observer 누락)');
        } else if (hasObserver) {
            console.log('⚠️ Observer 매핑만 활성화됨 (Complete 누락)');
        }
        
        return true;
    } else {
        console.error('❌ 시스템 초기화 실패 - 매핑 데이터 없음');
        console.error('필요한 스크립트 파일들을 확인해주세요:');
        console.error('- katalon_mapping_complete.js');
        console.error('- katalon_mapping_observer.js');
        return false;
    }
}

/**
 * DOM 로드 완료 시 실행
 */
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const success = initializeSystem();
        
        if (success) {
            console.log('🎉 테스트케이스 매퍼가 준비되었습니다!');
            
            // 매핑 데이터 통계를 UI에 표시 (선택적)
            const statsMessage = `매핑 데이터: ${window.CURRENT_MAPPING_DATA?.length || 0}개 로드됨`;
            console.log(`📊 ${statsMessage}`);
            
        } else {
            console.error('❌ 테스트케이스 매퍼 초기화 실패');
            
            // 사용자에게 알림 (선택적)
            const warningDiv = document.createElement('div');
            warningDiv.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #fef2f2;
                border: 1px solid #fecaca;
                color: #dc2626;
                padding: 12px;
                border-radius: 6px;
                z-index: 1000;
                max-width: 300px;
                font-size: 14px;
            `;
            warningDiv.innerHTML = `
                ⚠️ 매핑 데이터 로드 실패<br>
                <small>katalon_mapping_*.js 파일들을 확인해주세요</small>
            `;
            document.body.appendChild(warningDiv);
            
            // 5초 후 자동 제거
            setTimeout(() => {
                if (warningDiv.parentNode) {
                    warningDiv.parentNode.removeChild(warningDiv);
                }
            }, 5000);
        }
    }, 100);
});

console.log('✅ testcase_mapper_main.js (Observer 통합 버전) 로드 완료');

// ================================
// Steps 전용 매핑 함수들 (새로 추가)
// ================================

/**
 * Steps 전용 액션 매핑 검색
 */
function findStepsActionMapping(stepText) {
    const text = stepText.toLowerCase();
    
    const actionMappings = [
        { keywords: ['클릭', 'click', '버튼'], action: 'Click', element: 'button' },
        { keywords: ['입력', 'input', 'type'], action: 'Set Text', element: 'input' },
        { keywords: ['선택', 'select', '드롭다운'], action: 'Select Option By Label', element: 'select' },
        { keywords: ['체크', 'check'], action: 'Check', element: 'checkbox' },
        { keywords: ['이동', 'navigate', '페이지'], action: 'Navigate To Url', element: 'page' },
        { keywords: ['스크롤', 'scroll'], action: 'Scroll To Element', element: 'element' },
        { keywords: ['확인', 'verify', '검증'], action: 'Verify Element Present', element: 'element' },
        { keywords: ['대기', 'wait'], action: 'Wait For Element Present', element: 'element' }
    ];
    
    for (const mapping of actionMappings) {
        if (mapping.keywords.some(keyword => text.includes(keyword))) {
            console.log(`🎯 Steps 액션 매핑 발견: "${stepText}" → ${mapping.action}`);
            return mapping;
        }
    }
    
    return null;
}

/**
 * Steps 전용 스크립트 생성
 */
function generateStepsActionScript(actionMapping, stepText) {
    const { action, element } = actionMapping;
    
    switch (action) {
        case 'Click':
            return `WebUI.click(findTestObject('Object Repository/Page_/${element}_element'))\n`;
        case 'Set Text':
            return `WebUI.setText(findTestObject('Object Repository/Page_/${element}_field'), 'input_value')\n`;
        case 'Select Option By Label':
            return `WebUI.selectOptionByLabel(findTestObject('Object Repository/Page_/${element}_dropdown'), 'option_value', false)\n`;
        case 'Check':
            return `WebUI.check(findTestObject('Object Repository/Page_/${element}_element'))\n`;
        case 'Navigate To Url':
            return `WebUI.navigateToUrl('https://example.com/target-page')\n`;
        case 'Scroll To Element':
            return `WebUI.scrollToElement(findTestObject('Object Repository/Page_/${element}_element'), 5)\n`;
        case 'Verify Element Present':
            return `WebUI.verifyElementPresent(findTestObject('Object Repository/Page_/${element}_element'), 5)\n`;
        case 'Wait For Element Present':
            return `WebUI.waitForElementPresent(findTestObject('Object Repository/Page_/${element}_element'), 10)\n`;
        default:
            return `WebUI.comment("Step action: ${action}")\n`;
    }
}

/**
 * Steps 전용 스크립트 생성 (혼합 방식)
 */
function generateStepsScript(stepsArray) {
    if (!stepsArray || stepsArray.length === 0) {
        return `// === Steps Scripts ===\n// No steps found\n\n`;
    }
    
    let script = `// === Steps Scripts ===\n`;
    script += `// Generated ${stepsArray.length} step actions\n\n`;
    
    stepsArray.forEach((step, index) => {
        if (!step || step.trim() === '') return;
        
        const commentedText = step.split('\n').map(line => `// Step ${index + 1}: ${line.trim()}`).join('\n');
        script += `${commentedText}\n`;
        
        // 1순위: Steps 전용 액션 매핑 시도
        const actionMapping = findStepsActionMapping(step);
        
        if (actionMapping) {
            script += `// Action detected: ${actionMapping.action}\n`;
            script += generateStepsActionScript(actionMapping, step);
        } else {
            // 2순위: 일반 키워드 매핑 시도
            const keywords = extractKeywords(step);
            const mappings = findMappingsForKeywords(keywords);
            
            if (mappings.length > 0) {
                script += `// General mapping found: ${mappings[0].action}\n`;
                script += generateKatalonScript(mappings[0], step);
            } else {
                // 3순위: 기본 주석 처리
                script += `// No specific mapping found - treating as comment\n`;
                script += `WebUI.comment("Step ${index + 1}: ${step}")\n`;
            }
        }
        script += '\n';
    });
    
    return script;
}

/**
 * 통합 스크립트 생성 (Steps 포함)
 */
function createIntegratedScriptWithSteps(preconditionScript, summaryScript, stepsScript, expectedResultScript) {
    const header = `// ========================================\n// Katalon Mapping Script Generated (Steps 포함)\n// Generated at: ${new Date().toLocaleString()}\n// Mapping Sources: ${window.MAPPING_SOURCES?.join(' + ') || 'Unknown'}\n// Total Mappings: ${window.CURRENT_MAPPING_DATA?.length || 0}\n// ========================================\n\n`;
    
    return header + preconditionScript + summaryScript + stepsScript + expectedResultScript;
}