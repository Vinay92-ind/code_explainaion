'use server';
/**
 * @fileOverview Explains code in natural language, function by function.
 *
 * - explainCode - A function that handles the code explanation process.
 * - ExplainCodeInput - The input type for the explainCode function.
 * - ExplainCodeOutput - The return type for the explainCode function, which includes an array of explanations for each function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const ExplainCodeInputSchema = z.object({
  code: z.string().describe('The code to be explained.'),
  language: z.enum(['Python', 'JavaScript']).describe('The programming language of the code.'),
});
export type ExplainCodeInput = z.infer<typeof ExplainCodeInputSchema>;

const ExplainCodeOutputSchema = z.object({
  explanations: z.array(z.string()).describe('The explanation of the code, block by block in natural language.'),
});
export type ExplainCodeOutput = z.infer<typeof ExplainCodeOutputSchema>;

export async function explainCode(input: ExplainCodeInput): Promise<ExplainCodeOutput> {
  return explainCodeFlow(input);
}

const splitCodeIntoFunctions = ai.defineTool({
  name: 'splitCodeIntoFunctions',
  description: 'Splits the given code into an array of individual functions.',
  inputSchema: z.object({
    code: z.string().describe('The code to split into functions.'),
    language: z.string().describe('The programming language of the code.'),
  }),
  outputSchema: z.array(z.string()).describe('An array of code blocks, each representing a function.'),
}, async (input) => {
  // This is a mock implementation.  In a real application, you would use a proper code parser.
  // For simplicity, we split the code by "function" or "def" keyword.
  const functionKeyword = input.language === 'Python' ? 'def' : 'function';
  const codeBlocks = input.code.split(new RegExp(`(^|\\n)\\s*${functionKeyword}\\s+`, 'g')).filter(block => block.trim() !== '').map(block => {
    return `${functionKeyword} ${block.trim()}`;
  });
  return codeBlocks;
});

const prompt = ai.definePrompt({
  name: 'explainCodeBlockPrompt',
  input: {
    schema: z.object({
      codeBlock: z.string().describe('A block of code to be explained (typically a function).'),
      language: z.string().describe('The programming language of the code.'),
    }),
  },
  output: {
    schema: z.object({
      explanation: z.string().describe('The explanation of the code block in natural language.'),
    }),
  },
  prompt: `You are an AI expert in explaining code, block by block.

You will be provided with a code block (typically a function), and your task is to explain the code in plain English. Identify key functions, variables, and the overall logic of the code block. The code is written in {{{language}}}.

Here is the code block:
{{codeBlock}}`,
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
  const codeBlocks = await splitCodeIntoFunctions({code: input.code, language: input.language});
  const explanations = [];

  for (const codeBlock of codeBlocks) {
    const {output} = await prompt({codeBlock, language: input.language});
    explanations.push(output!.explanation);
  }

  return {explanations};
});
