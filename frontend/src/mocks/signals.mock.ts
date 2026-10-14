export interface Signal {
  id: string;
  type: 'positive' | 'negative' | 'neutral' | 'info';
  message: string;
  timestamp: string;
}

export const mockSignals: Signal[] = [
  {
    id: 'sig_1',
    type: 'positive',
    message: 'Eleanor Vance matched 86% for Senior Backend Engineer',
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: 'sig_2',
    type: 'info',
    message: 'New job indexed: Machine Learning Engineer',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'sig_3',
    type: 'neutral',
    message: 'David Kim resume uploaded, parsing in progress...',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
  {
    id: 'sig_4',
    type: 'negative',
    message: 'Failed to parse resume: James_Wilson_CV.docx',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  }
];
