# lights

This is a toy app that uses the [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API) to try and visualize sound as a single color.

It attempts to achieve this by characterizing sound as a combination of pitch, loudness (not to be confused with intensity), and timbre. These values are then mapped into HSL color space.

NOTE: This is still a WIP and needs work. The way through which timbre is quantified is suspect, and the mapping to HSL color space is not ideal. The color mapping should also utilize the time derivatives of pitch, loudness, and timbre.

# usage

```
npm install
bower install
npm run start
```

visit [localhost:8080](http://localhost:8080)

