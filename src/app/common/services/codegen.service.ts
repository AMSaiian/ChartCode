import { Injectable } from '@angular/core';
import { IElement } from '../models/element/element.interface';
import {
  AssignElement,
  ConditionElement,
  ForLoopElement,
  InputElement,
  OutputElement,
  ProcedureElement,
  WhileLoopElement,
} from '../models/element/element.model';
import { ArithmeticExpression, AssignExpression, BoolExpression } from '../models/expression/expression.model';
import { IScope } from '../models/scope/scope.interface';
import { CodegenTemplate, CodegenTemplates, FormatOptions } from '../const/сode-template.const';

@Injectable({ providedIn: 'root' })
export class CodegenService {
  generate(
    language: string,
    procedureId: string,
    elements: Record<string, IElement>,
    scopes: Record<string, IScope>,
    formatOptions?: FormatOptions
  ): string {
    const baseTemplate = CodegenTemplates[language];
    if (!baseTemplate) {
      throw new Error(`Template for '${language}' not found.`);
    }

    const template: CodegenTemplate = {
      ...baseTemplate,
      style: formatOptions?.style ?? baseTemplate.style,
      indentSize: formatOptions?.indentSize ?? baseTemplate.indentSize,
      indentChar: formatOptions?.indentChar ?? baseTemplate.indentChar,
    };

    const procedure = elements[procedureId];
    if (!(procedure instanceof ProcedureElement)) {
      throw new Error(`'${procedureId}' is not a ProcedureElement.`);
    }

    let lines = [
      ...template.imports,
      ''
    ];

    if (template.mainWrapper.signature && template.mainWrapper.mainSignature) {
      const body = this.generateScopeBody(procedure.scopeId, elements, scopes, template, 1);

      lines = [...lines,
        this.withBlockStart(template.mainWrapper.signature, template),
        this.openBlock(template, 0),
        this.indent(template, 1) + this.withBlockStart(template.mainWrapper.mainSignature, template),
        this.wrapBlock(template, body, 1),
        template.blockEnd
      ];
    } else if (!template.mainWrapper.signature && template.mainWrapper.mainSignature) {
      const body = this.generateScopeBody(procedure.scopeId, elements, scopes, template, 1);

      lines = [...lines,
        this.withBlockStart(template.mainWrapper.mainSignature, template),
        this.wrapBlock(template, body, 0),
      ];
    } else {
      const body = this.generateScopeBody(procedure.scopeId, elements, scopes, template, 1);
      lines = [...lines, body]
    }

    return lines.join('\n');
  }

  private generateScopeBody(
    scopeId: string,
    elements: Record<string, IElement>,
    scopes: Record<string, IScope>,
    template: CodegenTemplate,
    indentLevel: number
  ): string {
    const scope = scopes[scopeId];
    if (!scope?.startId) {
      return '';
    }
    return this.generateElement(scope.startId, elements, scopes, template, indentLevel);
  }

  private generateElement(
    id: string | null,
    elements: Record<string, IElement>,
    scopes: Record<string, IScope>,
    template: CodegenTemplate,
    indentLevel: number
  ): string {
    if (!id) return '';

    const element = elements[id];
    if (!element) return '';

    let code = '';

    if (element instanceof AssignElement) {
      code = this.indent(template, indentLevel) + this.generateAssignExpression(element.expression, template);
    } else if (element instanceof InputElement) {
      const typeName = element.type;
      const inputTemplate = template.inputByType?.[typeName] ?? template.input;
      code = this.indent(template, indentLevel) + this.format(inputTemplate, { name: element.destination });
    } else if (element instanceof OutputElement) {
      code = this.indent(template, indentLevel) + this.format(template.output, { name: element.source });
    } else if (element instanceof WhileLoopElement) {
      const cond = this.generateBoolExpression(element.checkExpression, template);
      const body = this.generateScopeBody(element.scopeId, elements, scopes, template, indentLevel);
      code = [
        this.withBlockStart(this.indent(template, indentLevel) + template.while.replace('{condition}', cond), template),
        this.wrapBlock(template, body, indentLevel)
      ].join('\n');
    } else if (element instanceof ForLoopElement) {
      const cond = this.generateBoolExpression(element.checkExpression, template);
      const acc = this.generateAssignExpression(element.accumulator, template);
      const update = element.isIncrement
                     ? this.format(template.increment, { var: element.accumulator.destination })
                     : this.format(template.decrement, { var: element.accumulator.destination });

      const forLine = template.for
                              .replace('{init}', acc.replace(';', ''))
                              .replace('{condition}', cond)
                              .replace('{update}', update);

      const body = this.generateScopeBody(element.scopeId, elements, scopes, template, indentLevel);
      code = [
        this.withBlockStart(this.indent(template, indentLevel) + forLine, template),
        this.wrapBlock(template, body, indentLevel)
      ].join('\n');
    } else if (element instanceof ConditionElement) {
      const cond = this.generateBoolExpression(element.conditionExpression, template);
      const positive = this.generateScopeBody(element.positiveWayId, elements, scopes, template, indentLevel);
      const negative = this.generateScopeBody(element.negativeWayId, elements, scopes, template, indentLevel);

      code = [
        this.withBlockStart(this.indent(template, indentLevel) + template.if.start.replace('{condition}', cond), template),
        this.wrapBlock(template, positive, indentLevel),
        this.withBlockStart(this.indent(template, indentLevel) + template.if.else, template),
        this.wrapBlock(template, negative, indentLevel)
      ].join('\n');
    }

    const next = this.generateElement(element.nextId, elements, scopes, template, indentLevel);
    return [code, next].filter(Boolean).join('\n');
  }

