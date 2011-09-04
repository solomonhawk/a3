varying vec3 aVertexColor;

void main() {
	vec3 aVertEyeNormal = normalize(uNormalMatrix * aVertNormal);
	
	aVertexColor = vec3(
		(aVertEyeNormal.x + 1.0) * 0.5,
		(aVertEyeNormal.y + 1.0) * 0.5,
		max(0.0, aVertEyeNormal.z));
		
	gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertPosition, 1.0);
}