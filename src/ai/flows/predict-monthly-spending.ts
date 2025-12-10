'use server';

/**
 * @fileOverview AI flow to predict monthly grocery spending based on scanned purchases.
 *
 * - predictMonthlySpending - Predicts the user's monthly spending on groceries.
 * - PredictMonthlySpendingInput - The input type for predictMonthlySpending.
 * - PredictMonthlySpendingOutput - The output type for predictMonthlySpending.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictMonthlySpendingInputSchema = z.object({
  purchaseHistory: z.array(
    z.object({
      item: z.string().describe('The name of the grocery item purchased.'),
      price: z.number().describe('The price of the item.'),
      date: z.string().describe('The date of purchase (YYYY-MM-DD).'),
      supermarket: z.string().optional().describe('The supermarket where the item was purchased.'),
    })
  ).describe('A list of recent grocery purchases with item name, price, date, and supermarket.'),
});
export type PredictMonthlySpendingInput = z.infer<typeof PredictMonthlySpendingInputSchema>;

const PredictMonthlySpendingOutputSchema = z.object({
  predictedSpending: z.number().describe('The predicted monthly spending on groceries.'),
  savingsOpportunities: z.string().describe('Suggestions for potential savings on grocery expenses.'),
});
export type PredictMonthlySpendingOutput = z.infer<typeof PredictMonthlySpendingOutputSchema>;

export async function predictMonthlySpending(input: PredictMonthlySpendingInput): Promise<PredictMonthlySpendingOutput> {
  return predictMonthlySpendingFlow(input);
}

const prompt = ai.definePrompt({
  name: 'predictMonthlySpendingPrompt',
  input: {schema: PredictMonthlySpendingInputSchema},
  output: {schema: PredictMonthlySpendingOutputSchema},
  prompt: `You are a personal finance advisor specializing in grocery spending.

  Based on the user's purchase history, predict their monthly spending on groceries and identify potential savings opportunities.

  Purchase History:
  {{#each purchaseHistory}}
  - {{date}}: {{item}} - \${{price}} ({{supermarket}})
  {{/each}}

  Consider the following factors when predicting spending and identifying savings:
  * Historical spending patterns
  * Average prices of items
  * Frequency of purchases
  * Supermarket choices

  Provide a predicted monthly spending amount and specific, actionable savings opportunities.
  Format the savings opporunities as a paragraph.`,
});

const predictMonthlySpendingFlow = ai.defineFlow(
  {
    name: 'predictMonthlySpendingFlow',
    inputSchema: PredictMonthlySpendingInputSchema,
    outputSchema: PredictMonthlySpendingOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
