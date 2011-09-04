varying vec3 vVertexColor;

#ifdef USE_TEXTURE
	varying vec2 vVertexUV;
#endif

void main() {
	vec4 vertexFinalColor = vec4(vVertexColor, uAlpha);
	
	#ifdef USE_TEXTURE
		vertexFinalColor *= texture2D(uTexture, gl_PointCoord);
	#endif
	
	gl_FragColor = vertexFinalColor;
}