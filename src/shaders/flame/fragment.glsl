uniform sampler2D uPerlinTexture;
uniform sampler2D uGradientTexture;
uniform float uTime;
uniform vec3 uFirstColor;
uniform vec3 uSecondColor;
uniform vec3 uThirdColor;
uniform float uGradientMultiply;
uniform float uColumnMultiply;

void main() {
    // Animate
    vec2 uv = gl_PointCoord;
    uv.y += uTime * 1.0;
    uv.x *= 1.5;

    float noiseTexture = texture(uPerlinTexture, uv).r;
    float gradientTexture = texture(uGradientTexture, gl_PointCoord).r * uGradientMultiply;
    float column = 1.0 - (abs(gl_PointCoord.x - 0.5) * uColumnMultiply);
    gradientTexture *= column;

    float mask1 = step(noiseTexture, gradientTexture);
    float mask2 = step(noiseTexture, gradientTexture - 0.2);
    float mask3 = step(noiseTexture, gradientTexture - 0.4);

    float alpha = mask1;
    alpha *= smoothstep(0.0, 0.15, gl_PointCoord.x);
    alpha *= smoothstep(0.0, 0.15, 1.0 - gl_PointCoord.x);
    alpha *= smoothstep(0.3, 0.5, gl_PointCoord.y);
    alpha *= smoothstep(0.0, 0.1, 1.0 - gl_PointCoord.y);

    float layer1 = mask1 - mask2;
    float layer2 = mask2 - mask3;


    vec3 color = vec3(0.0);
    color = mix(uSecondColor, uFirstColor, layer1);
    color = mix(color, uThirdColor, layer2);

    gl_FragColor = vec4(color, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}