import { useState, FC, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { BarChart3, RefreshCw, TrendingUp, XCircle } from 'lucide-react'
import { adAnalysisService } from '@/services/adAnalysisService'
import { toast } from 'sonner'

export const AdAnalysisPage: FC = () => {
  const [analysisResult, setAnalysisResult] = useState<any[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

  const abortControllerRef = useRef<AbortController | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  const analyzeWingAds = async () => {
    if (!startDate || !endDate) return
    
    // Cancel previous request if exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }

    // Create new AbortController
    abortControllerRef.current = new AbortController()
    
    setIsAnalyzing(true)
    setAnalysisResult([])
    try {
      const response = await adAnalysisService.analyzeWingReport(
        startDate, 
        endDate,
        abortControllerRef.current.signal
      )
      if (response.success) {
        setAnalysisResult(response.data)
        toast.success(`${response.data.length}개 캠페인 분석 완료`)
      }
    } catch (error: any) {
      if (error.name === 'CanceledError' || error.code === 'ERR_CANCELED') {
        toast.info('분석이 취소되었습니다.')
      } else {
        console.error('Wing analysis failed:', error)
        toast.error('쿠팡 윙 데이터 분석에 실패했습니다. 서버 로그를 확인해주세요.')
      }
    } finally {
      setIsAnalyzing(false)
      abortControllerRef.current = null
    }
  }

  const cancelAnalysis = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
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
        <h1 className="flex gap-3 items-center text-3xl font-extrabold tracking-tight text-slate-900">
          <BarChart3 className="w-8 h-8 text-indigo-600" />
          광고 분석
        </h1>
        <p className="mt-2 text-slate-500">
          쿠팡 윙 광고센터에서 데이터를 가져와 AI 기반 입찰가 최적화 제안을 받으세요.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex gap-2 items-center">
            <RefreshCw className="w-5 h-5" />
            쿠팡 윙 데이터 불러오기
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="grid gap-2 items-center w-full max-w-sm">
              <Label htmlFor="start-date">시작일</Label>
              <Input 
                id="start-date" 
                type="date" 
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="grid gap-2 items-center w-full max-w-sm">
              <Label htmlFor="end-date">종료일</Label>
              <Input 
                id="end-date" 
                type="date" 
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <Button 
              onClick={analyzeWingAds} 
              disabled={!startDate || !endDate || isAnalyzing}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? '데이터 가져오기...' : '데이터 가져오기 & 분석'}
            </Button>
            {isAnalyzing && (
              <Button 
                onClick={cancelAnalysis} 
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
              >
                <XCircle className="w-4 h-4 mr-2" />
                취소
              </Button>
            )}
          </div>
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              쿠팡 윙 광고센터에 자동으로 접속하여 데이터를 가져옵니다. (약 30초~1분 소요)
            </p>
          </div>
        </CardContent>
      </Card>

      {analysisResult.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              분석 결과 및 제안
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-lg border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-100 border-slate-200">
                    <tr>
                      <th className="p-3 font-semibold text-left text-slate-700">캠페인명</th>
                      <th className="p-3 font-semibold text-right text-slate-700">집행금액</th>
                      <th className="p-3 font-semibold text-right text-slate-700">매출액</th>
                      <th className="p-3 font-semibold text-right text-slate-700">ROAS</th>
                      <th className="p-3 font-semibold text-left text-indigo-700">AI 제안</th>
                      <th className="p-3 font-semibold text-left text-slate-700">분석 근거</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analysisResult.map((row, idx) => (
                      <tr key={idx} className="transition-colors hover:bg-slate-50">
                        <td className="p-3">{row.campaignName || '-'}</td>
                        <td className="p-3 text-right">{row.spend?.toLocaleString() || 0}원</td>
                        <td className="p-3 text-right">{row.sales?.toLocaleString() || 0}원</td>
                        <td className="p-3 font-medium text-right">{row.roas || 0}%</td>
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

            <div className="p-4 mt-4 bg-amber-50 rounded-lg border border-amber-200">
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

