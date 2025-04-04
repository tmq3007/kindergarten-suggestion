// types/diff2html__ui.d.ts
declare module 'diff2html/lib/ui' {
    export class Diff2HtmlUI {
        constructor(target: HTMLElement);
        draw(diffInput: string, config: any): void;
    }
}
