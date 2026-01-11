export enum Suit {
  HEARTS = '♥',
  DIAMONDS = '♦',
  CLUBS = '♣',
  SPADES = '♠',
}

export enum Rank {
  TWO = '2',
  THREE = '3',
  FOUR = '4',
  FIVE = '5',
  SIX = '6',
  SEVEN = '7',
  EIGHT = '8',
  NINE = '9',
  TEN = '10',
  JACK = 'J',
  QUEEN = 'Q',
  KING = 'K',
  ACE = 'A',
}

export interface Card {
  suit: Suit;
  rank: Rank;
  id: string; // Unique ID for React keys
}

export enum ActionType {
  HIT = 'HIT',
  STAND = 'STAND',
  DOUBLE = 'DOUBLE',
  SPLIT = 'SPLIT',
  SURRENDER = 'SURRENDER',
  BUST = 'BUSTED',
}

export interface AIAdvice {
  action: ActionType;
  confidence: number;
  winProbability?: number;
  explanation: string;
}

export type SelectionMode = 'DEALER' | 'PLAYER';
