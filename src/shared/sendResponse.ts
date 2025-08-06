import { Response } from 'express';

interface ApiResponse {
  success: boolean;
  message: string;
  data?: any;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export const sendResponse = (
  res: Response,
  data: ApiResponse & { statusCode: number }
) => {
  const { statusCode, ...responseData } = data;
  res.status(statusCode).json(responseData);
}; 