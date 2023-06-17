// ********************
// BACKGROUND PARALAX SCRIPT
// ********************

    // const speed = 0.7;
  
    // window.addEventListener('scroll', function() {
    //   const yPos = (window.pageYOffset * speed);
    //   document.body.style.backgroundPosition = `center ${yPos}px`;
    // });




// ********************
// WINDOW SIZES SCRIPTS
// ********************


    const menu = document.getElementById("menu");

    var maxColWidth = (getComputedStyle(document.documentElement).getPropertyValue('--maxcolw'));
    //convert to integer
    maxColWidth = maxColWidth.substring(0, maxColWidth.length - 2);
    maxColWidth = parseInt(maxColWidth);

    var minColWidth = (getComputedStyle(document.documentElement).getPropertyValue('--mincolw'));
    //convert to integer
    minColWidth = minColWidth.substring(0, minColWidth.length - 2);
    minColWidth = parseInt(minColWidth);
    // console.log('minColWidth', minColWidth);

    var menuWidth = 300;

    var astrogateMinSize = 128;

// HEADER SCRIPT

    const astrogate = document.getElementById("astrogate");
    const title = document.getElementById("title");


    //RESIZES astrogate based on window width
    if (((window.innerWidth - maxColWidth)/2 - 9) > astrogateMinSize) {
        astrogate.style.setProperty('width', ((window.innerWidth - maxColWidth)/2 - 9 + "px"));
    }

    else {
        astrogate.style.setProperty('width', astrogateMinSize + "px");
    }

    window.addEventListener('resize', function(event) {
        if (((window.innerWidth - maxColWidth)/2 - 9) > astrogateMinSize) {
            astrogate.style.setProperty('width', ((window.innerWidth - maxColWidth)/2 - 9 + "px"));
        }

        else {
            astrogate.style.setProperty('width', astrogateMinSize + "px");
        }
    });

    //RESIZES title bar based on window width
    window.addEventListener('resize', function(event) {
        if (((window.innerWidth - maxColWidth)/2 - 9) >= astrogateMinSize) {
            title.style.setProperty('width', (maxColWidth + "px"));
        }

        else {
            title.style.setProperty('width', (window.innerWidth - ((window.innerWidth - maxColWidth)/2) ) - astrogateMinSize + "px");

        }
    });
 
// SIDE MENU SCIRPTS

    var menuTreshold = 500;

    // RESIZES side menu based on the window width
    document.documentElement.style.setProperty('--menusize', window.innerWidth < menuTreshold ? '100%' : (menuWidth + "px"));

    window.addEventListener('resize', function(event) {
        if (window.innerWidth < menuTreshold) {
            document.documentElement.style.setProperty('--menusize', "100%");
            // console.log('window.innerWidth', window.innerWidth);
        } 

        else if (window.innerWidth >= menuTreshold) {
            document.documentElement.style.setProperty('--menusize', (menuWidth + "px"));
            // console.log('window.innerWidth', window.innerWidth);
        }
    });

    //checks if the menu should load collapsed on small screens
        if (window.innerWidth < (maxColWidth + (2 * menuWidth))) {
            menu.classList.add("closed");

        } else {
      menu.classList.remove("closed");
    }

    
    // This is for the button on the side menu to close and open it
    function toggleMenu() {
        if (menu.classList.contains("closed")) {
            menu.classList.remove("closed");
        }  else {
            menu.classList.add("closed");
        }
    }
