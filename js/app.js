import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import fragment from './shaders/fragment.glsl';
import vertex from './shaders/vertex.glsl';

import ocean from '../img/ocean.jpg';

export default class Sketch {
    constructor(options) {
        this.time = 0;
        this.container = options.dom;
        this.scene = new THREE.Scene();

        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;

        this.camera = new THREE.PerspectiveCamera( 70, this.width / this.height, 100, 2000 );
        this.camera.position.z = 600;


        this.camera.fov = 2*Math.atan( (this.height/2)/600 )* (180/Math.PI);

        this.renderer = new THREE.WebGLRenderer( { 
            antialias: true,
            alpha: true
         } );
        // this.renderer.setSize( this.width, this.height );
        // this.renderer.setAnimationLoop( animation );
        this.container.appendChild( this.renderer.domElement );


        this.controls = new OrbitControls( this.camera, this.renderer.domElement);


        this.images = [...document.querySelectorAll('img')];

        const fontOpen = new Promise(resolve => {
            new FontFaceObserver("Open Sans").load().then(()=> {
                resolve();
            })
        })

        const fontPlayfair = new Promise(resolve => {
            new FontFaceObserver("PLayfair Display").load().then(()=> {
                resolve();
            })
        })
        
        const preloadImages = new Promise(resolve => {
            new imagesLoaded(document.querySelectorAll("img"), {Background: true} ,resolve());
        })

        let allDone = [fontOpen, fontPlayfair, preloadImages];

        Promise.all(allDone).then(() => {
            this.addImages();
            this.setPosition();
            this.resize();
            this.setupResize();
            this.addObjects();
            this.render();
        }) 
    }

    setupResize() {
        window.addEventListener('resize', this.resize.bind(this));
    }

    resize() {
        this.width = this.container.offsetWidth;
        this.height = this.container.offsetHeight;
        this.renderer.setSize( this.width, this.height)
        this.camera.aspect = this.width / this.height;
        this.camera.updateProjectionMatrix()
    }


    addImages() {
        this.imageStore = this.images.map(img => {
            let bounds = img.getBoundingClientRect()

            let geometry = new THREE.PlaneBufferGeometry(bounds.width,bounds.height, 1,1)

            let material = new THREE.MeshBasicMaterial({color: 0xff0000})

            let mesh = new THREE.Mesh(geometry, material)

            this.scene.add(mesh)

            return {
                img: img,
                mesh: mesh,
                top: bounds.top,
                left: bounds.left,
                width: bounds.width,
                height: bounds.height
            }
        })

        console.log(this.imageStore);
    }


    setPosition() {
        this.imageStore.forEach(o => {
            o.mesh.position.y = -o.top + this.height/2 - o.height/2;
            o.mesh.position.x = o.left - this.width/2 + o.width/2;
        })
    }

    addObjects() {
        
    this.geometry = new THREE.PlaneBufferGeometry( 200, 400,10,10);
    // this.geometry = new THREE.SphereBufferGeometry( 0.5,40,40);
	this.material = new THREE.MeshNormalMaterial();

    this.material = new THREE.ShaderMaterial({
        uniforms: {
            time: {value: 0},
            oceanTexture: {value: new THREE.TextureLoader().load(ocean)}
        },
        side: THREE.DoubleSide,
        fragmentShader: fragment,
        vertexShader:  vertex,
        wireframe: true
    })

	this.mesh = new THREE.Mesh( this.geometry, this.material );
	this.scene.add( this.mesh );

    }
    // Create render loop

    render() {

        this.time+=0.05;
        this.mesh.rotation.x = this.time / 2000;
	    this.mesh.rotation.y = this.time / 1000;

        this.material.uniforms.time.value = this.time;

	    this.renderer.render( this.scene, this.camera );
        // console.log(this.time); Check out the magic of time incrementing in 0.05 ms!
        window.requestAnimationFrame(this.render.bind(this));
    }
}

new Sketch({
    dom: document.getElementById('container')
});




// First thing to do is to add some Objects to our scene as well as a resize function.
// Line 49-53 is our first object we are going to add.

// Next we need to populate our animation loop we can take the code from three.js and
// add it to our render function.

// When you change something in three.js you have to deliberatly say you changed it!
// In this instance for resizing we need to update our camera metrics or matrix metrics.

// Once changing the buffer geo to plane when rotating the plane the posterior plane is invisible
// Just set the side key to our objects.    side: THREE.DoubleSide,


// By adding the wireframe: true we can see inside our shapes and shaders and all the points 
// in the 3d space. this.geometry = new THREE.PlaneBufferGeometry( 0.5, 0.5,10,10); Awesome grid looking cube



// Once we apply the shader vertex using PI we want to add uniforms to our object as well
// Then since we have to update our time we do this in the render function.
//  this.material.uniforms.time.value = this.time;

// this.geometry = new THREE.PlaneBufferGeometry( 4, 4,50,50); to create realistic wave.
