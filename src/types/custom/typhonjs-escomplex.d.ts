declare module 'typhonjs-escomplex' {
  interface HalsteadMetrics {
    difficulty: number;
    effort: number;
  }

  interface SlocMetrics {
    logical: number;
  }

  interface MethodReport {
    name: string;
    lineStart: number;
    cyclomatic: number;
    halstead: HalsteadMetrics;
    sloc: SlocMetrics;
  }

  interface ModuleReport {
    methods: MethodReport[];
    cyclomatic: number;
    halstead: HalsteadMetrics;
    maintainability: number;
  }

  function analyzeModule(code: string): ModuleReport;

  const _default: {
    analyzeModule: typeof analyzeModule;
  };

  export default _default;
}
