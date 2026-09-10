# Matthieu Fuller â€” portfolio

```sh
npm install
npm run dev
npm test
npm run build
```

The desktop homepage is a Three.js flight scene. Phones, reduced-motion visitors, and browsers without working graphics use the project index.

A low-poly plane uses a smoothed third-person chase camera. The inverted T above the crosshair shows attitude. Mouse travel is 500 pixels to full stick; pitch, yaw, and roll rates are 1.05, 0.65, and 1.5 radians/second. Wingtip trails appear during strong pitching or steep pitch angles and fade away.

Terrain uses layered, warped Perlin noise with ridged mountains, beaches, grass, rock, snow, and a water plane. The 160 birds use three-dimensional separation, alignment, and cohesion with terrain and plane avoidance. Ground contact returns the plane to the start.

Click **Start** to begin and capture the mouse. The circular HUD shows stick deflection. Left/right applies roll rate; up pushes the nose down and down pulls it up. Center the stick to stop rolling, then pull while banked to turn. **Q/E** roll, **A/D** yaw about the aircraftâ€™s own vertical axis, **W/S** increase/decrease persistent throttle, **Shift** adds afterburner thrust proportional to throttle, and **Escape** pauses and unlocks. Orientation uses local-axis quaternions with no automatic leveling or pitch limits. Motion remains smoothed. Posts pause flight; closing resumes it. Speed follows thrust, quadratic drag, gravity, and angle-of-attack lift with stall falloff. Climbs spend speed; dives gain it. Momentum allows unpowered zoom climbs. Dry thrust/mass tops out at 8 m/s²; full afterburner provides 16 m/s² against 9.82 m/s² gravity, with no altitude or throttle gate. Lift and drag follow dynamic pressure and an angle-of-attack polar, including induced drag and post-stall flow. Midpoint integration preserves momentum across throttle changes. Pausing preserves momentum and throttle. This is a simplified aerodynamic model without fuel or compressibility.

## Editing projects

Edit the Markdown files in `public/posts/`. They support headings, paragraphs, bullet lists, emphasis, links, standalone images, and fenced code. Raw HTML is escaped.

Project titles, preview images, descriptions, and Markdown paths live in `src/lib/projects.js`. To add a project, add an entry with a unique lowercase slug and its Markdown file. The scene positions projects along a loop automatically.

Posts can be shared as `/#/projects/signalor`. No server routing or CMS is required. A directly opened post closes to the index.

`npm test` checks panel crossings, re-entry suppression, Markdown safety, project/post mappings, aircraft controls, terrain, contrails, and 3D flocking. The flight scene logs frame metrics every 15 seconds while animating.
