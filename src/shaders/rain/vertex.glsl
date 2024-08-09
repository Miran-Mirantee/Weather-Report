uniform float uSize;
uniform float uPixelRatio;
uniform float uTime;

void main() {
    vec3 newPosition = position;
    newPosition.y -= uTime * 4.0;

    newPosition.y = mod(newPosition.y , 3.5);

    vec4 modelPosition = modelMatrix * vec4(newPosition, 1.0);
    vec4 viewPosition = viewMatrix * modelPosition;
    vec4 projectionPosition = projectionMatrix * viewPosition;


    gl_Position = projectionPosition;
    gl_PointSize = uSize * uPixelRatio;
    gl_PointSize *= (1.0 / - viewPosition.z);
}