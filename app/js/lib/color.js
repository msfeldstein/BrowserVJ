function hexToRgba(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result && [
          parseInt(result[1], 16) / 255.0,
          parseInt(result[2], 16) / 255.0,
          parseInt(result[3], 16) / 255.0,
          1.0
        ];
}
