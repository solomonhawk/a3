varying vec3 vVertexColor;

#ifdef USE_TEXTURE
	varying vec2 vVertexUV;
#endif

void main() {
	vec4 vertexFinalColor = vec4(vVertexColor, 1.0);
	
	#ifdef USE_TEXTURE
		vertexFinalColor *= texture2D(uTexture, vVertexUV);
	#endif
	
	vertexFinalColor.a *= uAlpha;
	
	gl_FragColor = vertexFinalColor;
}