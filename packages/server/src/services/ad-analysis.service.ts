import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as XLSX from 'xlsx';
// import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';

export interface AdCampaign {
  campaignName: string;
  spend: number;
  sales: number;
  roas: number;
}

export interface AnalysisResult extends AdCampaign {
  suggestion: string;
  suggestionType: 'increase' | 'decrease' | 'maintain';
  reason?: string;
}

// Zod schema for structured output
const CampaignAnalysisSchema = z.object({
  campaignName: z.string(),
  suggestionType: z.enum(['increase', 'decrease', 'maintain']),
  suggestion: z.string(),
  reason: z.string(),
});

@Injectable()
export class AdAnalysisService {
  private readonly logger = new Logger(AdAnalysisService.name);
  // private readonly llm: ChatOpenAI;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');

    if (apiKey) {
      // this.llm = new ChatOpenAI({
      //   modelName: 'gpt-4o-mini',
      //   temperature: 0.3,
      //   openAIApiKey: apiKey,
      // });
    }
  }

  /**
   * Parse Excel file and extract campaign data
   */
  parseExcelFile(buffer: Buffer): AdCampaign[] {
    try {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      return data.map((row: any) => ({
        campaignName: row['캠페인명'] || row['Campaign Name'] || row['campaign_name'] || '-',
        spend: parseFloat(row['집행금액'] || row['Spend'] || row['spend'] || '0'),
        sales: parseFloat(row['매출액'] || row['Sales'] || row['sales'] || '0'),
        roas: parseFloat(row['수익률'] || row['ROAS'] || row['roas'] || '0'),
      }));
    } catch (error: any) {
      this.logger.error('Failed to parse Excel file', error);
      throw new Error('Invalid Excel file format');
    }
  }

  /**
   * Analyze campaigns using LangChain + OpenAI
   */
  async analyzeCampaigns(campaigns: AdCampaign[]): Promise<AnalysisResult[]> {
    // Fallback to heuristic if OpenAI is not configured
    // if (!this.llm) {
    //   this.logger.warn('OpenAI API key not configured, using heuristic analysis');
    //   return this.heuristicAnalysis(campaigns);
    // }

    try {
      const results: AnalysisResult[] = [];

      // Analyze campaigns in batches to avoid token limits
      for (const campaign of campaigns) {
        const prompt = this.buildAnalysisPrompt(campaign);
        // const response = await this.llm.invoke(prompt);

        const analysis = this.parseAIResponse('', campaign);
        results.push(analysis);
      }

      return results;
    } catch (error: any) {
      this.logger.error('AI analysis failed, falling back to heuristic', error);
      return this.heuristicAnalysis(campaigns);
    }
  }

  /**
   * Build analysis prompt for a single campaign
   */
  private buildAnalysisPrompt(campaign: AdCampaign): string {
    return `당신은 마켓플레이스 광고 전문가입니다. 다음 광고 캠페인 데이터를 분석하고 입찰가 조정 제안을 해주세요.

캠페인 정보:
- 캠페인명: ${campaign.campaignName}
- 광고비: ${campaign.spend.toLocaleString()}원
- 매출액: ${campaign.sales.toLocaleString()}원
- ROAS: ${campaign.roas}%

분석 기준:
- ROAS가 200% 미만이면 광고 효율이 낮음
- ROAS가 400% 이상이면 광고 효율이 높음
- 시장 평균 ROAS는 250-350% 정도

다음 JSON 형식으로만 응답해주세요 (다른 텍스트 없이):
{
  "campaignName": "캠페인명",
  "suggestionType": "increase" | "decrease" | "maintain",
  "suggestion": "구체적인 제안 (예: 입찰가 15% 상향 조정 권장)",
  "reason": "제안 이유 (1-2문장)"
}`;
  }

  /**
   * Parse AI response
   */
  private parseAIResponse(content: string, campaign: AdCampaign): AnalysisResult {
    try {
      // Extract JSON from response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const validated = CampaignAnalysisSchema.parse(parsed);

      return {
        ...campaign,
        suggestion: validated.suggestion,
        suggestionType: validated.suggestionType,
        reason: validated.reason,
      };
    } catch (error) {
      this.logger.error('Failed to parse AI response', error);
      // Fallback to heuristic for this campaign
      return this.heuristicAnalysis([campaign])[0];
    }
  }

  /**
   * Fallback heuristic analysis
   */
  private heuristicAnalysis(campaigns: AdCampaign[]): AnalysisResult[] {
    return campaigns.map((campaign) => {
      let suggestion = '현재 유지';
      let suggestionType: 'increase' | 'decrease' | 'maintain' = 'maintain';
      let reason = 'ROAS가 적정 범위 내에 있습니다.';

      if (campaign.roas < 200) {
        suggestion = '입찰가 10% 하향 조정 권장 (ROAS 낮음)';
        suggestionType = 'decrease';
        reason = 'ROAS가 200% 미만으로 광고 효율이 낮습니다.';
      } else if (campaign.roas > 400) {
        suggestion = '입찰가 10% 상향 조정 권장 (ROAS 높음)';
        suggestionType = 'increase';
        reason = 'ROAS가 400% 이상으로 광고 효율이 매우 높아 노출을 늘릴 여지가 있습니다.';
      }

      return {
        ...campaign,
        suggestion,
        suggestionType,
        reason,
      };
    });
  }
}
