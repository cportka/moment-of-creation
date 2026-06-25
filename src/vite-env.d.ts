/// <reference types="vite/client" />

// The animation contract — the handful of globals the overlay's inline boot script
// defines on `window` (see README.md). Declared here so the engine + lab are typed.
declare global {
  interface Window {
    /** Live tuning dials for the mounted animation (read/write). */
    __ospDials?: Record<string, number>;
    /** Play the mounted animation from the top — the generic entry the lab calls. */
    __ospPlay?: () => void;
    /** The intro's full-sequence play function (creation → splash). */
    __ospIntro?: () => void;
    /** Which slice of a multi-mode overlay to play (e.g. 'moment' | 'burst' | 'merger'). */
    __ospMode?: string;
    /** Intro: play just the moment-of-creation burst (splash hidden). */
    __ospCreation?: () => void;
    /** Intro: play just the binary-merger splash (creation hidden). */
    __ospSplashOnly?: () => void;
    /** The one hook you define: load your app under the opening hold. */
    __ospBoot?: () => void;
    /** Guard so __ospBoot fires at most once. */
    __ospBooted?: boolean;
    /** Intro-specific: (pre)build the splash. */
    __ospSplash?: (defer?: boolean) => void;
    /** Intro-specific: play a (prebuilt) splash. */
    __ospSplashPlay?: () => void;
    /** Intro-specific: performance.now() of the splash's first painted frame. */
    __ospSplashStart?: number;
  }
}

export {};
