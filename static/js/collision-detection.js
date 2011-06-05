function addVector(vec1, vec2){
	return {
		x: vec1.x+vec2.x,
		y: vec1.y+vec2.y,
		z: vec1.z+vec2.z
	}
}

function subVector(vec1, vec2){
	return {
		x: vec1.x-vec2.x,
		y: vec1.y-vec2.y,
		z: vec1.z-vec2.z
	}
}


/**
 *compute dot product of two same sized vectors 
 */
function dotProduct(vec1,vec2){
	var sum = 0;
	for (var i in vec1){
		sum += vec1[i]*vec2[i];
	}
	return sum;
}
/**
* cross product of two 3D vectors
*/
function crossProduct(vec1, vec2){
	return {x:vec1.y*vec2.z-vec2.y*vec1.z,
			y:vec1.x*vec2.z-vec2.x*vec1.z,
			z:vec1.x*vec2.y-vec2.x*vec1.y};
}
/**
* absolute values of cross product of two 3D vectors
*/
function absCrossProduct(vec1, vec2){
	return {x: Math.abs(vec1.y*vec2.z-vec2.y*vec1.z),
			y: Math.abs(vec1.x*vec2.z-vec2.x*vec1.z),
			z: Math.abs(vec1.x*vec2.y-vec2.x*vec1.y)};
}

function faks_triangleIntersectionTest(face1,face2){
	var normal1 = faks.data.normals[face1.normals[0]]; //face1.normals[1] face1.normals[2] should be the same 
	var normal2 = faks.data.normals[face2.normals[0]]; //face1.normals[1] face1.normals[2] should be the same 
	var d1 = -dotProduct(normal1, faks.data.vertices[face1.vertices[0]]);
	var d2 = -dotProduct(normal2, faks.data.vertices[face2.vertices[0]]);
	
	//calculate distances of of all vertexes in face1 from the plane of face2
	var d1v0 = dotProduct(normal2, faks.data.vertices[face1.vertices[0]]) + d2;
	var d1v1 = dotProduct(normal2, faks.data.vertices[face1.vertices[1]]) + d2;
	var d1v2 = dotProduct(normal2, faks.data.vertices[face1.vertices[2]]) + d2;
	
	if ((d1v0 > 0 && d1v1 > 0 && d1v2 >0) || (d1v0 < 0 && d1v1 < 0 && d1v2 < 0)){
		return 0; // no collisoin possible, the triangle is above or below the plane
	}
	
	if (d1v0 == 0 && d1v1 == 0 && d1v2 ==0){
		return 1;// triangles are laying on the same plane
	}
	
	//calculate distances of of all vertexes in face2 from the plane of face1
	var d2v0 = dotProduct(normal1, faks.data.vertices[face2.vertices[0]]) + d1;
	var d2v1 = dotProduct(normal1, faks.data.vertices[face2.vertices[1]]) + d1;
	var d2v2 = dotProduct(normal1, faks.data.vertices[face2.vertices[2]]) + d1;

	if ((d2v0 > 0 && d2v1 > 0 && d2v2 >0) || (d2v0 < 0 && d2v1 < 0 && d2v2 < 0)){
		return 0; // no collisoin possible, the triangle is above or below the plane
	}
	
	var L = absCrossProduct(normal1, normal2); //intersect vector of the two planes
	var max = 'y';
	if (L.x>L.y && L.x>L.z){ // x cord is the biggest
		max = 'x';
	}else if( L.z>L.y){ // z cord is the biggest
		max = 'z';
	}// y cord is the biggest
	
	var p1v0 = faks.data.vertices[face1.vertices[0]][max];
	var p1v1 = faks.data.vertices[face1.vertices[1]][max];
	var p1v2 = faks.data.vertices[face1.vertices[2]][max];
	var p2v0 = faks.data.vertices[face2.vertices[0]][max];
	var p2v1 = faks.data.vertices[face2.vertices[1]][max];
	var p2v2 = faks.data.vertices[face2.vertices[2]][max];
	
	if (d1v0 * d1v1 < 0){
		t11 = p1v0 + (p1v1-p1v0) * (d1v0 / (d1v0 - d1v1));
		if (d1v0 * d1v2 < 0){
			t12 = p1v0 + (p1v2-p1v0) * (d1v0 / (d1v0 - d1v2));
		}else{
			t12 = p1v1 + (p1v2-p1v1) * (d1v1 / (d1v1 - d1v2));
		}
	}else{
		t11 = p1v2 + (p1v0-p1v2) * (d1v2 / (d1v2 - d1v0));
		t12 = p1v2 + (p1v1-p1v2) * (d1v2 / (d1v2 - d1v1));
	}
	
	if (d2v0 * d2v1 < 0){
		t21 = p2v0 + (p2v1-p2v0) * (d2v0 / (d2v0 - d2v1));
		if (d2v0 * d2v2 < 0){
			t22 = p2v0 + (p2v2-p2v0) * (d2v0 / (d2v0 - d2v2));
		}else{
			t22 = p2v1 + (p2v2-p2v1) * (d2v1 / (d2v1 - d2v2));
		}
	}else{
		t21 = p2v2 + (p2v0-p2v2) * (d2v2 / (d2v2 - d2v0));
		t22 = p2v2 + (p2v1-p2v2) * (d2v2 / (d2v2 - d2v1));
	}
	
	if (Math.min(t21,t22)>Math.max(t11,t12) || Math.max(t21,t22)<Math.min(t11,t12)){
		return 0;
	}

	return 1;
}

