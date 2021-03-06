// https://stream.mux.com/QhB33iydisgSEarLVrPFxm9ssRfyom7duGHZOfjfZIc
import React, { useRef, useEffect, useState } from 'react';
import { VideoBaseProps } from '../types';
import Hls from 'hls.js';
import { Image } from '../Image';
import { Video } from '../Video';

export type MuxPlayerProps = VideoBaseProps & {
  playsInline?: boolean;
  playbackId: string;
  preventLoading?: boolean;
  fallbackGifOptions?: {
    /**
     * Maximum 640px (hard limit by Mux api)
     */
    width: number;
    /**
     * Maximum 640px (hard limit by Mux api)
     */
    height?: number;
    /**
     * Maximum 30fps (hard limit by Mux api)
     */
    fps: number;
  };
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
      fallbackGifOptions,
      preventLoading,
      className,
      style,
      disableRemotePlayback,
    }: MuxPlayerProps,
    ref
  ) => {
    const [useGif, setUseGif] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const [sourceIsLoaded, setSourceIsLoaded] = useState(false);

    // Validate gifOptions
    if (fallbackGifOptions) {
      if (fallbackGifOptions.width > 640) {
        throw new Error(
          `Provided fallbackGifOptions.width was ${fallbackGifOptions.width} for playbackId: ${playbackId}. Max width is 640px (hard limit by the mux api.)`
        );
      }
      if (fallbackGifOptions.height && fallbackGifOptions.height > 640) {
        throw new Error(
          `Provided fallbackGifOptions.height was ${fallbackGifOptions.height} for playbackId: ${playbackId}. Max height is 640px (hard limit by the mux api.)`
        );
      }
      if (fallbackGifOptions.fps > 30) {
        throw new Error(
          `Provided fallbackGifOptions.fps was ${fallbackGifOptions.fps} for playbackId: ${playbackId}. Max fps is 30 (hard limit by the mux api.)`
        );
      }
    }

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

    function attemptPlay() {
      videoRef.current?.play().catch(err => {
        console.log('error attempting to play: ', err);
        if (fallbackGifOptions && (autoPlay || isBackgroundVideo)) {
          console.log('Using Gif as fallback');
          setUseGif(true);
        }
      });
    }

    // @ts-ignore not all codepaths return a value error
    useEffect(() => {
      if (preventLoading) return;

      const src = `https://stream.mux.com/${playbackId}.m3u8`;

      if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
        // This will run in safari, where HLS is supported natively
        videoRef.current.src = src;
        setSourceIsLoaded(true);
      } else if (Hls.isSupported()) {
        const hls = new Hls({ enableWorker: false });
        if (videoRef.current) {
          hls.attachMedia(videoRef.current);
          hls.on(Hls.Events.MEDIA_ATTACHED, function() {
            hls.loadSource(src);
          });
        }
        setSourceIsLoaded(true);
        return () => {
          hls.destroy();
        };
      } else {
        // Hls is not supported
        console.log(`Browser doesn't support Hls.js, Using Gif as fallback`);
        setUseGif(true);
      }
    }, [preventLoading]);

    useEffect(() => {
      if (sourceIsLoaded) {
        if (
          autoPlay ||
          (typeof autoPlay === 'undefined' && isBackgroundVideo)
        ) {
          attemptPlay();
        }
      }
    }, [sourceIsLoaded, autoPlay, isBackgroundVideo]);

    if (useGif && fallbackGifOptions) {
      const gifParams: string[] = [];
      gifParams.push(`width=${fallbackGifOptions.width}`);
      if (fallbackGifOptions.height) {
        gifParams.push(`height=${fallbackGifOptions.height}`);
      }
      gifParams.push(`fps=${fallbackGifOptions.fps}`);

      return (
        // @ts-ignore
        <Image
          layout={layout}
          aspectWidth={aspectWidth}
          aspectHeight={aspectHeight}
          onLoad={onLoad}
          style={style}
          className={className}
          alt=""
          sources={[]}
          src={`https://image.mux.com/${playbackId}/animated.gif?${gifParams.join(
            '&'
          )}`}
          placeholder={placeholder}
        />
      );
    }

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
        disableRemotePlayback={disableRemotePlayback}
      />
    );
  }
);
