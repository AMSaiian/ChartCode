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
import { CodegenTemplate, CodegenTemplates } from '../const/сode-template.const';


@Injectable({ providedIn: 'root' })
export class CodegenService {
  generate(
    language: string,
    procedureId: string,
    elements: Record<string, IElement>,
    scopes: Record<string, IScope>,
  ): string {
    const template = CodegenTemplates[language];
    if (!template) {
      throw new Error(`Codegen template for '\${language}' not found.`);
    }

    const procedure = elements[procedureId];
    if (!(procedure instanceof ProcedureElement)) {
      throw new Error(`Element '\${procedureId}' is not a ProcedureElement.`);
    }

    const scopeBody = this.generateScopeBody(procedure.scopeId, elements, scopes, template, 2);

    const wrapped = [
      ...template.imports,
      '',
      template.main_wrapper.signature,
      template.block_start,
      this.indent(template, 1) + template.main_wrapper.main_signature,
      this.wrapBlock(template, scopeBody, 1),
      template.block_end,
    ];

    return wrapped.join('\n');
  }

  private generateScopeBody(
    scopeId: string,
    elements: Record<string, IElement>,
    scopes: Record<string, IScope>,
    template: CodegenTemplate,
    indentLevel: number,
  ): string {
    const scope = scopes[scopeId];
    if (!scope || !scope.startId) {
      return '';
    }
    return this.generateElement(scope.startId, elements, scopes, template, indentLevel);
  }

  private generateElement(
    id: string | null,
    elements: Record<string, IElement>,
    scopes: Record<string, IScope>,
    template: CodegenTemplate,
    indentLevel: number,
  ): string {
    if (!id) {
      return '';
    }
    const element = elements[id];
    if (!element) {
      return '';
    }

    let code = '';

    if (element instanceof AssignElement) {
      code = this.indent(template, indentLevel) + this.generateAssignExpression(element.expression, template);
    } else if (element instanceof InputElement) {
      code = this.indent(template, indentLevel) + this.format(template.input, { name: element.destination });
    } else if (element instanceof OutputElement) {
      code = this.indent(template, indentLevel) + this.format(template.output, { name: element.source });
    } else if (element instanceof WhileLoopElement) {
      const condition = this.generateBoolExpression(element.checkExpression, template);
      const body = this.generateScopeBody(element.scopeId, elements, scopes, template, indentLevel + 1);
      code = [
        this.indent(template, indentLevel) + template.while.replace('{condition}', condition),
        this.wrapBlock(template, body, indentLevel),
      ].join('\n');
    } else if (element instanceof ForLoopElement) {
      const check = this.generateBoolExpression(element.checkExpression, template);
      const acc = this.generateAssignExpression(element.accumulator, template);
      const varName = element.accumulator.destination;
      const update = element.isIncrement
                     ? this.format(template.increment, { var: varName })
                     : this.format(template.decrement, { var: varName });

      const forLine = template.for
                              .replace('{init}', acc.replace(';', ''))
                              .replace('{condition}', check)
                              .replace('{update}', update);

      const body = this.generateScopeBody(element.scopeId, elements, scopes, template, indentLevel + 1);
      code = [
        this.indent(template, indentLevel) + forLine,
        this.wrapBlock(template, body, indentLevel),
      ].join('\n');
    } else if (element instanceof ConditionElement) {
      const cond = this.generateBoolExpression(element.conditionExpression, template);
      const positive = this.generateElement(element.positiveWayId, elements, scopes, template, indentLevel + 1);
      const negative = this.generateElement(element.negativeWayId, elements, scopes, template, indentLevel + 1);

      code = [
        this.indent(template, indentLevel) + template.if.start.replace('{condition}', cond),
        this.wrapBlock(template, positive, indentLevel),
        this.indent(template, indentLevel) + template.block_start,
        this.indentBlock(template, positive, indentLevel + 1),
        this.indent(template, indentLevel) + template.block_end,
        this.indent(template, indentLevel) + template.if.else,
        this.indent(template, indentLevel) + template.block_start,
        this.indentBlock(template, negative, indentLevel + 1),
        this.indent(template, indentLevel) + template.block_end,
      ].join('\n');
    }

    return code + '\n' + this.generateElement(element.nextId, elements, scopes, template, indentLevel);
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
      if (expr.type.isCollection) {
        return this.format(template.assign.declare_array, {
          type,
          name: dst,
          length: expr.type.length || '0',
        });
      } else {
        return this.format(template.assign.declare, {
          type,
          name: dst,
          value,
        });
      }
    } else {
      return this.format(template.assign.assign, { name: dst, value });
    }
  }

  private generateBoolExpression(expr: BoolExpression, template: CodegenTemplate): string {
    const fmt = template.bool_expression[expr.expressionType];
    const a = typeof expr.leftOperand === 'string'
              ? expr.leftOperand
              : this.generateBoolExpression(expr.leftOperand, template);
    const b = typeof expr.rightOperand === 'string'
              ? expr.rightOperand
              : expr.rightOperand
                ? this.generateBoolExpression(expr.rightOperand, template)
                : '';
    return this.format(fmt, { a, b });
  }

  private generateArithmeticExpression(expr: ArithmeticExpression, template: CodegenTemplate): string {
    const fmt = template.arithmetic_expression[expr.expressionType];
    const a = typeof expr.leftOperand === 'string'
              ? expr.leftOperand
              : this.generateArithmeticExpression(expr.leftOperand, template);
    const b = typeof expr.rightOperand === 'string'
              ? expr.rightOperand
              : this.generateArithmeticExpression(expr.rightOperand, template);
    return this.format(fmt, { a, b });
  }

  private format(template: string, params: Record<string, string>): string {
    return template.replace(/{(\w+)}/g, (_, key) => params[key] ?? '');
  }

  private indent(template: CodegenTemplate, level: number): string {
    return template.indent.repeat(level);
  }

  private indentBlock(template: CodegenTemplate, code: string, level: number): string {
    return code
      .split('\n')
      .map(line => this.indent(template, level) + line)
      .join('\n');
  }

  private wrapBlock(template: CodegenTemplate, code: string, indentLevel: number): string {
    const start = this.indent(template, indentLevel) + template.block_start;
    const end = this.indent(template, indentLevel) + template.block_end;
    return [start, this.indentBlock(template, code, indentLevel + 1), end].join('\n');
  }
}
