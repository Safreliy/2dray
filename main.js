//import CanvasSVG from "canvas-svg/trunk/canvas-getsvg";
document.addEventListener("DOMContentLoaded", function(event) {

    let mode;
    let brightness = 50;
    let first_step_obstacle = false;
    let density = 7;
    let point_sources = [];
    let flat_mirrors = [];
    let obstacles = [];
    let beams = [];
    let rays = [];
    let point_buffer = [];
    let mousePosition = {
        x: 0,
        y: 0
    };
    

    let density_value = document.getElementById('density_value');
    let density_slider = document.getElementById('density_slider');
    let brightness_value = document.getElementById('brightness_value');
    let brightness_slider = document.getElementById('brightness_slider');

    let canvas_wrapper = document.getElementsByClassName('canvas');
    let layer1 = document.getElementById('layer1');
    let layer2 = document.getElementById('layer2');

    let ctx1 = layer1.getContext("2d");
    let ctx2 = layer2.getContext("2d");



    let ray_btn = document.getElementById("ray");
    let beam_btn = document.getElementById("beam");
    let point_btn = document.getElementById("point_source");
    let flat_mirror_btn = document.getElementById("flat_mirror");
    let coll_lens_btn = document.getElementById("coll_lens");
    let diff_lens_btn = document.getElementById("diff_lens");
    let obstacle_btn = document.getElementById("obstacle");
    let save_btn = document.getElementById("saveButton");


    ray_btn.addEventListener("mouseup", (event)=>{mode=1});
    beam_btn.addEventListener("mouseup", (event)=>{mode=2});
    point_btn.addEventListener("mouseup", (event)=>{mode=3});
    flat_mirror_btn.addEventListener("mouseup", (event)=>{mode=4});
    coll_lens_btn.addEventListener("mouseup", (event)=>{mode=5});
    diff_lens_btn.addEventListener("mouseup", (event)=>{mode=6});
    obstacle_btn.addEventListener("mouseup", (event)=>{mode=7});
    save_btn.addEventListener("mouseup", (event)=>{
        //download(createSvg(), "image", "image/svg+xml");
        download(createSvg(), "image", "text/html");
    });
    let canvas_offset = layer1.getBoundingClientRect();


    let cs = getComputedStyle(canvas_wrapper[0]);
    let width = parseInt(cs.getPropertyValue('width'), 10);
    let height = parseInt(cs.getPropertyValue('height'), 10);

    layer1.width = width;
    layer1.height = height;
    layer2.width = width;
    layer2.height = height;

    let ctxSVG = new C2S(width,height);

    add_borders();

    density_slider.addEventListener("input",(event) => {
        density = event.target.value;
        density_value.innerHTML = density;
        renderAll();
    });
    brightness_slider.addEventListener("input",(event) => {
        brightness = event.target.value;
        brightness_value.innerHTML = `${brightness}%`;
        renderAll()
    });

    clear(ctx2);

    layer1.addEventListener("mousemove", (event) => {
        mousePosition = {
            x: event.pageX - canvas_offset.x,
            y: event.pageY - canvas_offset.y
        }

        ctx2.beginPath();
        clear(ctx2);
        draw_point(mousePosition.x, mousePosition.y, ctx2);
        ctx2.stroke();


        ctx1.strokeStyle = `rgba(255, 255, 255, ${brightness/100})`;
        ctxSVG.strokeStyle = `rgba(255, 255, 255, ${brightness/100})`;
        ctx2.strokeStyle = `rgba(255, 255, 255, ${brightness/100})`;
        if(first_step_obstacle) {
            ctx2.beginPath();
            draw_point(point_buffer[0].x, point_buffer[0].y, ctx2);
            ctx2.moveTo(point_buffer[0].x, point_buffer[0].y);
            ctx2.lineTo(mousePosition.x, mousePosition.y);
            ctx2.stroke();
        }

    });


    layer1.addEventListener("mouseup", (event) => {
        switch (mode) {
            case 1:
                add_ray();
                break;
            case 2:
                add_beam();
                break;
            case 3:
                add_point_source(event);
                break;
            case 4:
                add_flat_mirror();
                break;
            case 5:
                add_coll_lens();
                break;
            case 6:
                add_diff_lens();
                break;
            case 7:
                add_obstacle(event);
                break;
        }
        renderAll();
    });

    function add_two_point_entity (arr) {
        if(!first_step_obstacle) {
            first_step_obstacle = true;
            point_buffer.push(mousePosition);
        }
        else {
            point_buffer.push(mousePosition);
            arr.push(point_buffer);
            first_step_obstacle = false;
            point_buffer = [];
        }
    }

    function add_ray() {
        add_two_point_entity(rays);
    }

    function add_flat_mirror() {
        add_two_point_entity(flat_mirrors);
    }

    function add_obstacle() {
        add_two_point_entity(obstacles);
    }

    function add_beam() {
        add_two_point_entity(beams);
    }

    function add_borders() {
        obstacles.push([
            {x:-1,y:-1},
            {x:-1,y:layer1.height}]);
        obstacles.push([
            {x:-1,y:-1},
            {x:layer1.width,y:-1}]);
        obstacles.push([
            {x:-1,y:layer1.height},
            {x:layer1.width,y:layer1.height}]);
        obstacles.push([
            {x:layer1.width,y:-1},
            {x:layer1.width,y:layer1.height}]);
    }

    function add_point_source(event) {
        point_sources.push([mousePosition.x, mousePosition.y]);
    }

    function render_obstacles() {
        ctx1.beginPath();
        ctx1.strokeStyle = `red`;
        obstacles.forEach((obstacle)=>{
           draw_point(obstacle[0].x, obstacle[0].y, ctx1);
           draw_point(obstacle[1].x, obstacle[1].y, ctx1);
           ctx1.moveTo(obstacle[0].x, obstacle[0].y);
           ctx1.lineTo(obstacle[1].x, obstacle[1].y);
           ctx1.stroke();
        });

        ctxSVG.beginPath();
        ctxSVG.strokeStyle = `red`;
        obstacles.forEach((obstacle)=>{
            draw_point(obstacle[0].x, obstacle[0].y, ctxSVG);
            draw_point(obstacle[1].x, obstacle[1].y, ctxSVG);
            ctxSVG.moveTo(obstacle[0].x, obstacle[0].y);
            ctxSVG.lineTo(obstacle[1].x, obstacle[1].y);
            ctxSVG.stroke();
        });
    }

    function render_flat_mirrors() {
        ctx1.beginPath();
        ctx1.strokeStyle = `blue`;
        flat_mirrors.forEach((mirror)=>{
            draw_point(mirror[0].x, mirror[0].y, ctx1);
            draw_point(mirror[1].x, mirror[1].y, ctx1);
            ctx1.moveTo(mirror[0].x, mirror[0].y);
            ctx1.lineTo(mirror[1].x, mirror[1].y);
            ctx1.stroke();
        });

        ctxSVG.beginPath();
        ctxSVG.strokeStyle = `blue`;
        flat_mirrors.forEach((mirror)=>{
            draw_point(mirror[0].x, mirror[0].y, ctxSVG);
            draw_point(mirror[1].x, mirror[1].y, ctxSVG);
            ctxSVG.moveTo(mirror[0].x, mirror[0].y);
            ctxSVG.lineTo(mirror[1].x, mirror[1].y);
            ctxSVG.stroke();
        });

    }

    function draw_point(x, y, ctx) {
        ctx.fillStyle = "red";
        ctx.fillRect(x - 2, y - 2, 4,  4);
    }

    function clear(ctx) {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, layer1.width, layer1.height);
    }

    function update_sources() {
        ctx1.strokeStyle = `rgba(255, 255, 255, ${brightness/100})`;

        ctxSVG.strokeStyle = `rgba(255, 255, 255, ${brightness/100})`;
        point_sources.forEach((source)=>{
            let step = 2 * Math.PI / parseInt(density_value.innerHTML, 10);
            for (let i = 0; i < 2 * Math.PI; i += step) {
                renderRay([
                    {x: source[0], y: source[1]},
                    {x: source[0] + Math.sin(i)*5000, y: source[1] + Math.cos(i)*5000}
                ]);
            }
        });
        rays.forEach((source)=>{
            ctx1.strokeStyle = `rgba(255, 255, 255, ${brightness/100})`;
            draw_point(source[0].x, source[0].y, ctx1);

            ctxSVG.strokeStyle = `rgba(255, 255, 255, ${brightness/100})`;
            draw_point(source[0].x, source[0].y, ctxSVG);
            renderRay(source);
        });
        beams.forEach((source)=>{
            draw_point(source[0].x, source[0].y, ctx1);
            draw_point(source[1].x, source[1].y, ctx1);
            ctx1.strokeStyle = "gray"
            ctx1.moveTo(source[0].x, source[0].y);
            ctx1.lineTo(source[1].x, source[1].y);
            ctx1.stroke();
            ctx1.strokeStyle = `rgba(255, 255, 255, ${brightness/100})`;

            draw_point(source[0].x, source[0].y, ctxSVG);
            draw_point(source[1].x, source[1].y, ctxSVG);
            ctxSVG.strokeStyle = "gray"
            ctxSVG.moveTo(source[0].x, source[0].y);
            ctxSVG.lineTo(source[1].x, source[1].y);
            ctxSVG.stroke();
            ctxSVG.strokeStyle = `rgba(255, 255, 255, ${brightness/100})`;
            
            let numOfRays = parseInt(density_value.innerHTML, 10);
            let vector = {
                x: (source[1].x - source[0].x) / numOfRays,
                y: (source[1].y - source[0].y) / numOfRays
            }
            let length = lengthVec(vector);
            let step = length / numOfRays;

            let normal = getNormalVector(vector);
            let checkNormalDirection = normal.x * vector.y - normal.y * vector.x;

            if (checkNormalDirection > 0) {
                normal = {
                    x: -normal.x,
                    y: -normal.y
                };
            }
            for (let i = 0; i < numOfRays; i ++) {
                let start = {
                    x: source[0].x + vector.x*i,
                    y: source[0].y + vector.y*i
                };
                let end = {
                    x: start.x + normal.x,
                    y: start.y + normal.y
                }
                renderRay([
                    start,
                    end
                ]);
            }
        });
    }

    function renderAll() {
        ctx1.clearRect(0, 0, layer1.width, layer2.height);
        ctxSVG.clearRect(0, 0, layer1.width, layer2.height);
        update_sources();
        render_flat_mirrors();
        render_obstacles();
    }

    function renderRay(ray) {
        let minDistance = Infinity;
        let minIntersect;
        let currentMirror;
        obstacles.forEach((obstacle)=>{
            let intersect = checkIntersect(obstacle, ray);
            if (intersect) {
                let dist = distance(ray[0].x, ray[0].y, intersect.x, intersect.y);
                if (minDistance > dist) {
                    minDistance = dist;
                    minIntersect = intersect;
                }
            }
        });
        flat_mirrors.forEach((mirror)=>{
            let intersect = checkIntersect(mirror, ray);
            if (intersect) {
                let dist = distance(ray[0].x, ray[0].y, intersect.x, intersect.y);
                if (minDistance > dist) {
                    minDistance = dist;
                    minIntersect = intersect;
                    currentMirror = mirror;
                }
            }
        });
        ctx1.beginPath();
        ctxSVG.beginPath();
        
        if(minIntersect) {
            ctx1.moveTo(ray[0].x, ray[0].y);
            ctx1.lineTo(minIntersect.x, minIntersect.y);
            ctx1.stroke();

            ctxSVG.moveTo(ray[0].x, ray[0].y);
            ctxSVG.lineTo(minIntersect.x, minIntersect.y);
            ctxSVG.stroke();
            if(currentMirror) {
                let n = getNormalVector({
                    x:currentMirror[1].x - currentMirror[0].x,
                    y:currentMirror[1].y - currentMirror[0].y
                });
                let l = {
                    x: (ray[0].x - ray[1].x),
                    y: (ray[0].y - ray[1].y)
                };

                let ln = dotProduct(l,n);
                if(ln < 0) {
                    n = {
                        x: -n.x,
                        y: -n.y
                    };
                    ln = -ln;
                }

                let resVector = normalize({
                    x: -l.x + 2 * n.x * ln,
                    y: -l.y + 2 * n.y * ln
                });
                renderRay([
                    {
                      x: minIntersect.x + resVector.x*5,
                      y: minIntersect.y + resVector.y*5
                    },
                    {
                        x: resVector.x*10 + minIntersect.x,
                        y: resVector.y*10 + minIntersect.y
                    }
                ]);
            }
        }
        else {
            ctx1.moveTo(ray[0].x, ray[0].y);
            ctx1.lineTo(ray[1].x, ray[1].y);
            ctx1.stroke();

            ctxSVG.moveTo(ray[0].x, ray[0].y);
            ctxSVG.lineTo(ray[1].x, ray[1].y);
            ctxSVG.stroke();
        }
    }

    function normalize(vec) {
        let length = lengthVec(vec);
        return({
            x: vec.x / length,
            y: vec.y / length
        });
    }
    function dotProduct(vec1, vec2) {
        return vec1.x*vec2.x + vec1.y*vec2.y;
    }

    function getNormalVector(vec) {
        let n = {
            x: -vec.y/vec.x,
            y: 1
        }
        return (normalize(n));
    }

    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
    }

    function lengthVec(vec) {
        return Math.sqrt(dotProduct(vec,vec));
    }

    function checkIntersect(obstacle, ray) {
        const x1 = obstacle[0].x;
        const y1 = obstacle[0].y;
        const x2 = obstacle[1].x;
        const y2 = obstacle[1].y;

        const x3 = ray[0].x;
        const y3 = ray[0].y;
        const x4 = ray[1].x;
        const y4 = ray[1].y;

        const den = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
        if (den == 0) {
            return;
        }

        const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / den;
        const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / den;
        if (t > 0 && t < 1 && u > 0) {
            let intersect = {
                x: x1 + t * (x2 - x1),
                y: y1 + t * (y2 - y1)
            }
            return intersect;
        } else {
            return;
        }
    }

    function download(data, filename, type) {
        let file = new Blob([data], {type: type});
        if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
        else { // Others
            let a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);
            }, 0);
        }
    }

    function createSvg() {
        var mySerializedSVG = ctxSVG.getSerializedSvg();
        var svg = ctxSVG.getSvg();
        return svg.outerHTML.slice(0, 5) + "style=\"background-color:black\"" + svg.outerHTML.slice(4);
    }
});
