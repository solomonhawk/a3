varying vec3 vVertexColor;

#ifdef USE_TEXTURE 
	varying vec2 vVertexUV;
#endif

#ifdef USE_ENVMAP
	varying vec3 vVertexRef;
#endif

void main() {
	vec4 vertexFinalColor = vec4(vVertexColor, 1.0);
	
	#ifdef USE_TEXTURE 
		vertexFinalColor *= texture2D(uTexture, vVertexUV);
	#endif
	
	#ifdef USE_ENVMAP
		vertexFinalColor *= textureCube(uEnvironment, vVertexRef);
	#endif
	
	vertexFinalColor.a *= uAlpha;
	
	gl_FragColor = vertexFinalColor;
}