/* ---- particles.js config ---- */

particlesJS("particles-js", {
  "particles": {
    "number": {
      "value": 75,
      "density": {
        "enable": true,
        "value_area":800
      }
    },
    "color": {
      "value": "#ccffff"
    },

    "shape": {
      "type": "circle",
      "stroke": {
        "width": 0,
        "color": "#ff0000"
      },
      "polygon": {
        "nb_sides": 5
      },
      "image": {
        "src": "",
        "width": 0,
        "height": 0
      }
    },
    "opacity": {
      "value": 1,
      "random": false,
      "anim": {
        "enable": false,
        "speed": 1,
        "opacity_min": 0.1,
        "sync": false
      }
    },
    "size": {
      "value": 4,
      "random": true,
      "anim": {
        "enable": true,
        "speed": 24,
        "size_min": 0,
        "sync": false
      }
    },
    "line_linked": {
      "enable": true,
      "distance": 100,
      "color": "#3F51B5",
      "opacity": 1,
      "width": 1
    },
  },
  "interactivity": {
    "detect_on": "canvas",
    "events": {
      "onhover": {
        "enable": true,
        "mode": "grab"
      },
      "onclick": {
        "enable": true,
		"mode": "repulse"
      },
      "resize": false
    },
    "modes": {
      "grab": {
        "distance": 140,
        "line_linked": {
          "opacity": 1
        }
      },
      "bubble": {
        "distance": 400,
        "size": 4,
        "duration": 2,
        "opacity": 8,
        "speed": 1
      },
      "repulse": {
        "distance": 300,
        "duration": 0.3
      },
      "push": {
        "particles_nb": 4
      },
      "remove": {
        "particles_nb": 2
      }
    }
  },
  "retina_detect": true
});
