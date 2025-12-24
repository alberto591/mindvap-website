
import { EmailContext } from './email-types';

/**
 * SRP: Handles email template rendering logic
 */
export class EmailRenderer {
    /**
     * Render template with context data
     */
    static renderTemplate(template: string, context: EmailContext): string {
        let rendered = template;

        // Replace simple variables
        Object.keys(context).forEach(key => {
            const value = context[key];
            if (typeof value === 'string' || typeof value === 'number') {
                const regex = new RegExp(`{{${key}}}`, 'g');
                rendered = rendered.replace(regex, String(value));
            }
        });

        // Handle arrays (like items in order confirmation)
        rendered = this.renderArrays(rendered, context);

        // Handle conditional sections
        rendered = this.renderConditionals(rendered, context);

        return rendered;
    }

    /**
     * Render array sections in templates
     */
    private static renderArrays(template: string, context: EmailContext): string {
        // Handle items array in order templates
        if (context.items && Array.isArray(context.items)) {
            const itemTemplate = this.extractArraySection(template, 'items');
            if (itemTemplate) {
                const itemsHtml = context.items
                    .map(item => this.renderTemplate(itemTemplate, { ...context, ...item }))
                    .join('');
                template = template.replace(/{{#each items}}[\s\S]*?{{\/each}}/g, itemsHtml);
            }
        }

        return template;
    }

    /**
     * Render conditional sections in templates
     */
    private static renderConditionals(template: string, context: EmailContext): string {
        // Handle conditional blocks like {{#if ipAddress}}...{{/if}}
        const conditionalRegex = /{{#if (\w+)}}([\s\S]*?){{\/if}}/g;

        return template.replace(conditionalRegex, (match, condition, content) => {
            if (context[condition]) {
                return this.renderTemplate(content, context);
            }
            return '';
        });
    }

    /**
     * Extract array section from template
     */
    private static extractArraySection(template: string, arrayName: string): string | null {
        const regex = new RegExp(`{{#each ${arrayName}}}([\\s\\S]*?){{/each}}`);
        const match = template.match(regex);
        return match ? match[1] : null;
    }

    /**
     * Generate plain text version from HTML
     */
    static generatePlainText(html: string): string {
        return html
            .replace(/<style[\s\S]*?<\/style>/gi, '')
            .replace(/<script[\s\S]*?<\/script>/gi, '')
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .replace(/\s+/g, ' ')
            .trim();
    }
}
