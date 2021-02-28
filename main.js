document.addEventListener("DOMContentLoaded", function(event) {
    let mode;
    let point_sources = [];
    let density_value = document.getElementById('density_value');
    let density_slider = document.getElementById('density_slider');
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

    let canvas_offset = canvas.getBoundingClientRect();


    let cs = getComputedStyle(canvas_wrapper[0]);
    let width = parseInt(cs.getPropertyValue('width'), 10);
    let height = parseInt(cs.getPropertyValue('height'), 10);

    canvas.width = width;
    canvas.height = height;

    density_slider.addEventListener("input",(event) => {
        density_value.innerHTML = event.target.value;
        update_sources();
    });
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    canvas.addEventListener("mousemove", (event) => {
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "red";
        ctx.fillRect(event.pageX - canvas_offset.x - 2, event.pageY - canvas_offset.y - 2,
            4, 4);
        ctx.stroke();
    });

    canvas.addEventListener("mouseup", (event) => {
        ctx.strokeStyle = "#e3e3e3";
        switch (mode) {
            case 3:
                point_sources.push([event.pageX - canvas_offset.x, event.pageY - canvas_offset.y]);
                ctx.moveTo(event.pageX - canvas_offset.x,event.pageY - canvas_offset.y);
                let step = 2 * Math.PI / parseInt(density_value.innerHTML, 10);
                for (let i = 0; i < 2 * Math.PI; i += step) {
                    ctx.moveTo(event.pageX - canvas_offset.x,event.pageY - canvas_offset.y);
                    ctx.lineTo(event.pageX - canvas_offset.x + 1000*Math.sin(i), event.pageY - canvas_offset.y + 1000*Math.cos(i));
                }
                break;
        }
        ctx.stroke();
    });

    function update_sources() {
        ctx.beginPath();
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        point_sources.forEach((source)=>{
            ctx.moveTo(source[0],source[1]);
            let step = 2 * Math.PI / parseInt(density_value.innerHTML, 10);
            for (let i = 0; i < 2 * Math.PI; i += step) {
                ctx.lineTo(source[0] + 1000*Math.sin(i), source[1] + 1000*Math.cos(i));
                ctx.moveTo(source[0],source[1]);
            }
            ctx.stroke();
        });
    }


});
