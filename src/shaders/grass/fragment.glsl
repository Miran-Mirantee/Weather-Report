uniform sampler2D uPerlinTexture;
uniform vec3 uGrassColor;
uniform vec3 uSnowColor;
uniform float uTemp1;
uniform float uTemp2;
uniform float uTemp3;

varying vec2 vUv;

void main() {
    vec3 color = vec3(0.0);
    float noiseTexture = texture(uPerlinTexture, vUv).r;
    float mixStrength = smoothstep(0.0, uTemp2, noiseTexture);
    mixStrength = pow(mixStrength, 4.248);
    color = mix(uGrassColor, uSnowColor, mixStrength);

    csm_DiffuseColor = vec4(color, 1.0);
}