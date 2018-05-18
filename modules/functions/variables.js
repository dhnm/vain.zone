export const gameModeDict = {
  // human readable mode name, private, rank points showed
  '5v5_pvp_ranked': ['5v5 Ranked', false, 'ranked_5v5'],
  '5v5_pvp_casual': ['5v5 Casual', false, 'ranked_5v5'],
  private_party_draft_match_5v5: ['5v5 Private Draft', true, 'ranked_5v5'],
  private_party_vg_5v5: ["Sovereign's Rise Private Blind", true, 'ranked_5v5'],
  ranked: ['3v3 Ranked', false, 'ranked'],
  private_party_draft_match: ['3v3 Private Draft', true, 'ranked'],
  casual: ['3v3 Casual', false, 'ranked'],
  private: ['Halcyon Fold Private Blind', true, 'ranked'],
  casual_aral: ['Battle Royale', false, 'blitz'],
  private_party_aral_match: ['Private Battle Royale', true, 'blitz'],
  blitz_pvp_ranked: ['Blitz', false, 'blitz'],
  private_party_blitz_match: ['Private Blitz', true, 'blitz'],
  blitz_rounds_pvp_casual: ['Onslaught', false, 'blitz'],
  private_party_blitz_rounds_match: ['Private Onslaught', true, 'blitz'],
};
