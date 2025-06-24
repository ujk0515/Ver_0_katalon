/**
 * 테스트케이스 매퍼 메인 컨트롤러 (통합 시스템 적용)
 * 
 * 주요 변경사항:
 * - 모든 매핑 검색을 unifiedMappingSystem.findMapping()으로 통일
 * - 성능 최적화 및 일관성 향상
 * - 전체 테스트케이스 분석 기능 추가
 * 
 * 수정일: 2025년 6월 24일
 */

// ================================
// 전역 변수 관리
// ================================
window.parsedTestcaseData = null;
window.generatedScript = null;
window.mappingQualityReport = null;

// ================================
// 메인 워크플로우 제어 (통합 시스템 적용)
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
        // 기존 파싱 함수 사용 (호환성 유지)
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
 * 통합 매핑 스크립트 생성 메인 함수
 */
function generateMappingScriptWithUnifiedSystem() {
    console.log('🚀 통합 매핑 시스템으로 스크립트 생성 시작...');
    
    if (!window.parsedTestcaseData) {
        alert('먼저 테스트케이스 데이터를 추출해주세요.');
        return;
    }
    
    if (!checkUnifiedSystemAvailability()) {
        alert('❌ 통합 매핑 시스템을 사용할 수 없습니다!\n\n필요한 파일들을 확인해주세요:\n- unified_mapping_system.js\n- korean_combination_engine.js\n- katalon_mapping_complete.js\n- katalon_mapping_observer.js');
        return;
    }
    
    try {
        const data = window.parsedTestcaseData;
        
        console.log('📋 처리할 데이터:', {
            summary: data.summary ? '✅' : '❌',
            precondition: data.precondition?.length || 0,
            steps: data.steps?.length || 0,
            expectedResult: data.expectedResult ? '✅' : '❌'
        });
        
        // 전체 테스트케이스 분석 (통합 시스템 활용)
        const fullAnalysis = analyzeFullTestCase(data);
        
        // 섹션별 스마트 스크립트 생성
        const preconditionScript = generateUnifiedSectionScript('Precondition', data.precondition);
        const summaryScript = generateUnifiedSectionScript('Summary', [data.summary]);
        const stepsScript = generateUnifiedSectionScript('Steps', data.steps);
        const expectedResultScript = generateUnifiedSectionScript('Expected Result', [data.expectedResult]);
        
        // 통합 스크립트 생성
        const fullScript = createIntegratedScriptWithUnifiedSystem(
            preconditionScript, 
            summaryScript, 
            stepsScript, 
            expectedResultScript,
            fullAnalysis
        );
        
        // 매핑 품질 분석
        const qualityReport = generateQualityReport(fullAnalysis);
        window.mappingQualityReport = qualityReport;
        
        // UI에 스크립트 표시
        displayUnifiedMappingScript(fullScript, qualityReport);
        updateMappingStatus(true);
        
        console.log('🎉 통합 매핑 스크립트 생성 완료');
        console.log('📊 매핑 품질 리포트:', qualityReport);
        
    } catch (error) {
        console.error('❌ 매핑 스크립트 생성 오류:', error);
        alert('매핑 스크립트 생성 중 오류가 발생했습니다: ' + error.message);
    }
}

/**
 * 전체 테스트케이스 분석 (통합 시스템 활용)
 * @param {object} testcaseData - 테스트케이스 데이터
 * @returns {object} 분석 결과
 */
function analyzeFullTestCase(testcaseData) {
    if (!unifiedMappingSystem || !unifiedMappingSystem.isInitialized) {
        console.warn('⚠️ 통합 매핑 시스템이 초기화되지 않았습니다. 기본 분석 모드로 진행합니다.');
        return generateBasicAnalysis(testcaseData);
    }
    
    // 통합 시스템의 analyzeTestCase 기능 활용
    const fullText = buildFullTestCaseText(testcaseData);
    const analysis = unifiedMappingSystem.analyzeTestCase(fullText);
    
    console.log('🔍 통합 시스템 분석 완료:', analysis);
    return analysis;
}

/**
 * 전체 테스트케이스 텍스트 구성
 * @param {object} data - 테스트케이스 데이터
 * @returns {string} 구성된 텍스트
 */
function buildFullTestCaseText(data) {
    let fullText = '';
    
    if (data.summary) {
        fullText += `Summary: ${data.summary}\n`;
    }
    
    if (data.precondition && data.precondition.length > 0) {
        fullText += `Precondition:\n`;
        data.precondition.forEach((item, index) => {
            fullText += `${index + 1}. ${item}\n`;
        });
    }
    
    if (data.steps && data.steps.length > 0) {
        fullText += `Steps:\n`;
        data.steps.forEach((item, index) => {
            fullText += `${index + 1}. ${item}\n`;
        });
    }
    
    if (data.expectedResult) {
        fullText += `Expected Result: ${data.expectedResult}\n`;
    }
    
    return fullText;
}

