export interface Project {
  name: string;
  kind: string;
  href?: string; // where the card goes; leave out for a project with no link yet
  github?: string; // repo, shown as the GitHub mark at the card's top right
}

export const projects: Project[] = [
  { name: 'Video Trimmer',           kind: 'Tool',  href: 'https://corytapply.github.io/VideoTools/',                        github: 'https://github.com/CoryTapply/VideoTools' },
  { name: 'Raid Calendar',           kind: 'Tool',  href: 'https://raid.zerpy.dev',                                          github: 'https://github.com/CoryTapply/RaidSchedule' },
  { name: 'ForeverLoot Addon',       kind: 'Addon', href: 'https://www.curseforge.com/wow/addons/foreverlootcouncil',        github: 'https://github.com/CoryTapply/ForeverLoot' },
  { name: 'ZerpyUI Addon',           kind: 'Addon' }, // TODO: no link yet
  { name: 'Saved Variables Manager', kind: 'Tool',  href: 'https://github.com/CoryTapply/SavedVariablesManager',             github: 'https://github.com/CoryTapply/SavedVariablesManager' },
];
