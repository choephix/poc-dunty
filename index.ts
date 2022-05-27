import { boot } from './boot';
import { initBlink } from './_blink';
import { initTabsAdv } from './_tabsAdv';

const __window__ = window as any;

const app = (__window__.app = boot());

initBlink(app);
initTabsAdv(app);

console.log(`2234234`)