/**
 * 통합 시스템 기반 섹션별 스크립트 생성
 * @param {string} sectionName - 섹션 이름
 * @param {array} textArray - 텍스트 배열
 * @returns {string} 생성된 스크립트
 */
function generateUnifiedSectionScript(sectionName, textArray) {
    if (!textArray || textArray.length === 0) {
        return `// === ${sectionName} Scripts ===\n// No content found for ${sectionName}\n\n`;
    }
    
    let script = `// === ${sectionName} Scripts (Unified System) ===\n`;
    let sectionMappings = [];
    
    textArray.forEach((text, index) => {
        if (!text || text.trim() === '') return;
        
        // 다중 라인 텍스트를 주석으로 처리
        const commentedText = text.split('\n').map(line => `// ${sectionName} ${index + 1}: ${line.trim()}`).join('\n');
        script += `${commentedText}\n`;
        
        // 통합 시스템으로 매핑 검색
        const mappingResult = unifiedMappingSystem.findMapping(text);
        
        if (mappingResult.found) {
            sectionMappings.push(mappingResult);
            
            // Groovy 코드가 이미 생성된 경우 사용
            if (mappingResult.groovyCode) {
                script += mappingResult.groovyCode + '\n';
            } else {
                // 기본 스크립트 생성
                script += generateDefaultGroovyScript(mappingResult.action, text);
            }
            
            console.log(`🎯 [${sectionName}] 매핑 성공: "${text}" → ${mappingResult.action} (${mappingResult.source})`);
        } else {
            script += `// TODO: No mapping found for: "${text.replace(/\n/g, ' ')}"\n`;
            
            // 제안사항이 있으면 추가
            if (mappingResult.suggestions && mappingResult.suggestions.length > 0) {
                script += `// Suggestions: ${mappingResult.suggestions.slice(0, 3).map(s => s.keyword).join(', ')}\n`;
            }
            
            console.log(`❌ [${sectionName}] 매핑 실패: "${text}"`);
        }
        
        script += '\n';
    });
    
    // 섹션 요약 정보 추가
    const uniqueActions = [...new Set(sectionMappings.map(m => m.action))];
    if (uniqueActions.length > 0) {
        script += `// Section Summary: ${uniqueActions.length} unique actions (${sectionMappings.map(m => m.source).join(', ')})\n\n`;
    }
    
    return script;
}

/**
 * 기본 Groovy 스크립트 생성
 * @param {string} action - Katalon 액션
 * @param {string} originalText - 원본 텍스트
 * @returns {string} 생성된 Groovy 코드
 */
function generateDefaultGroovyScript(action, originalText) {
    const objectName = generateObjectName(originalText);
    
    const templates = {
        'Click': `WebUI.click(findTestObject('Object Repository/${objectName}'))`,
        'Set Text': `WebUI.setText(findTestObject('Object Repository/${objectName}'), 'input_value')`,
        'Get Text': `def result = WebUI.getText(findTestObject('Object Repository/${objectName}'))`,
        'Verify Element Present': `WebUI.verifyElementPresent(findTestObject('Object Repository/${objectName}'), 10)`,
        'Verify Element Visible': `WebUI.verifyElementVisible(findTestObject('Object Repository/${objectName}'))`,
        'Upload File': `WebUI.uploadFile(findTestObject('Object Repository/${objectName}'), '/path/to/file')`,
        'Drag And Drop': `WebUI.dragAndDropToObject(findTestObject('Object Repository/${objectName}_source'), findTestObject('Object Repository/${objectName}_target'))`,
        'Select Option By Label': `WebUI.selectOptionByLabel(findTestObject('Object Repository/${objectName}'), 'option_value', false)`
    };
    
    return (templates[action] || `WebUI.comment("${action} - ${originalText}")`) + '\n';
}

/**
 * 오브젝트 이름 생성
 * @param {string} text - 원본 텍스트
 * @returns {string} 오브젝트 이름
 */
function generateObjectName(text) {
    return text.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_가-힣]/g, '').substring(0, 30) + '_element';
}

/**
 * 통합 스크립트 생성 (분석 정보 포함)
 * @param {string} preconditionScript - Precondition 스크립트
 * @param {string} summaryScript - Summary 스크립트  
 * @param {string} stepsScript - Steps 스크립트
 * @param {string} expectedResultScript - Expected Result 스크립트
 * @param {object} analysis - 분석 결과
 * @returns {string} 통합 스크립트
 */
