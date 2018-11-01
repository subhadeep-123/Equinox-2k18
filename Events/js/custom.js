var keysnd = new Audio("");
var h=$(window).height(), w=$(window).width();
var k=0;
var text="";
var bgcolour = ["rgb(0, 89, 95)", "rgb(109, 16, 0)", "rgb(0, 95, 65)", "rgb(0, 86, 95)", "rgb(0, 50, 95)", "rgb(95, 0, 39)", "rgb(134, 0, 55)", "rgb(0, 68, 84)", "rgb(0, 84, 69)","rgb(23, 23, 23)"];
var bgsel = bgcolour [Math.floor(Math.random() * bgcolour.length)];
// ISOTOPE FILTER
jQuery(document).ready(function($){

  if ( $('.iso-box-wrapper').length > 0 ) {

      var $container  = $('.iso-box-wrapper'),
        $imgs     = $('.iso-box img');

      $container.imagesLoaded(function () {

        $container.isotope({
        layoutMode: 'fitRows',
        itemSelector: '.iso-box'
        });

        $imgs.load(function(){
          $container.isotope('reLayout');
        })

      });

      //filter items on button click

      $('.filter-wrapper li a').click(function(){

          var $this = $(this), filterValue = $this.attr('data-filter');

      $container.isotope({
        filter: filterValue,
        animationOptions: {
            duration: 750,
            easing: 'linear',
            queue: false,
        }
      });

      // don't proceed if already selected

      if ( $this.hasClass('selected') ) {
        return false;
      }

      var filter_wrapper = $this.closest('.filter-wrapper');
      filter_wrapper.find('.selected').removeClass('selected');
      $this.addClass('selected');

        return false;
      });

  }
	$.post("count.php",{},function(data){
		$("#regcount").html(data);
	});
	$("#loader").css("background",bgsel);
});
$(function(){
    $('#inner-content-div').slimScroll({
        height: '250px'
    });
});

// PRELOADER JS
$(window).load(function(){
	$("body").css("overflow-y","scroll");
	$("#loader").addClass("remove").delay(100).queue(function(next){
    		$(this).css("display","none");
	});
	$(".intrlogo").css("display","none");
  $("body").animate({scrollTop:0}, 'fast');
	$("#content").css("opacity","1");
	$("#particles-js").css("opacity","1");
	$("#headbar").css("display","block");
	if( h > 550 && w >767){
		setTimeout(slidetext,1);
		keysnd.play();
		setTimeout(soundPause,24900);
	}
	else{
		$("#text2").addClass("slact");
	}
//	$("#regcount").addClass("addnot").delay(5000).queue(function(next){
    		$(this).removeClass("addnot");
//	});
});
function soundPause(){
	keysnd.pause();
}
var TxtType = function(el, toRotate, period) {
        this.toRotate = toRotate;
        this.el = el;
        this.loopNum = 0;
        this.period = parseInt(period, 10) || 2000;
        this.txt = '';
        this.tick();
        this.isDeleting = false;
    };

    TxtType.prototype.tick = function() {
        var i = this.loopNum % this.toRotate.length;
        var fullTxt = this.toRotate[i];

        if (this.isDeleting) {
        this.txt = fullTxt.substring(0, this.txt.length - 1);
        } else {
        this.txt = fullTxt.substring(0, this.txt.length + 1);
        }

        this.el.innerHTML = '<span class="wrap">'+this.txt+'</span>';

        var that = this;
        var delta = 200 - Math.random() * 100;

        if (this.isDeleting) { delta /= 2; }

        if (!this.isDeleting && this.txt === fullTxt) {
        delta = this.period;
        this.isDeleting = true;
        } else if (this.isDeleting && this.txt === '') {
        this.isDeleting = false;
        this.loopNum++;
        delta = 500;
        }

        setTimeout(function() {
        that.tick();
        }, delta);
    };

    window.onload = function() {
        var elements = document.getElementsByClassName('typewrite');
        for (var i=0; i<elements.length; i++) {
            var toRotate = elements[i].getAttribute('data-type');
            var period = elements[i].getAttribute('data-period');
            if (toRotate) {
              new TxtType(elements[i], JSON.parse(toRotate), period);
            }
        }
        // INJECT CSS
        var css = document.createElement("style");
        css.type = "text/css";
        css.innerHTML = ".typewrite > .wrap { border-right: 0.08em solid #fff}";
        document.body.appendChild(css);
    };

// jQuery to collapse the navbar on scroll //
$(window).scroll(function() {
    if ($(".navbar").offset().top > 50) {
        $(".navbar-fixed-top").addClass("top-nav-collapse");
    } else {
        $(".navbar-fixed-top").removeClass("top-nav-collapse");
    }
});
// Slide Show //

	function slidetext(){
		sl = "#text"+k;
		/*text = text +" "+ k + " - " + sl;
		$("#texout").html(text);*/
		$(sl).addClass("slact");
		if(k==0){setTimeout(removeslText,24000);}
		if(k==1){setTimeout(removeslText,4000);}
		k++;
	};
	function removeslText(){
		$(sl).remove();
		slidetext();
	};
function rcError(){
	$("#regcount").removeClass("addnot");
	$("#regcount").html("Right Click Disabled");
	$("#regcount").addClass("addnot").delay(5000).queue(function(next){
    		$(this).removeClass("addnot");
	});
}
//Button color Change
$(function(){
   function bidcol1(){
      $("#bid1").css('background','#D4D4D4');
	  $("#bid2").css('background','#ff5a00');
	  $("#bid3").css('background','#ff5a00');
	  setTimeout(bidcol2,200);
   };
   function bidcol2(){
	  $("#bid1").css('background','#ff5a00');
      $("#bid2").css('background','#D4D4D4');
	  $("#bid3").css('background','#ff5a00');
	  setTimeout(bidcol3,200);
   };
   function bidcol3(){
      $("#bid1").css('background','#ff5a00');
	  $("#bid2").css('background','#ff5a00');
	  $("#bid3").css('background','#D4D4D4');
	  setTimeout(bidcol1,200);
   };
   setTimeout(bidcol1,1);
});


/* HTML document is loaded. DOM is ready.
-------------------------------------------*/
$(function(){

  // ------- WOW ANIMATED ------ //
  wow = new WOW(
  {
    mobile: false
  });
  wow.init();


  // HIDE MOBILE MENU AFTER CLIKING ON A LINK
  $('.navbar-collapse a').click(function(){
        $(".navbar-collapse").collapse('hide');
    });


  // NIVO LIGHTBOX
  $('.iso-box-section a').nivoLightbox({
        effect: 'fadeScale',
    });

  // HOME BACKGROUND SLIDESHOW
  $(function(){
    jQuery(document).ready(function() {
    $('#home').backstretch([
       "images/bg2.jpg",
       "images/s4.jpg",
	   "images/s4.jpg",
       "images/s4.jpg",
	   "images/s4.jpg",
        ],  {duration: 7000, fade: 1050});
    });
  })
  $(function() {
	$('#impulseid').click(function(){
		$("#aboutbg").attr('src',"images/about-img2.png");
	});
  });
  $(function() {
	$('#collegeid').click(function(){
		$("#aboutbg").attr('src',"images/about-img1.jpg");
	});
  });

});
