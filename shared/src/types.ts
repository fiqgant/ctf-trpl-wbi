export type Difficulty = 'Easy' | 'Medium' | 'Hard' | 'Very Hard';

export type Category =
  | 'Misc'
  | 'Encoding'
  | 'File Analysis'
  | 'Web Logic'
  | 'Authorization'
  | 'Crypto'
  | 'Forensics'
  | 'Reverse Engineering'
  | 'Multi-step Chaining';

export interface ChallengeInfo {
  id: string;
  title: string;
  difficulty: Difficulty;
  categories: Category[];
  objective: string;
}

export interface WorkerEnv {
  CTF_FLAG_SALT: string;
  L02_EXPECTED_ANSWER: string;
  L04_EXPECTED_ANSWER: string;
  L05_EXPECTED_ANSWER: string;
  L08_EXPECTED_ANSWER: string;
  L10_EXPECTED_ANSWER: string;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
  limit: number;
}