function createIntegratedScriptWithUnifiedSystem(preconditionScript, summaryScript, stepsScript, expectedResultScript, analysis) {
    const timestamp = new Date().toLocaleString();
    const systemStats = unifiedMappingSystem ? unifiedMappingSystem.getStatistics() : {};
    
    const header = `// ========================================
// Katalon Mapping Script (Unified System)
// Generated at: ${timestamp}
// Unified Mapping System: ${unifiedMappingSystem ? 'Active' : 'Inactive'}
// Overall Mapping Rate: ${analysis.overallMappingRate || 0}%
// Total Mappings Available: ${systemStats.overallMappingCapacity || 'Unknown'}
// ========================================

`;
    
    const testCaseStart = `@Test
def testCase() {
    try {
        // Test case execution with Unified Mapping System
        
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
 * 품질 리포트 생성
 * @param {object} analysis - 분석 결과
 * @returns {object} 품질 리포트
 */
function generateQualityReport(analysis) {
    const report = {
        overallMappingRate: analysis.overallMappingRate || 0,
        systemStatus: unifiedMappingSystem ? 'active' : 'inactive',
        recommendations: analysis.recommendations || [],
        statistics: unifiedMappingSystem ? unifiedMappingSystem.getStatistics() : {},
        sectionBreakdown: {
            preconditions: analysis.preconditions ? analysis.preconditions.length : 0,
            steps: analysis.steps ? analysis.steps.length : 0,
            expectedResults: analysis.expectedResults ? analysis.expectedResults.length : 0,
            summary: analysis.summary ? 1 : 0
        }
    };
    
    // 품질 등급 결정
    if (report.overallMappingRate >= 90) {
        report.qualityGrade = 'Excellent';
        report.qualityColor = '#10b981';
    } else if (report.overallMappingRate >= 70) {
        report.qualityGrade = 'Good';
        report.qualityColor = '#3b82f6';
    } else if (report.overallMappingRate >= 50) {
        report.qualityGrade = 'Fair';
        report.qualityColor = '#f59e0b';
    } else {
        report.qualityGrade = 'Poor';
        report.qualityColor = '#ef4444';
    }
    
    return report;
}

/**
 * 기본 분석 (통합 시스템 없는 경우 폴백)
 * @param {object} testcaseData - 테스트케이스 데이터
 * @returns {object} 기본 분석 결과
 */
function generateBasicAnalysis(testcaseData) {
    return {
        overallMappingRate: 50, // 기본값
        recommendations: ['통합 매핑 시스템을 활성화하여 더 정확한 분석을 받아보세요.'],
        preconditions: testcaseData.precondition || [],
        steps: testcaseData.steps || [],
        expectedResults: [testcaseData.expectedResult || ''],
        summary: testcaseData.summary || ''
    };
}

/**
 * 통합 시스템 사용 가능 여부 확인
 * @returns {boolean} 사용 가능 여부
 */
function checkUnifiedSystemAvailability() {
    const requirements = [
        typeof window !== 'undefined' && window.unifiedMappingSystem,
        typeof unifiedMappingSystem !== 'undefined'
    ];
    
    const available = requirements.some(Boolean);
    
    console.log(`📊 통합 시스템 요구사항 확인: ${available ? '✅' : '❌'}`);
    
    if (available && unifiedMappingSystem && !unifiedMappingSystem.isInitialized) {
        console.warn('⚠️ 통합 시스템이 초기화되지 않았습니다. 잠시 후 다시 시도해주세요.');
        return false;
    }
    
    return available;
}

/**
 * 통합 시스템 매핑 스크립트 표시
 * @param {string} script - 표시할 스크립트
 * @param {object} qualityReport - 품질 분석 결과
 */
function displayUnifiedMappingScript(script, qualityReport) {
    const scriptElement = document.getElementById('scriptResult');
    if (!scriptElement) {
        console.error('scriptResult 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 스크립트를 라인별로 분리하여 스타일링
    const lines = script.split('\n');
    let styledHTML = '';
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // HTML 이스케이프 처리
        const escapedLine = line
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // 통합 시스템 특화 스타일링
        if (trimmedLine.includes('TODO: No') || trimmedLine.includes('No mapping found')) {
            styledHTML += `<span class="no-mapping-line">${escapedLine}</span>\n`;
        } else if (trimmedLine.includes('Suggestions:')) {
            styledHTML += `<span class="keywords-line">${escapedLine}</span>\n`;
        } else if (trimmedLine.startsWith('WebUI.') || trimmedLine.includes('findTestObject')) {
            styledHTML += `<span class="mapped-code-line">${escapedLine}</span>\n`;
        } else if (trimmedLine.includes('매핑 성공:') || trimmedLine.includes('Unified System')) {
            styledHTML += `<span class="action-detected-line">${escapedLine}</span>\n`;
        } else if (trimmedLine.includes('=== ') && trimmedLine.includes(' Scripts ===')) {
            styledHTML += `<span class="section-header-line">${escapedLine}</span>\n`;
        } else if (trimmedLine.startsWith('//')) {
            styledHTML += `<span class="comment-line">${escapedLine}</span>\n`;
        } else {
            styledHTML += `<span class="default-line">${escapedLine}</span>\n`;
        }
    });
    
    // 품질 정보 추가 (통합 시스템 특화)
    if (qualityReport) {
        styledHTML += `\n<div class="quality-report" style="border-top: 2px solid ${qualityReport.qualityColor}; margin-top: 20px; padding-top: 15px;">
<span class="section-header-line">// ======== Unified Mapping Quality Report ========</span>
<span class="comment-line">// Overall Quality: ${qualityReport.qualityGrade} (${qualityReport.overallMappingRate}%)</span>
<span class="comment-line">// System Status: ${qualityReport.systemStatus}</span>`;
        
        if (qualityReport.statistics && qualityReport.statistics.totalQueries) {
            styledHTML += `\n<span class="comment-line">// Queries Processed: ${qualityReport.statistics.totalQueries}</span>`;
            styledHTML += `\n<span class="comment-line">// Cache Hit Rate: ${qualityReport.statistics.cacheHitRate || '0%'}</span>`;
        }
        
        if (qualityReport.recommendations && qualityReport.recommendations.length > 0) {
            qualityReport.recommendations.slice(0, 3).forEach(rec => {
                const message = typeof rec === 'object' ? rec.message : rec;
                styledHTML += `\n<span class="comment-line">// ${message}</span>`;
            });
        }
        
        styledHTML += `\n<span class="section-header-line">// =======================================</span>
</div>`;
    }
    
    // HTML로 설정
    scriptElement.innerHTML = styledHTML;
    window.generatedScript = script; // 원본 스크립트는 복사용으로 보관
    
    console.log('✅ 통합 시스템 스타일링된 스크립트 표시 완료');
}

