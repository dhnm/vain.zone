// BR 3 W140 L105 1BOOST
// BR 2 L50 0BOOST
// BR 1 L8 W11 0BOOSTT

// Blitz 2 L30 0BOOST (15/1)
// Blitz 2 L38 1BOOST
// Blitz 1 W6 0BOOST

// 5V5R 3(4) W585 (fame booster - how many?)
// 5V5R 5 950 1BOOST
// 3V3C 2 W250 1BOOST

export const gameModeDict = {
  // human readable mode name, private, rank points showed
  "5v5_pvp_ranked": [
    "5v5 Ranked",
    false,
    "ranked_5v5",
    [35, 100, 120, 144, 173]
  ],
  "5v5_pvp_casual": [
    "5v5 Casual",
    false,
    "ranked_5v5",
    [35, 100, 120, 144, 173]
  ],
  private_party_draft_match_5v5: ["5v5 Private Draft", true, "ranked_5v5"],
  private_party_vg_5v5: ["Sovereign's Rise Private Blind", true, "ranked_5v5"],
  ranked: ["3v3 Ranked", false, "ranked", [35, 100, 120]],
  private_party_draft_match: ["3v3 Private Draft", true, "ranked"],
  casual: ["3v3 Casual", false, "ranked", [35, 100, 120]],
  private: ["Halcyon Fold Private Blind", true, "ranked"],
  casual_aral: ["Battle Royale", false, "blitz", [35 / 3, 100 / 3, 40]],
  private_party_aral_match: ["Private Battle Royale", true, "blitz"],
  blitz_pvp_ranked: ["Blitz", false, "blitz", [7, 20, 24]],
  private_party_blitz_match: ["Private Blitz", true, "blitz"],
  blitz_rounds_pvp_casual: ["Onslaught", false, "blitz"],
  private_party_blitz_rounds_match: ["Private Onslaught", true, "blitz"]
};

export const apiKey =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiJhNWUxMDJkMC0yOTI1LTAxMzYtMGYyZS0wYTU4NjQ2MGI5MDciLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTI0NDg5MDQxLCJwdWIiOiJzZW1jIiwidGl0bGUiOiJ2YWluZ2xvcnkiLCJhcHAiOiJ2YWluLXpvbmUiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0Ijo1MH0.NROqQ2-U11JTN4lDCY81XmFIcRRucRfXco8VKYFzuxI";
export const testingApiKey =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI3ZmVlYTMwMC1mMTU3LTAxMzQtYzgzZS0wMjQyYWMxMTAwMDMiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNDkwMjA1Njg5LCJwdWIiOiJzZW1jIiwidGl0bGUiOiJ2YWluZ2xvcnkiLCJhcHAiOiI3ZmViZTNlMC1mMTU3LTAxMzQtYzgzZC0wMjQyYWMxMTAwMDMiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0IjoxMH0.rQrjRyo54Fdgicbv67pABSuu2zikb5MFa_gsidu0aBs";
export const filterApiKey =
  "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI5ZGI0MTNjMC02NzE0LTAxMzYtOTQ4Mi0wYTU4NjQ2MTRkYjUiLCJpc3MiOiJnYW1lbG9ja2VyIiwiaWF0IjoxNTMxMjk4Njk4LCJwdWIiOiJzZW1jIiwidGl0bGUiOiJ2YWluZ2xvcnkiLCJhcHAiOiJ0ZW1wX3Rlc3QiLCJzY29wZSI6ImNvbW11bml0eSIsImxpbWl0IjoxMH0.kZZ1kSvyT447fc_hKmvoZ5qXUmXWftX2eYrYzL6ganE";

