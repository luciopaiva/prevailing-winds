
const PLANET_RESOLUTION = 64;

class App {

    constructor () {
        this.renderer = new THREE.WebGLRenderer();
        this.scene = new THREE.Scene();
        this.aspect = window.innerWidth / window.innerHeight;
        this.camera = new THREE.PerspectiveCamera(45, this.aspect, 0.1, 1500);
        this.orbitControls = new THREE.OrbitControls(this.camera);
        this.spotlight = new THREE.SpotLight(0x888888, 1, 0, 10, 2);
        this.spotlight.position.set(2, 0, 2);

        this.renderer.setSize(window.innerWidth, window.innerHeight);
        document.querySelector(".container").appendChild(this.renderer.domElement);

        this.planet = this.createPlanet();

        this.camera.position.set(0, 0, 2.5);
        this.camera.lookAt(this.planet.position);

        this.scene.add(this.camera);
        this.scene.add(this.spotlight);
        this.scene.add(this.planet);

        window.addEventListener("resize", this.onResize.bind(this));
        requestAnimationFrame(this.render.bind(this));
    }

    render() {
        this.renderer.render(this.scene, this.camera);
        requestAnimationFrame(this.render.bind(this));
    }

    onResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    createPlanet() {
        const size = 0.5;
        const geometry = new THREE.SphereGeometry(size, PLANET_RESOLUTION, PLANET_RESOLUTION);
        const material = new THREE.MeshPhongMaterial({
            bumpScale: 0.05,
            specular: new THREE.Color("black"),
            shininess: 0,
        });
        const surface = new THREE.Mesh(geometry, material);
        return surface;
    }
}

window.addEventListener("load", () => new App());
