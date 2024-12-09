declare global {
  interface Window {
    mswHandlers: {
      useMock: (options: {
        method: string;
        path: string;
        preset: string;
        override?: (data: any) => void;
      }) => void;
    };
  }
}

export {};
