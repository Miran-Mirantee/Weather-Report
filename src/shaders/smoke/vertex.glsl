uniform float uSize;
uniform float uPixelRatio;
uniform float uTime;

attribute float aScale;

varying float vAlpha;

void main() {
    vec3 newPosition = position;
    newPosition.y += uTime * 0.5;
    newPosition.y = mod(newPosition.y, 3.5);
    newPosition.xz *= mod(newPosition.y, 3.5) * 0.5 + 0.5;
    float progress = newPosition.y / 3.5;
    
    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;

    gl_Position = projectionPosition;
    gl_PointSize = uSize * uPixelRatio * aScale;
    gl_PointSize *= 1.0 / -viewPosition.z;

    // Varyings
    vAlpha = smoothstep(0.0, 0.15, progress);
}