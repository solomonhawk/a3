varying vec3 vVertexColor;

void main() {
	vec4 particlePosition = uModelViewMatrix * vec4(aVertPosition, 1.0);
	vVertexColor = aVertColor;
	
	gl_Position = uProjectionMatrix * particlePosition;
	gl_PointSize = CHUNK[ParticleSize] / (CHUNK[ParticleScale] * length(uEyePosition.xyz - particlePosition.xyz));
}