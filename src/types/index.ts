export interface DrawnRegion {
  id: string;
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  width: number; // percentage 0-100
  height: number; // percentage 0-100
  cropDataUrl?: string; // base64 preview of the cropped area
  beforeLabel: string; // What was in the before state (e.g. "Top Banner", "Subscribe Button")
  afterInstruction: string; // User instruction for what it should become in the After state (starts empty/faka)
  color?: string;
}

export interface ChangeItem {
  element: string;
  action: string;
  selectorUsed: string;
  rationale: string;
}

export interface GeneratedScriptResponse {
  scriptName: string;
  matchUrl: string;
  summary: string;
  tampermonkeyCode: string;
  changes: ChangeItem[];
  tips: string[];
}

export interface SamplePreset {
  id: string;
  title: string;
  description: string;
  category: string;
  imageUrl: string;
  matchUrl: string;
  scriptName: string;
  prompt: string;
  regions: DrawnRegion[];
}
