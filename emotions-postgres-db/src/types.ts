export type SourceType = 'Eigene Emotion' | 'Herzmauer' | 'Übernommene Emotion' | 'Geerbte Emotion';

export interface Emotion {
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
  nummer: number;
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
