var main;
var main2;
var lastX = -1;
var lastY = -1;
var dragging = false;
var socket;
var notTicking = true;
var timer = 0;
var noMoving = 0;

var cellWidth = 20;

var arr1 = makeInitial();
var arr2 = makeInitial();

var colors = ['rgba(7, 322, 244, 1)', 'rgba(0, 128, 37, 1)', 'rgba(255, 0, 23, 1)', 'rgba(0, 128, 37, 1)', 'rgba(1, 10, 121, 1)', 'rgba(131, 0, 7, 1)', 'rgba(0, 128, 37, 1)', 'rgba(0, 127, 128, 1)', 'rgba(0, 0, 0, 1)', 'rgba(128, 128, 128, 1)'];
            
function makeInitial()
{
    var matrix = [];
        for(var i=0; i<15; i++) {
            matrix[i] = new Array(15);
            for (var j=0; j<15; j++)
            {
                matrix[i][j] = {};
                matrix[i][j].flagged = false;
                matrix[i][j].flipped = false;
                matrix[i][j].value = 0;
            }
    }
            
   return matrix;

}

function updateTimer()
{
    document.getElementById("timer").innerHTML = ++timer;
    console.log(noMoving);
    if (noMoving > 0)
    {
        noMoving--;
    }
    if (noMoving == 1)
    {
        noMoving = 0;
        main.repaint();
    }
    
    if (!notTicking)
        setTimeout(updateTimer, 1000);
}

function drawSquares()
{
    var g = this.getContext("2d");
    clear(g);
    
    
    for (var x=0; x<this.contents.active.length; x++)
    {
        for (var y=0; y<this.contents.active[0].length; y++)
        {
            if (this.contents.active[x][y] == 0)
                g.fillStyle="blue";
            else if (this.contents.active[x][y] == 1)
                g.fillStyle="red";
            else
                g.fillStyle="yellow";
            
            
            g.fillStyle   = '#fff';
            g.beginPath();
            g.moveTo(x*cellWidth, y*cellWidth); // give the (x,y) coordinates
            g.lineTo(x*cellWidth+cellWidth, y*cellWidth);
            g.lineTo(x*cellWidth, y*cellWidth+cellWidth);
            g.lineTo(x*cellWidth, y*cellWidth);
            g.fill();
            g.closePath();
            
            g.fillStyle   = '#808080';
            g.beginPath();
            g.moveTo(x*cellWidth+cellWidth, y*cellWidth+cellWidth); // give the (x,y) coordinates
            g.lineTo(x*cellWidth+cellWidth, y*cellWidth);
            g.lineTo(x*cellWidth, y*cellWidth+cellWidth);
            g.lineTo(x*cellWidth+cellWidth, y*cellWidth+cellWidth);
            g.fill();
            g.closePath();
            
            g.fillStyle = '#c1c1c1';
            g.fillRect(x*cellWidth+2,y*cellWidth+2,cellWidth-4,cellWidth-4); // x, y, width, height
            
            if (this.contents.active[x][y].flipped == true)
            {
                g.fillStyle = "#c1c1c1";
                g.fillRect(x*cellWidth,y*cellWidth,cellWidth,cellWidth); // x, y, width, height
            }

            else if (this.contents.active[x][y].flagged == true)
            {
                g.fillStyle = "red";
                g.beginPath();
                g.moveTo(x*cellWidth+11, y*cellWidth+3); // give the (x,y) coordinates
                g.lineTo(x*cellWidth+3, y*cellWidth+8);
                g.lineTo(x*cellWidth+11, y*cellWidth+11);
                g.lineTo(x*cellWidth+11, y*cellWidth+2);
                g.fill();
                g.closePath();
                
                g.beginPath();
                g.moveTo(x*cellWidth+12,y*cellWidth+3);
                g.lineTo(x*cellWidth+12,y*cellWidth+15);
                g.stroke();
                g.closePath();

            }

    
//            g.fillRect(x*cellWidth,y*cellWidth,cellWidth,cellWidth); // x, y, width, height
            
            g.fillStyle="white";
            g.font="cellWidthpx Arial";
            
//
//            if (this.contents.values[x].length > 1)
//            {
//                g.font="20px Arial";
//                off = 0;
//            }
            
            if (this.contents.active[x][y].value < 0)
            {
                g.fillStyle = 'black'
                g.fillText("X", x*cellWidth+4, y*cellWidth+17)
            }
            else if (this.contents.active[x][y].value < 9 && this.contents.active[x][y].value > 0)
            {
                g.fillStyle = colors[parseInt(this.contents.active[x][y].value)+1];
                g.fillText(this.contents.active[x][y].value, x*cellWidth+4, y*cellWidth+17)
            }
        }
    }
    
    g.fillStyle="black";
    g.font="20px Arial";
//    g.fillText("we love javascript", 135, 20)
//    g.font="15px Arial";
//    g.fillText("click a square to mark active", 10, 290)
    
    if (lastX >0 && lastY >0)
    {
        g.fillStyle = "#c1c1c1";
        g.fillRect((lastX-1)*cellWidth,(lastY-1)*cellWidth,cellWidth,cellWidth); // x, y, width, height

//        g.font="25px Arial";
//        g.fillText("("+lastX+", "+lastY+")", 10, 265)
    }
    
    if (noMoving > 0)
    {
        g.fillStyle = 'rgba(255, 0, 0, .2)'
        g.fillRect(0,0,300,300); // x, y, width, height
    }
    
     // gradientify(g);     // uncomment for fun!

    
}

