uniform vec3 uLeavesColor;
uniform vec3 uSnowColor;
uniform float uSnowCoverage;

varying vec3 vLeavesNormal;

void main() {
    vec3 color = vec3(0.0);
    float mixStrength = smoothstep(0.0, 1.0, uSnowCoverage * -vLeavesNormal.y) * 0.7;

    if (uSnowCoverage == 0.0) {
        mixStrength = 0.0;
    }
    color = mix(uLeavesColor, uSnowColor, mixStrength);

    csm_DiffuseColor = vec4(color, 1.0);
}