/**
 * 매핑 상태 업데이트 (통합 시스템 특화)
 * @param {boolean} hasMappings - 매핑 존재 여부
 */
function updateMappingStatus(hasMappings) {
    const indicator = document.getElementById('mappingIndicator');
    if (!indicator) return;
    
    if (hasMappings) {
        indicator.classList.remove('no-mapping');
        indicator.classList.add('has-mapping');
        
        // 품질 보고서가 있으면 품질에 따른 색상 적용
        if (window.mappingQualityReport) {
            const quality = window.mappingQualityReport.qualityGrade?.toLowerCase();
            indicator.classList.remove('quality-excellent', 'quality-good', 'quality-fair', 'quality-poor');
            if (quality) {
                indicator.classList.add(`quality-${quality}`);
            }
            
            const rate = window.mappingQualityReport.overallMappingRate;
            const system = window.mappingQualityReport.systemStatus;
            indicator.title = `통합 시스템 매핑률: ${rate}% (${system})`;
        }
    } else {
        indicator.classList.add('no-mapping');
        indicator.classList.remove('has-mapping', 'quality-excellent', 'quality-good', 'quality-fair', 'quality-poor');
        indicator.title = '매핑 없음';
    }
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
// 기존 UI 제어 함수들 (호환성 유지)
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
        console.log('✅ 통합 시스템 스크립트 복사 완료');
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
        const stepsElement = document.getElementById('stepsResult');
        const expectedElement = document.getElementById('expectedResult');
        
        if (summaryElement) {
            summaryElement.innerHTML = '<span class="placeholder-text">추출된 Summary가 여기에 표시됩니다</span>';
        }
        if (preconditionElement) {
            preconditionElement.innerHTML = '<span class="placeholder-text">추출된 Precondition이 여기에 표시됩니다</span>';
        }
        if (stepsElement) {
            stepsElement.innerHTML = '<span class="placeholder-text">추출된 Steps가 여기에 표시됩니다</span>';
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
            scriptElement.innerHTML = '<span class="placeholder-text">// 통합 매핑 시스템 스크립트가 여기에 생성됩니다\n// \n// === Precondition Scripts ===\n// Precondition 매핑 스크립트가 여기에 표시됩니다\n//\n// === Summary Scripts ===  \n// Summary 매핑 스크립트가 여기에 표시됩니다\n//\n// === Steps Scripts ===\n// Steps 매핑 스크립트가 여기에 표시됩니다\n//\n// === Expected Result Scripts ===\n// Expected Result 매핑 스크립트가 여기에 표시됩니다</span>';
        }
        
        // 매핑 상태 초기화
        updateMappingStatus(false);
        
        // 전역 변수 초기화
        window.generatedScript = null;
        window.mappingQualityReport = null;
        
        console.log('✅ 매핑 스크립트 초기화 완료');
    }
}