function main()
{
    main = document.getElementById("main");
    main2 = document.getElementById("main2");

    
    // create arrays of data
    var values = [1,2,3,4,5,6,7,"fish",9];
    
    active = arr1;
    active2 = arr2;
    
    main.contents = {};
    main2.contents = {};

    $('body').on('contextmenu', '#main', function(e){ return false; });

    
    main.contents.values = values;
    main.contents.active = active;
    
    main2.contents.values = values;
    main2.contents.active = active2;
    
    main.repaint = drawSquares;
    main.repaint();
    
    main2.repaint = drawSquares;
    main2.repaint();
    
    socket = io.connect('http://localhost:3000');
    
    socket.on('updateBoard', function (data) {
              console.log("got update board");
              if (notTicking)
              {
                notTicking = false;
                setTimeout(updateTimer, 1000);
              }
              for (var x=0; x<data.length; x++)
              {
              (function(s){setTimeout(function(){processMove(s);}, 1);})(data[x]);
              }
              });

    
    $('#main').mouseup(fireClick);
    $('#main').mousedown(depressClick);
    $('#main').mousemove(moveClick);


    
}

function clear(g)
{
    g.clearRect(0, 0, main.width, main.height);
}

function moveClick(event)
{
    
    if (lastX>0 || lastY>0)
    {
        var x = event.offsetX;
        var y = event.offsetY;
        
        lastX = Math.ceil(x/cellWidth);
        lastY = Math.ceil(y/cellWidth);
        
        main.repaint();
    }
}

function depressClick(event)
{
    var x = event.offsetX;
    var y = event.offsetY;
    
    x = Math.ceil(x/cellWidth);
    y = Math.ceil(y/cellWidth);
    
    if (event.which == 1)
    {
        lastX = x;
        lastY = y;
        
        main.repaint();
        
    }

}

function fireClick(event)
{
    var x = event.offsetX;
    var y = event.offsetY;
    
    x = Math.ceil(x/cellWidth);
    y = Math.ceil(y/cellWidth);
    
    if (event.which == 1)
    {
       // main.contents.active[x-1][y-1].flipped = true;
//        main.contents.active[x-1][y-1].value = parseInt(Math.random()*8)+1;
        //send flip at x-1, y-1
        if (noMoving <= 0)
            socket.emit('click', { action: 'flip', x: x-1, y: y-1});

    }
    else if (event.which == 3)
    {
//        main.contents.active[x-1][y-1].flagged = !main.contents.active[x-1][y-1].flagged;
        //send flag at x-1, y-1
        if (noMoving <= 0)
            socket.emit('click', { action: 'flag', x: x-1, y: y-1});

    }
    
//    lastX = x;
//    lastY = y;
    main.repaint();
}

function gradientify(g)
{
    g.rect(0, 0, main.width, main.height);
    
    // add linear gradient
    var grd = g.createLinearGradient( main.width/2, 0, main.width/2, main.height);
    grd.addColorStop(1, 'cyan');
    grd.addColorStop(0, 'transparent');
    
    g.fillStyle = grd;
    g.fill();
}

function processMove(response)
{
    var target;
    
    if (response.board == 0)
        target = document.getElementById("main");
    else
        target = document.getElementById("main2");
    
    if (response.display <= 8 && !target.contents.active[response.x][response.y].flipped)
    {
        target.contents.active[response.x][response.y].flipped = true;
        target.contents.active[response.x][response.y].value = response.display;
        
        if (response.display<0 && response.board==0)
        {
            noMoving = 5;
        }
    }
    else (!target.contents.active[response.x][response.y].flipped && response.display>=9)
    {
        target.contents.active[response.x][response.y].flagged = (response.display==11)? false : true;
        target.contents.active[response.x][response.y].value = response.display;
    }
    
    lastX = -1;
    lastY = -1;
    
    target.repaint();
    
    
}