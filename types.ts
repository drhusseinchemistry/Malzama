
export enum PaperSize {
  A4 = 'A4',
  A5 = 'A5',
  Letter = 'Letter'
}

export interface FloatingItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  pageIndex: number;
}

export interface FloatingImage extends FloatingItem {
  src: string;
}

export interface FloatingText extends FloatingItem {
  content: string;
  fontSize: number;
  color: string;
}

export interface MalzamaContent {
  sections: MalzamaSection[];
}

export interface MalzamaSection {
  id: string;
  title: string;
  content: string;
}

export interface EditorSettings {
  paperSize: PaperSize;
  fontSize: number;
  fontColor: string;
  primaryColor: string;
  lineHeight: number;
  teacherName: string;
  apiKey?: string;
  customFontUrl?: string;
}
