document.addEventListener("DOMContentLoaded", function(event) {
    let mode;
    let brightness = 50;
    let first_step_obstacle = false;
    let density = 7;
    let point_sources = [];
    let obstacles = [];
    let num_of_obstacles = 0;
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
    let canvas = document.getElementById('canvas_id');
    let ctx = canvas.getContext("2d");


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

    let canvas_offset = canvas.getBoundingClientRect();


    let cs = getComputedStyle(canvas_wrapper[0]);
    let width = parseInt(cs.getPropertyValue('width'), 10);
    let height = parseInt(cs.getPropertyValue('height'), 10);

    canvas.width = width;
    canvas.height = height;

    density_slider.addEventListener("input",(event) => {
        density = event.target.value;
        density_value.innerHTML = density;
        update_sources();
    });
    brightness_slider.addEventListener("input",(event) => {
        brightness = event.target.value;
        brightness_value.innerHTML = `${brightness}%`;
        update_sources();
    });

    clear();

    canvas.addEventListener("mousemove", (event) => {
        mousePosition = {
            x: event.pageX - canvas_offset.x,
            y: event.pageY - canvas_offset.y
        }
        clear();

        ctx.strokeStyle = `rgba(255, 255, 255, ${brightness/100})`;
        ctx.beginPath();
        draw_point(mousePosition.x, mousePosition.y);
        render_obstacle();

        if(first_step_obstacle) {
            draw_point(point_buffer[0].x, point_buffer[0].y);
            ctx.moveTo(point_buffer[0].x, point_buffer[0].y);
            ctx.lineTo(mousePosition.x, mousePosition.y);
        }
        ctx.stroke();
    });

    canvas.addEventListener("mouseup", (event) => {
        switch (mode) {
            case 3:
                point_source_drawing(event);
                break;
            case 7:
                draw_obstacle(event);
                break;
        }
        ctx.stroke();
    });

    function draw_obstacle(event) {
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

    function point_source_drawing(event) {
        clear();
        point_sources.push([mousePosition.x, mousePosition.y]);
        ctx.moveTo(mousePosition.x,mousePosition.y);
        let step = 2 * Math.PI / parseInt(density, 10);
        ctx.strokeStyle = `rgba(255, 255, 255, ${brightness/100})`;
        for (let i = 0; i < 2 * Math.PI; i += step) {
            ctx.moveTo(mousePosition.x,mousePosition.y);
            ctx.lineTo(mousePosition.x + 5000*Math.sin(i), mousePosition.y + 5000*Math.cos(i));
        }
    }

    function render_obstacle() {
        obstacles.forEach((obstacle)=>{
           draw_point(obstacle[0].x, obstacle[0].y);
           draw_point(obstacle[1].x, obstacle[1].y);
           ctx.moveTo(obstacle[0].x, obstacle[0].y);
           ctx.lineTo(obstacle[1].x, obstacle[1].y);
        });
    }

    function draw_point(x, y) {
        ctx.fillStyle = "red";
        ctx.fillRect(x - 2, y - 2, 4,  4);
    }

    function clear() {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    function update_sources() {
        clear();
        ctx.beginPath();
        clear();
        ctx.strokeStyle = `rgba(255, 255, 255, ${brightness/100})`;
        point_sources.forEach((source)=>{
            ctx.moveTo(source[0],source[1]);
            let step = 2 * Math.PI / parseInt(density_value.innerHTML, 10);
            for (let i = 0; i < 2 * Math.PI; i += step) {
                ctx.lineTo(source[0] + 5000*Math.sin(i), source[1] + 5000*Math.cos(i));
                ctx.moveTo(source[0],source[1]);
            }
        });
        ctx.stroke();
    }


});
