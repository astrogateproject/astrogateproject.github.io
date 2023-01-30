/*
---------------------------------------------------------------------------------------------------------------------------
Cíl: 
Model pohybu planety kolem Slunce po eliptické trajektorii, jejiž hlavní poloosu/periodu a číselnou výstřednost lze měnit a to interaktivním způsobem

Výsledek:
1. Planeta se pohybuje kolem Slunce, na začátku s periodou odpovídající 10 sekundám. (OK)
2. Lze zapnout a vypnout průvodič. (OK)
3. Lze zapnout tlačítko a začne se obarvovat plocha, kterou průvodič od začátku stisku opsal. Velikost plochy se nasčítává a vykresluje. (OK)
4. Lze zmačknout tlačítko, že podobu 3 sekund se vykreslí plocha. Lze takto vykreslit až tři různé plochy. (1/2)
5. Lze hýbat polohou prázdného ohniska a tím měnit excentricitu. (OK)
6. Lze zobrazit okamžitou rychlost planety. (téměř OK, jen je potřeba ještě buď upravit časový krok, nebo zvolit jinou metodou pro výpočet rychlosti (Runge-Kutta))
7. Lze zobrazit perihelium a afelium 
---------------------------------------------------------------------------------------------------------------------------
 */ 
 


 /* 
---------------------------------------------------------------------------------------------------------------------------
 (1) VSTUPNÍ ÚDAJE O ELIPSE, PLANETĚ, POMOCNÉ PROMĚNNÉ, FUNKCE PRO VYKRESLOVÁNÍ VŠECHNO V CANVASU 
 ---------------------------------------------------------------------------------------------------------------------------
 */

 // rozměry canvasu: size_x, size_y
 let canvas = document.getElementById("animationCanvas");
 let size_x = canvas.width;
 let size_y = canvas.height;
 let fontincanvas = canvas.font;

 // ještě definujeme kontext canvasu
 let canvasContext = animationCanvas.getContext('2d');

 // x-ová souřadnice ohniska elipsy jako globální proměnné
 // Poznámka: Počátek souřadnicového systému je v levém horním rohu obrazovky a x-ová osa je orientovaná jako běžně, y-ová ve směru "dolů"
 let xF = 12/20*size_x, yF = 0.5*size_y;

 // souřadnice středu prázdného ohniska
 let pointX = 6/20*size_x, pointY = 0.5*size_y; 

 // dopočítáme lineární excentricitu ze vzdálenosti ohnisek
 let e = 0.5*Math.abs(xF-pointX);

 // hlavní poloosa je fixní
 let a = 80; //100

 // vedlejší poloosu dopočítáme ze známé hlavní poloosy a excentricity
 let b = Math.sqrt(Math.pow(a,2)-Math.pow(e,2));

 //spočítáme numerickou excentricitu
 let eps = e/a;

 // plocha elipsy z hlavní a vedlejší poloosy
 let S_elipsy = Math.PI*a*b;

 // počáteční poloha planety - umístíme ji do perihelia (r=a-e, phi = 0)
 // radialni souřadnice, úhlová souřadnice
 let r = a-e, phi = 0; 

 // globální čas "t" s počátkem od t = 0, časový krok v ms
 let t = 0, h = 20; //20

 // perioda - planetě bude trvat 10 sekund (tedy 10000 ms) oběh kolem Slunce pro danou hlavní poloosu - přesná hodnota je naše volba, ale důvod, proč bude P fixní i při změně excentricity, plyne z 3. KZ
 let P = 10000; // 10000

 // plošná rychlost
 let plosna_rychlost = S_elipsy/P;

 // výpočet G*M
 let GM = 4*a*Math.pow(plosna_rychlost,2)/Math.pow(b,2);

 // úhlová rychlost v periheliu
 let w = 2*plosna_rychlost/Math.pow(r,2);
 
 // tato pole se začnou plnit/utvářet, až se spustí správné tlačítko - při spuštění se začně vybarvovat plocha opsaná průvodičem
 // pole x-ové a y-ové souřadnice planety na její trajektorii
 let x_array = [], y_array = [];
 // pole času t
 let t_array = [];
 // pole úhlů a průvodičů
 let phi_array = [];
 let r_array = [];

 // navíc definujeme pole rychlostí
 let v_array = [];

 // doba, po jakou pozorování provádíme, a opsaná plocha za tuto dobu
 let t_observation = 0, S_observation = 0;

 // pomocná proměnná - počet oběhů
 let number_of_rounds = 0;

 // pomocná proměnná pro průvodič, resp. funkci connection()
 let connection_show = false;

 // pomocná proměnná pro opsanou plochu, resp. funkci area()
 let area_show = false;

 // pomocná proměnna pro funkci area_time_interval()
 let area_time_interval_boolean = false;
 let time_interval = 3000; //3000 ms - doba, po kterou budeme pozorovat, pokud klikneme na správné tlačítko

 // pole pro kreslení trojúhelníků - TADY ZBYTEČNÉ zatím - TODO
 let x_array_trinagles = [];
 let y_array_triangles = [];

 // pomocná proměnná: numofr
 let numofr = 0;

 // pomocná proměnná...TODO
 let x_aofa = [];
 let y_aofa = [];

  // pomocné proměnné - budeme do nich ukládat aktuální souřadnice myši
  let x_p = 0;
  let y_p = 0;
 
  // pomocná proměnná - pokud není tlačítko myši stisknuto, je mouseDown = 0, jinak 1 (to zařizují metody onmousedown a onmouseup)
  let mouseDown = 0;
 
  // poloměr kruhu
  let radius = 6;

  // pozicování tabulky
  let tab_xpos = 80;
  let tab_ypos = 30;
  let tab_step = 20;

  // průběžná poloha planety
  let x = 0, y = 0;

  // pomocná proměnná - k ukázání vektoru rychlosti
  let show_arrow_boolean = false;

  // pomocná proměnná - k ukázání perihelia
  let show_perihelium_boolean = false;

  // pomocná proměnná - k ukázání afelia
  let show_afelium_boolean = false;

 /*
 definujeme funkci "function()" a rovnou ji voláme;
 funkce jako taková se volá jenom jednou, ale díky setInterval(drawEverything, h) uvnitř ní se funkce "drawEverything" bude volat vždy po čase "h", ... 
 ... dokud volání neukončíme (to děláme v jiných funkcích za určitých podmínek);
 window.onload = function() ... po každém "h" se změní canvas a výsledek se aktualizuje na obrazovku sám 
 */

 window.onload = function() {
     drawCenter();
     setInterval(drawOnline, h);
 }   


 /* 
 ---------------------------------------------------------------------------------------------------------------------------
 (2) FUNKCE:
 1. position_mouse - ukládá aktuální souřadnice myši (při uskuteční určité události) do proměnných x_p, y_p
 2. onmousedown - myš je stisknuta: mouseDown = 1
 3. onmouseup - myš je puštěna: mouseDown = 0
 4. drawCenter - kreslíme prázdné ohnisko
 5. drawOnline - vykreslování a aktualizace polohy ohniska, volání funkce drawEverything
 6. drawEverything - vykresluje všechno až na prázdné ohnisko, provádí výpočet pohybu planety
 ---------------------------------------------------------------------------------------------------------------------------
 */

 // POZICE MYŠI - funkce uloží do globálních proměnných x_p, y_p aktuální souřadnice myši; počátek souř. systému je v levém horním rohu
 function position_mouse(event){
     x_p = event.clientX- canvas.offsetLeft;
     y_p = event.clientY- canvas.offsetLeft-75;//-38;
 }

 // MYŠ JE STISKNUTA
 // tato funkce se volá bez ohledu na zbytek kódu - pokud je myš stisknuta ("onmousedown"), změní se hodnota globální proměnné mouseDown na 1
 document.body.onmousedown = function() { 
         mouseDown = 1;
     }

 // MYŠ JE PUŠTĚNA    
 // tato funkce se volá bez ohledu na zbytek kódu - pokud je myš NEstisknuta ("onmouseup"), změní se hodnota globální proměnné mouseDown na 0
 document.body.onmouseup = function() {
         mouseDown = 0;
     }

 // PRÁZDNÉ OHNISKO (souř. pointX a pointY) - VYKRESLENÍ 
 function drawCenter() {
     canvasContext.beginPath();
     canvasContext.arc(pointX, pointY, radius, 0, 2 * Math.PI, true);
     canvasContext.font = "15px Arial";
     canvasContext.fillStyle = "red";
     canvasContext.strokeStyle = "red";
     canvasContext.lineWidth = 3;
     if(e>0){
        canvasContext.fillText("Prázdné ohnisko", xF-2*e-50, yF-30);
     }
     else{
        canvasContext.fillText("Střed kružnice", xF-2*e-50, yF-30);
     }
     

     if (Math.sqrt( Math.pow(pointX - x_p,2) + Math.pow(pointY -y_p,2) )<5*radius ){
       if(mouseDown==1){
         canvasContext.fillStyle = "green";
         canvasContext.strokeStyle = "green";
       }
       else{
         canvasContext.fillStyle = "#red";
         canvasContext.strokeStyle = "green";
       }
     }
     canvasContext.fill();
     canvasContext.stroke();
 }

 // VYKRESLOVÁNÍ DO CANVASU - VOLÁ FUNKCI drawEverything(); POHYB A STISK MYŠI A AKTUALIZACE OBRAZU OHNISKA; UVNITŘ setInterval(drawOnline, h)
 function drawOnline(){
    // volá se funkce, která má na starosti téměř celé vykreslování do canvasu - kromě prázdného ohniska
     drawEverything();

     /*
     AKTUALIZCE POLOHY MYŠI:
     přidáváme "posluchače", který při události 'pohnutí myší' zavolá funkci position_mouse() ...
     ... ta uloží do pomocných proměnných x_p, y_p aktuální souřadnice myši
     */
     canvas.addEventListener("mousemove", position_mouse, false);

     /*
     AKTUALIZACE POLOHY PRÁZDNÉHO OHNISKA
     pokud je myš stisknuta a vzdálenost myši od středu ohniska je menší než 5*radius, přidáme si nového posluchače; toho je pak potřeba odstranit, pokud podmínky nejsou splněny
     posluchač při pohybu myší (událost "mousemove") zavolá funkci getPosition - ta aktualizuje x-ovou souřadnici pointX (polohu středu kruhu) a vykreslí kruh
     */
     if (mouseDown==1 && Math.sqrt( Math.pow(pointX - x_p,2) + Math.pow(pointY -y_p,2) )<5*radius ){
        canvas.addEventListener("mousemove", getPosition, false);
        drawCenter(); // vypadá to tady zbytečně, protože vykreslení je zahrnuto ve volní funkce getposition, ale prakticky to funguje lépe, když je to tady 2x zahrnuto
        // se změnou excentricity se přeruší výpočty a vykreslování ploch
        resetfunction();
     }
     else{
        drawCenter();
        canvas.removeEventListener("mousemove", getPosition, false);
        //mouseDown = 0;
     }
    }

 // MAŽE KRUHOVOU STOPU, zdroj: https://gist.github.com/getify/2926699
 function clearCircle(context,x,y,radius) {
	context.save();
	context.beginPath();
	context.arc(x, y, radius, 0, 2*Math.PI, true);
	context.clip();
	context.clearRect(x-radius,y-radius,radius*2,radius*2);
	context.restore();
}

 function getPosition(event) {
    /* 
    SMAZÁNÍ OBRAZU OHNISKA:
    velmi důležité - maže obraz ohniska - to je potřeba udělat předtím, než nakreslíme nové ohnisko (která má novoou polohu)
    Původní řádek: canvasContext.clearRect(pointX-1.1*radius, pointY-1.1*radius, 3*radius, 3*radius); // hodnoty jsou čistě empirické..
    Nový řádek (z https://gist.github.com/getify/2926699):
    */
     clearCircle(canvasContext,pointX,pointY,radius);

     // AKTUALIZACE POLOHY NOVÉHO OHNISKA - JEN V SOUŘ. X
     pointX = event.clientX - canvas.offsetLeft;

     // PODMÍNKA, ŽE NOVÁ SOUŘADNICE NEMŮŽE BÝT VĚTŠÍ NEŽ JE X-OVÁ SOUŘADNICE SLUNCE
     if (pointX>xF){
         pointX = xF;
     }
    
     // DOVOLÍME NEJVĚTŠÍ HODNOTU NUM. EXCENTRICITY BÝT 0.9
     let coef = 0.8; // definuje dříve
     if ( Math.abs(pointX-xF)/(2*a)>coef )
         pointX = xF - coef*2*a;

     // VYKRESLENÍ NOVÉHO OHNISKA 
     drawCenter();
 }

