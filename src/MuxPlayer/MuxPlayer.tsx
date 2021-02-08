// https://stream.mux.com/QhB33iydisgSEarLVrPFxm9ssRfyom7duGHZOfjfZIc
import React, { useRef, useEffect, useState } from 'react';
import PlaceHolderContext from '../placeholder/PlaceholderContext';
import styles from './vimeo.module.css';
import { VideoBaseProps } from '../types';
import Hls from 'hls.js';
// import styles from './vimeo.module.scss';
// import { useImageLoad } from '../hooks';
import { Video } from '../Video';

export type MuxPlayerProps = VideoBaseProps & {
  playsInline?: boolean;
  playbackId: string;
  fallbackToGif?: boolean;
};

export const MuxPlayer = React.forwardRef(
  (
    {
      playbackId,
      layout,
      aspectWidth,
      aspectHeight,
      isBackgroundVideo,
      placeholder,
      controls,
      muted,
      onLoad,
      loop,
      autoPlay,
      playsInline,
      fallbackToGif,
      className,
      style,
    }: MuxPlayerProps,
    ref
  ) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);
    // const [hls] = useState(() => new Hls({ enableWorker: false }));
    const videoRef = useRef<HTMLVideoElement>(null);

    // Allow the client to get the ref, while using it in this components as well.
    useEffect(() => {
      if (ref) {
        if (typeof ref === 'function') {
          ref(videoRef.current);
        } else {
          ref.current = videoRef.current;
        }
      }
    }, []);

    // if fallback to gif, do something when fail

    function attemptPlay() {
      videoRef.current
        ?.play()
        .catch(err => console.log('error attempting to play: ', err));
    }

    useEffect(() => {
      const hls = new Hls({ enableWorker: false });
      hls.loadSource(`https://stream.mux.com/${playbackId}.m3u8`);
      if (videoRef.current) {
        hls.attachMedia(videoRef.current);
      }
      if (autoPlay || isBackgroundVideo) {
        attemptPlay();
      }
    }, []);

    return (
      // @ts-ignore sadly have to ignore this as the layout type errors
      <Video
        className={className}
        style={style}
        onLoad={onLoad}
        loop={loop}
        playsInline={playsInline}
        placeholder={placeholder}
        controls={controls}
        muted={muted}
        ref={videoRef}
        layout={layout}
        sources={[]}
        autoPlay={false} // autoPlay should be false as we want to control it from MuxPlayer
        aspectWidth={aspectHeight!} // use the bang, otherwise TS complains because of the layout prop
        aspectHeight={aspectWidth!}
        isBackgroundVideo={isBackgroundVideo}
      />
    );
  }
);
