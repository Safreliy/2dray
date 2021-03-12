document.addEventListener("DOMContentLoaded", function(event) {
    let mode;
    let brightness = 50;
    let first_step_obstacle = false;
    let density = 7;
    let point_sources = [];
    let obstacles = [];
    let rays = [];
    let point_buffer = [];
    let mousePosition = {
        x: 0,
        y: 0
    }
    

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


    ray_btn.addEventListener("mouseup", (event)=>{mode=1});
    beam_btn.addEventListener("mouseup", (event)=>{mode=2});
    point_btn.addEventListener("mouseup", (event)=>{mode=3});
    flat_mirror_btn.addEventListener("mouseup", (event)=>{mode=4});
    coll_lens_btn.addEventListener("mouseup", (event)=>{mode=5});
    diff_lens_btn.addEventListener("mouseup", (event)=>{mode=6});
    obstacle_btn.addEventListener("mouseup", (event)=>{mode=7});

    let canvas_offset = layer1.getBoundingClientRect();


    let cs = getComputedStyle(canvas_wrapper[0]);
    let width = parseInt(cs.getPropertyValue('width'), 10);
    let height = parseInt(cs.getPropertyValue('height'), 10);

    layer1.width = width;
    layer1.height = height;
    layer2.width = width;
    layer2.height = height;

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
                add_beam;
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

    function add_obstacle(event) {
        if(!first_step_obstacle) {

            first_step_obstacle = true;
            point_buffer.push(mousePosition);
        }
        else {
            point_buffer.push(mousePosition);
            obstacles.push(point_buffer);
            first_step_obstacle = false;
            point_buffer = [];
        }
    }

    function add_point_source(event) {
        point_sources.push([mousePosition.x, mousePosition.y]);
    }

    function render_obstacle() {
        ctx1.beginPath();
        ctx1.strokeStyle = `red`;
        obstacles.forEach((obstacle)=>{
           draw_point(obstacle[0].x, obstacle[0].y, ctx1);
           draw_point(obstacle[1].x, obstacle[1].y, ctx1);
           ctx1.moveTo(obstacle[0].x, obstacle[0].y);
           ctx1.lineTo(obstacle[1].x, obstacle[1].y);
        });
        ctx1.stroke();
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
        point_sources.forEach((source)=>{
            let step = 2 * Math.PI / parseInt(density_value.innerHTML, 10);
            for (let i = 0; i < 2 * Math.PI; i += step) {
                renderRay([
                    {x: source[0], y: source[1]},
                    {x: source[0] + Math.sin(i)*5000, y: source[1] + Math.cos(i)*5000}
                ]);
            }
        });
    }

    function renderAll() {
        ctx1.clearRect(0, 0, layer1.width, layer2.height);
        update_sources();
        render_obstacle();
    }

    function renderRay(ray) {
        let minDistance = Infinity;
        let minIntersect;
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
        ctx1.beginPath();
        if(minIntersect) {
            ctx1.moveTo(ray[0].x, ray[0].y);
            ctx1.lineTo(minIntersect.x, minIntersect.y);
        }
        else {
            ctx1.moveTo(ray[0].x, ray[0].y);
            ctx1.lineTo(ray[1].x, ray[1].y);
        }
        ctx1.stroke();
    }

    function distance(x1, y1, x2, y2) {
        return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
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
});
