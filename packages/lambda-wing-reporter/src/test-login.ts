import { WingBrowser } from './browser';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

// .env 파일 로드
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testLogin() {
  console.log('=== Wing Ad Center 3-Level Data Collection Test ===\n');
  
  // 환경 변수 확인
  const username = process.env.WING_USERNAME;
  const password = process.env.WING_PASSWORD;
  
  if (!username || !password) {
    console.error('Error: WING_USERNAME and WING_PASSWORD must be set in .env file');
    process.exit(1);
  }
  
  console.log(`Username: ${username}`);
  console.log(`Chrome Path: ${process.env.CHROME_PATH || 'default'}\n`);
  
  // WingBrowser 인스턴스 생성
  const browser = new WingBrowser({
    username,
    password
  });
  
  try {
    console.log('Starting data collection...\n');
    
    // 테스트 날짜 범위 설정 (최근 7일)
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    // 3단계 데이터 수집
    const report = await browser.scrapeReportData({
      startDate: formatDate(startDate),
      endDate: formatDate(endDate),
    });
    
    console.log('\n=== Collection Results ===');
    console.log(`Total Campaigns: ${report.metadata.totalCampaigns}`);
    console.log(`Total Products: ${report.metadata.totalProducts}`);
    console.log(`Total Keywords: ${report.metadata.totalKeywords}`);
    
    // 샘플 데이터 출력
    if (report.campaigns.length > 0) {
      const campaign = report.campaigns[0];
      console.log('\n=== Sample Campaign ===');
      console.log(`Name: ${campaign.campaignName}`);
      console.log(`ROAS: ${campaign.roas}%`);
      console.log(`Conversion Rate: ${campaign.conversionRate}%`);
      console.log(`Products: ${campaign.products.length}`);
      
      if (campaign.products.length > 0) {
        const product = campaign.products[0];
        console.log('\n  === Sample Product ===');
        console.log(`  Name: ${product.productName}`);
        console.log(`  CTR: ${product.ctr}%`);
        console.log(`  Sales: ${product.sales}`);
        console.log(`  Keywords: ${product.keywords.length}`);
        
        if (product.keywords.length > 0) {
          console.log('\n    === Sample Keywords ===');
          product.keywords.slice(0, 3).forEach((kw, i) => {
            console.log(`    ${i + 1}. "${kw.keyword}" - ${kw.impressions} impressions, ${kw.clicks} clicks`);
          });
        }
      }
    }
    
    // JSON 파일로 저장
    const outputPath = path.join(__dirname, '../wing-report.json');
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n✓ Full report saved to: ${outputPath}`);
    
    console.log('\n=== Test Completed Successfully ===');
  } catch (error) {
    console.error('\n=== Test Failed ===');
    console.error('Error:', error);
    process.exit(1);
  }
}

// 테스트 실행
testLogin();
