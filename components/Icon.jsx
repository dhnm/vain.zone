import React from 'react';
import PropTypes from 'prop-types';

const Icon = (props) => {
  const styles = {
    svg: {
      display: 'inline-block',
      margin: `auto ${1.7 / 11 * props.size}px`,
    },
    path: {
      fill: props.color,
    },
  };

  return (
    <svg
      style={styles.svg}
      width={`${props.size}px`}
      height={`${props.size}px`}
      viewBox="0 0 1024 1024"
    >
      <path style={styles.path} d={props.icon} />
    </svg>
  );
};

export default Icon;

Icon.propTypes = {
  icon: PropTypes.string.isRequired,
  size: PropTypes.number,
  color: PropTypes.string,
};

Icon.defaultProps = {
  size: 11,
  color: 'black',
};
