import csharpTemplate from '../../../assets/templates/csharp.json';
import javaTemplate from '../../../assets/templates/java.json';
import cppTemplate from '../../../assets/templates/сpp.json';
import jsTemplate from '../../../assets/templates/js.json';

export const CodegenTemplates: Record<string, CodegenTemplate> = {
  csharp: csharpTemplate as CodegenTemplate,
  java: javaTemplate as CodegenTemplate,
  cpp: cppTemplate as CodegenTemplate,
  js: jsTemplate as CodegenTemplate
};

export const codegenTemplateList = Object.entries(CodegenTemplates)
                                         .map(([key, value]) =>
                                           ({ key, displayName: value.displayName })
                                         );

export interface FormatOptions {
  style?: 'allman' | 'kr' | null;
  indentSize?: number | null;
  indentChar?: string | null;
}


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

