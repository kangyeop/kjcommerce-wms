import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChart3, RefreshCw, Upload, TrendingUp } from 'lucide-react'
import { adAnalysisService } from '@/services/adAnalysisService'

const AdAnalysisPage = () => {
  const [file, setFile] = useState<File | null>(null)
  const [analysisResult, setAnalysisResult] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      setAnalysisResult([]) // Clear previous results
    }
  }

  const analyzeAds = async () => {
    if (!file) return

    setIsAnalyzing(true)
    try {
      const response = await adAnalysisService.analyzeReport(file)
      if (response.success) {
        setAnalysisResult(response.data)
      }
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('분석에 실패했습니다. 파일 형식을 확인해주세요.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getSuggestionColor = (suggestionType: string) => {
    switch (suggestionType) {
      case 'increase':
        return 'text-green-600'
      case 'decrease':
        return 'text-red-600'
      default:
        return 'text-slate-600'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-indigo-600" />
          광고 분석
        </h1>
        <p className="text-slate-500 mt-2">
          마켓플레이스 광고 리포트를 업로드하여 AI 기반 입찰가 최적화 제안을 받으세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" />
            광고 리포트 업로드
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-end gap-4">
            <div className="grid w-full max-w-sm items-center gap-2">
              <Label htmlFor="ad-report">광고 리포트 (Excel)</Label>
              <Input 
                id="ad-report" 
                type="file" 
                accept=".xlsx, .xls" 
                onChange={handleFileChange}
                className="cursor-pointer"
              />
              <p className="text-xs text-slate-500">
                엑셀 파일에 '캠페인명', '집행금액', '매출액', '수익률' 열이 포함되어야 합니다.
              </p>
            </div>
            <Button 
              onClick={analyzeAds} 
              disabled={!file || isAnalyzing}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? '분석 중...' : 'AI 분석 실행'}
            </Button>
          </div>

          {file && analysisResult.length === 0 && !isAnalyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                ✓ 파일이 선택되었습니다: <strong>{file.name}</strong>. 'AI 분석 실행' 버튼을 클릭하세요.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResult.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              분석 결과 및 제안
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-100 border-b border-slate-200">
                    <tr>
                      <th className="p-3 text-left font-semibold text-slate-700">캠페인명</th>
                      <th className="p-3 text-right font-semibold text-slate-700">집행금액</th>
                      <th className="p-3 text-right font-semibold text-slate-700">매출액</th>
                      <th className="p-3 text-right font-semibold text-slate-700">ROAS</th>
                      <th className="p-3 text-left font-semibold text-indigo-700">AI 제안</th>
                      <th className="p-3 text-left font-semibold text-slate-700">분석 근거</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analysisResult.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3">{row.campaignName || '-'}</td>
                        <td className="p-3 text-right">{row.spend?.toLocaleString() || 0}원</td>
                        <td className="p-3 text-right">{row.sales?.toLocaleString() || 0}원</td>
                        <td className="p-3 text-right font-medium">{row.roas || 0}%</td>
                        <td className={`p-3 font-semibold ${getSuggestionColor(row.suggestionType)}`}>
                          {row.suggestion}
                        </td>
                        <td className="p-3 text-sm text-slate-600">
                          {row.reason || '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <p className="text-sm text-amber-800">
                <strong>참고:</strong> 제안은 ROAS 기준 휴리스틱 분석 결과입니다. 실제 입찰가 조정은 시장 상황과 경쟁 강도를 고려하여 신중히 결정하세요.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default AdAnalysisPage
