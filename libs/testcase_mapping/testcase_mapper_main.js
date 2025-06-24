/**
 * 테스트케이스 매퍼 메인 컨트롤러 (개선된 버전)
 * 한글 문법 분석 + 우선순위 기반 매핑 + 스마트 중복 제거
 * 
 * 주요 개선사항:
 * - 섹션별 액션 필터링 추가
 * - 문법 분석 결과 활용
 * - 스마트 중복 제거
 * - 부정 표현 자동 처리
 * - 매핑 품질 실시간 분석
 */

// ================================
// 전역 변수 관리
// ================================
window.parsedTestcaseData = null;
window.generatedScript = null;
window.mappingQualityReport = null;

// ================================
// 개선된 메인 워크플로우 제어
// ================================

/**
 * 테스트케이스 데이터 추출 메인 함수 (기존 유지)
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
 * 매핑 스크립트 생성 메인 함수 (완전히 개선된 버전)
 */
function generateMappingScriptWithSmartAnalysis() {
    console.log('🚀 스마트 매핑 스크립트 생성 시작...');
    
    if (!window.parsedTestcaseData) {
        alert('먼저 테스트케이스 데이터를 추출해주세요.');
        return;
    }
    
    if (!checkMappingDataAvailability()) {
        alert('❌ 매핑 데이터를 로드할 수 없습니다!\n\n필요한 파일들을 확인해주세요:\n- korean_grammar_analyzer.js\n- katalon_mapping_complete.js\n- katalon_mapping_observer.js');
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
        
        // 섹션별 스마트 스크립트 생성
        const preconditionScript = generateSmartSectionScript('Precondition', data.precondition);
        const summaryScript = generateSmartSectionScript('Summary', [data.summary]);
        const stepsScript = generateSmartSectionScript('Steps', data.steps);
        const expectedResultScript = generateSmartSectionScript('Expected Result', [data.expectedResult]);
        
        // 통합 스크립트 생성 (개선된 버전)
        const fullScript = createIntegratedScriptWithAnalysis(
            preconditionScript, 
            summaryScript, 
            stepsScript, 
            expectedResultScript
        );
        
        // 매핑 품질 분석 실행
        const qualityReport = analyzeMappingQuality(data);
        window.mappingQualityReport = qualityReport;
        
        // UI에 스크립트 표시 (스타일링 포함)
        displayMappingScriptWithAnalysis(fullScript, qualityReport);
        updateMappingStatus(true);
        
        console.log('🎉 스마트 매핑 스크립트 생성 완료');
        console.log('📊 매핑 품질 리포트:', qualityReport);
        
    } catch (error) {
        console.error('❌ 매핑 스크립트 생성 오류:', error);
        alert('매핑 스크립트 생성 중 오류가 발생했습니다: ' + error.message);
    }
}

/**
 * 스마트 섹션별 스크립트 생성
 * @param {string} sectionName - 섹션 이름
 * @param {array} textArray - 텍스트 배열
 * @returns {string} 생성된 스크립트
 */
function generateSmartSectionScript(sectionName, textArray) {
    if (!textArray || textArray.length === 0) {
        return `// === ${sectionName} Scripts ===\n// No content found for ${sectionName}\n\n`;
    }
    
    let script = `// === ${sectionName} Scripts ===\n`;
    let sectionMappings = [];
    
    textArray.forEach((text, index) => {
        if (!text || text.trim() === '') return;
        
        // 다중 라인 텍스트를 주석으로 처리
        const commentedText = text.split('\n').map(line => `// ${sectionName} ${index + 1}: ${line.trim()}`).join('\n');
        script += `${commentedText}\n`;
        
        // 스마트 키워드 분석
        const keywordAnalysis = performSmartKeywordAnalysis(text, sectionName);
        
        // 우선순위 기반 매핑 검색
        const mappings = findMappingsWithPriorityAndFiltering(keywordAnalysis, sectionName);
        
        // 중복 제거 및 최적화
        const optimizedMappings = optimizeMappingsForSection(mappings, sectionName);
        
        sectionMappings.push(...optimizedMappings);
        
        if (optimizedMappings.length > 0) {
            optimizedMappings.forEach(mapping => {
                script += generateContextualKatalonScript(mapping, text, sectionName);
            });
        } else {
            script += `// TODO: No suitable mapping found for: "${text.replace(/\n/g, ' ')}"\n`;
            if (keywordAnalysis.keywords) {
                script += `// Keywords analyzed: ${keywordAnalysis.keywords.join(', ')}\n`;
            }
            if (keywordAnalysis.negativeInfo) {
                script += `// Negative expression detected: ${keywordAnalysis.negativeInfo.negativeType}\n`;
            }
        }
        
        script += '\n';
    });
    
    // 섹션 요약 정보 추가
    const uniqueActions = [...new Set(sectionMappings.map(m => m.action))];
    if (uniqueActions.length > 0) {
        script += `// Section Summary: ${uniqueActions.length} unique actions generated\n\n`;
    }
    
    return script;
}

