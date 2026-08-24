/**
 * Prettier Fantrax -- shared stat abbreviation dictionary
 * ---------------------------------------------------------------------
 * Abbreviation -> full name, scraped from Fantrax's own Classic-view
 * header tooltips so it stays accurate to this league's stat set.
 * Shared between content.js (Simple-view tooltips) and pitch-editor.js
 * (points-breakdown hover) so the two don't drift out of sync.
 * ---------------------------------------------------------------------
 */
window.FX_STAT_NAMES = {
  GS: 'Games Started',
  Min: 'Minutes Played',
  CS: 'Clean Sheets On Field',
  GA: 'Goals Against',
  Sv: 'Saves',
  YC: 'Yellow Cards',
  RC: 'Red Cards',
  PKS: 'Penalty Kick Saves',
  SBON: 'Substitutions On',
  SBOF: 'Substitutions Off',
  TkW: 'Tackles Won',
  DIS: 'Dispossessed',
  G: 'Goals',
  KP: 'Key Passes (Assists on Shots)',
  AT: 'Assists (Total)',
  Int: 'Interceptions',
  CLR: 'Effective Clearances',
  CoS: 'Successful Dribbles (Contests Succeeded)',
  AER: 'Aerials Won',
  HCS: 'High Claims Succeeded',
  Sm: 'Smothers',
  OG: 'Own Goals',
  SOT: 'Shots on Target',
  SOP: 'Shots off the Post',
  ACNC: 'Accurate Crosses (No Corners)',
  BS: 'Blocked Shots',
  BCC: 'Big Chances Created',
  BCM: 'Big Chances Missed',
  PKM: 'Penalty Kicks Missed',
  PKD: 'Penalty Kicks Drawn',
  GAO: 'Goals Against Outfielders',
};
