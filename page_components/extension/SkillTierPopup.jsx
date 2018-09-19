import React from "react";
import PropTypes from "prop-types";
import { Popup, Image, Progress } from "semantic-ui-react";

import skillTierCalculator from "./../../functions/skillTierCalculator";

const propTypes = {
  rankPoints: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired
};

export default function SkillTierPopup({ rankPoints, mode }) {
  const skillTierInfo = skillTierCalculator(rankPoints);

  return (
    <Popup
      trigger={
        <div
          style={{
            float: "right",
            position: "relative",
            marginRight: "-5px",
            marginLeft: "2px"
          }}
        >
          <Image
            size="tiny"
            src={`/static/img/rank/c/${skillTierInfo.number} ${
              skillTierInfo.color
            }.png`}
            style={{
              width: "40px",
              margin: 0,
              marginBottom: "-6px"
              // marginRight: "18px"
            }}
          />
          <strong
            style={{
              fontSize: "0.85rem",
              marginLeft: "-9px" // -24
            }}
          >
            {mode}
          </strong>
        </div>
      }
    >
      <Popup.Header>
        {skillTierInfo.name}
        {skillTierInfo.color}
      </Popup.Header>
      <Progress percent={skillTierInfo.progress} size="tiny">
        {skillTierInfo.value.toFixed(2)}
      </Progress>
    </Popup>
  );
}

SkillTierPopup.propTypes = propTypes;
