import * as BABYLON from 'babylonjs';
import TextureHotLoader from './textureHotLoader';

// const pathToAssets = require.context('./assets', true);

class Game {
    private _canvas: HTMLCanvasElement;
    private _engine: BABYLON.Engine;
    private _scene?: BABYLON.Scene;
    private _camera?: BABYLON.FreeCamera;

    constructor(canvasId : string) {
        // Create canvas and engine.
        this._canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this._engine = new BABYLON.Engine(this._canvas, true);

        new TextureHotLoader(this._engine, [
            '../assets/2D/dungeons_and_flagons3.jpg'
        ]);
    }

    createMaterial(url: string) : BABYLON.StandardMaterial {
        let material = new BABYLON.StandardMaterial("sphere_material", this._scene!);
        material.diffuseTexture = new BABYLON.Texture(url, this._scene!);

        return material;
    }

    createScene() : void {
        // Create a basic BJS Scene object.
        this._scene = new BABYLON.Scene(this._engine);
    
        // Create a FreeCamera, and set its position to (x:0, y:5, z:-10).
        this._camera = new BABYLON.FreeCamera('camera1', new BABYLON.Vector3(0, 5,-10), this._scene);
        
        // Target the camera to scene origin.
        this._camera.setTarget(BABYLON.Vector3.Zero());
        
        // Attach the camera to the canvas.
        this._camera.attachControl(this._canvas, false);
        
        // Create a basic light, aiming 0,1,0 - meaning, to the sky.
        new BABYLON.HemisphericLight('light1', new BABYLON.Vector3(0,1,0), this._scene);
        
        let sphereMaterial = new BABYLON.StandardMaterial("sphere_material", this._scene);
        sphereMaterial.diffuseColor = new BABYLON.Color3(1, 0.5, 0.5);                        
        
        // Create a built-in "sphere" shape; with 16 segments and diameter of 2.
        let sphere = BABYLON.MeshBuilder.CreateSphere('sphere1', {segments: 16, diameter: 2}, this._scene);
        sphere.material = sphereMaterial;
        // Move the sphere upward 1/2 of its height.
        sphere.position.y = 1;

        // animate the sphere
        this.ApplyRotationAnimation(sphere);

        // Create a built-in "ground" shape.
        const ground1 = BABYLON.MeshBuilder.CreateGround('ground1', {width: 2, height: 2, subdivisions: 2}, this._scene);
        ground1.material = this.createMaterial("/assets/2D/dungeons_and_flagons3.jpg");
        ground1.position.x += 3;   

        // the path to the texture corresponds to the path after you build your project (npm run build)
        const ground2 = BABYLON.MeshBuilder.CreateGround('ground2', {width: 2, height: 2, subdivisions: 2}, this._scene);
        ground2.material = this.createMaterial("/assets/2D/dungeons_and_flagons3.jpg");
        ground2.position.x -= 3;   
    }

    doRender() : void {
        if (!this._scene) {
            console.error('call createScene() before doRender()')
        }
        // Run the render loop.
        this._engine.runRenderLoop(() => {
            this._scene!.render();
        });

        // The canvas/window resize event handler.
        window.addEventListener('resize', () => {
            this._engine.resize();
        });
    }

    ApplyRotationAnimation(mesh:BABYLON.Mesh):void{
        let frameRate = 6;
        let duration = 6;

        let xSlide = new BABYLON.Animation("xSlide", "position", frameRate, BABYLON.Animation.ANIMATIONTYPE_VECTOR3, BABYLON.Animation.ANIMATIONLOOPMODE_CYCLE);

        let keyFrames = []; 

        keyFrames.push({
            frame: 0,
            value: new BABYLON.Vector3(0,1,-1),
            outTangent: new BABYLON.Vector3(1, 0, 0)
            //interpolation: BABYLON.AnimationKeyInterpolation.STEP
        });

        keyFrames.push({
            frame: duration/2,
            inTangent: new BABYLON.Vector3(-1, 0, 0),
            value: new BABYLON.Vector3(0, 1, 1),
            outTangent: new BABYLON.Vector3(-1, 0, 0)
            //interpolation: BABYLON.AnimationKeyInterpolation.STEP
        });

        keyFrames.push({
            frame: duration,
            value: new BABYLON.Vector3(0,1,-1),
            inTangent: new BABYLON.Vector3(1, 0, 0)
            //interpolation: BABYLON.AnimationKeyInterpolation.STEP
        });

        xSlide.setKeys(keyFrames);

        let anim = this._scene.beginDirectAnimation(mesh, [xSlide], 0, duration, true);
        anim.speedRatio = .5;

    }
}

window.addEventListener('DOMContentLoaded', () => {
    // Create the game using the 'renderCanvas'.
    let game = new Game('renderCanvas');

    // Create the scene.
    console.log('creating the scene.')
    game.createScene();

    // Start render loop.
    game.doRender();
});