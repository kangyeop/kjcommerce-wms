import apiClient from './api';

export const adAnalysisService = {
  async analyzeReport(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/ad-analysis/analyze`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  async analyzeWingReport(startDate: string, endDate: string) {
    const response = await apiClient.post(`/ad-analysis/analyze-wing`, {
      startDate,
      endDate,
    });
    return response.data;
  },
};
