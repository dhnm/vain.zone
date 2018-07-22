"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = rankPoints => {
    const processedRankPoints = (rawRankPoints => {
        const rankPointLimits = [
            -2800,
            0,
            109,
            218,
            327,
            436,
            545,
            654,
            763,
            872,
            981,
            1090,
            1200,
            1250,
            1300,
            1350,
            1400,
            1467,
            1533,
            1600,
            1667,
            1733,
            1800,
            1867,
            1933,
            2000,
            2134,
            2267,
            2400,
            2600,
            2800
        ];
        let rankProgress = 0.0;
        for (let i = 1; i < rankPointLimits.length; i += 1) {
            if (rawRankPoints >= rankPointLimits[i - 1] &&
                rawRankPoints < rankPointLimits[i]) {
                rankProgress =
                    (rawRankPoints - rankPointLimits[i - 1]) /
                        (rankPointLimits[i] - 1 - rankPointLimits[i - 1]);
                return {
                    value: rawRankPoints,
                    progress: rankProgress * 100,
                    skillTier: i - 2
                };
            }
        }
        return {
            value: rawRankPoints,
            progress: 100,
            skillTier: rankPointLimits.length - 2
        };
    })(rankPoints);
    const skillTierFormats = (rawSkillTier => {
        let tierNumber = Math.floor(rawSkillTier / 3) + 1;
        let tierName = "";
        const colorNumber = rawSkillTier % 3;
        let colorName = "";
        switch (tierNumber) {
            case 1:
                tierName = "Just Beginning";
                break;
            case 2:
                tierName = "Getting There";
                break;
            case 3:
                tierName = "Rock Solid";
                break;
            case 4:
                tierName = "Worthy Foe";
                break;
            case 5:
                tierName = "Got Swagger";
                break;
            case 6:
                tierName = "Credible Threat";
                break;
            case 7:
                tierName = "The Hotness";
                break;
            case 8:
                tierName = "Simply Amazing";
                break;
            case 9:
                tierName = "Pinnacle of Awesome";
                break;
            case 10:
                tierName = "Vainglorious";
                break;
            default:
                tierNumber = 0;
                tierName = "Unranked";
        }
        switch (colorNumber) {
            case 0:
                colorName = " Bronze";
                break;
            case 1:
                colorName = " Silver";
                break;
            case 2:
                colorName = " Gold";
                break;
            default:
                colorName = "";
        }
        return {
            number: tierNumber,
            name: tierName,
            color: colorName
        };
    })(processedRankPoints.skillTier);
    return { ...processedRankPoints, ...skillTierFormats };
};
//# sourceMappingURL=skillTierCalculator.js.map