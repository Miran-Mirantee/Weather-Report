uniform sampler2D uPerlinTexture;
uniform vec3 uGrassColor;
uniform vec3 uSnowColor;
uniform float uSnowCoverage;


varying vec2 vUv;

void main() {
    vec3 color = vec3(0.0);
    float noiseTexture = texture(uPerlinTexture, vUv).r;
    float mixStrength = smoothstep(0.0, 1.0 - uSnowCoverage, noiseTexture);
    mixStrength = pow(mixStrength, 4.248);
    if (uSnowCoverage == 0.0) {
        mixStrength = 0.0;
    }
    color = mix(uGrassColor, uSnowColor, mixStrength);

    csm_DiffuseColor = vec4(color, 1.0);
}