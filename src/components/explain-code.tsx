"use client";

import {useState} from 'react';
import {explainCode} from '@/ai/flows/explain-code';
import {suggestImprovements} from '@/ai/flows/suggest-improvements';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from '@/components/ui/select';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Separator} from "@/components/ui/separator";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {ScrollArea} from "@/components/ui/scroll-area";
import {toast} from "@/hooks/use-toast";

const placeholderCode = `
function add(a: number, b: number): number {
  return a + b;
}

// Example usage:
const sum = add(5, 3);
console.log(sum); // Output: 8
`;

export function ExplainCode() {
  const [language, setLanguage] = useState<'JavaScript' | 'Python'>('JavaScript');
  const [code, setCode] = useState(placeholderCode);
  const [explanation, setExplanation] = useState('');
  const [improvements, setImprovements] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleExplainCode = async () => {
    setIsLoading(true);
    try {
      const result = await explainCode({code, language});
      setExplanation(result.explanation);
      toast({
        title: "Code Explained!",
        description: "Explanation generated successfully.",
      });
    } catch (error: any) {
      console.error('Error explaining code:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate explanation.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestImprovements = async () => {
    setIsLoading(true);
    try {
      const result = await suggestImprovements({code, language});
      setImprovements(result.improvements);
      toast({
        title: "Suggestions generated!",
        description: "Improvements generated successfully.",
      });
    } catch (error: any) {
      console.error('Error suggesting improvements:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to generate suggestions.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex w-full flex-col p-4 md:flex-row">
      {/* Code Input Section */}
      <div className="flex flex-col w-full md:w-1/2 md:pr-4">
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Code Input</CardTitle>
            <CardDescription>Enter your code to get an explanation or improvements.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col space-y-4">
            <Select value={language} onValueChange={value => setLanguage(value as 'JavaScript' | 'Python')}>
              <SelectTrigger>
                <SelectValue placeholder="Select a language"/>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="JavaScript">JavaScript</SelectItem>
                <SelectItem value="Python">Python</SelectItem>
              </SelectContent>
            </Select>
            <Textarea
              className="font-mono text-black"
              placeholder="Paste your code here..."
              value={code}
              onChange={e => setCode(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={handleExplainCode}
              >
                {isLoading ? 'Explaining...' : 'Explain Code'}
              </Button>
              <Button
                variant="outline"
                disabled={isLoading}
                onClick={handleSuggestImprovements}
              >
                {isLoading ? 'Suggesting...' : 'Suggest Improvements'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Explanation Display Section */}
      <div className="w-full md:w-1/2">
        <Tabs defaultValue="explanation" className="w-full">
          <TabsList>
            <TabsTrigger value="explanation">Explanation</TabsTrigger>
            <TabsTrigger value="improvements">Improvements</TabsTrigger>
          </TabsList>
          <Separator className="my-2"/>
          <TabsContent value="explanation" className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Card>
              <CardHeader>
                <CardTitle>Code Explanation</CardTitle>
                <CardDescription>Here is the explanation of the code:</CardDescription>
              </CardHeader>
              <CardContent className="font-mono text-black">
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <div className="p-4 whitespace-pre-line">{explanation || 'No explanation available.'}</div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="improvements" className="ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            <Card>
              <CardHeader>
                <CardTitle>Suggested Improvements</CardTitle>
                <CardDescription>Here are the suggested improvements for the code:</CardDescription>
              </CardHeader>
              <CardContent className="font-mono text-black">
                <ScrollArea className="h-[400px] w-full rounded-md border">
                  <div className="p-4 whitespace-pre-line">{improvements || 'No improvements available.'}</div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