// ================================
// 기존 호환성 함수
// ================================

/**
 * 기존 매핑 스크립트 생성 함수 (호환성 유지)
 */
function generateMappingScript() {
    console.log('🔄 기존 호환성 함수 호출됨. 통합 시스템으로 리다이렉트...');
    generateMappingScriptWithUnifiedSystem();
}

// ================================
// 전역 함수 노출 (HTML에서 호출용)
// ================================

// HTML에서 직접 호출할 수 있도록 전역 함수로 노출
window.extractTestcaseData = extractTestcaseData;
window.generateMappingScript = generateMappingScript; // 기존 호환성
window.generateMappingScriptWithUnifiedSystem = generateMappingScriptWithUnifiedSystem; // 새로운 함수
window.copyScript = copyScript;
window.resetInput = resetInput;
window.resetParsing = resetParsing;
window.resetScript = resetScript;

// 추가 유틸리티 함수들도 노출
window.analyzeFullTestCase = analyzeFullTestCase;
window.generateQualityReport = generateQualityReport;
window.checkUnifiedSystemAvailability = checkUnifiedSystemAvailability;

// ================================
// 시스템 초기화 및 검증
// ================================

/**
 * 통합 시스템 기반 초기화
 */
function initializeUnifiedSystem() {
    console.log('🚀 통합 매핑 시스템 기반 테스트케이스 매퍼 초기화...');
    
    // 시스템 요구사항 검증
    const systemStatus = checkUnifiedSystemAvailability();
    
    console.log('📊 시스템 상태 확인:');
    
    // 각 컴포넌트 상태 확인
    const components = {
        'Unified System': (typeof window !== 'undefined' && window.unifiedMappingSystem) || 
                         (typeof unifiedMappingSystem !== 'undefined'),
        'Korean Combination': (typeof window !== 'undefined' && window.koreanCombinationEngine) || 
                            (typeof koreanCombinationEngine !== 'undefined'),
        'Observer Data': (typeof window !== 'undefined' && window.KATALON_MAPPING_OBSERVER) || 
                        (typeof KATALON_MAPPING_OBSERVER !== 'undefined'),
        'Complete Data': (typeof window !== 'undefined' && window.KATALON_MAPPING_COMPLETE) || 
                        (typeof KATALON_MAPPING_COMPLETE !== 'undefined'),
        'Grammar Analyzer': (typeof window !== 'undefined' && window.KoreanGrammarAnalyzer) || 
                           (typeof KoreanGrammarAnalyzer !== 'undefined')
    };
    
    Object.entries(components).forEach(([name, available]) => {
        console.log(`  ${available ? '✅' : '❌'} ${name}: ${available ? '사용 가능' : '사용 불가'}`);
    });
    
    // 통합 시스템 통계
    if (unifiedMappingSystem && unifiedMappingSystem.isInitialized) {
        const stats = unifiedMappingSystem.getStatistics();
        console.log(`📊 통합 시스템 통계:`, stats);
    }
    
    // 시스템 기능 수준 결정
    const availableComponents = Object.values(components).filter(Boolean).length;
    const totalComponents = Object.keys(components).length;
    const featureLevel = Math.round((availableComponents / totalComponents) * 100);
    
    console.log(`🎯 시스템 기능 수준: ${featureLevel}% (${availableComponents}/${totalComponents})`);
    
    // 상태 메시지
    if (systemStatus && unifiedMappingSystem && unifiedMappingSystem.isInitialized) {
        console.log('🎉 통합 매핑 시스템이 준비되었습니다!');
        
        if (featureLevel >= 80) {
            console.log('💡 모든 고급 기능을 사용할 수 있습니다.');
        } else if (featureLevel >= 60) {
            console.log('💡 대부분의 기능을 사용할 수 있습니다.');
        } else {
            console.log('⚠️ 기본 기능만 사용 가능합니다.');
        }
        
    } else {
        console.error('❌ 통합 매핑 시스템 초기화 실패');
        console.error('필요한 파일: unified_mapping_system.js, korean_combination_engine.js');
    }
    
    return systemStatus;
}