// VOLÁ SE PRO VYKRESLENÍ PRŮVODIČE UVNITŘ FUNKCE drawEverything()
// hodnota proměnné connection_show při spuštění programu: connection_show = false
function connection(){
    if (connection_show==false){
        connection_show=true;
    }
    else{
        connection_show=false;
    }
 }    



 // VYKRESLUJE PLOCHU OPSANOU PRŮVODIČEM
 // hodnota proměnné area_show při spuštění programu: area_show = false
 function area(){
    area_time_interval_boolean = false;
    if (area_show==false){
        area_show=true;
        t_observation=0; // je potřeba vynulovat vždycky, když spouštíme nové měření plochy, podobně pro S_observation
        S_observation=0;
    }
    else{
        area_show=false;
    }
 }

 // VYKRESLUJE PLOCHU OPSANOU PRŮVODIČEM PO DOBU 3 SEKUND
 function area_time_interval(){
    area();
    area_time_interval_boolean=true;
}
 
 // KRESLÍ ŠIPKY - převzato z https://stackoverflow.com/questions/808826/draw-arrow-on-canvas-tag
 function canvas_arrow(context, fromx, fromy, tox, toy) {
    let headlen = 10; // length of head in pixels
    let dx = tox - fromx;
    let dy = toy - fromy;
    let angle = Math.atan2(dy, dx);
    context.beginPath();
    context.moveTo(fromx, fromy);
    context.lineTo(tox-0.5*headlen * Math.cos(angle), toy- 0.5*headlen * Math.sin(angle));
    context.stroke();
    context.closePath();
    context.beginPath();
    context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
    //context.moveTo(tox, toy);
    context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
    context.moveTo(tox, toy);
    context.strokeStyle = "#FF0000";
    context.closePath();
    //context.stroke();
    context.fill();

  }

  // POMOCNÁ FUNKCE PRO KRESLENÍ ŠIPEK
  function show_arrow(){
    if (show_arrow_boolean == false){
        show_arrow_boolean = true; 
    }
    else{
        show_arrow_boolean = false; 
    }
  }

 // VYKRESLENÍ PERIHELIA
 function perihelium_point(){
    canvasContext.beginPath();
    canvasContext.arc(xF+a-e, yF, radius, 0, 2 * Math.PI);
    canvasContext.strokeStyle = "red";
    canvasContext.stroke();
    canvasContext.fillStyle = "red";
    canvasContext.fill();
    canvasContext.font = "15px Arial";
    canvasContext.fillText("Perihelium", xF+a-e+10, size_y/2);
    canvasContext.closePath();
 }

 function periheliu_show(){
    if (show_perihelium_boolean == false){
        show_perihelium_boolean = true; 
    }
    else{
        show_perihelium_boolean = false; 
    }
 }
 
 // VYKRESLENÍ AFELIA
 function afelium_point(){
    canvasContext.beginPath();
    canvasContext.arc(xF-a-e, yF, radius, 0, 2 * Math.PI);
    canvasContext.strokeStyle = "red";
    canvasContext.stroke();
    canvasContext.fillStyle = "red";
    canvasContext.fill();
    canvasContext.font = "15px Arial";
    canvasContext.fillText("Afelium", xF-a-e-60, size_y/2);
    canvasContext.closePath();
 }

 function afelium_show(){
    if (show_afelium_boolean == false){
        show_afelium_boolean = true; 
    }
    else{
        show_afelium_boolean = false; 
    }
 }


 // KRESLENÍ VŠEHO (KROMĚ PRÁZDNÉHO OHNISKA)
 function drawEverything()   { 
     // AKTUALIZACE LINEÁRNÍ EXCENTRICITY ELIPSY (po změně polohy pointX při volání funkce getPosition) 
     e = 0.5*Math.abs(xF-pointX);

     // AKTUALIZACE VEDLEJŠÍ POLOOSY ELIPSY
     b = Math.sqrt(Math.pow(a,2)-Math.pow(e,2));

     // AKTUALIZACE NUMERICKÉ EXCENTRICITY ELIPSY
     eps = e/a;

     // AKTUALIZACE PLOCHY ELIPSY
     S_elipsy = Math.PI*a*b;

     // AKTUALIZACE PERIODY
     P = Math.sqrt( 4*Math.PI*Math.PI*a*a*a/GM  );
     //console.log(Math.sqrt( 4*Math.PI*Math.PI*a*a*a/GM  ));

     
     // POZADÍ CANVASU - obdélník o rozměrech canvasu          
     canvasContext.fillStyle = 'rgba(255, 255, 255, 1)';
     canvasContext.fillRect(0,0,canvas.width,canvas.height);


     // -----------------------------------------------------------
     // VYKRESLENÍ ELIPSY - střed elipsy uprostřed canvasu
     // HLAVNÍ POLOOSU LZE STISKNUTÍM A POHYBEM MYŠI MĚNIT

     let xs = pointX+e; // střed elispy: x-ová souřadnice
     let ys =  pointY;  // střed elispy: y-ová souřadnice

     // pomocná proměnná - "jak moc se nacházíme daleko od elispy" (TODO: lze vysvětlit i lépe)
     let podm = Math.abs( Math.pow( (x_p-xs)/a, 2) + Math.pow( (y_p-ys)/b, 2) - 1 );

    // POMOCNÁ FUNKCE - HLEDÁNÍ KOŘENŮ NELINEÁRNÍ FUNKCE NEWTONOVOU METODOU
    function f(varA,constx,consty,conste){
        return constx*constx/varA + consty*consty/(varA-conste*conste)-1;
    }
    function df(varA,constx,consty,conste){
        return -constx*constx/(varA*varA) - consty*consty/((varA-conste*conste)*(varA-conste*conste));
    }
    function findA(varA,constx,consty,conste){
        for(let i = 0; i<10; i++){
            varA = varA - f(varA,constx,consty,conste)/df(varA,constx,consty,conste);
        }
        return varA;
    }

    // pomocná proměnná: b_min - nebudeme konstruovat elipsy s vedlejí poloosou menší než je b_min
    let b_min = 20;
    let a_min = Math.sqrt( Math.pow(b_min,2) + Math.pow(e,2) );
    // maximální reletivní excentricita
    let coef = 0.8; 
    // console.log(a, "  ", a_min, "  ", eps);

     canvasContext.beginPath();
     canvasContext.ellipse(xs, ys, a, b, 0, 0, 2* Math.PI, false);
     if(podm < Math.abs(  (x_p-xs)*40/(a*a) + (y_p-ys)*40/(b*b)) && Math.sqrt( Math.pow(pointX - x_p,2) + Math.pow(pointY -y_p,2) )>5*radius){
        canvasContext.strokeStyle = "#0000FF";
        if(mouseDown==1 && a> a_min  && eps<=coef ){   
            canvasContext.strokeStyle = "#00FF00"
            if (findA(a*a,x_p-xs,y_p-ys, e) > 0){
                if( e/Math.sqrt(findA(a*a,x_p-xs,y_p-ys, e)) < coef )
                {
                    let sqrtA = Math.sqrt(findA(a*a,x_p-xs,y_p-ys, e));
                    a = sqrtA;
                    resetfunction();
                }
            }
        }
     }
     else{
        canvasContext.strokeStyle = "#FF0000";
     }
     if(a<a_min){
        a = a_min+0.1;
     }
     if(eps>coef){
        eps = 0.79;
     }
     canvasContext.stroke();
     canvasContext.closePath();

     // -----------------------------------------------------------

     // SLUNCE / OHNISKO F - VYKRESLENÍ
     canvasContext.beginPath();
     canvasContext.arc(xF, yF, 1.5*radius, 0, 2 * Math.PI);
     canvasContext.strokeStyle = "orange";
     canvasContext.stroke();
     canvasContext.fillStyle = "orange";
     canvasContext.fill();
     canvasContext.font = "15px Arial";
     canvasContext.fillText("Slunce", xF-21, size_y/2+30);
     canvasContext.closePath();

     // VÝPOČET RYCHLOSTI PLANETY VE SVÉM AKTUÁLNÍM BODĚ
     v_array = [(xF + r*Math.cos(phi) - x)/h*1000, (yF - r*Math.sin(phi) - y)/h*1000];

     // VYKRESLENÍ VEKTORU RYCHLOSTI V CANVASU
     if (show_arrow_boolean == true && t>h && (mouseDown==0 || Math.sqrt( Math.pow(pointX - x_p,2) + Math.pow(pointY -y_p,2) )>5*radius)){
        if(mouseDown==0 || podm > Math.abs(  (x_p-xs)*40/(a*a) + (y_p-ys)*40/(b*b))){
            canvas_arrow(canvasContext, x, y, x+v_array[0], y+v_array[1]);
        }
     }

    // VYKRESLENÍ PERIHELIA A AFELIA V CANVASU
     if (show_perihelium_boolean == true && t>h){
        perihelium_point();
     }
     if (show_afelium_boolean == true && t>h){
        afelium_point();
     }
     if (e == 0){
        show_perihelium_boolean = false;
        show_afelium_boolean = false;
     }
     let check_perihelium = document.getElementById("myCheck_perihelium");
     if (e > 0 && check_perihelium.checked==true){
        show_perihelium_boolean = true;
     }
     let check_afelium = document.getElementById("myCheck_afelium");
     if (e > 0 && check_afelium.checked==true){
        show_afelium_boolean = true;
     }

    // VELIKOST RYCHLOSTI
    let vmagn = Math.sqrt(Math.pow(v_array[0],2) + Math.pow(v_array[1],2))

    // VYKRESLENÍ RYCHLOSTI V PERIHELIU A AFELIU
    let vp = 1000*Math.sqrt((GM/a)*(1+eps)/(1-eps));
    let va = 1000*Math.sqrt((GM/a)*(1-eps)/(1+eps));

    // VELIKOST RYCHLOSTI V PERIHELIU, AFELIU A OKAMŽITÁ RYCHLOST
    canvasContext.fillStyle = "blue";
    canvasContext.strokeStyle = "red";
    canvasContext.fillText("Rychlost v perihéliu, aféliu, daném okamžiku", 30, 330);
    //canvasContext.fillStyle = "white";

    canvasContext.beginPath();
    canvasContext.moveTo(30, 345);
    canvasContext.lineTo(30+vp, 345);
    canvasContext.moveTo(30, 365);
    canvasContext.lineTo(30+va, 365);
    if(mouseDown==0 || Math.sqrt( Math.pow(pointX - x_p,2) + Math.pow(pointY -y_p,2) )>5*radius){

        if(mouseDown==0 || podm > Math.abs(  (x_p-xs)*40/(a*a) + (y_p-ys)*40/(b*b))){
            canvasContext.moveTo(30, 385);
            canvasContext.lineTo(30+vmagn, 385);
        }
    }
    canvasContext.closePath();
    canvasContext.fill();
    canvasContext.stroke();
    canvasContext.fillText("vp", 10, 350);
    canvasContext.fillText("va", 10, 370);
    canvasContext.fillText("v", 10, 390);
    canvasContext.fill();

    // NUMERICKÁ EXCENTRICITA NA ÚSEČCE
    canvasContext.fillStyle = "blue";
    canvasContext.strokeStyle = "red";
    canvasContext.fillText("Numerická excentricita", 30, 420);
    canvasContext.fillText("ε", 10, 440);
    canvasContext.fillText("0", 25, 440);
    canvasContext.fillText("0.8", 165, 440);
    canvasContext.beginPath();
    canvasContext.moveTo(40, 435);
    canvasContext.lineTo(40+150*eps, 435);
    canvasContext.closePath();
    canvasContext.stroke();
    canvasContext.fill();


     // AKTUÁLNÍ SOUŘADNICE PLANETY P - VÝPOČET POLOHY
     // poznámka: phi a r už máme definované z dříve, viz let r = a-e, phi = 0;
     //let
      x = xF + r*Math.cos(phi);
     //let
      y = yF - r*Math.sin(phi);  
     phi = phi + w*h; 
     r = a*(1-Math.pow(eps,2))/(1+eps*Math.cos(phi));
     let k = 2*Math.PI*a*b/P;
     w = k/Math.pow(r,2);
     t = t+h;   


     // VYKRESLÍME PLANETU
     canvasContext.beginPath();
     canvasContext.arc(x, y, radius, 0, 2 * Math.PI);
     canvasContext.strokeStyle = "Chartreuse";
     canvasContext.stroke();
     canvasContext.fillStyle = "Chartreuse";
     canvasContext.fill();
     canvasContext.font = "15px Arial";
     canvasContext.fillText("Planeta", x-20, y+30);
     canvasContext.closePath();
     

     // KDYŽ NEVYKRESLUJEME PLOCHU
     if(area_show==false){
         // pole x_array a další vyprázdníme, jsou připravené pro další kreslování plochy opsané průvodičem
         x_array=[];
         y_array=[];
         t_array=[];
         phi_array=[];
         r_array=[];
         
         // z počátku je nula počtu oběhů kolem dokola
         number_of_rounds = 0; 

         // TABULKA VELIČIN: Doba pozorování, Opsaná plocha - vyjádřené jako násobky oběžné doby a elipsy
         canvasContext.font = "15px Arial";
         canvasContext.fillStyle = "blue";
         canvasContext.fillText("Doba pozorování: " + (t_observation/P).toFixed(2) + " x perioda", tab_xpos, tab_ypos);
         canvasContext.fillText("   Opsaná plocha: " + (S_observation/S_elipsy).toFixed(2) + " x plocha elipsy", tab_xpos, tab_ypos+h);

         // Pokud nebylo provedeno ještě žádné měření, plošnou rychlost není z čeho počítat
         if (S_observation==0){
             canvasContext.fillText("   Plošná rychlost: -", tab_xpos, tab_ypos+2*h);
         }
         else{
             canvasContext.fillText("   Plošná rychlost: " + ((S_observation/S_elipsy).toFixed(2)/(t_observation/P)).toFixed(1) + " x plocha elipsy/perioda ", tab_xpos, tab_ypos+2*h);
         }      
     }
    
    // KDYŽ VYKRESLUJEME PLOCHU
     if(area_show==true){
         // zobrazí se průvodič
         //connection_show=true;

         // generujeme pole souřadnice v x, y a času t
         x_array=x_array.concat(x);
         y_array=y_array.concat(y);
         t_array=t_array.concat(t);
         phi_array=phi_array.concat(phi);
         r_array=r_array.concat(r);

         // Počítáme celkovou dobu pozorování a plochu opsanou za tuto dobu
         t_observation = t_observation + h;
         let r_next = a*(1-Math.pow(eps,2))/(1+eps*Math.cos(phi+w*h));
         S_observation = S_observation + 0.5*r*r_next*Math.sin(w*h);

         if(area_time_interval_boolean==true && t_observation >= time_interval){
             area_time_interval();
         }
         
         canvasContext.font = "15px Arial";
         canvasContext.fillStyle = "blue";
         canvasContext.fillText("Doba pozorování: " + (t_observation/P).toFixed(2) + " x perioda", tab_xpos, tab_ypos); 
         canvasContext.fillText("   Opsaná plocha: " + (S_observation/S_elipsy).toFixed(2) + " x plocha elipsy", tab_xpos, tab_ypos+h);
         
         canvasContext.fillText("   Plošná rychlost: " + ((S_observation/S_elipsy)/(t_observation/P)).toFixed(1) + " x plocha elipsy/perioda ", tab_xpos, tab_ypos+2*h);


         if(x_array.length>=5){
             if (  (x_array[x_array.length-1]-x_array[0])*(x_array[x_array.length-2]-x_array[0])<=0 && (y_array[y_array.length-1]-y_array[0])*(y_array[y_array.length-2]-y_array[0])<=0  ){
                  number_of_rounds+=1;
                  x_array=[x_array[0],x_array[1],x_array[2],x_array[3],x_array[4]];
                  y_array=[y_array[0],y_array[1],y_array[2],y_array[3],y_array[4]];
             }
         }
         
     }

     // KDYŽ JE VYDÁN PŘÍKAZ, ABY SE ZOBRAZIL PRŮVODIČ
     if (connection_show==true){
         canvasContext.beginPath();
         canvasContext.moveTo(xF, yF);
         canvasContext.lineTo(x, y);
         canvasContext.strokeStyle = "#FF0000";
         canvasContext.closePath();
         canvasContext.stroke();
     }

     // Important: Další část kódu se týká vybarvování opsané plochy! -------------------------

     // POKUD JE ZADÁN PŘÍKAZ, ŽE SE MAJÍ VYKRESLOVAT PLOCHY
     // hodnoty x-ových a y-ových souřadnic v x_array a y_array se ukládají do x_array_trinagles, y_array_trinagles
     if(area_show==true){
         x_array_trinagles = x_array;
         y_array_triangles = y_array;
         numofr = number_of_rounds;
     }
     
     //obarvování ploch
     canvasContext.beginPath();
     canvasContext.moveTo(xF, yF);
     for(let k=0;k<y_array_triangles.length;k++){
         canvasContext.lineTo(x_array_trinagles[k], y_array_triangles[k]);
     }
     canvasContext.fillStyle = 'rgba(0, 255, 0, 0.2)';
     canvasContext.fill();
     canvasContext.closePath();

     // vykreslí se bod, v němž spouštíme pozorování
     canvasContext.font = "20px Arial";
     canvasContext.beginPath();
     canvasContext.arc(x_array_trinagles[0], y_array_triangles[0], 0.8*radius, 0, 2 * Math.PI);
     canvasContext.strokeStyle = "#0000FF";
     canvasContext.stroke();
     canvasContext.fillStyle = "#0000FF";
     canvasContext.fill();
     canvasContext.closePath();

     // vykreslí se průvodič v momentě, kdy spustíme pozorování
     canvasContext.beginPath();
     canvasContext.moveTo(xF, yF);
     canvasContext.lineTo(x_array_trinagles[0], y_array_triangles[0]);
     canvasContext.strokeStyle = "#0000FF";
     canvasContext.closePath();
     canvasContext.stroke();

     // o kolikátý oběh jde: 
     //canvasContext.fillText("Oběh: " + number_of_rounds + ".");
     canvasContext.font = "15px Arial";

     let s = 0.25;
     if (numofr<1){
         canvasContext.fillText("Start", x_array_trinagles[0] + s*(x_array_trinagles[0]-xF), y_array_triangles[0]+s*(y_array_triangles[0]-yF));
     }
     else{
         s = 0.3
         canvasContext.fillText(numofr + "."+" oběh",x_array_trinagles[0] + s*(x_array_trinagles[0]-xF), y_array_triangles[0]+s*(y_array_triangles[0]-yF));
     }

     if (area_show==false && x_array_trinagles.length != 0){

         canvasContext.beginPath();
         canvasContext.moveTo(xF, yF);
         canvasContext.lineTo(x_array_trinagles[x_array_trinagles.length-1], y_array_triangles[x_array_trinagles.length-1]);
         canvasContext.strokeStyle = "#00FF00";
         canvasContext.closePath();
         canvasContext.stroke();

         canvasContext.font = "20px Arial";
         canvasContext.beginPath();
         canvasContext.arc(x_array_trinagles[x_array_trinagles.length-1], y_array_triangles[x_array_trinagles.length-1], 0.8*radius, 0, 2 * Math.PI);
         canvasContext.strokeStyle = "#00FF00";
         canvasContext.stroke();
         canvasContext.fillStyle = "#00FF00";
         canvasContext.fill();
         canvasContext.closePath();

         canvasContext.font = "15px Arial";
         canvasContext.fillText("Konec", x_array_trinagles[x_array_trinagles.length-1] + s*(x_array_trinagles[x_array_trinagles.length-1]-xF), y_array_triangles[x_array_trinagles.length-1]+s*(y_array_triangles[x_array_trinagles.length-1]-yF));


     }

 }

  // SMAŽE PLOCHY
  function resetfunction(){
    x_array_trinagles = [];
    y_array_triangles = [];
    t_observation=0;
    S_observation=0;
    area_show = false;
    //show_arrow_boolean = false;

    //let check_velocity = document.getElementById("myCheck_rychlost");
    //check_velocity.checked = false;
    //let check_connection = document.getElementById("myCheck_pruvodic");
    //check_connection.checked = false;
    //connection_show = false;

}