export const ICONS = {
  coin:
    "M122.269 64.191c-84.060 97.815-122.269 239.952-122.269 447.809s38.209 349.994 122.269 447.809c53.493 61.134 59.606 64.191 140.609 64.191h84.060l-56.549-64.191c-84.060-97.815-122.269-239.952-122.269-447.809s38.209-349.994 122.269-447.809l56.549-64.191h-84.060c-81.003 0-87.116 3.057-140.609 64.191z M450.866 10.699c-41.266 15.284-108.513 87.116-140.609 148.251-93.23 181.875-93.23 524.227 0 706.101 105.457 203.272 282.746 203.272 388.203 0 122.269-236.896 82.531-658.722-76.418-808.501-44.322-41.266-125.325-64.191-171.176-45.851z",
  creepscore:
    "M43.301 87.234c-45.8 119.671-57.619 279.232-25.116 347.193 11.819 28.071 31.026 63.529 41.368 79.781 14.774 22.161 14.774 28.071 1.477 33.981-26.594 8.865-23.639 87.168 4.432 181.722 32.503 107.851 158.084 234.909 270.367 273.322 267.413 88.645 562.896-113.761 562.896-387.083 0-31.026-7.387-65.006-16.252-73.871-13.297-13.297-10.342-23.639 7.387-42.845 70.916-70.916 70.916-240.819-1.477-431.406l-23.639-63.529-41.368 87.168c-23.639 47.277-54.664 97.51-70.916 112.284-28.071 26.594-32.503 25.116-100.464-7.387-98.987-47.277-246.729-47.277-357.535 1.477l-79.781 35.458-35.458-44.323c-20.684-23.639-51.71-75.348-69.439-116.716l-33.981-72.393-32.503 87.168zM377.197 626.491c70.916 0 76.826 11.819 42.845 75.348-16.252 31.026-36.935 57.619-42.845 57.619-16.252 0-202.406-177.29-202.406-192.064 0-5.91 38.413 4.432 85.69 23.639 45.8 19.206 98.987 35.458 116.716 35.458zM753.939 608.762c-35.458 48.755-159.561 165.471-175.813 165.471-7.387-1.477-25.116-31.026-42.845-66.484l-29.548-63.529 81.258-17.729c45.8-8.865 106.374-28.071 134.445-42.845 28.071-13.297 54.664-23.639 57.619-22.161 2.955 2.955-8.865 23.639-25.116 47.277zM575.171 861.4c19.206 16.252 31.026 33.981 25.116 39.89s-19.206 2.955-29.548-4.432c-38.413-29.548-100.464-33.981-153.651-11.819-62.052 25.116-79.781 28.071-79.781 7.387 0-25.116 79.781-57.619 141.832-59.097 39.89 0 73.871 10.342 96.032 28.071z",
  kraken:
    "M149.546 71.93c-17.616 38.167-29.359 79.271-24.956 91.014s-20.552 48.443-58.719 85.142l-66.059 64.591 35.231 38.167c20.552 20.552 42.571 54.315 51.379 76.335 13.212 36.699 11.744 41.103-20.552 49.911-27.891 7.34-38.167 23.488-49.911 76.335-14.68 67.527-14.68 70.463 33.763 113.034 27.891 23.488 76.335 61.655 108.63 83.674 35.231 22.020 92.482 88.078 136.521 154.137 42.571 63.123 77.803 115.97 80.738 118.906 1.468 2.936 23.488-5.872 48.443-19.084 41.103-20.552 49.911-20.552 91.014 1.468 52.847 26.424 45.507 32.295 143.861-114.502 54.315-80.738 96.886-127.714 152.669-162.945 120.374-77.803 132.118-96.886 111.566-176.157-10.276-44.039-24.956-68.995-44.039-73.399-41.103-11.744-33.763-60.187 17.616-120.374l45.507-51.379-68.995-64.591c-44.039-39.635-66.059-70.463-58.719-82.206 5.872-8.808 0-38.167-11.744-63.123-13.212-26.424-26.424-58.719-30.827-73.399-8.808-24.956-11.744-24.956-54.315 10.276-45.507 38.167-63.123 45.507-167.349 60.187-124.778 17.616-249.555-4.404-317.082-54.315l-51.379-39.635-32.295 71.931zM293.407 258.362c0 29.359-51.379 22.020-79.271-8.808-22.020-23.488-22.020-33.763-8.808-60.187l17.616-33.763 35.231 42.571c19.084 23.488 33.763 51.379 35.231 60.187zM733.799 190.836c13.212 23.488 11.744 36.699-8.808 58.719-23.488 26.424-79.271 39.635-79.271 17.616 0-10.276 63.123-107.162 68.995-107.162 1.468 0 10.276 13.212 19.084 30.827zM429.928 265.702c5.872 17.616 5.872 35.231 2.936 39.635-10.276 10.276-49.911-46.975-42.571-60.187 13.212-22.020 32.295-11.744 39.635 20.552zM548.834 245.151c7.34 13.212-32.295 70.463-42.571 60.187-2.936-4.404-2.936-22.020 2.936-39.635 7.34-32.295 26.424-42.571 39.635-20.552zM381.485 431.583c23.488 11.744 52.847 36.699 64.591 54.315l23.488 32.295 23.488-32.295c33.763-49.911 102.758-80.738 136.521-61.655 16.148 7.34 58.719 14.68 95.418 14.68 70.463 0 101.29 20.552 52.847 36.699-38.167 11.744-102.758 96.886-102.758 136.521 0 48.443-55.783 186.432-86.61 215.792-36.699 30.827-77.803 23.488-96.886-19.084-17.616-41.103-26.424-41.103-44.039 1.468-10.276 20.552-27.891 32.295-51.379 32.295-48.443 0-95.418-71.931-123.31-192.304-22.020-96.886-61.655-158.541-114.502-176.157-46.975-14.68-13.212-35.231 58.719-35.231 38.167 0 79.271-7.34 91.014-14.68 27.891-17.616 23.488-19.084 73.399 7.34z",
  blackclaw:
    "M117.287 23.679c-11.459 37.243-5.73 120.324 14.324 252.108 10.027 64.459-1.432 131.784-21.486 131.784-27.216 0-87.378-77.351-87.378-111.73 0-27.216-4.297-32.946-15.757-21.486-20.054 20.054 5.73 114.595 51.568 181.919 31.514 45.838 31.514 51.568 10.027 51.568-14.324 0-32.946-7.162-42.973-17.189-12.892-12.892-17.189-12.892-17.189 1.432 0 11.459 31.514 50.135 70.189 87.378s80.216 87.378 91.676 108.865c30.081 61.595 42.973 144.676 22.919 151.838-11.459 4.297-14.324 22.919-7.162 58.73 8.595 45.838 20.054 58.73 80.216 88.811l71.622 35.811 71.622-35.811c60.162-30.081 71.622-42.973 80.216-88.811 7.162-35.811 4.297-54.432-7.162-58.73-20.054-7.162-7.162-90.243 22.919-151.838 11.459-21.486 53-71.622 91.676-108.865s70.189-75.919 70.189-87.378c0-14.324-4.297-14.324-17.189-1.432-10.027 10.027-28.649 17.189-42.973 17.189-21.486 0-21.486-5.73 10.027-51.568 45.838-67.324 71.622-161.865 51.568-181.919-11.459-11.459-15.757-5.73-15.757 21.486 0 34.378-60.162 111.73-87.378 111.73-20.054 0-31.514-67.324-21.486-131.784 21.486-130.351 24.351-239.216 10.027-265-11.459-21.486-14.324-12.892-15.757 38.676 0 81.649-53 179.054-95.973 179.054-17.189 0-35.811 4.297-41.541 10.027-17.189 18.622-30.081 12.892-38.676-17.189-4.297-15.757-14.324-28.649-24.351-28.649s-20.054 12.892-24.351 28.649c-8.595 30.081-21.486 35.811-38.676 17.189-5.73-5.73-24.351-10.027-41.541-10.027-40.108 0-85.946-81.649-97.405-171.892-7.162-63.027-8.595-67.324-18.622-32.946zM257.665 507.842l27.216 45.838-48.703-24.351c-55.865-28.649-70.189-45.838-70.189-84.514 0-24.351 2.865-24.351 32.946-5.73 17.189 12.892 44.405 42.973 58.73 68.757zM505.476 469.166c-5.73 18.622-30.081 42.973-60.162 57.297l-50.135 24.351 21.486-41.541c21.486-41.541 78.784-93.108 90.243-80.216 2.865 2.865 2.865 21.486-1.432 40.108zM266.26 916.085c28.649 34.378 8.595 40.108-21.486 7.162-14.324-15.757-18.622-28.649-11.459-28.649 8.595 0 22.919 10.027 32.946 21.486zM430.989 923.247c-14.324 15.757-28.649 25.784-32.946 21.486-10.027-8.595 25.784-50.135 44.405-50.135 7.162 0 2.865 12.892-11.459 28.649z",
  ghostwing:
    "M946.292 14.599c-132.493 17.904-284.681 76.989-392.108 150.397l-87.732 59.085 7.162-102.055 8.952-100.265-53.713 112.798c-30.438 62.666-84.151 153.978-121.75 204.111-46.552 64.456-66.247 109.217-64.456 148.607 1.79 46.552-14.324 75.199-76.989 136.074-60.875 59.085-78.78 69.827-78.78 44.761 0-23.276-12.533-14.324-44.761 32.228-55.504 80.57-55.504 102.055-3.581 148.607 68.037 62.666 84.151 64.456 119.96 17.904 51.923-64.456 134.283-94.894 191.578-68.037 53.713 25.066 73.408 14.324 41.18-25.066-19.695-23.276-17.904-25.066 5.371-17.904 14.324 7.162 59.085 1.79 100.265-8.952 80.57-21.485 136.074-85.941 121.75-141.445-16.114-62.666 16.114-80.57 55.504-28.647 57.294 73.408 66.247 159.35 30.438 307.957-16.114 73.408-26.857 136.074-25.066 137.864 3.581 3.581 44.761-5.371 89.522-17.904 175.464-51.923 356.299-222.015 361.67-340.185 3.581-44.761-21.485-75.199-162.931-207.692-119.96-112.798-187.997-162.931-239.92-177.254l-73.408-17.904 60.875-64.456c34.018-34.018 89.522-76.989 123.541-94.894 68.037-34.018 230.968-69.827 338.394-73.408l64.456-1.79-53.713-14.324c-68.037-17.904-118.169-17.904-241.71 1.79zM410.949 481.905c-17.904 48.342-91.313 102.055-91.313 66.247 0-25.066 69.827-105.636 91.313-105.636 8.952 0 8.952 17.904 0 39.39z",
  spades:
    "M817.57 348.15c-193.566-143.858-260.266-259.018-305.566-348.148v0c-0.004 0-0.004-0.002-0.004-0.002v0.002c-45.296 89.13-112 204.292-305.566 348.148-330.036 245.286-19.376 587.668 253.758 399.224-17.796 116.93-78.53 202.172-140.208 238.882v37.744h384.032v-37.74c-61.682-36.708-122.41-121.954-140.212-238.884 273.136 188.446 583.8-153.94 253.766-399.226z",
  swords:
    "M39.24 47.354c-21.8 21.8-39.24 49.414-39.24 61.040s42.147 63.947 94.467 116.267l94.467 95.921-65.4 63.947c-36.334 34.88-65.4 68.307-65.4 72.667 0 5.813 46.507 0 101.734-11.627l103.187-23.253 56.68 56.68 58.134 56.68-174.401 175.854c-174.401 174.401-174.401 174.401-174.401 244.162v68.307h152.601l341.535-341.535 341.535 341.535h152.601v-69.76c0-68.307 0-69.76-174.401-242.708l-174.401-172.948 53.774-55.227c59.587-61.040 78.48-63.947 190.388-34.88 40.694 11.627 75.574 15.987 75.574 10.173s-29.067-39.24-65.4-74.12l-65.4-63.947 104.641-106.094 106.094-106.094-55.227-53.774-53.774-55.227-106.094 106.094-106.094 104.641-63.947-65.4c-34.88-36.334-68.307-65.4-74.12-65.4s-1.453 30.52 10.173 68.307c30.52 100.281 26.16 123.534-37.787 186.028l-58.134 56.68-61.040-59.587-61.040-61.040 23.253-95.921c11.627-52.32 17.44-94.467 13.080-94.467-5.813 0-39.24 29.067-74.12 65.4l-63.947 65.4-103.187-101.734c-56.68-55.227-106.094-101.734-110.454-101.734s-24.707 18.893-46.507 40.694z",
  turret:
    "M919.073 58.182c-58.182 55.855-74.473 151.273-44.218 232.727 27.927 67.491 139.636 104.727 323.491 104.727 155.927 0 183.855-6.982 232.727-58.182 83.782-81.455 81.455-223.418-2.327-288.582-51.2-41.891-95.418-48.873-258.327-48.873-176.873 0-200.145 4.655-251.345 58.182z M167.364 237.382l6.982 76.8 169.891 6.982c128 4.655 167.564 13.964 167.564 39.564 0 27.927 39.564 34.909 202.473 34.909 197.818 0 200.145 0 158.255-46.545-23.273-25.6-41.891-76.8-44.218-116.364l-2.327-69.818h-665.6l6.982 74.473z M383.8 558.545c-134.982 104.727-207.127 181.527-281.6 302.545l-102.4 162.909h67.491c53.527 0 93.091-25.6 169.891-114.036 65.164-74.473 169.891-151.273 300.218-221.091 281.6-151.273 379.345-148.945 663.273 6.982 134.982 76.8 237.382 153.6 295.564 221.091 67.491 83.782 104.727 107.055 155.927 107.055h69.818l-100.073-160.582c-72.145-118.691-146.618-200.145-276.945-302.545l-179.2-141.964h-600.436l-181.527 139.636z",
  plus:
    "M992 384h-352v-352c0-17.672-14.328-32-32-32h-192c-17.672 0-32 14.328-32 32v352h-352c-17.672 0-32 14.328-32 32v192c0 17.672 14.328 32 32 32h352v352c0 17.672 14.328 32 32 32h192c17.672 0 32-14.328 32-32v-352h352c17.672 0 32-14.328 32-32v-192c0-17.672-14.328-32-32-32z",
  bin:
    "M128 320v640c0 35.2 28.8 64 64 64h576c35.2 0 64-28.8 64-64v-640h-704zM320 896h-64v-448h64v448zM448 896h-64v-448h64v448zM576 896h-64v-448h64v448zM704 896h-64v-448h64v448zM848 128h-208v-80c0-26.4-21.6-48-48-48h-224c-26.4 0-48 21.6-48 48v80h-208c-26.4 0-48 21.6-48 48v80h832v-80c0-26.4-21.6-48-48-48zM576 128h-192v-63.198h192v63.198z",
  ban:
    "M874.040 149.96c-96.706-96.702-225.28-149.96-362.040-149.96s-265.334 53.258-362.040 149.96c-96.702 96.706-149.96 225.28-149.96 362.040s53.258 265.334 149.96 362.040c96.706 96.702 225.28 149.96 362.040 149.96s265.334-53.258 362.040-149.96c96.702-96.706 149.96-225.28 149.96-362.040s-53.258-265.334-149.96-362.040zM896 512c0 82.814-26.354 159.588-71.112 222.38l-535.266-535.268c62.792-44.758 139.564-71.112 222.378-71.112 211.738 0 384 172.262 384 384zM128 512c0-82.814 26.354-159.586 71.112-222.378l535.27 535.268c-62.794 44.756-139.568 71.11-222.382 71.11-211.738 0-384-172.262-384-384z",
  pick:
    "M896 0h-768c-70.4 0-128 57.6-128 128v768c0 70.4 57.6 128 128 128h768c70.4 0 128-57.6 128-128v-768c0-70.4-57.6-128-128-128zM448 794.51l-237.254-237.256 90.51-90.508 146.744 146.744 306.746-306.746 90.508 90.51-397.254 397.256z"
};
