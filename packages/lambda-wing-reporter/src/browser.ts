import { chromium, Page } from 'playwright-core';
import { 
  WingCredentials, 
  ReportRequest, 
  CampaignPerformance,
  ProductPerformance,
  KeywordPerformance,
  WingReport
} from './types';

// 브라우저 설정 - 로컬에서는 환경변수, Lambda에서는 /opt/chrome/chrome
const EXECUTABLE_PATH = process.env.CHROME_PATH;

export class WingBrowser {
  private credentials: WingCredentials;
  
  constructor(credentials: WingCredentials) {
    this.credentials = credentials;
  }

  /**
   * 메인 메서드: 3단계 데이터 수집 (Campaign → Product → Keyword)
   */
  async scrapeReportData(reportRequest: ReportRequest): Promise<WingReport> {
    console.log('Starting 3-level data collection from Wing Ad Center');
    
    const browser = await chromium.launch({
      executablePath: EXECUTABLE_PATH,
      headless: true,
    });
    
    try {
      const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 },
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      });
      
      const page = await context.newPage();
      
      // 1. 로그인
      await this.login(page);
      
      // 2. 캠페인 성과 페이지로 이동
      console.log('Navigating to campaign performance page');
      await page.goto('https://advertising.coupang.com/marketing/dashboard/pa/campaign', { 
        waitUntil: 'networkidle' 
      });
      await page.waitForTimeout(3000);
      
      // 3. 날짜 범위 설정
      await this.setDateRange(page, reportRequest.startDate, reportRequest.endDate);
      
      // 4. 캠페인 데이터 수집
      console.log('Collecting campaign-level data...');
      const campaigns = await this.extractCampaignData(page);
      
      // 5. 각 캠페인별로 상품 및 키워드 데이터 수집
      for (const campaign of campaigns) {
        console.log(`Collecting product data for campaign: ${campaign.campaignName}`);
        campaign.products = await this.extractProductData(page, campaign.campaignName);
        
        // 6. 각 상품별로 키워드 데이터 수집
        for (const product of campaign.products) {
          console.log(`  Collecting keyword data for product: ${product.productName}`);
          product.keywords = await this.extractKeywordData(page, product.productName);
        }
      }
      
      // 통계 계산
      const totalProducts = campaigns.reduce((sum, c) => sum + c.products.length, 0);
      const totalKeywords = campaigns.reduce((sum, c) => 
        sum + c.products.reduce((pSum, p) => pSum + p.keywords.length, 0), 0
      );
      
      console.log(`\nData collection complete:`);
      console.log(`  Campaigns: ${campaigns.length}`);
      console.log(`  Products: ${totalProducts}`);
      console.log(`  Keywords: ${totalKeywords}`);
      
      return {
        campaigns,
        metadata: {
          startDate: reportRequest.startDate,
          endDate: reportRequest.endDate,
          generatedAt: new Date().toISOString(),
          totalCampaigns: campaigns.length,
          totalProducts,
          totalKeywords,
        }
      };
    } finally {
      await browser.close();
    }
  }

  /**
   * 로그인 처리
   */
  private async login(page: Page): Promise<void> {
    console.log('Logging in to Wing Ad Center');
    await page.goto('https://advertising.coupang.com', { 
      waitUntil: 'networkidle',
      timeout: 60000 
    });
    await page.waitForTimeout(3000);
    
    // 판매자 로그인 선택
    console.log('Clicking seller login button');
    await page.click('text=판매자 또는 광고대행사로 로그인', { timeout: 60000 });
    await page.waitForTimeout(2000);
    
    // 쿠팡 마켓플레이스 판매자 로그인
    console.log('Clicking marketplace login button');
    await page.click('text=쿠팡 마켓플레이스', { timeout: 60000 });
    await page.waitForTimeout(2000);
    
    // 로그인 폼 입력
    console.log('Filling in credentials');
    await page.fill('input#username', this.credentials.username);
    await page.waitForTimeout(500);
    await page.fill('input#password', this.credentials.password);
    await page.waitForTimeout(500);
    await page.click('input#kc-login');
    
    // 로그인 완료 대기
    console.log('Waiting for login to complete');
    await page.waitForLoadState('networkidle', { timeout: 60000 });
    await page.waitForTimeout(3000);
    console.log('Login successful');
  }

  /**
   * 날짜 범위 설정
   */
  private async setDateRange(page: Page, startDate: string, endDate: string): Promise<void> {
    console.log(`Setting date range: ${startDate} ~ ${endDate}`);
    
    try {
      // Ant Design 날짜 선택기 사용
      const dateInputs = await page.$$('input.ant-picker-input');
      
      if (dateInputs.length >= 2) {
        // 시작일 입력
        await dateInputs[0].fill(startDate);
        await page.waitForTimeout(500);
        
        // 종료일 입력
        await dateInputs[1].fill(endDate);
        await page.waitForTimeout(500);
        
        // 적용 버튼 클릭
        const confirmButton = await page.$('button.ant-btn-primary');
        if (confirmButton) {
          await confirmButton.click();
          await page.waitForTimeout(2000);
        }
      }
    } catch (error) {
      console.warn('Date range setting failed, using default range:', error);
    }
  }

  /**
   * 캠페인 레벨 데이터 추출 (AG Grid)
   */
  private async extractCampaignData(page: Page): Promise<CampaignPerformance[]> {
    const campaigns: CampaignPerformance[] = [];
    
    // AG Grid 데이터 추출
    // AG Grid는 가상화되어 있어서 JavaScript로 데이터를 가져와야 함
    const campaignData = await page.evaluate(() => {
      const results: any[] = [];
      
      // AG Grid API를 통해 모든 행 데이터 가져오기
      const gridApi = (window as any).agGrid?.api;
      if (gridApi) {
        gridApi.forEachNode((node: any) => {
          results.push(node.data);
        });
      } else {
        // AG Grid API가 없으면 DOM에서 직접 추출
        const rows = document.querySelectorAll('.ag-row');
        rows.forEach(row => {
          const cells = row.querySelectorAll('.ag-cell');
          if (cells.length > 0) {
            const rowData: any = {};
            cells.forEach((cell, index) => {
              const colId = cell.getAttribute('col-id');
              rowData[colId || index] = cell.textContent?.trim() || '';
            });
            results.push(rowData);
          }
        });
      }
      
      return results;
    });
    
    // 데이터 변환
    for (const data of campaignData) {
      campaigns.push({
        collectedAt: new Date(),
        dateRange: {
          startDate: '',
          endDate: '',
        },
        campaignName: data.campaignName || data['캠페인 이름'] || '',
        isActive: data.onOff === 'ON' || data['ON/OFF'] === 'ON',
        status: data.status || data['상태'] || '',
        mission: data.mission || data['캠페인 성장 미션'],
        startDate: data.startDate || data['시작 날짜'] || '',
        budget: this.parseNumber(data.budget || data['예산']),
        budgetScore: this.parseNumber(data.budgetScore || data['주간 예산 점수']),
        todaySpend: this.parseNumber(data.todaySpend || data['오늘 누적광고비']),
        totalSpend: this.parseNumber(data.totalSpend || data['집행 광고비']),
        impressions: this.parseNumber(data.impressions || data['노출수']),
        clicks: this.parseNumber(data.clicks || data['클릭수']),
        ctr: this.parseNumber(data.ctr || data['클릭률']),
        cpc: this.parseNumber(data.cpc || data['클릭당 비용']),
        conversions: this.parseNumber(data.conversions || data['광고 전환 주문수']),
        conversionRate: this.parseNumber(data.conversionRate || data['전환율']),
        sales: this.parseNumber(data.sales || data['광고 전환 판매수']),
        revenue: this.parseNumber(data.revenue || data['광고 전환 매출']),
        roas: this.parseNumber(data.roas || data['광고수익률']),
        products: [], // 나중에 채워짐
      });
    }
    
    return campaigns;
  }

  /**
   * 상품 레벨 데이터 추출 (React Table)
   */
  private async extractProductData(page: Page, campaignName: string): Promise<ProductPerformance[]> {
    const products: ProductPerformance[] = [];
    
    try {
      // 캠페인 이름 클릭하여 상품 페이지로 이동
      await page.click(`text=${campaignName}`);
      await page.waitForTimeout(3000);
      
      // React Table 데이터 추출
      const productData = await page.evaluate(() => {
        const results: any[] = [];
        const rows = document.querySelectorAll('.rt-tr-group');
        
        rows.forEach(row => {
          const cells = row.querySelectorAll('.rt-td');
          if (cells.length > 0) {
            results.push({
              productName: cells[1]?.textContent?.trim() || '',
              status: cells[2]?.textContent?.trim() || '',
              salesMethod: cells[3]?.textContent?.trim() || '',
              impressions: cells[5]?.textContent?.trim() || '0',
              clicks: cells[6]?.textContent?.trim() || '0',
              ctr: cells[7]?.textContent?.trim() || '0',
              sales: cells[8]?.textContent?.trim() || '0',
            });
          }
        });
        
        return results;
      });
      
      // 데이터 변환
      for (const data of productData) {
        if (data.productName) {
          products.push({
            productName: data.productName,
            productId: '', // URL에서 추출 필요
            productUrl: '',
            isActive: true,
            status: data.status,
            salesMethod: data.salesMethod,
            impressions: this.parseNumber(data.impressions),
            clicks: this.parseNumber(data.clicks),
            ctr: this.parseNumber(data.ctr),
            sales: this.parseNumber(data.sales),
            keywords: [], // 나중에 채워짐
          });
        }
      }
      
      // 뒤로 가기
      await page.goBack();
      await page.waitForTimeout(2000);
      
    } catch (error) {
      console.error(`Failed to extract product data for ${campaignName}:`, error);
    }
    
    return products;
  }

  /**
   * 키워드 레벨 데이터 추출 (Modal)
   */
  private async extractKeywordData(page: Page, productName: string): Promise<KeywordPerformance[]> {
    const keywords: KeywordPerformance[] = [];
    
    try {
      // "키워드 보기" 버튼 클릭
      const keywordButton = await page.$(`text=키워드 보기`);
      if (keywordButton) {
        await keywordButton.click();
        await page.waitForTimeout(2000);
        
        // 모달에서 키워드 데이터 추출
        const keywordData = await page.evaluate(() => {
          const results: any[] = [];
          const modal = document.querySelector('.ant-modal-body, .modal-body');
          
          if (modal) {
            const rows = modal.querySelectorAll('tr');
            rows.forEach((row, index) => {
              if (index === 0) return; // 헤더 스킵
              
              const cells = row.querySelectorAll('td');
              if (cells.length > 0) {
                results.push({
                  keyword: cells[0]?.textContent?.trim() || '',
                  status: cells[1]?.textContent?.trim() || '',
                  appliedProducts: cells[2]?.textContent?.trim() || '',
                  keywordType: cells[3]?.textContent?.trim() || '',
                  bid: cells[4]?.textContent?.trim() || '',
                  impressions: cells[5]?.textContent?.trim() || '0',
                  clicks: cells[6]?.textContent?.trim() || '0',
                  ctr: cells[7]?.textContent?.trim() || '0',
                });
              }
            });
          }
          
          return results;
        });
        
        // 데이터 변환
        for (const data of keywordData) {
          if (data.keyword) {
            keywords.push({
              keyword: data.keyword,
              status: data.status,
              appliedProducts: data.appliedProducts,
              keywordType: data.keywordType,
              bid: data.bid,
              impressions: this.parseNumber(data.impressions),
              clicks: this.parseNumber(data.clicks),
              ctr: this.parseNumber(data.ctr),
            });
          }
        }
        
        // 모달 닫기
        const closeButton = await page.$('.ant-modal-close, .modal-close');
        if (closeButton) {
          await closeButton.click();
          await page.waitForTimeout(1000);
        }
      }
    } catch (error) {
      console.error(`Failed to extract keyword data for ${productName}:`, error);
    }
    
    return keywords;
  }

  /**
   * 숫자 파싱 헬퍼
   */
  private parseNumber(value: any): number {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;
    
    // 천 단위 구분자, 통화 기호, % 등 제거
    const cleaned = value.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
}