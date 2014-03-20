class @ShroomPass extends ShaderPassBase
  update: () ->
    @uniforms.StartRad.value += 0.01
    
  fragmentShader: """
    // Constants
    const float C_PI    = 3.1415;
    const float C_2PI   = 2.0 * C_PI;
    const float C_2PI_I = 1.0 / (2.0 * C_PI);
    const float C_PI_2  = C_PI / 2.0;

    uniform float StartRad;
    uniform float freq;
    uniform float amp;
    uniform vec2 uSize;
    varying vec2 vUv;

    uniform sampler2D uTex;

    void main (void)
    {
        vec2  perturb;
        float rad;
        vec4  color;

        // Compute a perturbation factor for the x-direction
        rad = (vUv.s + vUv.t - 1.0 + StartRad) * freq;

        // Wrap to -2.0*PI, 2*PI
        rad = rad * C_2PI_I;
        rad = fract(rad);
        rad = rad * C_2PI;

        // Center in -PI, PI
        if (rad >  C_PI) rad = rad - C_2PI;
        if (rad < -C_PI) rad = rad + C_2PI;

        // Center in -PI/2, PI/2
        if (rad >  C_PI_2) rad =  C_PI - rad;
        if (rad < -C_PI_2) rad = -C_PI - rad;

        perturb.x  = (rad - (rad * rad * rad / 6.0)) * amp;

        // Now compute a perturbation factor for the y-direction
        rad = (vUv.s - vUv.t + StartRad) * freq;

        // Wrap to -2*PI, 2*PI
        rad = rad * C_2PI_I;
        rad = fract(rad);
        rad = rad * C_2PI;

        // Center in -PI, PI
        if (rad >  C_PI) rad = rad - C_2PI;
        if (rad < -C_PI) rad = rad + C_2PI;

        // Center in -PI/2, PI/2
        if (rad >  C_PI_2) rad =  C_PI - rad;
        if (rad < -C_PI_2) rad = -C_PI - rad;

        perturb.y  = (rad - (rad * rad * rad / 6.0)) * amp;
        vec2 pos = vUv.st;
        pos.x = 1.0 - pos.x;
        color = texture2D(uTex, perturb + pos);

        gl_FragColor = vec4(color.rgb, color.a);
    }
  """
