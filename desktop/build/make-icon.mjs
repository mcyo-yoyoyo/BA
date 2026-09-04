import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Resvg } from '@resvg/resvg-js';
import pngToIco from 'png-to-ico';

const dir = path.dirname(fileURLToPath(import.meta.url));
const svg = fs.readFileSync(path.join(dir, 'icon.svg'));

function pngAt(size) {
    return new Resvg(svg, {
        fitTo: { mode: 'width', value: size },
        background: 'rgba(0,0,0,0)'
    }).render().asPng();
}

const png512 = pngAt(512);
fs.writeFileSync(path.join(dir, 'icon.png'), png512);
const ico = await pngToIco([pngAt(16), pngAt(32), pngAt(48), pngAt(64), pngAt(128), pngAt(256)]);
fs.writeFileSync(path.join(dir, 'icon.ico'), ico);
console.log('wrote desktop/build/icon.png and icon.ico');
