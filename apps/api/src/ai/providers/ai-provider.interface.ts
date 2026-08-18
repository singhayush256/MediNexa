export interface AiResponse {
  answer: string;
  sources?: string[];
}

export interface AiProvider {
  generateResponse(prompt: string, context?: any): Promise<AiResponse>;
}
