// src/ai/flows/suggest-improvements.ts
'use server';
/**
 * @fileOverview A code improvement suggestion AI agent.
 *
 * - suggestImprovements - A function that handles the code improvement suggestion process.
 * - SuggestImprovementsInput - The input type for the suggestImprovements function.
 * - SuggestImprovementsOutput - The return type for the suggestImprovements function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestImprovementsInputSchema = z.object({
  code: z.string().describe('The code to be improved.'),
  language: z.string().describe('The programming language of the code.'),
});
export type SuggestImprovementsInput = z.infer<typeof SuggestImprovementsInputSchema>;

const SuggestImprovementsOutputSchema = z.object({
  improvements: z.string().describe('The suggested improvements for the code.'),
});
export type SuggestImprovementsOutput = z.infer<typeof SuggestImprovementsOutputSchema>;

export async function suggestImprovements(input: SuggestImprovementsInput): Promise<SuggestImprovementsOutput> {
  return suggestImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestImprovementsPrompt',
  input: {
    schema: z.object({
      code: z.string().describe('The code to be improved.'),
      language: z.string().describe('The programming language of the code.'),
    }),
  },
  output: {
    schema: z.object({
      improvements: z.string().describe('The suggested improvements for the code.'),
    }),
  },
  prompt: `You are an expert software developer specializing in code improvements.

You will use this information to suggest improvements to the code, such as fixing errors, optimization opportunities, security vulnerabilities, and general improvements to the style and formatting.

Language: {{{language}}}
Code: {{{code}}}`,
});

const suggestImprovementsFlow = ai.defineFlow<
  typeof SuggestImprovementsInputSchema,
  typeof SuggestImprovementsOutputSchema
>(
  {
    name: 'suggestImprovementsFlow',
    inputSchema: SuggestImprovementsInputSchema,
    outputSchema: SuggestImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
