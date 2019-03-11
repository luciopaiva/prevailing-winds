
const PLANET_RESOLUTION = 64;
const PLANET_RADIUS = 0.5;

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
        this.loadPlanetTextures();
        this.winds = this.createWindsNonRotatingPlanet();

        this.camera.position.set(0, 0, 2.5);
        this.camera.lookAt(this.planet.position);

        this.scene.add(this.camera);
        this.scene.add(this.spotlight);
        this.scene.add(this.planet);
        this.scene.add(this.winds);

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

    /**
     * Draws wind patterns in a planet that is not rotating (so there's no Coriolis force).
     *
     * @return {THREE.Object3D}
     */
    createWindsNonRotatingPlanet() {
        const TAU = Math.PI * 2;
        const HALF_PI = Math.PI / 2;

        const altitude1 = PLANET_RADIUS * 1.05;
        const altitude2 = PLANET_RADIUS * 1.2;

        const winds = new THREE.Object3D();

        const lonAngleStep = TAU / 12;
        const zoneStep = Math.PI / 6;  // 6 zones

        for (let lon = 0; lon < TAU; lon += lonAngleStep) {
            for (let zone = 0; zone < Math.PI; zone += zoneStep) {
                const latStart = zone + zoneStep * 0.05;
                const latEnd = zone + zoneStep - zoneStep * 0.05;
                const latStep = (latEnd - latStart) / 3;

                const curve = new THREE.CatmullRomCurve3([
                    (new THREE.Vector3()).setFromSphericalCoords(altitude1, latStart, lon),
                    (new THREE.Vector3()).setFromSphericalCoords(altitude1, latStart + latStep, lon),
                    (new THREE.Vector3()).setFromSphericalCoords(altitude1, latStart + latStep * 2, lon),
                    (new THREE.Vector3()).setFromSphericalCoords(altitude1, latEnd, lon),
                    (new THREE.Vector3()).setFromSphericalCoords(altitude2, latEnd, lon),
                    (new THREE.Vector3()).setFromSphericalCoords(altitude2, latEnd - latStep, lon),
                    (new THREE.Vector3()).setFromSphericalCoords(altitude2, latEnd - latStep * 2, lon),
                    (new THREE.Vector3()).setFromSphericalCoords(altitude2, latStart, lon),
                ], true);

                const points = curve.getPoints(800);
                const geometry = (new THREE.BufferGeometry()).setFromPoints(points);
                const material = new THREE.LineBasicMaterial({ color: 0x444444, linewidth: 2 });

                winds.add(new THREE.Line(geometry, material));
            }
        }

        return winds;
    }

    loadPlanetTextures() {
        const mapLoader = new THREE.TextureLoader();
        mapLoader.load("textures/map.jpg", texture => {
            this.planet.material.map = texture;
            this.planet.material.needsUpdate = true;
        });

        const bumpMapLoader = new THREE.TextureLoader();
        bumpMapLoader.load("textures/bump.jpg", texture => {
            this.planet.material.bumpMap = texture;
            this.planet.material.needsUpdate = true;
        });

        // map: https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthmap1k.jpg
        // bump map: https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthbump1k.jpg
        // specular map: https://s3-us-west-2.amazonaws.com/s.cdpn.io/141228/earthspec1k.jpg
    }

    createPlanet() {
        const size = PLANET_RADIUS;
        const geometry = new THREE.SphereGeometry(size, PLANET_RESOLUTION, PLANET_RESOLUTION);
        const material = new THREE.MeshPhongMaterial({
            bumpScale: 0.05,
            specular: new THREE.Color("black"),
            shininess: 0,
        });
        return new THREE.Mesh(geometry, material);
    }
}

window.addEventListener("load", () => new App());
