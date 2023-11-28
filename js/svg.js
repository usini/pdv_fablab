function load_svg(svg_file, divObj, endcallback) {
    fetch(svg_file).then(function (response) {
        return response.text();
    }).then(function (svg) {
        document.getElementById(divObj).innerHTML = svg;
        setTimeout(function () {
            endcallback();
        }, 5);

    }).catch(function (error) {
    });
}