/**
 * 스마트 키워드 분석 (모든 분석 기능 통합)
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
    
    // 개선된 매핑 함수 사용 시도
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
 * 통합 스크립트 생성 (분석 정보 포함)
 * @param {string} preconditionScript - Precondition 스크립트
 * @param {string} summaryScript - Summary 스크립트  
 * @param {string} stepsScript - Steps 스크립트
 * @param {string} expectedResultScript - Expected Result 스크립트
 * @returns {string} 통합 스크립트
 */
function createIntegratedScriptWithAnalysis(preconditionScript, summaryScript, stepsScript, expectedResultScript) {
    const timestamp = new Date().toLocaleString();
    const mappingCount = getCurrentMappingCount();
    const analysisInfo = getAnalysisInfo();
    
    const header = `// ========================================
// Katalon Mapping Script Generated (Smart Analysis)
// Generated at: ${timestamp}
// Total Mappings Available: ${mappingCount}
// Features: Grammar Analysis + Priority + Section Filtering
// Analysis: ${analysisInfo}
// ========================================

`;
    
    const testCaseStart = `@Test
def testCase() {
    try {
        // Smart test case execution with priority-based mapping
        
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
    
    // 스크립트 들여쓰기 (기존 함수 활용)
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
 * 매핑 품질 분석 (전체 테스트케이스)
 * @param {object} testcaseData - 테스트케이스 데이터
 * @returns {object} 품질 분석 결과
 */
function analyzeMappingQuality(testcaseData) {
    const qualityReport = {
        overall: { quality: 'Unknown', score: 0 },
        sections: {},
        recommendations: [],
        statistics: {}
    };
    
    try {
        // 섹션별 품질 분석
        const sections = [
            { name: 'Precondition', data: testcaseData.precondition },
            { name: 'Summary', data: [testcaseData.summary] },
            { name: 'Steps', data: testcaseData.steps },
            { name: 'Expected Result', data: [testcaseData.expectedResult] }
        ];
        
        let totalScore = 0;
        let validSections = 0;
        
        sections.forEach(section => {
            if (section.data && section.data.length > 0) {
                // 품질 평가 함수 사용 시도
                let sectionQuality;
                if (typeof window !== 'undefined' && window.KatalonMapper && window.KatalonMapper.evaluateSectionMappingQuality) {
                    sectionQuality = window.KatalonMapper.evaluateSectionMappingQuality(section.name, section.data);
                } else {
                    // 기본 품질 평가
                    sectionQuality = evaluateBasicSectionQuality(section.name, section.data);
                }
                
                qualityReport.sections[section.name] = sectionQuality;
                
                if (sectionQuality.score !== 'N/A') {
                    totalScore += parseFloat(sectionQuality.score.replace('%', ''));
                    validSections++;
                }
            }
        });
        
        // 전체 품질 계산
        if (validSections > 0) {
            const averageScore = totalScore / validSections;
            qualityReport.overall.score = averageScore.toFixed(1) + '%';
            
            if (averageScore >= 80) qualityReport.overall.quality = 'Excellent';
            else if (averageScore >= 60) qualityReport.overall.quality = 'Good';
            else if (averageScore >= 40) qualityReport.overall.quality = 'Fair';
            else qualityReport.overall.quality = 'Poor';
        }
        
        // 추천사항 생성
        qualityReport.recommendations = generateRecommendations(qualityReport.sections);
        
        // 통계 정보
        qualityReport.statistics = {
            totalSections: sections.length,
            analyzedSections: validSections,
            averageScore: qualityReport.overall.score,
            timestamp: new Date().toISOString()
        };
        
    } catch (error) {
        console.error('품질 분석 중 오류:', error);
        qualityReport.overall = { quality: 'Error', score: '0%' };
        qualityReport.recommendations = ['품질 분석 중 오류가 발생했습니다.'];
    }
    
    return qualityReport;
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

// ================================
// 유틸리티 함수들
// ================================

/**
 * 매핑 데이터 사용 가능 여부 확인
 * @returns {boolean} 사용 가능 여부
 */
function checkMappingDataAvailability() {
    const requirements = [
        // 문법 분석기
        typeof window !== 'undefined' && window.KoreanGrammarAnalyzer,
        // 매핑 데이터
        (typeof window !== 'undefined' && window.KATALON_MAPPING_COMPLETE) || 
        (typeof KATALON_MAPPING_COMPLETE !== 'undefined'),
        // 개선된 파서
        (typeof window !== 'undefined' && window.TestcaseParser) ||
        (typeof extractKeywords !== 'undefined')
    ];
    
    const available = requirements.filter(Boolean).length;
    const total = requirements.length;
    
    console.log(`📊 시스템 요구사항 확인: ${available}/${total} 만족`);
    
    return available >= 2; // 최소 2개 이상 만족하면 사용 가능
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
    
    return features.length > 0 ? features.join(' + ') : 'Basic';
}

/**
 * 스크립트 들여쓰기 (기존 함수 활용)
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
 * 분석 정보를 포함한 스크립트 표시
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

/**
 * 매핑 상태 업데이트 (개선된 버전)
 * @param {boolean} hasMappings - 매핑 존재 여부
 */
function updateMappingStatus(hasMappings) {
    const indicator = document.getElementById('mappingIndicator');
    if (!indicator) return;
    
    if (hasMappings) {
        indicator.classList.remove('no-mapping');
        indicator.classList.add('has-mapping');
        
        // 품질 보고서가 있으면 품질에 따른 색상 적용
        if (window.mappingQualityReport && window.mappingQualityReport.overall) {
            const quality = window.mappingQualityReport.overall.quality;
            indicator.classList.remove('quality-excellent', 'quality-good', 'quality-fair', 'quality-poor');
            indicator.classList.add(`quality-${quality.toLowerCase()}`);
            indicator.title = `매핑 품질: ${quality} (${window.mappingQualityReport.overall.score})`;
        }
    } else {
        indicator.classList.add('no-mapping');
        indicator.classList.remove('has-mapping', 'quality-excellent', 'quality-good', 'quality-fair', 'quality-poor');
        indicator.title = '매핑 없음';
    }
}

// ================================
// 기존 UI 제어 함수들 (호환성 유지)
// ================================

/**
 * 스크립트 복사 기능 (기존 유지)
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
 * 입력 영역 초기화 (기존 유지)
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
 * 파싱 결과 초기화 (기존 유지)
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
 * 생성된 스크립트 초기화 (개선된 버전)
 */
function resetScript() {
    if (confirm('생성된 매핑 스크립트를 초기화하시겠습니까?')) {
        const scriptElement = document.getElementById('scriptResult');
        if (scriptElement) {
            scriptElement.innerHTML = '<span class="placeholder-text">// 스마트 카탈론 매핑 스크립트가 여기에 생성됩니다\n// \n// === Precondition Scripts ===\n// Precondition 매핑 스크립트가 여기에 표시됩니다\n//\n// === Summary Scripts ===  \n// Summary 매핑 스크립트가 여기에 표시됩니다\n//\n// === Steps Scripts ===\n// Steps 매핑 스크립트가 여기에 표시됩니다\n//\n// === Expected Result Scripts ===\n// Expected Result 매핑 스크립트가 여기에 표시됩니다</span>';
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
// 기존 호환성 함수 (기존 generateMappingScript 유지)
// ================================

/**
 * 기존 매핑 스크립트 생성 함수 (호환성 유지)
 */
function generateMappingScript() {
    console.log('🔄 기존 호환성 함수 호출됨. 개선된 함수로 리다이렉트...');
    generateMappingScriptWithSmartAnalysis();
}

// ================================
// 전역 함수 노출 (HTML에서 호출용)
// ================================

// HTML에서 직접 호출할 수 있도록 전역 함수로 노출
window.extractTestcaseData = extractTestcaseData;
window.generateMappingScript = generateMappingScript; // 기존 호환성
window.generateMappingScriptWithSmartAnalysis = generateMappingScriptWithSmartAnalysis; // 새로운 함수
window.copyScript = copyScript;
window.resetInput = resetInput;
window.resetParsing = resetParsing;
window.resetScript = resetScript;

// 추가 유틸리티 함수들도 노출
window.performSmartKeywordAnalysis = performSmartKeywordAnalysis;
window.analyzeMappingQuality = analyzeMappingQuality;
window.checkMappingDataAvailability = checkMappingDataAvailability;

// ================================
// 시스템 초기화 및 검증
// ================================

/**
 * 개선된 시스템 초기화
 */
function initializeImprovedSystem() {
    console.log('🚀 개선된 테스트케이스 매퍼 시스템 초기화...');
    
    // 시스템 요구사항 검증
    const systemStatus = checkMappingDataAvailability();
    
    console.log('📊 시스템 상태 확인:');
    
    // 각 컴포넌트 상태 확인
    const components = {
        'Grammar Analyzer': (typeof window !== 'undefined' && window.KoreanGrammarAnalyzer) || 
                           (typeof KoreanGrammarAnalyzer !== 'undefined'),
        'Smart Parser': (typeof window !== 'undefined' && window.TestcaseParser) || 
                       (typeof extractKeywords !== 'undefined'),
        'Priority Mapper': (typeof window !== 'undefined' && window.KatalonMapper) || 
                          (typeof findMappingsForKeywords !== 'undefined'),
        'Complete Data': (typeof window !== 'undefined' && window.KATALON_MAPPING_COMPLETE) || 
                        (typeof KATALON_MAPPING_COMPLETE !== 'undefined'),
        'Observer Data': (typeof window !== 'undefined' && window.KATALON_MAPPING_OBSERVER) || 
                        (typeof KATALON_MAPPING_OBSERVER !== 'undefined')
    };
    
    Object.entries(components).forEach(([name, available]) => {
        console.log(`  ${available ? '✅' : '❌'} ${name}: ${available ? '사용 가능' : '사용 불가'}`);
    });
    
    // 매핑 데이터 통계
    const mappingCount = getCurrentMappingCount();
    console.log(`📊 매핑 데이터: 총 ${mappingCount}개 사용 가능`);
    
    // 시스템 기능 수준 결정
    const availableComponents = Object.values(components).filter(Boolean).length;
    const totalComponents = Object.keys(components).length;
    const featureLevel = Math.round((availableComponents / totalComponents) * 100);
    
    console.log(`🎯 시스템 기능 수준: ${featureLevel}% (${availableComponents}/${totalComponents})`);
    
    // 사용자에게 상태 알림 (선택적)
    if (systemStatus) {
        console.log('🎉 개선된 테스트케이스 매퍼가 준비되었습니다!');
        
        // 기능 수준에 따른 메시지
        if (featureLevel >= 80) {
            console.log('💡 모든 고급 기능을 사용할 수 있습니다.');
        } else if (featureLevel >= 60) {
            console.log('💡 대부분의 기능을 사용할 수 있습니다.');
        } else {
            console.log('⚠️ 기본 기능만 사용 가능합니다. 추가 파일 로드를 권장합니다.');
        }
        
    } else {
        console.error('❌ 시스템 초기화 실패 - 최소 요구사항 미충족');
        
        // 누락된 파일 안내
        const missingFiles = [];
        if (!components['Grammar Analyzer']) missingFiles.push('korean_grammar_analyzer.js');
        if (!components['Complete Data']) missingFiles.push('katalon_mapping_complete.js');
        if (!components['Smart Parser']) missingFiles.push('개선된 testcase_parser.js');
        
        console.error('누락된 파일들:', missingFiles);
    }
    
    return systemStatus;
}

/**
 * DOM 로드 완료 시 실행
 */
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(() => {
        const success = initializeImprovedSystem();
        
        if (success) {
            console.log('🎉 개선된 시스템이 준비되었습니다!');
        } else {
            console.error('❌ 개선된 시스템 초기화 실패');
            
            // 경고 메시지 표시 (기존 코드와 동일)
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
                ⚠️ 개선된 기능 일부 제한<br>
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

console.log('✅ testcase_mapper_main.js (스마트 분석 개선 버전) 로드 완료');