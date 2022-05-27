import { NbMenuItem } from '@nebular/theme';

export interface MenuItem extends NbMenuItem {
    key?: string;
    context?: { [key: string]: string };
    children?: MenuItem[];
    parent?: MenuItem;
}