/**
 * face = {
 *   normal : {x, y, z},
 *   vertices : [
 *	   {x, y, z},
 *	   {x, y, z},
 *	   {x, y, z}
 *   ]
 * }
 */

function triangleIntersectionTest(face1,face2){
	var t11,t12,t21,t22;
	var d1 = -dotProduct(face1.normal, face1.vertices[0]);
	var d2 = -dotProduct(face2.normal, face2.vertices[0]);
	
	//calculate distances of of all vertexes in face1 from the plane of face2
	var d1v0 = dotProduct(face2.normal, face1.vertices[0]) + d2;
	var d1v1 = dotProduct(face2.normal, face1.vertices[1]) + d2;
	var d1v2 = dotProduct(face2.normal, face1.vertices[2]) + d2;
	
	if ((d1v0 > 0 && d1v1 > 0 && d1v2 >0) || (d1v0 < 0 && d1v1 < 0 && d1v2 < 0)){
		return 0; // no collisoin possible, the triangle is above or below the plane
	}
	
	if (d1v0 == 0 && d1v1 == 0 && d1v2 ==0){
		return 1;// triangles are laying on the same plane
	}
	
	//calculate distances of of all vertexes in face2 from the plane of face1
	var d2v0 = dotProduct(face1.normal, face2.vertices[0]) + d1;
	var d2v1 = dotProduct(face1.normal, face2.vertices[1]) + d1;
	var d2v2 = dotProduct(face1.normal, face2.vertices[2]) + d1;

	if ((d2v0 > 0 && d2v1 > 0 && d2v2 >0) || (d2v0 < 0 && d2v1 < 0 && d2v2 < 0)){
		return 0; // no collisoin possible, the triangle is above or below the plane
	}
	
	var L = absCrossProduct(face1.normal, face2.normal); //intersect vector of the two planes
	var max = 'y';
	if (L.x>L.y && L.x>L.z){ // x cord is the biggest
		max = 'x';
	}else if( L.z>L.y){ // z cord is the biggest
		max = 'z';
	}// y cord is the biggest
	
	var p1v0 = face1.vertices[0][max];
	var p1v1 = face1.vertices[1][max];
	var p1v2 = face1.vertices[2][max];
	var p2v0 = face2.vertices[0][max];
	var p2v1 = face2.vertices[1][max];
	var p2v2 = face2.vertices[2][max];
	if (d1v0 * d1v1 < 0){
		t11 = p1v0 + (p1v1-p1v0) * (d1v0 / (d1v0 - d1v1));
		if (d1v0 * d1v2 < 0){
			t12 = p1v0 + (p1v2-p1v0) * (d1v0 / (d1v0 - d1v2));
		}else{
			t12 = p1v1 + (p1v2-p1v1) * (d1v1 / (d1v1 - d1v2));
		}
	}else{
		t11 = p1v2 + (p1v0-p1v2) * (d1v2 / (d1v2 - d1v0));
		t12 = p1v2 + (p1v1-p1v2) * (d1v2 / (d1v2 - d1v1));
	}
	
	if (d2v0 * d2v1 < 0){
		t21 = p2v0 + (p2v1-p2v0) * (d2v0 / (d2v0 - d2v1));
		if (d2v0 * d2v2 < 0){
			t22 = p2v0 + (p2v2-p2v0) * (d2v0 / (d2v0 - d2v2));
		}else{
			t22 = p2v1 + (p2v2-p2v1) * (d2v1 / (d2v1 - d2v2));
		}
	}else{
		t21 = p2v2 + (p2v0-p2v2) * (d2v2 / (d2v2 - d2v0));
		t22 = p2v2 + (p2v1-p2v2) * (d2v2 / (d2v2 - d2v1));
	}
	
	if (Math.min(t21,t22)>Math.max(t11,t12) || Math.max(t21,t22)<Math.min(t11,t12)){
		//console.log("miss");
		return 0;
	}
	//console.log("collision");
	return 1;
}
