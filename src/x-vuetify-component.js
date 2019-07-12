/*! Copyright 2012, Ben Lin (http://dreamerslab.com/)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version: 1.0.19
 *
 * Requires: jQuery >= 1.2.3
 */
(function(a){if(typeof define==="function"&&define.amd){define(["jquery"],a);
}else{a(jQuery);}}(function(a){a.fn.addBack=a.fn.addBack||a.fn.andSelf;a.fn.extend({actual:function(b,l){if(!this[b]){throw'$.actual => The jQuery method "'+b+'" you called does not exist';
}var f={absolute:false,clone:false,includeMargin:false,display:"block"};var i=a.extend(f,l);var e=this.eq(0);var h,j;if(i.clone===true){h=function(){var m="position: absolute !important; top: -1000 !important; ";
e=e.clone().attr("style",m).appendTo("body");};j=function(){e.remove();};}else{var g=[];var d="";var c;h=function(){c=e.parents().addBack().filter(":hidden");
d+="visibility: hidden !important; display: "+i.display+" !important; ";if(i.absolute===true){d+="position: absolute !important; ";}c.each(function(){var m=a(this);
var n=m.attr("style");g.push(n);m.attr("style",n?n+";"+d:d);});};j=function(){c.each(function(m){var o=a(this);var n=g[m];if(n===undefined){o.removeAttr("style");
}else{o.attr("style",n);}});};}h();var k=/(outer)/.test(b)?e[b](i.includeMargin):e[b]();j();return k;}});}));

// * ripple animation
function transform(el, value) {
    el.style['transform'] = value;
    el.style['webkitTransform'] = value;
}
function opacity(el, value) {
    el.style['opacity'] = value.toString();
}
function isTouchEvent(e) {
    return e.constructor.name === 'TouchEvent';
}
var calculate = function calculate(e, el, value) {
    if (value === void 0) {
        value = {};
    }
    var offset = el.getBoundingClientRect();
    var target = isTouchEvent(e) ? e.touches[e.touches.length - 1] : e;
    var localX = target.clientX - offset.left;
    var localY = target.clientY - offset.top;
    var radius = 0;
    var scale = 0.3;
    if (el._ripple && el._ripple.circle) {
        scale = 0.15;
        radius = el.clientWidth / 2;
        radius = value.center ? radius : radius + Math.sqrt(Math.pow(localX - radius, 2) + Math.pow(localY - radius, 2)) / 4;
    } else {
        radius = Math.sqrt(Math.pow(el.clientWidth, 2) + Math.pow(el.clientHeight, 2)) / 2;
    }
    var centerX = (el.clientWidth - radius * 2) / 2 + "px";
    var centerY = (el.clientHeight - radius * 2) / 2 + "px";
    var x = value.center ? centerX : localX - radius + "px";
    var y = value.center ? centerY : localY - radius + "px";
    return { radius: radius, scale: scale, x: x, y: y, centerX: centerX, centerY: centerY };
};

var ripple = {
    /* eslint-disable max-statements */
    show: function show(e, el, value) {
        if (value === void 0) {
            value = {};
        }
        var container = document.createElement('span');
        var animation = document.createElement('span');
        container.appendChild(animation);
        container.className = 'x-ripple__container';
        if (value.class) {
            container.className += " " + value.class;
        }
        var _a = calculate(e, el, value),
            radius = _a.radius,
            scale = _a.scale,
            x = _a.x,
            y = _a.y,
            centerX = _a.centerX,
            centerY = _a.centerY;
        var size = radius * 2 + "px";
        animation.className = 'x-ripple__animation';
        animation.style.width = size;
        animation.style.height = size;
        el.appendChild(container);
        var computed = window.getComputedStyle(el);
        if (computed && computed.position === 'static') {
            el.style.position = 'relative';
            el.dataset.previousPosition = 'static';
        }
        animation.classList.add('x-ripple__animation--enter');
        animation.classList.add('x-ripple__animation--visible');
        transform(animation, "translate(" + x + ", " + y + ") scale3d(" + scale + "," + scale + "," + scale + ")");
        opacity(animation, 0);
        animation.dataset.activated = String(performance.now());
        setTimeout(function () {
            animation.classList.remove('x-ripple__animation--enter');
            animation.classList.add('x-ripple__animation--in');
            transform(animation, "translate(" + centerX + ", " + centerY + ") scale3d(1,1,1)");
            opacity(animation, 0.25);
        }, 0);
    },
    hide: function hide(el) {
        var ripples = el.getElementsByClassName('x-ripple__animation');
        if (ripples.length === 0) return;
        var animation = ripples[ripples.length - 1];
        if (animation.dataset.isHiding) return;
        else animation.dataset.isHiding = 'true';
        var diff = performance.now() - Number(animation.dataset.activated);
        var delay = Math.max(250 - diff, 0);
        setTimeout(function () {
            animation.classList.remove('x-ripple__animation--in');
            animation.classList.add('x-ripple__animation--out');
            opacity(animation, 0);
            setTimeout(function () {
                var ripples = el.getElementsByClassName('x-ripple__animation');
                if (ripples.length === 1 && el.dataset.previousPosition) {
                    el.style.position = el.dataset.previousPosition;
                    delete el.dataset.previousPosition;
                }
                animation.parentNode && el.removeChild(animation.parentNode);
            }, 300);
        }, delay);
    }
};



