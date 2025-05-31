(function(window, document){
    const divPlace = document.getElementById("div_place");
    const divSky = document.getElementById("div_sky");
    const divFloor = document.getElementById("div_floor");
    const spanKillCount = document.getElementById("span_killCount");
    const spanText = document.getElementById("span_text");
    const spanFail = document.getElementById("span_fail");
    const imgCursor = document.getElementById("img_cursor");
    const imgCar = document.getElementById("img_car");
    const imgCarWhite = document.getElementById("img_car_white");

    var fn = {
        MaxCount: 130,
        KillCount: 0,
        Init: function() {
            fn.KillCount = 100;

            spanKillCount.innerText = fn.KillCount;
            spanText.style.display = "inherit";
            spanFail.style.display = "none";
            imgCar.style.opacity = 1;
            imgCar.setAttribute("shake-level", "0");
            imgCarWhite.setAttribute("shake-level", "0");

            let elements = document.getElementsByClassName("pigeon");
            let elementsPoop = document.getElementsByClassName("particle_poop");
            const elementsLength = elements.length;
            const elementsPoopLength = elementsPoop.length;

            for(var i = 0; i < elementsLength; i++) {
                elements[0].dispatchEvent(new CustomEvent("terminate"));
            };
            for(var i = 0; i < elementsPoopLength; i++) {
                elementsPoop[0].dispatchEvent(new CustomEvent("terminate"));
            };

            fn.Event.TriggerSpawn(true);
        },
        Create: {
            Pigeon: function() { 
                var pPigeon = document.createElement("p");
                const modeList = [
                    {mode: "fly", target: divSky, minHeight: [-20, 0], maxHeight: [0, 100], moveFunc: fn.Func.MakePoop}, 
                    {mode: "fly", target: divSky, minHeight: [-20, 0], maxHeight: [0, 100], moveFunc: fn.Func.MakePoop}, 
                    {mode: "walk", target: divFloor, minHeight: [50, 70], maxHeight: [90, 110], moveFunc: fn.Func.CollideWalk}
                ];
                const randomModeIndex = fn.Data.GetRandomInt(0, modeList.length - 1);
                const modeData = modeList[randomModeIndex];
            
                pPigeon.classList.add("pigeon");

                fn.Func.AnimatePigeon(pPigeon, modeData.mode, fn.Data.GetRandomInt(modeData.maxHeight[0], modeData.maxHeight[1]), fn.Data.GetRandomInt(modeData.minHeight[0], modeData.minHeight[1]), modeData.moveFunc);

                modeData.target.appendChild(pPigeon);
            },
            Poop: function(target) {
                var hitCar = false;
                var rect = target.getBoundingClientRect();
                var particle = document.createElement("p");
                var terminateFunc = function () {
                    clearInterval(particle.AnimationID);
                    particle.remove();
                };

                particle.classList.add("particle", "particle_poop");
                particle.style.left = rect.left + "px";
                particle.style.top = rect.top + "px";
                particle.style.backgroundPositionX = `0px`; 
                particle.style.backgroundPositionY = `${8 * fn.Data.GetRandomInt(0, 3)}px`; 

                particle.AnimationID = setInterval(function () {
                    if(!fn.Data.Collide(particle, divPlace) ) {
                        terminateFunc();
                    }

                    particle.style.top = particle.style.top.replace("px", "") * 1 + 2 + "px";

                    if(hitCar == false && fn.Data.Collide(particle, imgCar)) {
                        hitCar = true;

                        setTimeout(function(){
                            particle.style.backgroundPositionX = `8px`; 
                            particle.style.backgroundPositionY = `${8 * fn.Data.GetRandomInt(0, 3)}px`; 
                            imgCar.style.opacity = imgCar.style.opacity - 0.01;
                            clearInterval(particle.AnimationID);

                            setTimeout(function(){
                                terminateFunc();
                            }, fn.Data.GetRandomInt(20000, 100000));
                        }, fn.Data.GetRandomInt(200, 1000));
                    }
                }, 50); 

                particle.addEventListener("terminate", function() {
                    terminateFunc();
                });

                divSky.appendChild(particle);
            },
            Particle: function(x, y) {
                var particle = document.createElement("p");
                var svgPath = fn.Data.GetRandomLine(x, y);
                var particleX = fn.Data.GetRandomInt(0, imgCar.width);
                var particleY = fn.Data.GetRandomInt(0, imgCar.height);
                var terminateFunc = function () {
                    clearInterval(particle.AnimationID);
                    particle.remove();
                };

                particle.classList.add("particle", "particle_car");
                particle.style.offsetPath = svgPath;
                particle.style.offsetDistance = "0%";

                particle.style.backgroundPositionX = `-${particleX}px`; 
                particle.style.backgroundPositionY = `-${particleY}px`; 
                
                particle.AnimationID = setInterval(function () {
                    let distance = particle.style.offsetDistance.replace("%", "") * 1 + 4;

                    particle.style.offsetDistance = distance + "%";

                    if(distance > 100){
                    terminateFunc();
                    }
                }, 100); 

                divFloor.appendChild(particle);
            }
        },
        Event: {
            MoveCursor: function(event) {
                var eventDoc, doc, body;

                event = event || window.event;
                eventDoc = (event.target && event.target.ownerDocument) || document;
                
                doc = eventDoc.documentElement;
                body = eventDoc.body;
                
                var positionLeft = event.clientX +
                    (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                    (doc && doc.clientLeft || body && body.clientLeft || 0);
                var positionTop = event.clientY +
                    (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
                    (doc && doc.clientTop  || body && body.clientTop  || 0 );
                    
                imgCursor.style.left = positionLeft - (imgCursor.width / 2) + "px";
                imgCursor.style.top = positionTop - (imgCursor.height / 2) + "px";
            },
            HideCursor: function(){
                imgCursor.style.left = "-100px";
                imgCursor.style.top = "-100px";
            },
            KillPigeon: function(){
                fn.KillCount--;

                spanKillCount.innerText = fn.KillCount;

                if(fn.KillCount == 0)
                    fn.Event.Success();
                else {
                    fn.Event.TriggerSpawn(false);
                    fn.Event.TriggerSpawn(false);
                }
            },
            TriggerSpawn: function(recursive) {
                var count = document.querySelectorAll(".pigeon").length;

                if (count < fn.MaxCount) {
                    fn.Create.Pigeon();

                    if (count > fn.MaxCount / 100 * 80) {
                        imgCar.setAttribute("shake-level", "3");
                        imgCarWhite.setAttribute("shake-level", "3");
                    }
                    else if (count > fn.MaxCount / 100 * 60) {
                        imgCar.setAttribute("shake-level", "2");
                        imgCarWhite.setAttribute("shake-level", "2");
                    }
                    else if (count > fn.MaxCount / 100 * 40) {
                        imgCar.setAttribute("shake-level", "1");
                        imgCarWhite.setAttribute("shake-level", "1");
                    }

                    if (recursive)
                        setTimeout(function() {fn.Event.TriggerSpawn(recursive)}, fn.Data.GetRandomInt(1000, 2000));
                }
                else {
                    spanText.style.display = "none";
                    spanFail.style.display = "inherit";

                    setTimeout(fn.Init, 3000);
                }
            },
            Success: function() {
                window.top.postMessage("success", '*');
            }
        },
        Func: {
            AnimatePigeon: function (target, mode, maxHeight, minHeight, moveFunc) {
                var    position = 0;
                var    spriteCount = 3;
                const  interval = 100;
                const  intervalMove = 50; 
                const  svgPath = fn.Data.GetRandomPath(390, 20, maxHeight, minHeight);
                let startDirection = Math.round(Math.random()) * 2 - 1;

                switch(mode) {
                    case "fly":
                    spriteCount = 4;
                    target.style.backgroundPositionY = '0px'; 
                    break;
                    case "walk":
                    target.style.backgroundPositionY = '-32px'; 
                    break;
                }

                target.style.offsetPath = svgPath;
                target.style.offsetDistance = (startDirection > 0 ? 50 : 0) + "%";

                target.AnimationID = setInterval(function () {
                    if (position < 32 * spriteCount)
                    position += 32;
                    else
                    position = 0; 

                    target.style.backgroundPositionX = `-${position}px`; 
                }, interval); 

                target.AnimationMoveID = setInterval(function () {
                    let distance = target.style.offsetDistance.replace("%", "") * 1 + .2;

                    if(Math.floor(distance / 50) % 2 == 0) 
                    target.style.transform = "scaleY(1.5) scaleX(-1.5)";
                    else
                    target.style.transform = "scaleY(1.5) scaleX(1.5)";

                    target.style.offsetDistance = distance + "%";

                    if (moveFunc)
                        moveFunc(target, distance);
                }, intervalMove); 

                target.addEventListener("click", function() {
                    clearInterval(target.AnimationID);
                    clearInterval(target.AnimationMoveID);
                    clearInterval(target.MoveID);
                    target.remove();

                    fn.Event.KillPigeon();
                });

                target.addEventListener("terminate", function() {
                    clearInterval(target.AnimationID);
                    clearInterval(target.AnimationMoveID);
                    clearInterval(target.MoveID);
                    target.remove();
                });
            },
            CollideWalk: function(target, distance) {
                if(fn.Data.Collide(target, imgCar) && distance % 10 == 0){
                    var rect = target.getBoundingClientRect();
                    fn.Create.Particle(rect.left, rect.top - divFloor.offsetTop);
                }
            },
            MakePoop: function(target, distance) {
                if(!target.MoveID) {
                    target.MoveID = setInterval(function () {
                        fn.Create.Poop(target);
                    }, 4000); 
                }
            }
        },
        Data: {
            GetRandomPath: function(width, step, minSpread, maxSpread) {
                let pointString = "";
                var currentWidth = step * -2;

                while(currentWidth < width + step * 2){
                    pointString += ` L${fn.Data.GetRandomInt(currentWidth, currentWidth + step)},${fn.Data.GetRandomInt(minSpread, maxSpread)}`;

                    currentWidth += step;
                }

                pointString += `L${width + step * 2},${fn.Data.GetRandomInt(minSpread, maxSpread)}`;

                while(currentWidth + step * 2 > 0){
                    pointString += ` L${fn.Data.GetRandomInt(currentWidth - step, currentWidth)},${fn.Data.GetRandomInt(minSpread, maxSpread)}`;

                    currentWidth -= step;
                }

                return `path('M-4,${fn.Data.GetRandomInt(minSpread, maxSpread)} ${pointString} L-4,${fn.Data.GetRandomInt(minSpread, maxSpread)} Z')`;
            },
            GetRandomLine: function(startX, startY) {
                const endX = fn.Data.GetRandomInt(imgCar.width, imgCar.width * 2);
                const endY = fn.Data.GetRandomInt(imgCar.width, imgCar.height * 2);
                const directionX = fn.Data.GetRandomBoolean();
                const directionY = fn.Data.GetRandomBoolean();

                return `path('M${startX},${startY} L${endX * directionX},${endY * directionY}')`;
            },
            Collide: function(element, target) {
                var rect1 = element.getBoundingClientRect();
                var rect2 = target.getBoundingClientRect();

                return !(
                    rect1.top > rect2.bottom ||
                    rect1.right < rect2.left ||
                    rect1.bottom < rect2.top ||
                    rect1.left > rect2.right
                );
            },
            GetRandomInt: function(min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            },
            GetRandomBoolean: function() {
                return Math.floor(Math.random() * 2 + 1);
            }
        }
    }; 

    divPlace.addEventListener("mousemove", fn.Event.MoveCursor);
    divPlace.addEventListener("mouseleave", fn.Event.HideCursor);

    fn.Init();
})(window, document);
