void main() {
	gl_Position = uProjectionMatrix * uModelViewMatrix * vec4(aVertPosition, 1.0);
}