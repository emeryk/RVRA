uniform sampler2D colorMap;

// center of lens for un-distortion (in normalized coordinates between 0 and 1)
uniform vec2 centerCoordinate;

// lens distortion parameters
uniform vec2 K;

// texture coordinates
varying vec2 vUv;

void main() {
	// TODO

	float c0 = centerCoordinate[0];
	float c1 = centerCoordinate[1];

	float v0 = vUv[0];
	float v1 = vUv[1];

	float k0 = K[0];
	float k1 = K[1];

	vec2 v = vec2(v0 - c0, v1 - c1);
	float r = sqrt((v0 - c0) * (v0 - c0) + (v1 - c1) * (v1 - c1));

	float x = c0 + (v0 - c0) * (1.0 + k0 * r * r + k1 * r * r * r * r);
	float y = c1 + (v1 - c1) * (1.0 + k0 * r * r + k1 * r * r * r * r);

	if (x > 0.0 && x < 1.0 && y > 0.0 && y < 1.0)
		gl_FragColor = texture2D(colorMap, vec2(x, y));
	else
		gl_FragColor = vec4(0, 0, 0, 1);


	//gl_FragColor = texture2D(colorMap, vUv);
}
