import React from 'react';

export default ({ outerStyle, innerStyle, text, action }) => {
  return (
    <div
      className="outerLi"
      style={outerStyle}
      onClick={action}
      onKeyPress={action}
      role="button"
      tabIndex={0}
    >
      <div className="innerLi" style={innerStyle}>
        {!innerStyle && text}
      </div>
      <style jsx>
        {`
          .outerLi {
            color: white;
            font-size: 1.2rem;
            outline: none;
            display: flex;
            align-items: center;
            margin: auto;
            width: calc(48.5% - 24px - 2px);
            width: 100%;
            padding: 6px 12px;
            overflow: hidden;
            text-align: center;
            font-weight: bold;
            height: 75px;
            border-radius: 25px;
            box-shadow: 0 4px 20px rgba(255, 255, 255, 0.2);
            transition: 200ms linear;
            margin-bottom: 14px;
          }
          .innerLi {
            width: 100%;
          }
          .outerLi:hover {
            transform: scale(1.04);
            cursor: pointer;
          }
          .outerLi:active {
            opacity: 0.85;
          }
        `}
      </style>
    </div>
  );
};
