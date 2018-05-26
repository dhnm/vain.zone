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

export const ICONS = {
  coin:
    'M122.269 64.191c-84.060 97.815-122.269 239.952-122.269 447.809s38.209 349.994 122.269 447.809c53.493 61.134 59.606 64.191 140.609 64.191h84.060l-56.549-64.191c-84.060-97.815-122.269-239.952-122.269-447.809s38.209-349.994 122.269-447.809l56.549-64.191h-84.060c-81.003 0-87.116 3.057-140.609 64.191z M450.866 10.699c-41.266 15.284-108.513 87.116-140.609 148.251-93.23 181.875-93.23 524.227 0 706.101 105.457 203.272 282.746 203.272 388.203 0 122.269-236.896 82.531-658.722-76.418-808.501-44.322-41.266-125.325-64.191-171.176-45.851z',
  creepscore:
    'M43.301 87.234c-45.8 119.671-57.619 279.232-25.116 347.193 11.819 28.071 31.026 63.529 41.368 79.781 14.774 22.161 14.774 28.071 1.477 33.981-26.594 8.865-23.639 87.168 4.432 181.722 32.503 107.851 158.084 234.909 270.367 273.322 267.413 88.645 562.896-113.761 562.896-387.083 0-31.026-7.387-65.006-16.252-73.871-13.297-13.297-10.342-23.639 7.387-42.845 70.916-70.916 70.916-240.819-1.477-431.406l-23.639-63.529-41.368 87.168c-23.639 47.277-54.664 97.51-70.916 112.284-28.071 26.594-32.503 25.116-100.464-7.387-98.987-47.277-246.729-47.277-357.535 1.477l-79.781 35.458-35.458-44.323c-20.684-23.639-51.71-75.348-69.439-116.716l-33.981-72.393-32.503 87.168zM377.197 626.491c70.916 0 76.826 11.819 42.845 75.348-16.252 31.026-36.935 57.619-42.845 57.619-16.252 0-202.406-177.29-202.406-192.064 0-5.91 38.413 4.432 85.69 23.639 45.8 19.206 98.987 35.458 116.716 35.458zM753.939 608.762c-35.458 48.755-159.561 165.471-175.813 165.471-7.387-1.477-25.116-31.026-42.845-66.484l-29.548-63.529 81.258-17.729c45.8-8.865 106.374-28.071 134.445-42.845 28.071-13.297 54.664-23.639 57.619-22.161 2.955 2.955-8.865 23.639-25.116 47.277zM575.171 861.4c19.206 16.252 31.026 33.981 25.116 39.89s-19.206 2.955-29.548-4.432c-38.413-29.548-100.464-33.981-153.651-11.819-62.052 25.116-79.781 28.071-79.781 7.387 0-25.116 79.781-57.619 141.832-59.097 39.89 0 73.871 10.342 96.032 28.071z',
  kraken:
    'M149.546 71.93c-17.616 38.167-29.359 79.271-24.956 91.014s-20.552 48.443-58.719 85.142l-66.059 64.591 35.231 38.167c20.552 20.552 42.571 54.315 51.379 76.335 13.212 36.699 11.744 41.103-20.552 49.911-27.891 7.34-38.167 23.488-49.911 76.335-14.68 67.527-14.68 70.463 33.763 113.034 27.891 23.488 76.335 61.655 108.63 83.674 35.231 22.020 92.482 88.078 136.521 154.137 42.571 63.123 77.803 115.97 80.738 118.906 1.468 2.936 23.488-5.872 48.443-19.084 41.103-20.552 49.911-20.552 91.014 1.468 52.847 26.424 45.507 32.295 143.861-114.502 54.315-80.738 96.886-127.714 152.669-162.945 120.374-77.803 132.118-96.886 111.566-176.157-10.276-44.039-24.956-68.995-44.039-73.399-41.103-11.744-33.763-60.187 17.616-120.374l45.507-51.379-68.995-64.591c-44.039-39.635-66.059-70.463-58.719-82.206 5.872-8.808 0-38.167-11.744-63.123-13.212-26.424-26.424-58.719-30.827-73.399-8.808-24.956-11.744-24.956-54.315 10.276-45.507 38.167-63.123 45.507-167.349 60.187-124.778 17.616-249.555-4.404-317.082-54.315l-51.379-39.635-32.295 71.931zM293.407 258.362c0 29.359-51.379 22.020-79.271-8.808-22.020-23.488-22.020-33.763-8.808-60.187l17.616-33.763 35.231 42.571c19.084 23.488 33.763 51.379 35.231 60.187zM733.799 190.836c13.212 23.488 11.744 36.699-8.808 58.719-23.488 26.424-79.271 39.635-79.271 17.616 0-10.276 63.123-107.162 68.995-107.162 1.468 0 10.276 13.212 19.084 30.827zM429.928 265.702c5.872 17.616 5.872 35.231 2.936 39.635-10.276 10.276-49.911-46.975-42.571-60.187 13.212-22.020 32.295-11.744 39.635 20.552zM548.834 245.151c7.34 13.212-32.295 70.463-42.571 60.187-2.936-4.404-2.936-22.020 2.936-39.635 7.34-32.295 26.424-42.571 39.635-20.552zM381.485 431.583c23.488 11.744 52.847 36.699 64.591 54.315l23.488 32.295 23.488-32.295c33.763-49.911 102.758-80.738 136.521-61.655 16.148 7.34 58.719 14.68 95.418 14.68 70.463 0 101.29 20.552 52.847 36.699-38.167 11.744-102.758 96.886-102.758 136.521 0 48.443-55.783 186.432-86.61 215.792-36.699 30.827-77.803 23.488-96.886-19.084-17.616-41.103-26.424-41.103-44.039 1.468-10.276 20.552-27.891 32.295-51.379 32.295-48.443 0-95.418-71.931-123.31-192.304-22.020-96.886-61.655-158.541-114.502-176.157-46.975-14.68-13.212-35.231 58.719-35.231 38.167 0 79.271-7.34 91.014-14.68 27.891-17.616 23.488-19.084 73.399 7.34z',
  spades:
    'M817.57 348.15c-193.566-143.858-260.266-259.018-305.566-348.148v0c-0.004 0-0.004-0.002-0.004-0.002v0.002c-45.296 89.13-112 204.292-305.566 348.148-330.036 245.286-19.376 587.668 253.758 399.224-17.796 116.93-78.53 202.172-140.208 238.882v37.744h384.032v-37.74c-61.682-36.708-122.41-121.954-140.212-238.884 273.136 188.446 583.8-153.94 253.766-399.226z',
  swords:
    'M39.24 47.354c-21.8 21.8-39.24 49.414-39.24 61.040s42.147 63.947 94.467 116.267l94.467 95.921-65.4 63.947c-36.334 34.88-65.4 68.307-65.4 72.667 0 5.813 46.507 0 101.734-11.627l103.187-23.253 56.68 56.68 58.134 56.68-174.401 175.854c-174.401 174.401-174.401 174.401-174.401 244.162v68.307h152.601l341.535-341.535 341.535 341.535h152.601v-69.76c0-68.307 0-69.76-174.401-242.708l-174.401-172.948 53.774-55.227c59.587-61.040 78.48-63.947 190.388-34.88 40.694 11.627 75.574 15.987 75.574 10.173s-29.067-39.24-65.4-74.12l-65.4-63.947 104.641-106.094 106.094-106.094-55.227-53.774-53.774-55.227-106.094 106.094-106.094 104.641-63.947-65.4c-34.88-36.334-68.307-65.4-74.12-65.4s-1.453 30.52 10.173 68.307c30.52 100.281 26.16 123.534-37.787 186.028l-58.134 56.68-61.040-59.587-61.040-61.040 23.253-95.921c11.627-52.32 17.44-94.467 13.080-94.467-5.813 0-39.24 29.067-74.12 65.4l-63.947 65.4-103.187-101.734c-56.68-55.227-106.094-101.734-110.454-101.734s-24.707 18.893-46.507 40.694z',
  turret:
    'M919.073 58.182c-58.182 55.855-74.473 151.273-44.218 232.727 27.927 67.491 139.636 104.727 323.491 104.727 155.927 0 183.855-6.982 232.727-58.182 83.782-81.455 81.455-223.418-2.327-288.582-51.2-41.891-95.418-48.873-258.327-48.873-176.873 0-200.145 4.655-251.345 58.182z M167.364 237.382l6.982 76.8 169.891 6.982c128 4.655 167.564 13.964 167.564 39.564 0 27.927 39.564 34.909 202.473 34.909 197.818 0 200.145 0 158.255-46.545-23.273-25.6-41.891-76.8-44.218-116.364l-2.327-69.818h-665.6l6.982 74.473z M383.8 558.545c-134.982 104.727-207.127 181.527-281.6 302.545l-102.4 162.909h67.491c53.527 0 93.091-25.6 169.891-114.036 65.164-74.473 169.891-151.273 300.218-221.091 281.6-151.273 379.345-148.945 663.273 6.982 134.982 76.8 237.382 153.6 295.564 221.091 67.491 83.782 104.727 107.055 155.927 107.055h69.818l-100.073-160.582c-72.145-118.691-146.618-200.145-276.945-302.545l-179.2-141.964h-600.436l-181.527 139.636z',
};
