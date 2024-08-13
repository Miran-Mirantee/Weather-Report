uniform float uSize;
uniform float uPixelRatio;
uniform float uTime;

attribute float aScale;

void main() {
    vec3 newPosition = position;
    newPosition.y -= uTime * ((1.0 - aScale) + 1.0);
    newPosition.y = mod(newPosition.y, 3.5);

    newPosition.x -= sin(uTime * aScale) * pow(aScale, 3.0) * 0.5;
    newPosition.z -= cos((uTime + 0.1) * (1.0 - aScale)) * pow(aScale, 3.0) * 0.5;

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;
    
    gl_Position = projectionPosition;
    gl_PointSize = uSize * uPixelRatio * aScale;
    gl_PointSize *= (1.0 / - viewPosition.z);

}