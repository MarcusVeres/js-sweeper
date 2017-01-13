(function()
{
    'use strict';

    console.log("all systems go"); 

    // grab DOM elements
    var canvasElement = document.getElementById( 'canvas-element' );
    var canvas = canvasElement.getContext( '2d' );
    var hud = document.getElementById( 'hud' );

    // vars for storage
    var canvasHeight = canvasElement.height;
    var canvasWidth = canvasElement.width;

    var tileHeight = 40;
    var tileWidth = 40;
    var tileColor = "#EEE";
    var tileFlipColor = "#CCC";
    var tileBorderColor = "#BBB";
    var mineColor = "#000";
    var falseColor = "#CC0000";
    var chanceOfMine = 10;          // percentage out of 100
    var currentRandom = null;

    var currentScore = 0;

    // 
    function isMine()
    {
        currentRandom = Math.floor( Math.random() * 100 );

        if( currentRandom < chanceOfMine )
        {
            return true;
        }
        return false;
    }

    // tile "class" 
    function Tile( data )
    {
        this.height = tileHeight;
        this.width = tileWidth;

        this.flipped = false;
        this.mine = data.mine;
        this.x = data.x;
        this.y = data.y;
        this.col = data.col;
        this.row = data.row;
        this.color = tileColor;

        // if tile is interacted with or clicked, its label is set
        // TODO: maybe there's a better way to do this
        this.label = 0;

        return;

        if( this.mine ){
            this.color = mineColor;
        } else {
            this.color = tileColor;
        }
    }

    Tile.prototype.flip = function()
    {
        if( this.mine ){
            this.color = mineColor;
            loseGame();
        } 
        else 
        {
            this.color = tileFlipColor;
            addPoints();

            // calculate the number of mines that surround this tile, feeding in the tile array
            this.countSurroundingMines( tileGridArray );
        }
    }

    Tile.prototype.countSurroundingMines = function( array )
    {
        // fed an array, check surroundings and count mines
        // we provide the array instead of using a variable so that this function may be reused in other projects
        
        if( !array ){ 
            console.error( "no array was provided" ); 
            return; 
        }
        
        var mineCount = 0;
        var tileCount = 0;
        
        var rowBeingChecked = this.row - 1;
        var colBeingChecked = this.col - 1;
        var currentTile = null;

        var maxRow = this.row - 1 + 3; // we check a row above and below
        var maxCol = this.col - 1 + 3; // we check a col left and a col right

        var arrayOfEmptyTiles = [];

        // mark the tile as flipped (to prevent duplicate checks )
        array[ this.row ][ this.col ].flipped = true;

        // above the mine
        // TODO: break out the existence check into a function... exists()

        for( var row = rowBeingChecked ; row < maxRow ; row++ )
        {
            // if the row doesn't exist, get out of here
            if( typeof array[ row ] === 'undefined' ){ continue; }

            for( var col = colBeingChecked ; col < maxCol ; col++ )
            {
                // if the row doesn't exist, get out of here
                if( typeof array[ col ] === 'undefined' ){ continue; }

                // shortcut
                currentTile = array[ row ][ col ];

                // prevent duplicate checks
                if( currentTile.flipped ){ continue; }

                // increment the number of tiles that were checked (to test that tiles aren't double-checked) 
                tileCount++;

                // check if mines
                if( currentTile.mine ){
                    mineCount++;
                } 
                else {
                    arrayOfEmptyTiles.push( currentTile );
                    // console.log( currentTile );
                }
            }
        }
        // console.log( "checked" , tileCount , "tiles" );
        
        // apply label
        this.label = mineCount;

        // automatic flip
        // if there were no mines surrounding the tile, open all of its neighbors 
        if( mineCount === 0 )
        {
            // if there are empty tiles, check their neighbors
            for( var i = 0 ; i < arrayOfEmptyTiles.length ; i++ )
            {
                // check the empty tile
                arrayOfEmptyTiles
                arrayOfEmptyTiles[i].flip();
            }
        }

        return mineCount;
    }

    // draws a tile onto the canvas
    function renderTile( tile )
    {
        canvas.fillStyle = tile.color;
        canvas.fillRect( tile.x , tile.y , tile.width , tile.height ); 

        canvas.strokeStyle = tileBorderColor;
        canvas.strokeRect( tile.x , tile.y , tile.width , tile.height ); 

        // if( clicked ) should display its surrounding tiles
        if( tile.label !== 0 )
        {
            renderTileLabel( tile , tile.label );
                // console.log( "tile has a label" );
        }
    }

    // set font properties for all fonts
    // NOTE: this may be risky if different font styles are used, but for our purposes we don't care
    canvas.font = "16px sans-serif";
    canvas.textBaseline = "middle";
    canvas.textAlign = "center";

    // draws text onto a tile
    function renderTileLabel( tile , value )
    {
        canvas.fillStyle = 'blue';
        canvas.fillText( value , tile.x + tile.width / 2 , tile.y + tile.height / 2 );
    }

    var tileGridArray = [];

    var rows = Math.floor( canvasHeight / tileHeight );
    var cols = Math.floor( canvasWidth / tileWidth );

    // create the tiles the first time
    function generateTileMap()
    {
        for( var y = 0; y < rows ; y++ )
        {
            // create an array row in the array
            tileGridArray[y] = [];

            for( var x = 0; x < cols ; x++ )
            {
                // create a new tile object
                var tile = new Tile({
                    'mine' : isMine(),
                    'x' : x * tileWidth,
                    'y' : y * tileHeight,
                    'row' : y,
                    'col' : x,
                });
                
                // push the tile to our tile array
                tileGridArray[y].push( tile );
                
                // draw the tile onto the screen
                renderTile( tile );
            } 
        }

        // check result
        console.log( tileGridArray );
    }

    // draw the tiles
    function drawTileMap()
    {
        // wipe the canvas
        canvas.clearRect( 0 , 0 , canvasWidth , canvasHeight );

        // redraw the canvas
        // TODO: there may be a more efficient way to do this
        for( var y = 0; y < rows ; y++ )
        {
            for( var x = 0; x < cols ; x++ )
            {
                // find the tile at this coordinate
                var tile = tileGridArray[ y ][ x ];
                
                // draw the tile onto the screen
                renderTile( tile );
            } 
        }

        return;
    }


    // ----------------------------------------------------------------------
    // gameplay

    function addPoints()
    {
        currentScore++;
        updateHud();
    }

    function winGame()
    {

    }

    function loseGame()
    {
        setHud( "you lose" );
    }


    // ----------------------------------------------------------------------
    // mouse functions

    var mouseX = null;
    var mouseY = null;
    var canvasRect = canvasElement.getBoundingClientRect();

    function getMousePosition()
    {
        var mouseEvent = arguments[0];

        mouseX = mouseEvent.clientX - canvasRect.left;
        mouseY = mouseEvent.clientY - canvasRect.top;
            // console.log( "mouse is at: " + mouseX + "," + mouseY );

        return {
            'x' : mouseX,
            'y' : mouseY
        }
    }

    function processMouseClick()
    {
        var clickedTile = getTileAtCoordinates({
            x : mouseX,
            y : mouseY
        }); 

        // flip the tile
        clickedTile.flip();

        // redraw the screen
        drawTileMap();
    }

    function getTileAtCoordinates( data )
    {
        console.log( "tile is: " , data ); 

        // figure out the row and column my dividing the mouse position by the tile width, rounding to lowest tile
        // REMEMBER : rows and columns start at 0
        var column = Math.floor( data.x / tileWidth );
        var row = Math.floor( data.y / tileHeight );
            // console.log( "row is: " , row , "column is: " , column );
       
        // now just pull the tile from the array of tiles
        var selectedTile = tileGridArray[ row ][ column ];
            // console.log( "the tile is: " , selectedTile );

        return selectedTile;
    }

    // listen for mouse 
    canvasElement.addEventListener( 'mousemove' , getMousePosition );
    canvasElement.addEventListener( 'mousedown' , processMouseClick );

    // test the function
    generateTileMap();


    // ----------------------------------------------------------------------
    // hud functions
    
    function setHud( message )
    {
        hud.innerHTML = message;
    }

    function updateHud()
    {
        // game logic-based updating
        setHud( currentScore );
    }


})();

