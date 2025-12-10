'use server';

import { predictMonthlySpending, type PredictMonthlySpendingInput, type PredictMonthlySpendingOutput } from '@/ai/flows/predict-monthly-spending';

export async function getSpendingPrediction(input: PredictMonthlySpendingInput): Promise<{ success: boolean; data?: PredictMonthlySpendingOutput; error?: string }> {
  // The AI can be sensitive to small amounts of data.
  // Ensure we have a reasonable number of purchases before calling the AI.
  if (input.purchaseHistory.length < 3) {
    return {
      success: false,
      error: 'Añade al menos 3 compras para obtener una predicción.'
    };
  }
  
  try {
    const result = await predictMonthlySpending(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in getSpendingPrediction:', error);
    return { success: false, error: 'Ocurrió un error inesperado al generar la predicción.' };
  }
}
