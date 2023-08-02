// ********************
// BACKGROUND PARALAX SCRIPT
// ********************

    const speed = 0.7;
  
    window.addEventListener('scroll', function() {
      const yPos = (window.pageYOffset * speed);
      document.body.style.backgroundPosition = `center ${yPos}px`;
    });




// ********************
// RESPONSIVITY SCRIPTS
// ********************


    const menu = document.getElementById("menu");
    const menubutton = document.getElementById("menubutton");

    var maxColWidth = (getComputedStyle(document.documentElement).getPropertyValue('--maxcolw'));
    //convert to integer
    maxColWidth = maxColWidth.substring(0, maxColWidth.length - 2);
    maxColWidth = parseInt(maxColWidth);

    var minColWidth = (getComputedStyle(document.documentElement).getPropertyValue('--mincolw'));
    //convert to integer
    minColWidth = minColWidth.substring(0, minColWidth.length - 2);
    minColWidth = parseInt(minColWidth);
    // console.log('minColWidth', minColWidth);

    var menuWidth = (getComputedStyle(document.documentElement).getPropertyValue('--menuWidth'));
    //convert to integer
    menuWidth = menuWidth.substring(0, menuWidth.length - 2);
    menuWidth = parseInt(menuWidth);
    // console.log('minColWidth', minColWidth);

    var column = document.getElementById("column");

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

    //changes title progressbard with based on scroll
    window.addEventListener('scroll', function() {
        var scrollPercentage = (document.documentElement.scrollTop + document.body.scrollTop) / (document.documentElement.scrollHeight - document.documentElement.clientHeight) * 100;
        document.getElementById('pageprogressbar').style.width = scrollPercentage + '%';
      });
      
 
// SIDE MENU SCIRPTS

    var menuTreshold = maxColWidth + (2 * menuWidth);
    
    // This is for the button on the side menu to close and open it
    function toggleMenu() {
        if (menu.classList.contains("closed")) {
            menu.classList.remove("closed");
            menubutton.classList.remove("closed");
        }  else {
            menu.classList.add("closed");
            menubutton.classList.add("closed");
        }
    }

    // RESIZES side menu based on the window width on load

    window.addEventListener('resize', function(event) {
        if (window.innerWidth < menuTreshold) {
            menu.classList.add("smallscreen");
            menubutton.classList.add("smallscreen");

            menu.style.width = column.offsetWidth + "px";
            menubutton.style.translate = column.offsetWidth - menubutton.offsetWidth + "px";
        } 

        else {
            menu.classList.remove("smallscreen");
            menubutton.classList.remove("smallscreen");

            menu.classList.remove("closed");
            menubutton.classList.remove("closed");

            menu.style.width = "var(--menuWidth)";
            menubutton.style.translate = "calc(var(--globalpadding)*-1 - var(--size))";
        }
    });

    //checks if the menu should load collapsed on small screens
        if (window.innerWidth < menuTreshold) {
            menu.classList.add("closed");
            menubutton.classList.add("closed");
            
            menu.classList.add("smallscreen");
            menubutton.classList.add("smallscreen");

            menu.style.width = column.offsetWidth + "px";
            menubutton.style.translate = column.offsetWidth - menubutton.offsetWidth + "px";
        } 

    
