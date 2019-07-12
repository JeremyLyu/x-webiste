$(document).ready(function () {
	var dragging = false;
	var	scrolling = false;
	var	resizing = false;

	//cache jQuery objects
    var videoContainer = $('.x-video');
    //check if the .x-video in the viewport 
    //if yes, animate it
	checkPosition(videoContainer);
	$(window).on('scroll', function(){
		if( !scrolling) {
			scrolling =  true;
			( !window.requestAnimationFrame )
				? setTimeout(function(){checkPosition(videoContainer);}, 100)
				: requestAnimationFrame(function(){checkPosition(videoContainer);});
		}
    });
	// 兼容性判断
	if (!('requestAnimationFrame' in window)) return;
	if (/Mobile|Android/.test(navigator.userAgent)) return;

	// 执行文字背景动画
	var yPos = 30;
	setInterval(function () {
		if (yPos++ > 70) {
			yPos = 30;
		}
		$('.texture.animate').css('background-position', '10% ' + yPos + '%');
	}, 100);

	var backgrounds = [];
	$('.parallax').each(function () {
		var el = $(this);
		var bg = el.children('.parallax-background');
		bg.css({
			position: 'absolute',
			'min-width': '100%',
			'width': 'auto',
			'min-height': '100vh',
			top: 0,
			left: 0,
			zIndex: -100,
			display: 'block'
		});
		backgrounds.push(bg);

		el.css({
			position: 'relative',
			background: 'transparent',
			overflow: 'hidden',
		});
	});

	if (!backgrounds.length) return;

	var visible = [];
	var scheduled;

	$(window).on('scroll resize', scroll);
	scroll();

	function scroll() {
		visible.length = 0;
		for (var i = 0; i < backgrounds.length; i++) {
			var rect = backgrounds[i][0].parentNode.getBoundingClientRect();
			if (rect.bottom > 0 && rect.top < window.innerHeight) {
				visible.push({
					rect: rect,
					node: backgrounds[i]
				});
			}
		}
		cancelAnimationFrame(scheduled);
		if (visible.length) {
			scheduled = requestAnimationFrame(update);
		}
	}

	function update() {
		for (var i = 0; i < visible.length; i++) {
			var rect = visible[i].rect;
			var node = visible[i].node[0];
			var quot = Math.max(rect.bottom, 0) / (window.innerHeight + rect.height);
			var shift = '';
			if (node.hasAttribute('parallax-center')) {
				var nodeHeight = visible[i].node.outerHeight();
				shift = -((nodeHeight - rect.height) / 2 + rect.top) + 'px';
			} else {
				shift = -rect.top + 'px';
			}
			node.style.transform = 'translate3d(0, ' + (shift) + ', 0)';
		}
	}

	function checkPosition(container) {
        container.each(function(){
			var actualContainer = $(this);
            if( $(window).scrollTop() + $(window).height()*0.5 > actualContainer.offset().top) {
				// 只播放一次
				if (actualContainer.attr('first-play') == 'false') {
					actualContainer.attr('first-play', 'true');
					// TODO 检查播放器状态,再决定是否播放
					actualContainer.children('video')[0].play();
				}
            }
        });
        scrolling = false;
    }
});