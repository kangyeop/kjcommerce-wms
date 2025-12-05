import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { WingBrowser } from './browser';
import { WingCredentials, ReportRequest, LambdaResponse, WingReport } from './types';

/**
 * Lambda 핸들러 함수
 */
export async function handler(
  event: APIGatewayProxyEvent,
  context: Context
): Promise<APIGatewayProxyResult> {
  console.log('Processing Wing Ad Report request');
  
  try {
    // 요청 본문 파싱
    if (!event.body) {
      return formatResponse(400, { error: '요청 본문이 비어있습니다.' });
    }
    
    const request = JSON.parse(event.body);
    
    // 필수 파라미터 검증
    if (!validateRequest(request)) {
      return formatResponse(400, { 
        error: '필수 파라미터가 누락되었습니다. username, password, startDate, endDate가 필요합니다.' 
      });
    }
    
    const credentials: WingCredentials = {
      username: request.username,
      password: request.password
    };
    
    const reportRequest: ReportRequest = {
      startDate: request.startDate,
      endDate: request.endDate,
    };
    
    // 브라우저 자동화로 3단계 데이터 수집
    const browser = new WingBrowser(credentials);
    const report: WingReport = await browser.scrapeReportData(reportRequest);
    
    // 처리된 결과 반환
    return formatResponse(200, report);
  } catch (error: any) {
    console.error('Wing Ad Report processing failed:', error);
    
    return formatResponse(500, {
      error: '보고서 처리 중 오류가 발생했습니다.',
      message: error.message || '알 수 없는 오류'
    });
  }
}

/**
 * 요청 유효성 검증
 */
function validateRequest(request: any): boolean {
  return !!(
    request.username &&
    request.password &&
    request.startDate &&
    request.endDate
  );
}

/**
 * 응답 포맷팅
 */
function formatResponse(statusCode: number, body: any): LambdaResponse {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': 'true',
    },
    body: JSON.stringify(body)
  };
}