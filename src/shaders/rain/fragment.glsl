uniform float uOpacity;
uniform vec3 uColor;

void main() {

    float strength = 1.0 - step(0.1, pow(abs(gl_PointCoord.x - 0.5), 0.5));
    strength *= smoothstep(0.0, 0.8, gl_PointCoord.y);

    gl_FragColor = vec4(uColor, strength * uOpacity);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}