// * JS start 
$(document).ready(function () {
    // * btn
    $('.x-btn').on('click', function (event) {
        var btn = $(event.currentTarget);
        // 波纹动画
        if (btn.attr('ripple') == 'true') {
            ripple.show(event, event.currentTarget, {});
            ripple.hide(event.currentTarget);
        }
        // 弹窗
        var dialogId = btn.attr('dialog-tag--id');
        if (dialogId) {
            var overlay = $('.x-overlay');
            overlay.css('display', 'block');
            overlay.on('click', function(e) {
                $('.fixed-view > div').css('display', 'none');
            });
            // dialog 动画
            var dialogContent = $(`[tag-id="${dialogId}"].x-dialog__content`);
            var dialog = dialogContent.children('.x-dialog');
            dialog.addClass('dialog-transition-enter');
            dialogContent.css('display', 'flex');
            setTimeout(() => {
                dialog.removeClass('dialog-transition-enter');
            }, 50);
        }
    });

    // * input
    $('.x-input__slot input').on('focus', function (event) {
        var input = $(event.currentTarget);
        input.parent().addClass('x-intput--active');
        input.prev().addClass('x-label--active');
        // 处理select 的情况

    });

    $('.x-input__slot input').on('blur', function (event) {
        var input = $(event.currentTarget);
        input.parent().removeClass('x-intput--active');
        // 处理text-field
        if (input.val().length == 0) {
            input.prev().removeClass('x-label--active');
        }
    })

    // * expansion pannel
    $('.x-expansion-panel__header').on('click', function (event) {
        var panel__header = $(event.currentTarget);
        var li = panel__header.parent();
        var pannelIndex = li.index();
        var pannel_body = panel__header.next();
        if (li.hasClass('x-expansion-panel__container--active')) {
            li.removeClass('x-expansion-panel__container--active');
            pannel_body.addClass('expand-transition-leave-active expand-transition-leave-to');
            let pannelHeight = pannel_body.height();
            pannel_body.css({
                'height' : pannelHeight + 'px',
                'overflow' : 'hidden',
            });
            setTimeout(() => {
                pannel_body.css('height', '0px');
            }, 50);
            setTimeout(function(){
                pannel_body.css({
                    'display' : 'none',
                    'height' : 'auto',
                });
                pannel_body.removeClass('expand-transition-leave-active expand-transition-leave-to');
            }, 350);
        } else {
            li.addClass('x-expansion-panel__container--active');
            // animation
            let bodyHeight = pannel_body.actual('height');
            pannel_body.css({
                'display' : 'block',
                'overflow' : 'hidden',
                'height' : '0px',
            });
            pannel_body.addClass('expand-transition-enter-active expand-transition-enter-to');
            pannel_body.css('height', bodyHeight + 'px');
            setTimeout(function(){
                pannel_body.removeClass('expand-transition-enter-active expand-transition-enter-to');
            }, 300);
            // 折叠其他面板
            var list = li.parent();
            if (list.attr('accordion') == 'true') {
                list.children().each(function(index, item) {
                    if (pannelIndex != index && $(item).hasClass('x-expansion-panel__container--active')) {
                        $(item).children('.x-expansion-panel__header').trigger('click');
                    }
                });
            }
        }
    });

    // * tabs
    $('.x-tabs__div').on('click', function (event) {
        var tabs__div = $(event.currentTarget);
        // 修改tabItem状态
        var tabIndex = tabs__div.index();
        var tabsContainer = tabs__div.parent();
        tabsContainer.children('.x-tabs__div').each(function (index, item) {
            if (index != tabIndex) {
                $($(item).children()[0]).removeClass('x-tabs__item--active');
            }
        });
        $(tabs__div.children()[0]).addClass('x-tabs__item--active');
        // 调整导航条的位置与尺寸
        let tabWidth = tabs__div.width();
        let posLeft = tabs__div.position().left;
        if (tabIndex == 0 && tabsContainer.hasClass('x-tabs__container--fixed-tabs')) {
            let tabsContainerWidth = tabsContainer.width();
            let tabDivCount = tabsContainer.children('.x-tabs__div').length;
            posLeft = (tabsContainerWidth - (tabDivCount - 2) * tabWidth) / 2 - tabWidth;
        }
        var tabSlider = tabs__div.parent().children('.x-tabs__slider-wrapper');
        tabSlider.css({
            'left': posLeft + 'px',
            'width': tabWidth + 'px'
        })

        // 切换对应的windowItem
        var window__container = tabs__div.parent().parent().parent().next().children('.x-window__container');
        window__container.children().each(function (index, item) {
            if (index !== tabIndex) {
                $(item).css('display', 'none');
            }
        });
        $(window__container.children()[tabIndex]).css('display', 'block');
    });
});