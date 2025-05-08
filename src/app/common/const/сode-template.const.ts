import csharpTemplate from '../../assets/templates/csharp.json';

export const CodegenTemplates: Record<string, CodegenTemplate> = {
  csharp: csharpTemplate as CodegenTemplate
};

export interface CodegenTemplate {
  language: string;
  displayName: string;
  extension: string;

  style: 'allman' | 'kr';
  indentSize: number;
  indentChar: string;

  imports: string[];

  mainWrapper: {
    signature: string;
    mainSignature: string;
  };

  assign: {
    declare: string;
    declareArray: string;
    assign: string;
  };

  input: string;
  inputByType: Record<string, string>;

  output: string;

  if: {
    start: string;
    else: string;
  };

  while: string;
  for: string;
  increment: string;
  decrement: string;

  blockStart: string;
  blockEnd: string;

  types: Record<string, string>;
  boolExpression: Record<string, string>;
  arithmeticExpression: Record<string, string>;
}

