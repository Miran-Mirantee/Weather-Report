uniform sampler2D uSmokeTexture;
uniform vec3 uColor;

varying float vAlpha;
varying float vRotate;

vec2 rotate2D(vec2 v, float angle, vec2 center) {
    // Translate the vector to the origin
    vec2 translatedV = v - center;
    
    // Calculate the rotation matrix
    float cosAngle = cos(angle);
    float sinAngle = sin(angle);
    mat2 rotationMatrix = mat2(cosAngle, -sinAngle, 
                               sinAngle, cosAngle);
    
    // Rotate the vector
    vec2 rotatedV = rotationMatrix * translatedV;
    
    // Translate the vector back to the original center
    return rotatedV + center;
}

void main() {
    vec2 rotatedUv = rotate2D(gl_PointCoord, vRotate, vec2(0.5));
    vec3 color = uColor;

    float smokeTexture = texture(uSmokeTexture, rotatedUv.xy).r;
    smokeTexture *= vAlpha;

    gl_FragColor = vec4(color, smokeTexture);

    #include <tonemapping_fragment>
    #include <colorspace_fragment>
}