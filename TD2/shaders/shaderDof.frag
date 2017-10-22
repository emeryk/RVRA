uniform mat4 projectionMatrix2;
uniform mat4 inverseProjectionMatrix;

uniform float focusDistance;
uniform float pupilDiameter;
uniform float pixelPitch;

uniform vec2 gazePos;

uniform sampler2D colorMap;
uniform sampler2D depthMap;
uniform vec2 textureSize;

varying vec2 vUv;

float distToFrag( float z_buffer ) {
	float zndc = 2.0 * z_buffer - 1.0;
	vec4 view = inverseProjectionMatrix * vec4(1.0, 1.0, zndc, 1.0);
  return view.z;
}

float computeCoC( float fragDist, float focusDist ) {
	float M = 17.0 / (focusDist - 17.0);
	float coc = M * pupilDiameter * (abs(fragDist - focusDist) / fragDist);
	return coc / pixelPitch;
}

vec4 computeBlur( float radius ) {

		int rPixel = int(radius / pixelPitch);
    vec4 color = vec4(0,0,0,0);

		int cpt = 0;

    int i = - rPixel;
    for (int x = 0; x <= 30; x++) {
       if (i > rPixel)
			 	break;

       int j = - rPixel;
       for (int y = 0; y <= 30; y++) {
          if (j > rPixel)
						break;

          if (i*i + j*j <= rPixel*rPixel) {
              vec2 uv = vUv + vec2(float(i), float(j)) / textureSize;
              color.rgb += texture2D(colorMap, uv).rgb;
              cpt++;
          } j++;
       } i++;
    }

    color.rgb /= float(cpt);
    return color;
}

void main() {
    float fragDist = distToFrag(texture2D(depthMap, vUv).r);
    float blurRadius = computeCoC(fragDist, focusDistance);

    gl_FragColor = computeBlur(blurRadius);
}