  private generateAssignExpression(expr: AssignExpression, template: CodegenTemplate): string {
    const dst = expr.destination;
    const type = template.types[expr.type.type];

    const value = typeof expr.assign === 'string'
                  ? expr.assign
                  : expr.assign instanceof BoolExpression
                    ? this.generateBoolExpression(expr.assign, template)
                    : this.generateArithmeticExpression(expr.assign, template);

    if (expr.isNew) {
      return expr.type.isCollection
             ? this.format(template.assign.declareArray, { type, name: dst, length: expr.type.length || '0' })
             : this.format(template.assign.declare, { type, name: dst, value });
    }

    return this.format(template.assign.assign, { name: dst, value });
  }

  private generateBoolExpression(expr: BoolExpression, template: CodegenTemplate, isNested = false): string {
    const fmt = template.boolExpression[expr.expressionType];

    const a = typeof expr.leftOperand === 'string'
              ? expr.leftOperand
              : this.generateBoolExpression(expr.leftOperand, template, true);

    const b = typeof expr.rightOperand === 'string'
              ? expr.rightOperand
              : expr.rightOperand
                ? this.generateBoolExpression(expr.rightOperand, template, true)
                : '';

    const result = this.format(fmt, { a, b });
    return isNested ? `(${result})` : result;
  }

  private generateArithmeticExpression(expr: ArithmeticExpression, template: CodegenTemplate, isNested = false): string {
    const fmt = template.arithmeticExpression[expr.expressionType];

    const a = typeof expr.leftOperand === 'string'
              ? expr.leftOperand
              : this.generateArithmeticExpression(expr.leftOperand, template, true);

    const b = typeof expr.rightOperand === 'string'
              ? expr.rightOperand
              : this.generateArithmeticExpression(expr.rightOperand, template, true);

    const result = this.format(fmt, { a, b });

    return isNested ? `(${result})` : result;
  }

  private format(template: string, params: Record<string, string>): string {
    return template.replace(/{(\w+)}/g, (_, key) => params[key] ?? '');
  }

  private indent(template: CodegenTemplate, level: number): string {
    return template.indentChar.repeat(template.indentSize).repeat(level);
  }

  private indentBlock(template: CodegenTemplate, code: string, level: number): string {
    return code.trimEnd().split('\n')
               .map(line => line.trim() ? this.indent(template, level) + line : '')
               .join('\n');
  }

  private wrapBlock(template: CodegenTemplate, code: string, indentLevel: number): string {
    const lines = [
      this.indentBlock(template, code, indentLevel),
      this.indent(template, indentLevel) + template.blockEnd
    ];

    if (template.style === 'allman') {
      lines.unshift(this.indent(template, indentLevel) + template.blockStart);
    }

    return lines.join('\n');
  }

  private withBlockStart(line: string, template: CodegenTemplate): string {
    return template.style === 'kr' ? `${line} ${template.blockStart}` : line;
  }

  private openBlock(template: CodegenTemplate, indentLevel: number): string {
    return template.style === 'allman' ? this.indent(template, indentLevel) + template.blockStart : '';
  }
}
