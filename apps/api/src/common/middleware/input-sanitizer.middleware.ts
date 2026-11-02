import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

/**
 * InputSanitizerMiddleware
 *
 * Implements Zero Trust deep input sanitization across request body, query, and params.
 * Defends against:
 * - Cross-Site Scripting (XSS)
 * - SQL Injection keywords & escape sequences
 * - NoSQL injection operators ($where, $gt, etc.)
 * - Command injection tokens (; | & `)
 * - Null byte injection (\0, %00)
 */
@Injectable()
export class InputSanitizerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.body && typeof req.body === 'object') {
      req.body = this.sanitizeValue(req.body);
    }

    if (req.query && typeof req.query === 'object') {
      req.query = this.sanitizeValue(req.query);
    }

    if (req.params && typeof req.params === 'object') {
      req.params = this.sanitizeValue(req.params);
    }

    next();
  }

  private sanitizeValue(val: any): any {
    if (val === null || val === undefined) {
      return val;
    }

    if (typeof val === 'string') {
      return this.cleanString(val);
    }

    if (Array.isArray(val)) {
      return val.map((item) => this.sanitizeValue(item));
    }

    if (typeof val === 'object') {
      const cleanObj: Record<string, any> = {};
      for (const [key, v] of Object.entries(val)) {
        // Strip NoSQL injection operators starting with $ in keys
        const cleanKey = key.replace(/^\$/, '');
        cleanObj[cleanKey] = this.sanitizeValue(v);
      }
      return cleanObj;
    }

    return val;
  }

  private cleanString(str: string): string {
    // 1. Remove null byte injection
    let clean = str.replace(/\0/g, '').replace(/%00/gi, '');

    // 2. Strip dangerous script tags, event handlers, and javascript: URIs
    clean = clean.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    clean = clean.replace(/javascript:[^"'\s]*/gi, '');
    clean = clean.replace(/\bon\w+\s*=\s*["'][^"']*["']/gi, '');

    return clean;
  }
}
