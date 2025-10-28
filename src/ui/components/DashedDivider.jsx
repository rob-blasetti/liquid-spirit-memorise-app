import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Line } from 'react-native-svg';

const DEFAULT_COLOR = 'rgba(0,0,0,0.15)';

const DashedDivider = ({
  width = 180,
  thickness = 2,
  color = DEFAULT_COLOR,
  dashWidth = 6,
  dashGap = 4,
  style,
}) => {
  const flattened = StyleSheet.flatten(style) || {};
  const styleWidth = typeof flattened.width === 'number' ? flattened.width : undefined;
  const styleHeight = typeof flattened.height === 'number' ? flattened.height : undefined;
  const lineWidth = styleWidth ?? width;
  const lineHeight = styleHeight ?? thickness;

  return (
    <View style={[styles.container, { width: lineWidth, height: lineHeight }, style]}>
      <Svg width={lineWidth} height={lineHeight}>
        <Line
          x1="0"
          y1={lineHeight / 2}
          x2={lineWidth}
          y2={lineHeight / 2}
          stroke={color}
          strokeWidth={lineHeight}
          strokeDasharray={`${dashWidth},${dashGap}`}
          strokeLinecap="round"
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
  },
});

export default DashedDivider;
