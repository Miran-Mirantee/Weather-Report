uniform vec3 uColor;

void main() {
    float alpha = 1.0 - smoothstep(0.2, 0.5, distance(gl_PointCoord, vec2(0.5)));

    gl_FragColor = vec4(uColor, alpha);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}