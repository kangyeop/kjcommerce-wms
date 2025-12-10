import apiClient from './api';

export const adAnalysisService = {
  async analyzeReport(file: File, signal?: AbortSignal) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/ad-analysis/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      signal,
    });
    return response.data;
  },

  async analyzeWingReport(startDate: string, endDate: string, signal?: AbortSignal) {
    const response = await apiClient.post(`/ad-analysis/analyze-wing`, {
      startDate,
      endDate,
    }, {
      timeout: 300000, // 5분 (300초)
      signal,
    });
    return response.data;
  },
};
