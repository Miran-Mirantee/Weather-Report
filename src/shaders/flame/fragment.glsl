uniform sampler2D uPerlinTexture;
uniform sampler2D uGradientTexture;
uniform float uTime;
uniform vec3 firstColor;
uniform vec3 secondColor;
uniform vec3 thirdColor;

void main() {
    // Animate
    vec2 uv = gl_PointCoord;
    uv.y += uTime * 1.0;
    uv.x *= 1.5;

    float noiseTexture = texture(uPerlinTexture, uv).r;
    float gradientTexture = texture(uGradientTexture, gl_PointCoord).r;
    float mask1 = step(noiseTexture, gradientTexture);
    float mask2 = step(noiseTexture, gradientTexture - 0.2);
    float mask3 = step(noiseTexture, gradientTexture - 0.4);

    float layer1 = mask1 - mask2;
    float layer2 = mask2 - mask3;
    float alpha = mask1 - mask3;

    vec3 color = vec3(0.0);
    color = mix(secondColor, firstColor, layer1);
    color = mix(color, thirdColor, layer2);

    // float strength = 1.0 -uv.y;
    gl_FragColor = vec4(color, mask1);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}