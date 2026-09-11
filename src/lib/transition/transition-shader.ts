export const transitionVertexShader = `
  varying vec2 vUv;

  void main() {
    vUv = uv;

    gl_Position =
      projectionMatrix *
      modelViewMatrix *
      vec4(position, 1.0);
  }
`;

export const transitionFragmentShader = `
  precision highp float;

  varying vec2 vUv;

  uniform float uTime;
  uniform float uProgress;
  uniform float uOpacity;
  uniform vec2 uResolution;
  uniform float uSeed;


  // ============================================================
  // HASH
  // ============================================================

  float hash(vec3 p) {

    p = fract(
      p * 0.3183099 +
      vec3(0.1, 0.2, 0.3)
    );

    p *= 17.0;

    return fract(
      p.x *
      p.y *
      p.z *
      (p.x + p.y + p.z)
    );
  }


  // ============================================================
  // 3D NOISE
  // ============================================================

  float noise(vec3 p) {

    vec3 i = floor(p);
    vec3 f = fract(p);

    f =
      f * f *
      (3.0 - 2.0 * f);


    float n000 =
      hash(i + vec3(0.0, 0.0, 0.0));

    float n100 =
      hash(i + vec3(1.0, 0.0, 0.0));

    float n010 =
      hash(i + vec3(0.0, 1.0, 0.0));

    float n110 =
      hash(i + vec3(1.0, 1.0, 0.0));


    float n001 =
      hash(i + vec3(0.0, 0.0, 1.0));

    float n101 =
      hash(i + vec3(1.0, 0.0, 1.0));

    float n011 =
      hash(i + vec3(0.0, 1.0, 1.0));

    float n111 =
      hash(i + vec3(1.0, 1.0, 1.0));


    float nx00 =
      mix(n000, n100, f.x);

    float nx10 =
      mix(n010, n110, f.x);

    float nx01 =
      mix(n001, n101, f.x);

    float nx11 =
      mix(n011, n111, f.x);


    float nxy0 =
      mix(nx00, nx10, f.y);

    float nxy1 =
      mix(nx01, nx11, f.y);


    return mix(
      nxy0,
      nxy1,
      f.z
    );
  }


  // ============================================================
  // FBM
  // ============================================================

  const mat3 ROTATION = mat3(
     0.96, -0.26,  0.10,
     0.27,  0.95, -0.14,
    -0.06,  0.16,  0.99
  );


  float fbm(
    vec3 p,
    int octaves
  ) {

    float value = 0.0;
    float amplitude = 0.5;
    float total = 0.0;

    for (int i = 0; i < 5; i++) {

      if (i >= octaves) {
        break;
      }

      value +=
        noise(p) *
        amplitude;

      total += amplitude;

      p =
        ROTATION *
        p *
        2.01;

      amplitude *= 0.5;
    }

    return value /
      max(total, 0.0001);
  }


  // ============================================================
  // CLOUD FIELD
  // ============================================================

  float cloudDensity(
    vec3 p,
    float coverage
  ) {

    vec3 seed =
      vec3(
        uSeed * 1.7,
        uSeed * 0.9,
        uSeed * 2.3
      );


    // Large-scale deformation.
    vec3 warp = vec3(
      fbm(
        p * 0.30 + seed,
        3
      ),

      fbm(
        p * 0.30 + seed + 17.0,
        3
      ),

      fbm(
        p * 0.30 + seed + 31.0,
        3
      )
    );


    vec3 warped =
      p +
      (warp - 0.5) *
      1.35;


    // Main cloud mass.
    float base =
      fbm(
        warped * 0.52 + seed,
        4
      );


    // Smaller erosion detail.
    float detail =
      fbm(
        warped * 2.15 + seed * 1.2,
        3
      );


    float density =
      base -
      (1.0 - detail) *
      0.20;


    density =
      smoothstep(
        1.0 - coverage - 0.14,
        1.0 - coverage + 0.24,
        density
      );


    return clamp(
      density,
      0.0,
      1.0
    );
  }


  // ============================================================
  // MAIN
  // ============================================================

  void main() {

    vec2 uv =
      vUv;


    // ==========================================================
    // SCREEN COORDINATES
    // ==========================================================

    float aspect =
      uResolution.x /
      uResolution.y;


    vec2 p =
      (uv - 0.5) *
      vec2(
        aspect,
        1.0
      );


    // ==========================================================
    // NATURAL PROGRESS
    // ==========================================================

    float progress =
      clamp(
        uProgress,
        0.0,
        1.0
      );


    /*
     * Quintic easing.
     *
     * This gives us a very gentle start and finish.
     */
    float eased =
      progress *
      progress *
      progress *
      (
        progress *
        (
          progress *
          6.0 -
          15.0
        ) +
        10.0
      );


    // ==========================================================
    // ATMOSPHERIC ARRIVAL
    // ==========================================================

    /*
     * Clouds should NOT immediately become visible.
     *
     * The first portion of the transition is almost invisible.
     */
    float atmosphere =
      smoothstep(
        0.04,
        0.42,
        eased
      );


    // ==========================================================
    // CAMERA TRAVEL
    // ==========================================================

    /*
     * Very gentle camera movement initially.
     *
     * Most of the perceived movement happens naturally
     * in the middle of the cloud volume.
     */
    float travel =
      smoothstep(
        0.08,
        0.94,
        eased
      );


    travel =
      pow(
        travel,
        1.12
      );


    vec3 cameraPosition =
      vec3(
        0.0,
        0.0,
        -travel * 5.4
      );


    // ==========================================================
    // VERY SUBTLE CAMERA DRIFT
    // ==========================================================

    /*
     * This is deliberately tiny.
     *
     * It prevents the scene from feeling mathematically locked
     * without looking like camera shake.
     */

    cameraPosition.x +=
      sin(
        uTime * 0.16
      ) *
      0.025 *
      atmosphere;


    cameraPosition.y +=
      cos(
        uTime * 0.13
      ) *
      0.018 *
      atmosphere;


    // ==========================================================
    // NATURAL LENS CHANGE
    // ==========================================================

    /*
     * No dramatic FOV kick.
     *
     * Instead the ray gently widens as we approach the cloud bank.
     */
    float lens =
      1.0 +
      smoothstep(
        0.30,
        0.92,
        eased
      ) *
      0.075;


    // ==========================================================
    // CAMERA RAY
    // ==========================================================

    vec3 rayOrigin =
      cameraPosition +
      vec3(
        p.x * 2.15 * lens,
        p.y * 1.25 * lens,
        0.0
      );


    vec3 rayDirection =
      normalize(
        vec3(
          p.x * 0.16 * lens,
          p.y * 0.16 * lens,
          1.0
        )
      );


    // ==========================================================
    // CLOUD MOTION
    // ==========================================================

    /*
     * The cloud itself moves slowly.
     *
     * The camera supplies most of the motion.
     */

    float wind =
      uTime *
      0.022;


    float lateralWind =
      uTime *
      0.009;


    // ==========================================================
    // SUN
    // ==========================================================

    vec3 lightDir =
      normalize(
        vec3(
          0.35,
          0.55,
          -0.55
        )
      );


    // ==========================================================
    // RAYMARCH
    // ==========================================================

    const int STEPS = 28;

    const float MAX_DIST = 7.4;

    float stepSize =
      MAX_DIST /
      float(STEPS);


    float transmittance =
      1.0;


    vec3 accumulatedColor =
      vec3(0.0);


    // ==========================================================
    // CLOUD COVERAGE
    // ==========================================================

    /*
     * IMPORTANT:
     *
     * Coverage doesn't linearly follow progress.
     *
     * This prevents the "effect switched on" appearance.
     */

    float coverageBuild =
      smoothstep(
        0.18,
        0.78,
        eased
      );


    float coverage =
      mix(
        0.055,
        0.72,
        coverageBuild
      );


    // ==========================================================
    // VOLUME
    // ==========================================================

    for (int i = 0; i < STEPS; i++) {

      float fi =
        float(i);


      float depth =
        fi /
        float(STEPS - 1);


      // --------------------------------------------------------
      // TRAVEL THROUGH SPACE
      // --------------------------------------------------------

      vec3 position =
        rayOrigin +
        rayDirection *
        (
          depth *
          MAX_DIST
        );


      vec3 samplePosition =
        position;


      // --------------------------------------------------------
      // DEPTH-DEPENDENT WIND
      // --------------------------------------------------------

      /*
       * Distant clouds move slowly.
       * Nearby clouds move slightly faster.
       *
       * This creates natural parallax.
       */

      float layerSpeed =
        mix(
          0.55,
          1.25,
          depth
        );


      samplePosition.z +=
        wind *
        layerSpeed;


      samplePosition.x +=
        lateralWind *
        (
          0.55 +
          depth *
          0.75
        );


      // --------------------------------------------------------
      // VERY SUBTLE TURBULENCE
      // --------------------------------------------------------

      samplePosition.y +=
        sin(
          samplePosition.z *
          1.15 +
          uTime *
          0.07
        ) *
        0.055;


      // --------------------------------------------------------
      // DEPTH SCALE
      // --------------------------------------------------------

      float depthScale =
        mix(
          0.82,
          1.24,
          depth
        );


      samplePosition *=
        depthScale;


      // --------------------------------------------------------
      // CLOUD DEPTH WEIGHT
      // --------------------------------------------------------

      float depthWeight =
        smoothstep(
          0.0,
          0.22,
          depth
        );


      // --------------------------------------------------------
      // LOCAL COVERAGE
      // --------------------------------------------------------

      float localCoverage =
        coverage *
        mix(
          0.82,
          1.30,
          depth *
          travel
        );


      // --------------------------------------------------------
      // CLOUD DENSITY
      // --------------------------------------------------------

      float density =
        cloudDensity(
          samplePosition,
          localCoverage
        );


      density *=
        depthWeight;


      // --------------------------------------------------------
      // SOFT FOREGROUND BUILD-UP
      // --------------------------------------------------------

      float foreground =
        smoothstep(
          0.38,
          0.92,
          eased
        );


      density *=
        mix(
          0.78,
          1.25,
          foreground *
          depth
        );


      // --------------------------------------------------------
      // SOFT DENSITY
      // --------------------------------------------------------

      density =
        smoothstep(
          0.015,
          0.78,
          density
        );


      // --------------------------------------------------------
      // CLOUD SAMPLE
      // --------------------------------------------------------

      if (density > 0.003) {

        // ------------------------------------------------------
        // SELF SHADOW
        // ------------------------------------------------------

        float shadowDensity =
          0.0;


        vec3 shadowPosition =
          samplePosition;


        const float SHADOW_STEP = 0.34;


        for (int s = 0; s < 2; s++) {

          shadowPosition +=
            lightDir *
            SHADOW_STEP;


          shadowDensity +=
            cloudDensity(
              shadowPosition *
              depthScale,
              localCoverage
            );
        }


        float lightReach =
          exp(
            -shadowDensity *
            1.30
          );


        // ------------------------------------------------------
        // BEER-LAMBERT ABSORPTION
        // ------------------------------------------------------

        float absorption =
          density *
          stepSize *
          1.95;


        float slabTransmittance =
          exp(
            -absorption
          );


        // ------------------------------------------------------
        // POWDER EFFECT
        // ------------------------------------------------------

        float powder =
          1.0 -
          exp(
            -density *
            2.7
          );


        // ------------------------------------------------------
        // AMBIENT LIGHT
        // ------------------------------------------------------

        vec3 ambient =
          mix(
            vec3(
              0.075,
              0.085,
              0.105
            ),

            vec3(
              0.20,
              0.205,
              0.22
            ),

            depth
          );


        // ------------------------------------------------------
        // SUNLIGHT
        // ------------------------------------------------------

        vec3 sunColor =
          vec3(
            1.0,
            0.93,
            0.82
          );


        vec3 lighting =
          ambient +
          sunColor *
          lightReach *
          (
            0.80 +
            powder *
            0.35
          );


        // ------------------------------------------------------
        // ACCUMULATION
        // ------------------------------------------------------

        float contribution =
          transmittance *
          (
            1.0 -
            slabTransmittance
          );


        accumulatedColor +=
          contribution *
          lighting;


        transmittance *=
          slabTransmittance;
      }


      // --------------------------------------------------------
      // EARLY TERMINATION
      // --------------------------------------------------------

      if (
        transmittance <
        0.025
      ) {
        break;
      }
    }


    // ==========================================================
    // CLOUD ALPHA
    // ==========================================================

    float cloudAlpha =
      1.0 -
      transmittance;


    // ==========================================================
    // DEEP ATMOSPHERIC BACKGROUND
    // ==========================================================

    vec3 skyTop =
      vec3(
        0.025,
        0.032,
        0.052
      );


    vec3 skyHorizon =
      vec3(
        0.085,
        0.095,
        0.12
      );


    float skyAmount =
      clamp(
        p.y + 0.5,
        0.0,
        1.0
      );


    vec3 sky =
      mix(
        skyHorizon,
        skyTop,
        skyAmount
      );


    // ==========================================================
    // FINAL CLOUD COLOR
    // ==========================================================

    vec3 finalColor =
      mix(
        sky,
        accumulatedColor,
        cloudAlpha
      );


    // ==========================================================
    // SOFT SILVER LINING
    // ==========================================================

    float rim =
      pow(
        1.0 -
        min(
          1.0,
          length(
            p * 0.72
          )
        ),
        2.5
      );


    float rimAmount =
      smoothstep(
        0.12,
        0.78,
        eased
      );


    finalColor +=
      vec3(
        0.14,
        0.125,
        0.095
      ) *
      rim *
      cloudAlpha *
      (
        0.30 +
        rimAmount *
        0.55
      );


    // ==========================================================
    // SOFT VIGNETTE
    // ==========================================================

    float vignette =
      smoothstep(
        1.20,
        0.30,
        length(p)
      );


    finalColor *=
      mix(
        0.78,
        1.0,
        vignette
      );


    // ==========================================================
    // FINAL ALPHA
    // ==========================================================

    float finalAlpha =
      cloudAlpha *
      uOpacity *
      atmosphere;


    /*
     * Extremely soft alpha response.
     *
     * This removes the obvious "fullscreen effect" beginning.
     */

    finalAlpha =
      smoothstep(
        0.005,
        0.72,
        finalAlpha
      );


    gl_FragColor =
      vec4(
        finalColor,
        finalAlpha
      );
  }
`;