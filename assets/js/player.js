export function Player1(param){
    const t = this;

    const curOffset = deg => t.player.circumference * (1 - (deg / 360));
    const radianToDeg  = r => r * 180 / Math.PI;
    const degToRadian  = deg => deg * Math.PI / 180;
    const exeFnc = fnc => (fnc && typeof fnc === 'function') ? fnc(t, t.tmpDeg) : '';
    const getDegByDxDy = (x, y) => {
        const centerX = t.player.size * .5;
        const centerY = t.player.size * .5;

        const dx = centerX - x;
        const dy = centerY - y;
        const dxy = Math.sqrt(dx * dx + dy * dy);

        let curDeg = 0;

        if(x > centerX && y < centerY){ //1사분면
            curDeg = radianToDeg(Math.acos(dy / dxy));
        }else if(x > centerX && y > centerY){   //4사분면
            curDeg = 90 - radianToDeg(Math.acos(dx/ dxy)) + 180;
        }else if(x < centerX && y < centerY){   //2사분면
            curDeg = radianToDeg(Math.acos(dx/ dxy)) + 270;
        }else if(x < centerX && y > centerY){   //3사분면
            curDeg = 90 - radianToDeg(Math.acos(dy / dxy)) + 270;
        }else{
            if(x > centerX) curDeg = 90;
            else if(x < centerX) curDeg = 270;
            else if(y > centerY) curDeg = 180;
            else if(y < centerY) curDeg = 0;
        }

        // console.log(curDeg);
        return curDeg;
    }

    const toRGB = cde => {
        let r, g, b;
        if(
            cde.indexOf('#') < 0 ||
            cde.indexOf('(') > 0 ||
            cde.indexOf(')') > 0 ||
            cde.indexOf('rgb') > 0
        ){
            cde.split(',').forEach(function(color, idx){
                let value = '';
                for(let i = 0; i < color.length; i++){
                    if(!isNaN(color[i]) && color[i] !== ' ') value += color[i];
                }

                if(idx === 0) r = +value;
                else if(idx === 1) g = +value;
                else if(idx === 2) b = +value;
            })
        }else{
            cde = cde.replace('#', '');

            // 3자리 Hex 코드를 6자리로 확장
            if (cde.length === 3) cde = cde[0] + cde[0] + cde[1] + cde[1] + cde[2] + cde[2];

            // Hex 값을 R, G, B 값으로 분리
            r = parseInt(cde.substring(0, 2), 16);
            g = parseInt(cde.substring(2, 4), 16);
            b = parseInt(cde.substring(4, 6), 16);
        }

        // RGB 값을 객체로 반환
        return {r, g, b};
    }


    //상태값
    t.isDowned = false; //마우스 클릭시
    t.isAB = false;

    t.player = {
        size: 0,
        target: '',
        color: ''
    }

    t.cover = {
        size: 0,
        margin: 0,
        src: ''
    }

    t.a = {

    }

    t.b = {

    }

    t.abTrack = {
        target: '',
        radius: 0,
        width: 0,
        cx: 0,
        cy: 0,
        a: 0,
        b: 0
    }

    t.abSection = {
        target: ''
    }

    t.track = {
        target: '',
        radius: 0,
        width: 0,
        cx: 0,
        cy: 0,
        strokeWidth: 0
    }
    
    t.progress = {
        target: '',
        radius: 0,
        width: 0,
        cx: 0,
        cy: 0,
        a: 0,
        b: 0,
        deg: 0,
        strokeWidth: 0
    }

    t.handler = {
        target: '',
        size: 0,
        deg: 0,
        cx: 0,
        cy: 0,
        strokeWidth: 0
    }


    t.startTick = {}

    t.change = [];

    t.audioList = [];

    t.deg = 0;

    t.update = (obj, separator, ui) => {
        t.change.length = 0;

        for(let key in obj){
            const keyNm = key.split(separator);

            const key1 = keyNm[0];
            const key2 = keyNm[1];

            t[key1][key2] = obj[key];
            t.change.push(key);

            if(key1 === 'player'){
                if(key2 === 'size'){

                    t.player.size = obj[key];

                    const playerHalfSize = t.player.size * .5;
                    const handlerHalfSize = t.handler.size * .5;
                    const calced = val => val * t.track.radius + playerHalfSize;

                    // t.player.circumference = 2 * Math.PI * ((playerHalfSize - handlerHalfSize) - (t.progress.width));
                    t.player.circumference = 2 * Math.PI * (playerHalfSize - handlerHalfSize);

                    t.progress.cx = playerHalfSize;
                    t.progress.cy = playerHalfSize;
                    t.progress.radius = (playerHalfSize) - handlerHalfSize;

                    t.track.cx = playerHalfSize;
                    t.track.cy = playerHalfSize;
                    t.track.radius = playerHalfSize - handlerHalfSize;

                    t.handler.cx = calced(Math.sin(degToRadian(t.handler.deg)));
                    t.handler.cy = t.player.size - calced(Math.cos(degToRadian(t.handler.deg)));
                }
                
            }

            if(key1 === 'handler'){
                if(key2 === 'size'){
                    t.handler.size = obj[key];

                    const playerHalfSize = t.player.size * .5;
                    const handlerHalfSize = t.handler.size * .5;
                    const calced = val => val * t.track.radius + playerHalfSize;

                    t.player.circumference = 2 * Math.PI * (playerHalfSize - handlerHalfSize);
                    t.progress.radius = (playerHalfSize) - handlerHalfSize;
                    t.track.radius = playerHalfSize - handlerHalfSize;

                    t.handler.cx = calced(Math.sin(degToRadian(t.handler.deg)));
                    t.handler.cy = t.player.size - calced(Math.cos(degToRadian(t.handler.deg)));

                }else if(key2 === 'deg'){
                    const playerHalfSize = t.player.size * .5;
                    const calced = val => val * t.track.radius + playerHalfSize;

                    t.handler.deg = obj[key];
                    t.handler.cx = calced(Math.sin(degToRadian(obj[key])));
                    t.handler.cy = t.player.size - calced(Math.cos(degToRadian(obj[key])));

                    
                }
            }

            if(key1 === 'progress'){
                if(key2 === 'deg'){
                    t.progress.deg = obj[key];
                }
            }


        }

        if(ui) t.updateUI(separator);
    }

    t.updateUI = (s) => {
        t.change.forEach((k) => {
            const keyNm = k.split(s);

            const key1 = keyNm[0];
            const key2 = keyNm[1];
            
            if(key1 === 'player'){
                if(key2 === 'size'){
                    const playerHalfSize = t.player.size * .5;
                    const handlerHalfSize = t.handler.size * .5;
                    const imgSize = t.player.size - (t.cover.margin * 2) - t.handler.size;
                    const imgOffset = t.cover.margin + (t.handler.size * .5);

                    document.querySelector('svg[data-type="svg"]').style.cssText = `
                        width: ${t.player.size}px;
                        height: ${t.player.size}px;
                        vertical-align: top;
                    `;

                    t.cover.target.style.width = `${imgSize}px`;
                    t.cover.target.style.height = `${imgSize}px`;
                    t.cover.target.style.top = `${imgOffset}px`;
                    t.cover.target.style.left = `${imgOffset}px`;

                    t.track.target.setAttribute('cx', t.track.cx);
                    t.track.target.setAttribute('cy', t.track.cy);
                    t.track.target.setAttribute('r', t.track.radius);

                    t.progress.target.setAttribute('cx', t.progress.cx);
                    t.progress.target.setAttribute('cy', t.progress.cy);
                    t.progress.target.setAttribute('r', t.progress.radius);
                    t.progress.target.setAttribute('stroke-dasharray', t.player.circumference);
                    t.progress.target.setAttribute('stroke-dashoffset', curOffset(t.progress.deg));

                    t.handler.target.setAttribute('cx', t.handler.cx);
                    t.handler.target.setAttribute('cy', t.handler.cy);
                    t.handler.target.setAttribute('r', t.handler.size * .5);
                } else if(key2 === 'color'){
                    const color = toRGB(t.player.color);
                    let overAll120 = true;
                    let sub120 = 0;
                    for(let key in color){
                        if(color[key] < 120){
                            overAll120 = false;
                            sub120++;
                        }else{
                            color[key] = color[key] - 100;
                        }
                    }

                    if(overAll120){
                        totalTime.style.cssText = '';
                    }else{
                        if(sub120 === 3){
                            totalTime.style.cssText = `
                                color: var(--trackColor);
                                opacity: 1'
                            `;
                        }
                    }

                    document.documentElement.style.setProperty('--backgroundColor', t.player.color);
                    document.documentElement.style.setProperty('--pointColor', `rgb(${(color.r)}, ${(color.g)}, ${(color.b)})`);
                    // document.documentElement.style.setProperty('--trackColor', '#fff');
                }
            }

            if(key1 === 'handler'){
                if(key2 === 'size'){
                    t.progress.target.setAttribute('r', t.progress.radius);
                    t.track.target.setAttribute('r', t.track.radius);

                    t.handler.target.setAttribute('cx', t.handler.cx);
                    t.handler.target.setAttribute('cy', t.handler.cy);
                    t.handler.target.setAttribute('r', t.handler.size * .5);

                    const a = t.a.target;
                    const b = t.a.target;

                    const aOuter = a.querySelector('.outer');
                    const aInner = a.querySelector('.inner');
                    const aText = a.querySelector('text');
                    
                    aOuter.setAttribute('r', t.handler.size * .5);
                    aInner.setAttribute('r', t.handler.size * .5 - 1);
                    aText.style.cssText = `
                        fill:var(--pointColor);
                        font-weight: 900;
                        font-size: ${t.handler.size * .5};
                    `;
                    aText.setAttribute('x', t.handler.size * .5);
                    aText.setAttribute('y', t.handler.size * .5);
                    aText.setAttribute('dx', t.handler.size / -6);
                    aText.setAttribute('dy', t.handler.size / 6);



                    // t.a.target.setAttribute('transform', `translate(${t.handler.cx - t.handler.size * .5} ${t.handler.cy - t.handler.size * .5})`);
                    // t.b.target.setAttribute('transform', `translate(${t.handler.cx - t.handler.size * .5} ${t.handler.cy - t.handler.size * .5})`);
                }else if(key2 === 'deg'){
                    t.handler.target.setAttribute('cx', t.handler.cx);
                    t.handler.target.setAttribute('cy', t.handler.cy);
                }
            };

            if(key1 === 'progress'){
                if(key2 === 'deg'){
                    t.progress.target.setAttribute('stroke-dashoffset', curOffset(t.progress.deg));
                    return true;
                }
            }
            
            if(key1 === 'cover'){
                if(key2 === 'src'){
                    document.documentElement.style.setProperty('--coverUrl', `url(${t.cover.src}) no-repeat center`);
                }
            }

        })
    }

    function constructor(){
        setData();
        function setData(){
            t.player.target = document.querySelector(param.target);
            t.player.size = param.size;
            // t.player.circumference = 2 * Math.PI * ((t.player.size * .5 - param.handlerSize * .5) - (t.progress.width));
            t.player.circumference = 2 * Math.PI * ((t.player.size * .5 - param.handlerSize * .5));

            t.cover.target = document.createElement('div');
            t.cover.src = param.coverUrl;
            t.cover.margin = param.coverMargin;

            t.handler.target = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            t.handler.size = param.handlerSize;


            t.progress.target = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            t.progress.cx = param.size * .5;
            t.progress.cy = param.size * .5;
            t.progress.width = param.progressWidth;
            t.progress.radius = (param.size * .5) - (t.handler.size * .5);
            
            t.track.target = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            t.track.cx = param.size * .5;
            t.track.cy = param.size * .5;
            t.track.width = param.trackWidth;
            t.track.radius = (param.size * .5) - (t.handler.size * .5);

            
            t.a.target = document.createElementNS("http://www.w3.org/2000/svg", "g");
            t.a.size = param.handlerSize;

            t.b.target = document.createElementNS("http://www.w3.org/2000/svg", "g");
            t.b.size = param.handlerSize;

            t.abTrack.target = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            t.abSection.target = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            t.startTick.target = document.createElementNS("http://www.w3.org/2000/svg", "rect");

        }

        setUI();

        function setUI(){
            t.player.target.style.cssText = `position: relative;`;

            const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            svg.dataset.type = 'svg';
            svg.style.cssText = `
                width: ${t.player.size}px;
                height: ${t.player.size}px;
                vertical-align: top;
            `;


            const imgSize = t.player.size - (t.cover.margin * 2) - t.handler.size;
            const imgOffset = t.cover.margin + (t.handler.size * .5);
            t.cover.target.classList.add('cover');
            t.cover.target.style.cssText = `
                background-size: cover;
                width: ${imgSize}px;
                height: ${imgSize}px;
                border-radius: 50%;
                position: absolute;
                top: ${imgOffset}px;
                left: ${imgOffset}px;
            `;

            document.documentElement.style.setProperty('--coverUrl', `url(${t.cover.src}) no-repeat center`);

            t.track.target.classList.add('track');
            t.track.target.setAttribute('cx', t.track.cx);
            t.track.target.setAttribute('cy', t.track.cy);
            t.track.target.setAttribute('r', t.track.radius);
            t.track.target.setAttribute('fill', 'none');
            t.track.target.setAttribute('stroke-width', t.track.width);

            t.progress.target.classList.add('progress');
            t.progress.target.setAttribute('cx', t.progress.cx);
            t.progress.target.setAttribute('cy', t.progress.cx);
            t.progress.target.setAttribute('r', t.progress.radius);
            t.progress.target.setAttribute('fill', 'none');
            t.progress.target.style.transform = 'rotate(-90deg)';
            t.progress.target.style.transformOrigin = '50%';
            t.progress.target.setAttribute('stroke-width', t.progress.width);
            t.progress.target.setAttribute('stroke-linecap', 'round');
            t.progress.target.setAttribute('stroke-dasharray', t.player.circumference);
            t.progress.target.setAttribute('stroke-dashoffset', curOffset(0));

            t.handler.target.classList.add('handler');
            t.handler.target.setAttribute('cx', t.player.size * .5);
            t.handler.target.setAttribute('cy', t.handler.size * .5);
            t.handler.target.setAttribute('r', t.handler.size * .5);

            t.a.target.classList.add('handler-a');
            t.a.target.setAttribute('transform', `translate(${t.player.size * .5 - t.handler.size * .5} 0)`);
            t.a.target.style.display = 'none';

            const aCircleOuter = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            aCircleOuter.classList.add('outer');
            aCircleOuter.setAttribute('cx', t.handler.size * .5);
            aCircleOuter.setAttribute('cy', t.handler.size * .5);
            aCircleOuter.setAttribute('r', t.handler.size * .5);
            aCircleOuter.style.cssText = `fill: var(--pointColor);`;
            const aCircleInner = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            aCircleInner.classList.add('inner');
            aCircleInner.setAttribute('cx', t.handler.size * .5);
            aCircleInner.setAttribute('cy', t.handler.size * .5);
            aCircleInner.setAttribute('r', t.handler.size * .5 - 1);
            aCircleInner.style.cssText = `fill: #fff;`;
            
            const aText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            aText.innerHTML = 'A';
            aText.setAttribute('x', t.handler.size * .5);
            aText.setAttribute('y', t.handler.size * .5);
            aText.setAttribute('dx', t.handler.size / -6);
            aText.setAttribute('dy', t.handler.size / 6);
            aText.style.cssText = `
                fill:var(--pointColor);
                font-weight: 900;
                font-size: ${t.handler.size * .5};
            `;
            
            t.a.target.appendChild(aCircleOuter);
            t.a.target.appendChild(aCircleInner);
            t.a.target.appendChild(aText);

            t.b.target.classList.add('handler-b');
            t.b.target.setAttribute('transform', `translate(${t.player.size * .5 - t.handler.size * .5} 0)`);
            t.b.target.style.display = 'none';

            const bCircleOuter = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            bCircleOuter.setAttribute('cx', t.handler.size * .5);
            bCircleOuter.setAttribute('cy', t.handler.size * .5);
            bCircleOuter.setAttribute('r', t.handler.size * .5);
            bCircleOuter.style.cssText = `fill: var(--pointColor);`;
            const bCircleInner = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            bCircleInner.setAttribute('cx', t.handler.size * .5);
            bCircleInner.setAttribute('cy', t.handler.size * .5);
            bCircleInner.setAttribute('r', t.handler.size * .5 - 3);
            bCircleInner.style.cssText = `fill: #fff;`;
            
            const bText = document.createElementNS("http://www.w3.org/2000/svg", "text");
            bText.innerHTML = 'B';
            bText.setAttribute('x', t.handler.size * .5);
            bText.setAttribute('y', t.handler.size * .5);
            bText.setAttribute('dx', t.handler.size / -6);
            bText.setAttribute('dy', t.handler.size / 6);
            bText.style.cssText = `
                fill:var(--pointColor);
                font-weight: 900;
                font-size: ${t.handler.size * .5};
            `;
            
            t.b.target.appendChild(bCircleOuter);
            t.b.target.appendChild(bCircleInner);
            t.b.target.appendChild(bText);


            svg.appendChild(t.track.target);
            svg.appendChild(t.progress.target);
            svg.appendChild(t.handler.target);
            svg.appendChild(t.a.target);
            svg.appendChild(t.b.target);

            t.player.target.appendChild(t.cover.target);
            t.player.target.appendChild(svg);
        }

        setFnc();
        function setFnc(){
            t.player.target.removeEventListener('mousedown', fnc_mouseDownEvent);
            t.player.target.removeEventListener('mousemove', fnc_mouseMoveEvent);
            t.player.target.removeEventListener('mouseup', fnc_mouseUpEvent);
            t.player.target.removeEventListener('touchstart', fnc_mouseDownEvent);
            t.player.target.removeEventListener('touchmove', fnc_mouseMoveEvent);
            t.player.target.removeEventListener('touchend', fnc_mouseUpEvent);

            t.player.target.addEventListener('mousedown', fnc_mouseDownEvent);
            t.player.target.addEventListener('mousemove', fnc_mouseMoveEvent);
            t.player.target.addEventListener('mouseup', fnc_mouseUpEvent);
            t.player.target.addEventListener('touchstart', fnc_mouseDownEvent);
            t.player.target.addEventListener('touchmove', fnc_mouseMoveEvent);
            t.player.target.addEventListener('touchend', fnc_mouseUpEvent);


            function fnc_mouseDownEvent(e){
                t.isDowned = true;
            }

            function fnc_mouseMoveEvent(e){
                e.preventDefault();
                if(!t.isDowned) return;

                const xy = t.player.target.getBoundingClientRect();
                const x = e.touches ? e.touches[0].clientX - xy.x : e.offsetX;
                const y = e.touches ? e.touches[0].clientY - xy.y : e.offsetY;
                const deg = getDegByDxDy(x, y);

                t.tmpDeg = deg;

                t.update({handler_deg: deg}, '_', true);

                exeFnc(param.fncMoveHandler);
            }

            function fnc_mouseUpEvent(e){
                e.preventDefault();
                if(!t.isDowned) return;

                const xy = t.player.target.getBoundingClientRect();
                const x = e.changedTouches ? e.changedTouches[0].clientX - xy.x : e.offsetX;
                const y = e.changedTouches ? e.changedTouches[0].clientY - xy.y : e.offsetY;

                const deg = getDegByDxDy(x, y);

                t.isDowned = false;

                t.update({progress_deg: deg}, '_', true);
                if(t.isDowned) return;
                t.update({handler_deg: deg}, '_', true);

                t.tmpDeg = deg;

                exeFnc(param.fncFinishHandler);
            }

        }
    }
    
    constructor();

    let toggleCnt = 0;

    t.toggleAB = (e) => {
        toggleCnt++;
        if(toggleCnt > 2) toggleCnt = 0;

        e.querySelector(':scope > g').style.fill = toggleCnt === 2 ? 'var(--pointColor)' : '#cbcbcb';
        e.closest('span').classList[toggleCnt === 1 ? 'add' : 'remove']('setting');

        if(toggleCnt === 1){
            t.a.target.style.display = 'block';
        }
    }
}