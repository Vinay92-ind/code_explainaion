// noinspection JSUnusedLocalSymbols
'use server';
/**
 * @fileOverview Explains code in natural language.
 *
 * - explainCode - A function that handles the code explanation process.
 * - ExplainCodeInput - The input type for the explainCode function.
 * - ExplainCodeOutput - The return type for the explainCode function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ExplainCodeInputSchema = z.object({
  code: z.string().describe('The code to be explained.'),
  language: z.enum(['Python', 'JavaScript']).describe('The programming language of the code.'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

const ExplainCodeOutputSchema = z.object({
  explanation: z.string().describe('The explanation of the code in natural language.'),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;

export async function explainCode(input: ExplainCodeInput): Promise<ExplainCodeOutput> {
  return explainCodeFlow(input);
}

const prompt = ai.definePrompt({
  name: 'explainCodePrompt',
  input: {
    schema: z.object({
      code: z.string().describe('The code to be explained.'),
      language: z.string().describe('The programming language of the code.'),
    }),
  },
  output: {
    schema: z.object({
      explanation: z.string().describe('The explanation of the code in natural language.'),
    }),
  },
  prompt: `You are an AI expert in explaining code.

You will be provided with a code snippet, and your task is to explain the code in plain English. Identify key functions, variables, and the overall logic of the code. The code is written in {{{language}}}.

Here is the code:
{{code}}`,
});

const explainCodeFlow = ai.defineFlow<
  typeof ExplainCodeInputSchema,
  typeof ExplainCodeOutputSchema
>({
  name: 'explainCodeFlow',
  inputSchema: ExplainCodeInputSchema,
  outputSchema: ExplainCodeOutputSchema,
},
async input => {
  const {output} = await prompt(input);
  return output!;
});
