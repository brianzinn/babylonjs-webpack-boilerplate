import { Engine, InternalTexture, Texture, EventState } from 'babylonjs';
import ddimg from '../assets/2D/dungeons_and_flagons3.jpg';

export default class TextureHotLoader {

    private _engine: Engine;
    private _hmrMappedUrls : Set<String>  = new Set<string>();
    private _textureUrlMap: Map<string, Texture> = new Map<string, Texture>();

    constructor(engine: Engine, requiredAssetsToResolve: string[]) {
        this._engine = engine;

        console.log('ddimg in thl', ddimg);

        //const assetContext = require.context('../assets/', true);
        //require('../assets/2D/dungeons_and_flagons3.jpg');

        engine.onBeforeTextureInitObservable.add(this.onBeforeTextureInit);
        engine.getLoadedTexturesCache().forEach((internalTexture: InternalTexture) => {
            if (!internalTexture.isReady) {
                internalTexture.onLoadedObservable.add((internalTexture: InternalTexture) => {
                    console.log('internal texture ready -> loaded:', internalTexture.url);
                })
            }
        });
    }

    onHMRAccept = (url: string) : void => {
        if(module.hot){
            if (this._hmrMappedUrls.has(url)) {
                console.warn(`Url already mapped (not hot reloading): ${url}!`);
                return;
            }

            this._hmrMappedUrls.add(url);
            let hotAcceptUrl = '..' + url; // url.substr(1);
            console.log(`adding hot accept for: '${hotAcceptUrl}'`)

            //let resolvedImage = require.resolve(hotAcceptUrl);
            //console.log('resolvedImage:', resolvedImage);

            // '../assets/2D/dungeons_and_flagons3.jpg' /* require.resolve(hotAcceptUrl) */
            module.hot.accept('../assets/2D/dungeons_and_flagons3.jpg', () => {
                const matchingInternalTexture = this.findInternalTextureByUrl(url);
                
                if (!matchingInternalTexture) {
                    console.error('HMR accepted and internal texture NOT found.')
                    return;
                }

                let img = new Image();
                img.onload = () => {
                    // assumes want to restore on context lost among other things
                    console.info(`assigning buffer and forcing texture reload '${url}'`)
                    matchingInternalTexture._buffer = img;
                    matchingInternalTexture._rebuild();
                }
 
                const newUrl = matchingInternalTexture.url + '?' + Date.now();
                console.log(`redownloading image at '${newUrl}'..`);
                img.src = newUrl;
            })
        } else {
            console.warn('not hot - cannot add HMR');
        }
    }

    findInternalTextureByUrl = (url: string) => {
        return this._engine.getLoadedTexturesCache().find(texture => texture.url === url);
    }

    onTextureLoaded = (texture: Texture, eventState: EventState) : void => {
        if (texture.url) {
            this._textureUrlMap.set(texture.url, texture);
            const matchingInternalTexture = this.findInternalTextureByUrl(texture.url);
            
            if (matchingInternalTexture) {
                this.onHMRAccept(matchingInternalTexture.url);
            }
        }
    }

    onBeforeTextureInit = (texture: Texture, eventState: EventState) : void => {
        texture.onLoadObservable.add(this.onTextureLoaded);
    }
}