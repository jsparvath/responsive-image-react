import React, { CSSProperties, useContext } from 'react';
import PlaceHolderContext from './PlaceholderContext';

const coverWrapperContainerStyles: CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  overflow: 'hidden',
  width: '100%',
  height: '100%',
};

const coverWrapperStyles: CSSProperties = {
  position: 'relative',
  top: 0,
  left: 0,
  zIndex: 1,
  width: '100%',
  height: '100%',
};

const coverStyles: CSSProperties = {
  position: 'relative',
  width: '100%',
  height: '100%',
};

export interface CoverPlaceholderProps {
  coverColor: string;
  fadeOutOptions?: {
    fadeOutDurationMs: number;
  };
}

export const CoverPlaceholder = ({
  fadeOutOptions,
  coverColor,
}: CoverPlaceholderProps) => {
  const { isLoaded } = useContext(PlaceHolderContext);

  const transitionOutStyles = fadeOutOptions && {
    transition: `transform ${fadeOutOptions.fadeOutDurationMs}ms`,
    transform: `translate3D(0, ${isLoaded ? '-101%' : '0%'}, 0)`,
  };

  return (
    <div style={coverWrapperContainerStyles}>
      <div style={coverWrapperStyles}>
        <div
          style={{
            ...coverStyles,
            ...transitionOutStyles,
            background: coverColor,
          }}
        />
      </div>
    </div>
  );
};
