uniform sampler2D uSmokeTexture;

varying float vAlpha;

void main() {
    float smokeTexture = texture(uSmokeTexture, gl_PointCoord).r;
    smokeTexture *= vAlpha;

    gl_FragColor = vec4(1.0, 1.0, 1.0, smokeTexture);
}