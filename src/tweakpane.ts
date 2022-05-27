import { Pane, TabApi } from 'tweakpane';
import * as EssentialsPlugin from '@tweakpane/plugin-essentials';

const pane = new Pane({
  title: '...',
});
pane.registerPlugin(EssentialsPlugin);

export const tweakpane = pane as any;
