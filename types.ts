
export type Tone = 'epic-medieval' | 'sweet-family' | 'sad' | 'happy' | 'dark';

export interface Page {
  text: string;
  imagePrompt: string;
  imageUrl: string;
}

export interface Story {
  title: string;
  coverImageUrl: string;
  pages: Page[];
}

export interface ToneOption {
  value: Tone;
  label: string;
}