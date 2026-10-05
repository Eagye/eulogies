export type Candle = {
  id: string;
  createdAt: string;
};

export type Message = {
  id: string;
  name: string;
  message: string;
  type: "condolence" | "tribute";
  createdAt: string;
  approved: boolean;
};

export type Donation = {
  id: string;
  name: string;
  amount: number;
  createdAt: string;
};

export type MemorialAnalytics = {
  views: number;
  qrScans: number;
};

export type MemorialInteractions = {
  candles: Candle[];
  messages: Message[];
  donations?: Donation[];
  analytics?: MemorialAnalytics;
};
