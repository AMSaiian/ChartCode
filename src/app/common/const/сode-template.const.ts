import csharpTemplate from '../../assets/templates/csharp.json';

export const CodegenTemplates: Record<string, CodegenTemplate> = {
  csharp: csharpTemplate as CodegenTemplate
};

export interface CodegenTemplate {
  language: string;
  displayName: string;
  extension: string;

  style: 'allman' | 'kr';
  indent_size: number;
  indent_char: string;

  imports: string[];

  main_wrapper: {
    signature: string;
    main_signature: string;
  };

  assign: {
    declare: string;
    declare_array: string;
    assign: string;
  };

  input: string;
  input_by_type: Record<string, string>;

  output: string;

  if: {
    start: string;
    else: string;
  };

  while: string;
  for: string;
  increment: string;
  decrement: string;

  block_start: string;
  block_end: string;

  types: Record<string, string>;
  bool_expression: Record<string, string>;
  arithmetic_expression: Record<string, string>;
}
