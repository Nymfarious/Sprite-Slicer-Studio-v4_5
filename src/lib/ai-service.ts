// AI Service for generating poses and sprite sheets

export interface GeneratePoseOptions {
  prompt: string;
  styleReference?: string; // Base64 or URL of reference image
  width?: number;
  height?: number;
}

export interface GenerateSheetOptions {
  characterPrompt: string;
  actionPrompt: string;
  poseCount: number;
  columns: number;
  styleReference?: string;
}

export interface AIService {
  generatePose(options: GeneratePoseOptions): Promise<string>; // Returns base64 image data
  generateSheet(options: GenerateSheetOptions): Promise<string>; // Returns base64 image data
}

// Create the Lovable AI service using edge function
export const createLovableAIService = (): AIService => ({
  async generatePose(options) {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sprite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        type: 'pose',
        prompt: options.prompt,
        styleReference: options.styleReference,
        width: options.width || 256,
        height: options.height || 256,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Generation failed' }));
      throw new Error(error.error || 'Failed to generate pose');
    }

    const data = await response.json();
    return data.imageUrl;
  },

  async generateSheet(options) {
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-sprite`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      },
      body: JSON.stringify({
        type: 'sheet',
        characterPrompt: options.characterPrompt,
        actionPrompt: options.actionPrompt,
        poseCount: options.poseCount,
        columns: options.columns,
        styleReference: options.styleReference,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Generation failed' }));
      throw new Error(error.error || 'Failed to generate sprite sheet');
    }

    const data = await response.json();
    return data.imageUrl;
  },
});

// Stub implementation for testing without API
export const stubAIService: AIService = {
  async generatePose(options) {
    console.log('AI Generate Pose (stub):', options);
    await new Promise(resolve => setTimeout(resolve, 1500));
    // Return a placeholder
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="0 0 256 256">
        <rect fill="#2a2a3e" width="256" height="256"/>
        <text x="128" y="128" text-anchor="middle" fill="#8b5cf6" font-size="14">AI Pose</text>
        <text x="128" y="148" text-anchor="middle" fill="#666" font-size="10">(placeholder)</text>
      </svg>
    `);
  },

  async generateSheet(options) {
    console.log('AI Generate Sheet (stub):', options);
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Return a placeholder
    return 'data:image/svg+xml;base64,' + btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" width="512" height="256" viewBox="0 0 512 256">
        <rect fill="#2a2a3e" width="512" height="256"/>
        <text x="256" y="128" text-anchor="middle" fill="#8b5cf6" font-size="16">AI Sprite Sheet</text>
        <text x="256" y="150" text-anchor="middle" fill="#666" font-size="11">${options.poseCount} poses (placeholder)</text>
      </svg>
    `);
  },
};
