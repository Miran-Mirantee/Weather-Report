uniform vec3 uTentColor;
uniform vec3 uSnowColor;
uniform float uSnowCoverage;

varying vec3 vPosition;

void main() {
    vec3 color = vec3(0.0);
    float mixStrength = vPosition.y;
    mixStrength = smoothstep(0.0, 1.0 - uSnowCoverage, mixStrength);
    mixStrength = pow(mixStrength, 4.248 * 2.0);

    if (uSnowCoverage == 0.0) {
        mixStrength = 0.0;
    }
    color = mix(uTentColor, uSnowColor, mixStrength);

    csm_DiffuseColor = vec4(color, 1.0);
}