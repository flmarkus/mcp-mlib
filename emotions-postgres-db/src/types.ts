export type SourceType = 'Eigene Emotion' | 'Übernommene Emotion' | 'Geerbte Emotion';

export interface Emotion {
  nummer?: number; // Optional: wird automatisch generiert wenn nicht angegeben
  emotion: string;
  datum?: Date;
  alter?: number;
  quellenart?: SourceType;
  quelle?: string;
  koerperteil?: string;
  auswirkungen?: string;
  bemerkungen?: string;
}

export interface EmotionRecord extends Emotion {
  id: number;
  userContext: string;
}

export interface EmotionFilter {
  nummer?: number;
  emotion?: string;
  datumVon?: Date;
  datumBis?: Date;
  alterVon?: number;
  alterBis?: number;
  quellenart?: SourceType;
  quelle?: string;
  koerperteil?: string;
  auswirkungen?: string;
  bemerkungen?: string;
}