/**
 * DOM 로드 완료 시 실행
 */
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const success = initializeUnifiedSystem();
        
        if (success) {
            console.log('🎉 통합 시스템이 준비되었습니다!');
        } else {
            console.error('❌ 통합 시스템 초기화 실패');
            
            // 경고 메시지 표시
            const warningDiv = document.createElement('div');
            warningDiv.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #fef3c7;
                border: 1px solid #fcd34d;
                color: #92400e;
                padding: 12px;
                border-radius: 6px;
                z-index: 1000;
                max-width: 300px;
                font-size: 14px;
            `;
            warningDiv.innerHTML = `
                ⚠️ 통합 매핑 시스템 로딩 중<br>
                <small>기본 기능은 정상 동작합니다</small>
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

/**
 * 스마트 키워드 분석 (모든 분석 기능 통합) - 원본 기능 유지
 * @param {string} text - 분석할 텍스트
 * @param {string} sectionName - 섹션 이름
 * @returns {object} 통합 분석 결과
 */
function performSmartKeywordAnalysis(text, sectionName) {
    let analysis = {
        keywords: [],
        priority: [],
        negativeInfo: null,
        stateInfo: null,
        grammarAnalysis: null
    };
    
    // 1. 한글 문법 분석 시도
    if (typeof window !== 'undefined' && window.TestcaseParser && window.TestcaseParser.extractKeywordsBySection) {
        analysis = window.TestcaseParser.extractKeywordsBySection(text, sectionName.toLowerCase());
        console.log(`🔍 문법 분석 완료 [${sectionName}]: "${text}"`, analysis);
    } else if (typeof extractKeywordsBySection !== 'undefined') {
        analysis = extractKeywordsBySection(text, sectionName.toLowerCase());
    } else {
        // 2. 기본 키워드 추출 폴백
        console.warn('⚠️ 개선된 키워드 분석을 사용할 수 없습니다. 기본 방식 사용.');
        const basicKeywords = extractKeywords ? extractKeywords(text) : [];
        analysis = {
            keywords: basicKeywords,
            priority: basicKeywords.map((keyword, index) => ({
                keyword: keyword,
                priority: basicKeywords.length - index,
                source: 'basic_fallback'
            })),
            negativeInfo: null,
            stateInfo: null
        };
    }
    
    return analysis;
}

/**
 * 우선순위 및 필터링을 적용한 매핑 검색
 * @param {object} keywordAnalysis - 키워드 분석 결과
 * @param {string} sectionName - 섹션 이름
 * @returns {array} 필터링된 매핑 배열
 */
function findMappingsWithPriorityAndFiltering(keywordAnalysis, sectionName) {
    let mappings = [];
    
    // 🎯 통합 시스템 우선 사용
    if (unifiedMappingSystem && unifiedMappingSystem.isInitialized) {
        // 키워드별로 통합 시스템에서 검색
        const allKeywords = keywordAnalysis.priority.length > 0 
            ? keywordAnalysis.priority.map(p => p.keyword)
            : keywordAnalysis.keywords;
            
        allKeywords.forEach(keyword => {
            const result = unifiedMappingSystem.findMapping(keyword);
            if (result.found) {
                mappings.push({
                    ...result.mapping,
                    action: result.action,
                    originalKeyword: keyword,
                    confidence: result.confidence || 1.0,
                    source: result.source || 'unified',
                    priority: keywordAnalysis.priority.find(p => p.keyword === keyword)?.priority || 0
                });
            }
        });
        
        console.log(`🎯 통합 시스템 매핑 결과 [${sectionName}]:`, mappings.length, '개');
    } else {
        // 개선된 매핑 함수 사용 시도 (폴백)
        if (typeof window !== 'undefined' && window.KatalonMapper && window.KatalonMapper.findMappingsForKeywordsWithPriority) {
            mappings = window.KatalonMapper.findMappingsForKeywordsWithPriority(
                keywordAnalysis.priority.length > 0 ? keywordAnalysis.priority : keywordAnalysis.keywords,
                sectionName.toLowerCase()
            );
        } else if (typeof findMappingsForKeywordsWithPriority !== 'undefined') {
            mappings = findMappingsForKeywordsWithPriority(
                keywordAnalysis.priority.length > 0 ? keywordAnalysis.priority : keywordAnalysis.keywords,
                sectionName.toLowerCase()
            );
        } else {
            // 기본 매핑 함수 폴백
            console.warn('⚠️ 개선된 매핑 함수를 사용할 수 없습니다. 기본 방식 사용.');
            mappings = findMappingsForKeywords ? findMappingsForKeywords(keywordAnalysis.keywords) : [];
        }
    }
    
    return mappings;
}

/**
 * 섹션별 매핑 최적화
 * @param {array} mappings - 매핑 배열
 * @param {string} sectionName - 섹션 이름
 * @returns {array} 최적화된 매핑 배열
 */
function optimizeMappingsForSection(mappings, sectionName) {
    if (!mappings || mappings.length === 0) return [];
    
    // 1. 중복 액션 제거
    let optimized = [];
    if (typeof window !== 'undefined' && window.KatalonMapper && window.KatalonMapper.removeDuplicateActions) {
        optimized = window.KatalonMapper.removeDuplicateActions(mappings, getSectionActionLimit(sectionName));
    } else {
        // 기본 중복 제거
        const seen = new Set();
        optimized = mappings.filter(mapping => {
            if (seen.has(mapping.action)) {
                return false;
            }
            seen.add(mapping.action);
            return true;
        });
    }
    
    // 2. 섹션별 최대 액션 수 제한
    const limit = getSectionActionLimit(sectionName);
    if (optimized.length > limit) {
        optimized = optimized.slice(0, limit);
        console.log(`🔧 섹션 최적화: ${sectionName}에서 ${mappings.length}개 → ${optimized.length}개로 제한`);
    }
    
    return optimized;
}

/**
 * 섹션별 액션 개수 제한
 * @param {string} sectionName - 섹션 이름
 * @returns {number} 최대 액션 개수
 */
function getSectionActionLimit(sectionName) {
    const limits = {
        'precondition': 2,    // Precondition은 간단하게
        'summary': 3,         // Summary는 적당히
        'steps': 1,           // Steps는 핵심 액션만
        'expected result': 2  // Expected Result는 검증 위주
    };
    
    return limits[sectionName.toLowerCase()] || 2;
}

/**
 * 컨텍스트를 고려한 카탈론 스크립트 생성
 * @param {object} mapping - 매핑 객체
 * @param {string} originalText - 원본 텍스트
 * @param {string} sectionName - 섹션 이름
 * @returns {string} 생성된 스크립트
 */
function generateContextualKatalonScript(mapping, originalText, sectionName) {
    // 개선된 스크립트 생성 함수 사용 시도
    if (typeof window !== 'undefined' && window.KatalonMapper && window.KatalonMapper.generateKatalonScriptWithContext) {
        return window.KatalonMapper.generateKatalonScriptWithContext(mapping, originalText, sectionName);
    } else if (typeof generateKatalonScriptWithContext !== 'undefined') {
        return generateKatalonScriptWithContext(mapping, originalText, sectionName);
    } else {
        // 기본 스크립트 생성 폴백
        console.warn('⚠️ 개선된 스크립트 생성 함수를 사용할 수 없습니다. 기본 방식 사용.');
        return generateKatalonScript ? generateKatalonScript(mapping, originalText) : `// ${mapping.action} - Implementation needed\n`;
    }
}

/**
 * 기본 섹션 품질 평가 (폴백용)
 * @param {string} sectionName - 섹션 이름
 * @param {array} textArray - 텍스트 배열
 * @returns {object} 기본 품질 평가 결과
 */
function evaluateBasicSectionQuality(sectionName, textArray) {
    if (!textArray || textArray.length === 0) {
        return { quality: 'N/A', score: '0%', details: 'No content' };
    }
    
    let totalWords = 0;
    let mappableWords = 0;
    
    textArray.forEach(text => {
        if (!text) return;
        const words = text.split(/\s+/).filter(w => w.length > 1);
        totalWords += words.length;
        
        // 간단한 매핑 가능 단어 체크
        const mappableKeywords = ['클릭', '입력', '확인', '드래그', '업로드', '선택', '노출', '존재'];
        mappableWords += words.filter(word => mappableKeywords.some(key => word.includes(key))).length;
    });
    
    const score = totalWords > 0 ? (mappableWords / totalWords * 100).toFixed(1) : 0;
    let quality = 'Poor';
    if (score >= 60) quality = 'Good';
    else if (score >= 30) quality = 'Fair';
    
    return {
        quality,
        score: score + '%',
        details: `${mappableWords}/${totalWords} mappable words found`
    };
}

/**
 * 추천사항 생성
 * @param {object} sectionsQuality - 섹션별 품질 정보
 * @returns {array} 추천사항 배열
 */
function generateRecommendations(sectionsQuality) {
    const recommendations = [];
    
    Object.entries(sectionsQuality).forEach(([sectionName, quality]) => {
        const score = parseFloat(quality.score?.replace('%', '') || 0);
        
        if (score < 40) {
            recommendations.push(`${sectionName}: 매핑률이 낮습니다. 더 구체적인 액션 키워드 사용을 권장합니다.`);
        } else if (score < 60) {
            recommendations.push(`${sectionName}: 적당한 매핑률입니다. 일부 키워드 개선이 필요할 수 있습니다.`);
        } else if (score >= 80) {
            recommendations.push(`${sectionName}: 우수한 매핑률입니다!`);
        }
    });
    
    if (recommendations.length === 0) {
        recommendations.push('전반적으로 양호한 매핑 품질입니다.');
    }
    
    return recommendations;
}

/**
 * 현재 매핑 개수 반환
 * @returns {number} 매핑 개수
 */
function getCurrentMappingCount() {
    let count = 0;
    
    if (typeof window !== 'undefined' && window.CURRENT_MAPPING_DATA) {
        count = window.CURRENT_MAPPING_DATA.length;
    } else {
        // 직접 계산
        if ((typeof window !== 'undefined' && window.KATALON_MAPPING_COMPLETE) || 
            (typeof KATALON_MAPPING_COMPLETE !== 'undefined')) {
            count += (window.KATALON_MAPPING_COMPLETE || KATALON_MAPPING_COMPLETE).length;
        }
        if ((typeof window !== 'undefined' && window.KATALON_MAPPING_OBSERVER) || 
            (typeof KATALON_MAPPING_OBSERVER !== 'undefined')) {
            count += (window.KATALON_MAPPING_OBSERVER || KATALON_MAPPING_OBSERVER).length;
        }
    }
    
    return count;
}

/**
 * 분석 정보 문자열 생성
 * @returns {string} 분석 정보
 */
function getAnalysisInfo() {
    const features = [];
    
    if (typeof window !== 'undefined' && window.KoreanGrammarAnalyzer) {
        features.push('Grammar');
    }
    if (typeof window !== 'undefined' && window.KatalonMapper) {
        features.push('Priority');
    }
    if (typeof window !== 'undefined' && window.TestcaseParser) {
        features.push('Smart-Parser');
    }
    if (typeof window !== 'undefined' && window.unifiedMappingSystem) {
        features.push('Unified-System');
    }
    
    return features.length > 0 ? features.join(' + ') : 'Basic';
}

/**
 * 분석 정보를 포함한 스크립트 표시 (확장된 버전)
 * @param {string} script - 표시할 스크립트
 * @param {object} qualityReport - 품질 분석 결과
 */
function displayMappingScriptWithAnalysis(script, qualityReport) {
    const scriptElement = document.getElementById('scriptResult');
    if (!scriptElement) {
        console.error('scriptResult 요소를 찾을 수 없습니다.');
        return;
    }
    
    // 스크립트를 라인별로 분리하여 스타일링
    const lines = script.split('\n');
    let styledHTML = '';
    
    lines.forEach(line => {
        const trimmedLine = line.trim();
        
        // HTML 이스케이프 처리
        const escapedLine = line
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // 라인 타입별 스타일링 (기존 로직 유지하되 확장)
        if (trimmedLine.includes('TODO: No') || trimmedLine.includes('No mapping found')) {
            styledHTML += `<span class="no-mapping-line">${escapedLine}</span>\n`;
        } else if (trimmedLine.includes('Keywords') || trimmedLine.includes('analyzed:')) {
            styledHTML += `<span class="keywords-line">${escapedLine}</span>\n`;
        } else if (trimmedLine.startsWith('WebUI.') || trimmedLine.includes('findTestObject')) {
            styledHTML += `<span class="mapped-code-line">${escapedLine}</span>\n`;
        } else if (trimmedLine.includes('detected:') || trimmedLine.includes('mapping found:')) {
            styledHTML += `<span class="action-detected-line">${escapedLine}</span>\n`;
        } else if (trimmedLine.includes('=== ') && trimmedLine.includes(' Scripts ===')) {
            styledHTML += `<span class="section-header-line">${escapedLine}</span>\n`;
        } else if (trimmedLine.startsWith('//')) {
            styledHTML += `<span class="comment-line">${escapedLine}</span>\n`;
        } else {
            styledHTML += `<span class="default-line">${escapedLine}</span>\n`;
        }
    });
    
    // 품질 정보 추가 (스크립트 하단에)
    if (qualityReport && qualityReport.overall) {
        styledHTML += `\n<div class="quality-report">
<span class="section-header-line">// ======== Mapping Quality Report ========</span>
<span class="comment-line">// Overall Quality: ${qualityReport.overall.quality} (${qualityReport.overall.score})</span>`;
        
        if (qualityReport.recommendations && qualityReport.recommendations.length > 0) {
            qualityReport.recommendations.forEach(rec => {
                styledHTML += `\n<span class="comment-line">// ${rec}</span>`;
            });
        }
        
        styledHTML += `\n<span class="section-header-line">// =======================================</span>
</div>`;
    }
    
    // HTML로 설정
    scriptElement.innerHTML = styledHTML;
    window.generatedScript = script; // 원본 스크립트는 복사용으로 보관
    
    console.log('✅ 분석 정보 포함 스타일링된 스크립트 표시 완료');
}

console.log('✅ testcase_mapper_main.js (통합 시스템 적용 + 전체 기능 유지) 로드 완료');