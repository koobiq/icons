import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { KbqSvgIcon } from '../svg-icon';

@Component({
    standalone: true,
    selector: 'svg[kbqCircleXs16]',
    template: `<svg:path d="M11 8a3 3 0 1 0-6 0 3 3 0 0 0 6 0" />`,
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: '0 0 16 16',
        width: '16',
        height: '16'
    },
    hostDirectives: [KbqSvgIcon]
})
export class KbqCircleXs16 {}
