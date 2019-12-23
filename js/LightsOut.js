// eslint-disable-next-line no-unused-vars
function main()
{
    const canvas = document.getElementById("LightsOutCanvas");
    
    const infoText = document.getElementById("LightsOutPuzzleInfo");
    const qpText   = document.getElementById("QuietPatternsInfo");
    const spText   = document.getElementById("SolutionPeriodInfo");

    const renderModeSelect = document.getElementById("rendermodesel");

    const gl = canvas.getContext("webgl2");
    if (!gl)
    {
        alert("Unable to initialize WebGL. Your browser or machine may not support it.");
        return;
    }

    canvas.onmousedown = function(e)
    {
        let x = e.pageX - canvas.offsetLeft;
        let y = e.pageY - canvas.offsetTop;

        clickAtPoint(x, y, e.ctrlKey);
    };

    document.onkeydown = function(e)
    {
        if(e.code == "ArrowLeft" || e.code == "ArrowRight" || e.code == "ArrowUp" || e.code == "ArrowDown")
        {
            e.preventDefault();
        }
    };

    document.onkeypress = function(e)
    {
        if(e.code == "ArrowLeft" || e.code == "ArrowRight" || e.code == "ArrowUp" || e.code == "ArrowDown")
        {
            e.preventDefault();
        }
    };

    document.onkeyup = function (e)
    {
        e.preventDefault();

        switch (e.code)
        {
        case "Equal": //Actually +
        {
            if(e.shiftKey)
            {
                changeDomainSize(currentDomainSize + 1);
            }
            else
            {
                incrementGameSize();
            }
            break;
        }
        case "Minus":
        {
            if(e.shiftKey)
            {
                changeDomainSize(currentDomainSize - 1);
            }
            else
            {
                decrementGameSize();
            }
            break;
        }
        case "Digit0":
        {
            resetGameBoard(resetModes.RESET_ZERO, currentGameSize, currentDomainSize);
            break;
        }
        case "Digit1":
        {
            resetGameBoard(resetModes.RESET_ONE, currentGameSize, currentDomainSize);
            break;
        }
        case "KeyO":
        {
            resetGameBoard(resetModes.RESET_BORDER, currentGameSize, currentDomainSize);
            break;
        }
        case "KeyB":
        {
            resetGameBoard(resetModes.RESET_BLATNOY, currentGameSize, currentDomainSize);
            break;
        }
        case "KeyP":
        {
            resetGameBoard(resetModes.RESET_PIETIA, currentGameSize, currentDomainSize);
            break;
        }
        case "KeyF":
        {
            resetGameBoard(resetModes.RESET_FULL_RANDOM, currentGameSize, currentDomainSize);
            break;
        }
        case "KeyR":
        {
            if(e.shiftKey)
            {
                enableDefaultClickRule();
            }
            else
            {
                resetGameBoard(resetModes.RESET_SOLVABLE_RANDOM, currentGameSize, currentDomainSize);
            }
            break;
        }
        case "KeyI":
        {
            if(e.shiftKey)
            {
                resetGameBoard(resetModes.RESET_DOMAIN_ROTATE_NONZERO, currentGameSize, currentDomainSize);
            }
            else
            {
                resetGameBoard(resetModes.RESET_INVERTO, currentGameSize, currentDomainSize);
            }
            break;
        }
        case "KeyE":
        {
            resetGameBoard(resetModes.RESET_SOLUTION, currentGameSize, currentDomainSize);
            break;
        }
        case "KeyQ":
        {
            updateSolutionMatrixIfNeeded();
            break;
        }
        case "ArrowLeft":
        {
            resetGameBoard(resetModes.RESET_LEFT, currentGameSize, currentDomainSize);
            break;
        }
        case "ArrowRight":
        {
            resetGameBoard(resetModes.RESET_RIGHT, currentGameSize, currentDomainSize);
            break;
        }
        case "ArrowUp":
        {
            resetGameBoard(resetModes.RESET_UP, currentGameSize, currentDomainSize);
            break;
        }
        case "ArrowDown":
        {
            resetGameBoard(resetModes.RESET_DOWN, currentGameSize, currentDomainSize);
            break;
        }
        case "KeyW":
        {
            showInverseSolution(!flagShowInverseSolution);
            break;
        }
        case "KeyT":
        {
            if(e.shiftKey)
            {
                enableDefaultToroidClickRule();
            }
            else
            {
                updateSolutionMatrixIfNeeded();
                showSolution(!flagShowSolution);
            }
            break;
        }
        case "KeyA":
        {
            if(e.shiftKey)
            {
                showLitStability(!flagShowLitStability && !flagShowStability);
            }
            else
            {
                showStability(!flagShowLitStability && !flagShowStability);
            }
            break;
        }
        case "KeyS":
        {
            if(currentTurnList.length == 0)
            {
                updateSolutionMatrixIfNeeded();
                currentGameSolution = calculateSolution();
                updateSolutionTexture();

                currentTurnList = buildTurnList(currentGameSolution, currentGameSize);

                flagRandomSolving = true;

                flagTickLoop = true;
                window.requestAnimationFrame(nextTick);
            }
            else
            {
                currentTurnList.length = 0;
                flagTickLoop = false;
            }

            break;
        }
        case "KeyC":
        {
            if(currentTurnList.length == 0)
            {
                updateSolutionMatrixIfNeeded();
                currentGameSolution = calculateSolution();
                updateSolutionTexture();

                currentTurnList = buildTurnList(currentGameSolution, currentGameSize);

                flagRandomSolving = false;

                flagTickLoop = true;
                window.requestAnimationFrame(nextTick);
            }
            else
            {
                currentTurnList.length = 0;
                flagTickLoop = false;
            }

            break;
        }
        case "KeyZ":
        {
            if(flagPeriodBackCounting /*|| flagPeriodCounting || flagPerio4Counting*/)
            {
                changeCountingMode(countingModes.COUNT_NONE, false);
            }
            else
            {
                changeCountingMode(countingModes.COUNT_INVERSE_SOLUTION_PERIOD, true);
            }
            break;
        } 
        default:
        {
            break;
        }
        }
    };

    renderModeSelect.onchange = function()
    {
        setRenderMode(renderModeSelect.value);
    };

    let boardGenModes =
    {
        BOARDGEN_FULL_RANDOM:  1, //Generate a random board
        BOARDGEN_ZERO_ELEMENT: 2, //Generate a fully unlit board
        BOARDGEN_ONE_ELEMENT:  3, //Generate a fully lit board
        BOARDGEN_BLATNOY:      4, //Generate a chessboard pattern board
        BOARDGEN_PIETIA_STYLE: 5, //Generate a checkers pattern board
        BOARDGEN_BORDER:       6  //Generate a border board
    };

    let resetModes =
    {
        RESET_ONE:                    1, //Fully lit board
        RESET_ZERO:                   2, //Fully unlit board
        RESET_BORDER:                 3, //Border board
        RESET_PIETIA:                 4, //Checkers board
        RESET_BLATNOY:                5, //Chessboard board
        RESET_SOLVABLE_RANDOM:        6, //Random board, always solvable
        RESET_FULL_RANDOM:            7, //Random board
        RESET_SOLUTION:               8, //Current board -> Current solution/Current stability
        RESET_INVERTO:                9, //Current board -> Inverted current board
        RESET_DOMAIN_ROTATE_NONZERO: 10, //Current board -> Nonzero domain rotated current board
        RESET_LEFT:                  11, //Current board -> Current board moved left
        RESET_RIGHT:                 12, //Current board -> Current board moved right
        RESET_UP:                    13, //Current board -> Current board moved up
        RESET_DOWN:                  14  //Current board -> Current board moved down
    };

    let workingModes =
    {
        LIT_BOARD:                  1,
        CONSTRUCT_CLICKRULE:        2,
        CONSTRUCT_CLICKRULE_TOROID: 3
    };

    let countingModes =
    {
        COUNT_NONE:                    1,
        COUNT_SOLUTION_PERIOD:         2,
        COUNT_INVERSE_SOLUTION_PERIOD: 3,
        COUNT_SOLUTION_PERIOD_4X:      4
    };

    const minimumBoardSize = 1;
    const maximumBoardSize = 256;

    const minimumDomainSize = 2;
    const maximumDomainSize = 255;

    const canvasSize = 900;

    let standardWidth  = canvas.clientWidth;
    let standardHeight = canvas.clientHeight;

    let flagSolutionMatrixComputing = false;
    let flagRandomSolving           = false;
    let flagShowSolution            = false;
    let flagShowInverseSolution     = false;
    let flagShowStability           = false;
    let flagShowLitStability        = false;
    //let flagPeriodCounting          = false; //TODO check
    //let flagEigvecCounting          = false; //TODO check
    //let flagPerio4Counting          = false; //TODO check
    let flagPeriodBackCounting      = false;
    let flagStopCountingWhenFound   = false;
    let flagToroidBoard             = false;
    let flagTickLoop                = false;
    let flagDefaultClickRule        = false;

    let currentGameClickRule    = null;
    let currentGameBoard        = null;
    let currentGameSolution     = null;
    let currentGameStability    = null;
    let currentGameLitStability = null;
    let currentCountedBoard     = null;

    let currentCellSize = 20;

    let currentClickRuleSize = 3;
    let currentGameSize      = 15;
    let currentDomainSize    = 2;

    let currentColorLit     = [0.0, 1.0, 0.0, 1.0];
    let currentColorUnlit   = [0.0, 0.0, 0.0, 1.0];
    let currentColorSolved  = [0.0, 0.0, 1.0, 1.0];
    let currentColorBetween = [0.0, 0.0, 0.0, 1.0];

    let currentWorkingMode  = workingModes.LIT_BOARD;

    let currentSolutionMatrix = [];

    let currentSolutionMatrixRelevant = false;

    let currentQuietPatterns = 0;

    let currentTurnList = [];

    //TODO check
    //let eigvecTurnX = -1;
    //let eigvecTurnY = -1;

    let currentPeriodCount = 0;

    let currentShaderProgram = null;

    let squaresShaderProgram   = null;
    let circlesShaderProgram   = null;
    let diamondsShaderProgram  = null;
    let beamsShaderProgram     = null;
    let raindropsShaderProgram = null;
    let chainsShaderProgram    = null;

    let boardTexture     = null;
    let solutionTexture  = null;
    let stabilityTexture = null;

    let boardTextureUniformLocation     = null;
    let solutionTextureUniformLocation  = null;
    let stabilityTextureUniformLocation = null;

    let boardSizeUniformLocation  = null;
    let cellSizeUniformLocation   = null;
    let domainSizeUniformLocation = null;
    let flagsUniformLocation      = null;

    let canvasWidthUniformLocation     = null;
    let canvasHeightUniformLocation    = null;
    let viewportXOffsetUniformLocation = null;
    let viewportYOffsetUniformLocation = null;

    let colorNoneUniformLocation    = null;
    let colorEnabledUniformLocation = null;
    let colorSolvedUniformLocation  = null;
    let colorBetweenUniformLocation = null;

    let drawVertexBuffer = null; //Still don't know about WebGL gl_VertexID support :/

    let drawVertexBufferAttribLocation = null;

    enableDefaultClickRule();

    createTextures();
    createShaders();

    setRenderMode("Squares");

    changeGameSize(15);
    updateViewport();

    //==========================================================================================================================================================================

    function incrementGameSize()
    {
        if(currentWorkingMode === workingModes.LIT_BOARD)
        {
            changeGameSize(currentGameSize + 1);
        }
        else
        {
            changeGameSize(currentGameSize + 2);
        }
    }

    function decrementGameSize()
    {
        if(currentWorkingMode === workingModes.LIT_BOARD)
        {
            changeGameSize(currentGameSize - 1);
        }
        else
        {
            changeGameSize(currentGameSize - 2);
        }
    }

    function changeGameSize(newSize)
    {
        showStability(false);
        showLitStability(false);
        showSolution(false);
        showInverseSolution(false);

        changeCountingMode(countingModes.COUNT_NONE, false);
        currentTurnList.length = 0;
        flagRandomSolving = false;

        //eigvecTurnX = -1;
        //eigvecTurnY = -1;

        currentGameSize = clamp(newSize, minimumBoardSize, maximumBoardSize);
        currentSolutionMatrixRelevant = false;
        flagSolutionMatrixComputing   = false;

        qpText.textContent = "Quiet patterns: ";

        if(currentWorkingMode === workingModes.LIT_BOARD)
        {
            resetGameBoard(resetModes.RESET_SOLVABLE_RANDOM, currentGameSize, currentDomainSize);
            infoText.textContent = "Lights Out " + currentGameSize + "x" + currentGameSize + " DOMAIN " + currentDomainSize;
        }
        else
        {
            currentGameBoard = generateNewBoard(currentGameSize, currentDomainSize, boardGenModes.BOARDGEN_ZERO_ELEMENT);

            resetStability();
            updateStabilityTexture();

            makeTurn(currentGameBoard, currentGameClickRule, currentClickRuleSize, currentGameSize, currentDomainSize, Math.floor(currentGameSize / 2), Math.floor(currentGameSize / 2), false);
            infoText.textContent = "Lights Out constructing " + currentGameSize + "x" + currentGameSize + " DOMAIN " + currentDomainSize;
        }

        currentCellSize = Math.ceil(canvasSize / currentGameSize) - 1;
        standardWidth  = currentGameSize * currentCellSize + 1;
        standardHeight = currentGameSize * currentCellSize + 1;

        updateBoardTexture();

        updateViewport();
        requestRedraw();
    }

    function changeDomainSize(newSize)
    {
        if(currentWorkingMode != workingModes.LIT_BOARD)
        {
            return;
        }

        showStability(false);
        showLitStability(false);
        showSolution(false);
        showInverseSolution(false);

        changeCountingMode(countingModes.COUNT_NONE, false);
        currentTurnList.length = 0;
        flagRandomSolving = false;

        //TODO
        //eigvecTurnX = -1;
        //eigvecTurnY = -1;

        currentDomainSize = clamp(newSize, minimumDomainSize, maximumDomainSize);
        currentSolutionMatrixRelevant = false;
        flagSolutionMatrixComputing   = false;

        resetGameBoard(resetModes.RESET_SOLVABLE_RANDOM, currentGameSize, currentDomainSize);
        enableDefaultClickRule();

        infoText.textContent = "Lights Out  " + currentGameSize + "x" + currentGameSize + " DOMAIN " + currentDomainSize;
        updateBoardTexture();
    }

    function clickAtPoint(x, y, isConstruct)
    {
        if(x > standardWidth || y > standardHeight)
        {
            return;
        }

        let stepX = Math.floor((standardWidth  + 1) / currentGameSize);
        let stepY = Math.floor((standardHeight + 1) / currentGameSize);

        let modX = Math.floor(x / stepX);
        let modY = Math.floor(y / stepY);

        if(currentWorkingMode === workingModes.LIT_BOARD)
        {
            if(isConstruct)
            {
                currentGameBoard = makeConstructTurn(currentGameBoard, currentGameSize, currentDomainSize, modX, modY);
            }
            else
            {
                currentGameBoard = makeTurn(currentGameBoard, currentGameClickRule, currentClickRuleSize, currentGameSize, currentDomainSize, modX, modY, flagToroidBoard);
            }
        }
        else if(currentWorkingMode === workingModes.CONSTRUCT_CLICKRULE || currentWorkingMode === workingModes.CONSTRUCT_CLICKRULE_TOROID)
        {
            currentGameBoard = makeConstructTurn(currentGameBoard, currentGameSize, currentDomainSize, modX, modY);
        }

        resetStability();

        if(flagShowSolution)
        {
            currentGameSolution = calculateSolution();
            updateSolutionTexture();
        }
        else if(flagShowInverseSolution)
        {
            currentGameSolution = calculateInverseSolution();
            updateSolutionTexture();
        }

        if(flagShowStability)
        {
            updateStabilityTexture();
        }
        else if(flagShowLitStability)
        {
            calculateLitStability();
            updateStabilityTexture();
        }

        updateBoardTexture();
        requestRedraw();
    }

    function enableDefaultClickRule()
    {   
        let clickRuleValues = [0, 1, 0, //eslint-disable-next-line indent
                               1, 1, 1, //eslint-disable-next-line indent
                               0, 1, 0];

        currentClickRuleSize = 3;
        currentGameClickRule = new Uint8Array(clickRuleValues);

        flagToroidBoard               = false;
        flagDefaultClickRule          = true;
        currentSolutionMatrixRelevant = false;
        flagSolutionMatrixComputing   = false;

        requestRedraw();
    }

    function enableDefaultToroidClickRule()
    {   
        let clickRuleValues = [0, 1, 0, // eslint-disable-next-line indent
                               1, 1, 1, // eslint-disable-next-line indent
                               0, 1, 0];

        currentClickRuleSize = 3;
        currentGameClickRule = new Uint8Array(clickRuleValues);

        flagToroidBoard               = true;
        flagDefaultClickRule          = true;
        currentSolutionMatrixRelevant = false;
        flagSolutionMatrixComputing   = false;

        requestRedraw();
    }

    function resetStability()
    {
        currentGameStability = new Uint8Array(currentGameSize * currentGameSize);
        currentGameStability.fill(currentDomainSize - 1);
    }

    function calculateGameMatrix(clickRule, gameSize, clickRuleSize, isToroid)
    {
        //Generate a normal Lights Out matrix for the click rule
        let lightsOutMatrix = [];
        for(let yL = 0; yL < gameSize; yL++)
        {
            for(let xL = 0; xL < gameSize; xL++)
            {
                let matrixRow;
                if(isToroid)
                {
                    matrixRow = populateClickRuleToroid(clickRule, clickRuleSize, gameSize, xL, yL);
                }
                else
                {
                    matrixRow = populateClickRulePlane(clickRule, clickRuleSize, gameSize, xL, yL);
                }

                lightsOutMatrix.push(matrixRow);
            }
        }

        return lightsOutMatrix;
    }

    function calculateSolutionMatrix(clickRule, gameSize, domainSize, clickRuleSize, isToroid)
    {
        let lightsOutMatrix = calculateGameMatrix(clickRule, gameSize, clickRuleSize, isToroid);

        //Generate a unit matrix. This will eventually become an inverse matrix
        let invMatrix = [];
        for(let yI = 0; yI < currentGameSize; yI++)
        {
            for(let xI = 0; xI < currentGameSize; xI++)
            {
                if(!flagSolutionMatrixComputing)
                {
                    return {invmatrix: null, quietpats: null};
                }

                let invMatrixRow = new Uint8Array(gameSize * gameSize);
                invMatrixRow.fill(0);

                let cellIndex = cellIndexFromPoint(gameSize, xI, yI);
                invMatrixRow[cellIndex] = 1;

                invMatrix.push(invMatrixRow);
            }
        }

        let domainInvs = []; //For optimization, cache 1/k numbers in the domain
        for(let d = 0; d < domainSize; d++)
        {
            domainInvs.push(invModGcdEx(d, domainSize));
        }
        
        let matrixSize = gameSize * gameSize;
        for(let iD = 0; iD < matrixSize; iD++)
        {
            if(!flagSolutionMatrixComputing)
            {
                return {invmatrix: null, quietpats: null};
            }

            let thisValD = lightsOutMatrix[iD][iD];
            let compValD = lightsOutMatrix[iD][iD];
            if(domainInvs[compValD] === 0 || (thisValD !== 1 && domainSize % thisValD === 0))
            {
                for(let jSw = iD + 1; jSw < matrixSize; jSw++)
                {
                    if(!flagSolutionMatrixComputing)
                    {
                        return {invmatrix: null, quietpats: null};
                    }

                    compValD = lightsOutMatrix[jSw][iD];
                    if(domainInvs[compValD] !== 0)
                    {
                        thisValD = compValD;
                        
                        let tmpMatrixRow     = lightsOutMatrix[iD];
                        lightsOutMatrix[iD]  = lightsOutMatrix[jSw];
                        lightsOutMatrix[jSw] = tmpMatrixRow;

                        let tmpInvMatrixRow = invMatrix[iD];
                        invMatrix[iD]       = invMatrix[jSw];
                        invMatrix[jSw]      = tmpInvMatrixRow;

                        break;
                    }
                }
            }

            let invThisValD = domainInvs[thisValD];
            for(let jD = iD + 1; jD < matrixSize; jD++)
            {
                if(!flagSolutionMatrixComputing)
                {
                    return {invmatrix: null, quietpats: null};
                }

                compValD = lightsOutMatrix[jD][iD];
                if(domainInvs[compValD] !== 0)
                {
                    lightsOutMatrix[jD] = mulSubBoard(lightsOutMatrix[jD], lightsOutMatrix[iD], invThisValD * compValD, domainSize);
                    invMatrix[jD]       = mulSubBoard(invMatrix[jD],       invMatrix[iD],       invThisValD * compValD, domainSize);
                }
            }
        }

        let quietPatterns = 0;
        for(let iU = matrixSize - 1; iU >= 0; iU--)
        {
            let thisValU    = lightsOutMatrix[iU][iU];
            let invThisValU = domainInvs[thisValU];

            for(let jU = iU - 1; jU >= 0; jU--)
            {
                if(!flagSolutionMatrixComputing)
                {
                    return {invmatrix: null, quietpats: null};
                }

                let compValU = lightsOutMatrix[jU][iU];
                if(domainInvs[compValU] !== 0)
                {
                    lightsOutMatrix[jU] = mulSubBoard(lightsOutMatrix[jU], lightsOutMatrix[iU], invThisValU * compValU, domainSize);
                    invMatrix[jU]       = mulSubBoard(invMatrix[jU],       invMatrix[iU],       invThisValU * compValU, domainSize);
                }
            }

            if(domainInvs[thisValU] !== 0)
            {
                lightsOutMatrix[iU] = mulBoard(lightsOutMatrix[iU], invThisValU, domainSize);
                invMatrix[iU]       = mulBoard(invMatrix[iU],       invThisValU, domainSize);
            }

            if(lightsOutMatrix[iU].every(val => val === 0))
            {
                quietPatterns += 1;
            }
        }

        for(let i = 0; i < matrixSize; i++) //Transpose for the case of non-symmetrical click rules
        {
            for(let j = 0; j < i; j++)
            {
                if(!flagSolutionMatrixComputing)
                {
                    return {invmatrix: null, quietpats: null};
                }

                let temp        = invMatrix[i][j];
                invMatrix[i][j] = invMatrix[j][i];
                invMatrix[j][i] = temp;
            }
        }

        return {invmatrix: invMatrix, quietpats: quietPatterns};
    }

    function calculateSolution()
    {
        let solution = new Uint8Array(currentGameSize * currentGameSize);

        for(let y = 0; y < currentGameSize; y++)
        {
            for (let x = 0; x < currentGameSize; x++)
            {
                let cellIndex = cellIndexFromPoint(currentGameSize, x, y);
                let matrixRow = currentSolutionMatrix[cellIndex];

                solution[cellIndex] = dotProductBoard(currentGameBoard, matrixRow, currentDomainSize);
            }
        }

        solution = domainInverseBoard(solution, currentDomainSize);
        return solution;
    }

    function calculateInverseSolution() //Operates on currentGameBoard
    {
        let invSolution = new Uint8Array(currentGameSize * currentGameSize);
        invSolution.fill(0);

        let turns = buildTurnList(currentGameBoard, currentGameSize);
        if(flagDefaultClickRule)
        {
            invSolution = makeTurnsDefault(invSolution, currentGameSize, currentDomainSize, turns, flagToroidBoard);
        }
        else
        {
            invSolution = makeTurns(invSolution, currentGameClickRule, currentClickRuleSize, currentGameSize, currentDomainSize, turns, flagToroidBoard);
        }

        return invSolution;
    }

    async function updateSolutionMatrixIfNeeded()
    {
        if(!currentSolutionMatrixRelevant)
        {
            flagSolutionMatrixComputing = true;

            let solutionMatrixRes = calculateSolutionMatrix(currentGameClickRule, currentGameSize, currentDomainSize, currentClickRuleSize, flagToroidBoard);
            currentSolutionMatrix = solutionMatrixRes.invmatrix;
            currentQuietPatterns  = solutionMatrixRes.quietpats;

            qpText.textContent = "Quiet patterns: " + currentQuietPatterns;

            currentSolutionMatrixRelevant = true;
            flagSolutionMatrixComputing   = false;
        }
    }

    function calculateNewStabilityValue(boardToCompare)
    {
        return incDifBoard(currentGameStability, currentGameBoard, boardToCompare, currentDomainSize);
    }

    function calculateLitStability()
    {
        return mulComponentWiseBoard(currentGameStability, currentGameBoard, currentDomainSize);
    }

    function resetGameBoard(resetMode)
    {
        currentTurnList.length = 0;
        flagRandomSolving = false;

        if(resetMode === resetModes.RESET_LEFT || resetMode === resetModes.RESET_RIGHT || resetMode === resetModes.RESET_UP || resetMode === resetModes.RESET_DOWN)
        {
            showStability(false);
            showLitStability(false);

            switch(resetMode)
            {
            case resetModes.RESET_LEFT:
            {
                currentGameBoard = moveBoardLeft(currentGameBoard, currentGameSize);
                break;
            }
            case resetModes.RESET_RIGHT:
            {
                currentGameBoard = moveBoardRight(currentGameBoard, currentGameSize);
                break;
            }
            case resetModes.RESET_UP:
            {
                currentGameBoard = moveBoardUp(currentGameBoard, currentGameSize);
                break;
            }
            case resetModes.RESET_DOWN:
            {
                currentGameBoard = moveBoardDown(currentGameBoard, currentGameSize);
                break;
            }
            default:
            {
                break;
            }
            }

            resetStability();
            updateStabilityTexture();

            if(flagShowSolution)
            {
                currentGameSolution = calculateSolution();
                updateSolutionTexture();
            }
            else if(flagShowInverseSolution)
            {
                currentGameSolution = calculateInverseSolution();
                updateSolutionTexture();
            }
        }
        else if(resetMode === resetModes.RESET_SOLUTION)
        {
            if(currentWorkingMode !== workingModes.LIT_BOARD)
            {
                return;
            }

            if(flagShowSolution || flagShowInverseSolution)
            {
                currentGameStability = calculateNewStabilityValue(currentGameSolution);
                currentGameBoard = currentGameSolution;

                if(flagShowLitStability)
                {
                    currentGameLitStability = calculateLitStability();
                    updateStabilityTexture();
                }
                else if(flagShowStability)
                {
                    updateStabilityTexture();
                }

                showSolution(false);
                showInverseSolution(false);
            }
            else if(flagShowStability)
            {
                currentGameBoard = currentGameStability;

                showStability(false);
                resetStability();

                updateStabilityTexture();
            }
            else if(flagShowLitStability)
            {
                currentGameBoard = currentGameLitStability;

                showLitStability(false);
                resetStability();

                updateStabilityTexture();
            }
        }
        else if(resetMode === resetModes.RESET_INVERTO || resetMode === resetModes.RESET_DOMAIN_ROTATE_NONZERO)
        {
            showStability(false);
            showLitStability(false);

            switch(resetMode)
            {
            case resetModes.RESET_INVERTO:
            {
                currentGameBoard = inverseBoard(currentGameBoard, currentDomainSize);
                break;
            }
            case resetModes.RESET_DOMAIN_ROTATE_NONZERO:
            {
                currentGameBoard = domainRotateNonZeroBoard(currentGameBoard, currentDomainSize);
                break;
            }
            default:
            {
                break;
            }
            }

            resetStability();
            updateStabilityTexture();

            if(flagShowSolution)
            {
                currentGameSolution = calculateSolution();
                updateSolutionTexture();
            }
            else if(flagShowInverseSolution)
            {
                currentGameSolution = calculateInverseSolution();
                updateSolutionTexture();
            }
        }
        else if(resetMode === resetModes.RESET_SOLVABLE_RANDOM)
        {
            if(currentWorkingMode !== workingModes.LIT_BOARD)
            {
                return;
            }

            showStability(false);
            showLitStability(false);
            showSolution(false);
            showInverseSolution(false);

            currentGameBoard = generateNewBoard(currentGameSize, currentDomainSize, boardGenModes.BOARDGEN_FULL_RANDOM);
            currentGameBoard = calculateInverseSolution();

            resetStability();
            updateStabilityTexture();
        }
        else
        {
            showStability(false);
            showLitStability(false);
            showSolution(false);
            showInverseSolution(false);

            let modeBgen = boardGenModes.BOARDGEN_ONE_ELEMENT;
            switch(resetMode)
            {
            case resetModes.RESET_ONE:
            {
                modeBgen = boardGenModes.BOARDGEN_ONE_ELEMENT;
                break;
            }
            case resetModes.RESET_ZERO:
            {
                modeBgen = boardGenModes.BOARDGEN_ZERO_ELEMENT; 
                break;
            }
            case resetModes.RESET_BORDER:
            {
                modeBgen = boardGenModes.BOARDGEN_BORDER;
                break;
            }
            case resetModes.RESET_PIETIA:
            {
                modeBgen = boardGenModes.BOARDGEN_PIETIA_STYLE;
                break;
            }
            case resetModes.RESET_BLATNOY:
            {
                modeBgen = boardGenModes.BOARDGEN_BLATNOY;
                break;
            }
            case resetModes.RESET_FULL_RANDOM:
            {
                modeBgen = boardGenModes.BOARDGEN_FULL_RANDOM;
                break;
            }
            default:
            {
                break;    
            }
            }

            currentGameBoard = generateNewBoard(currentGameSize, currentDomainSize, modeBgen);

            resetStability();
            updateStabilityTexture();
        }

        updateBoardTexture();
        requestRedraw();
    }

    function generateNewBoard(gameSize, domainSize, bgenMode)
    {
        let generatedBoard = new Uint8Array(gameSize * gameSize);

        let minVal = 0;
        let maxVal = domainSize - 1;

        for(let y = 0; y < gameSize; y++) 
        {
            for(let x = 0; x < gameSize; x++)
            {
                let cellNumber = y * gameSize + x;

                switch (bgenMode)
                {
                case boardGenModes.BOARDGEN_FULL_RANDOM:
                {
                    let randomCellValue = minVal + Math.floor(Math.random() * (maxVal - minVal + 1));
                    generatedBoard[cellNumber] = randomCellValue;
                    break;
                }
                case boardGenModes.BOARDGEN_ZERO_ELEMENT:
                {
                    generatedBoard[cellNumber] = minVal;
                    break;
                }
                case boardGenModes.BOARDGEN_ONE_ELEMENT:
                {
                    generatedBoard[cellNumber] = maxVal;
                    break;
                }
                case boardGenModes.BOARDGEN_BLATNOY:
                {
                    if(x % 2 === y % 2)
                    {
                        generatedBoard[cellNumber] = minVal;
                    }
                    else
                    {
                        generatedBoard[cellNumber] = maxVal;
                    }
                    break;
                }
                case boardGenModes.BOARDGEN_PIETIA_STYLE:
                {
                    if(y % 2 !== 0)
                    {
                        if(x % 2 === 0)
                        {
                            generatedBoard[cellNumber] = maxVal;
                        }
                        else
                        {
                            generatedBoard[cellNumber] = minVal;
                        }
                    }
                    else
                    {
                        generatedBoard[cellNumber] = minVal;
                    }
                    break;
                }
                case boardGenModes.BOARDGEN_BORDER:
                {
                    if(y === 0 || y === (gameSize - 1) || x === 0 || x === (gameSize - 1))
                    {
                        generatedBoard[cellNumber] = maxVal;
                    }
                    else
                    {
                        generatedBoard[cellNumber] = minVal;
                    }
                    break;
                }
                }
            }
        }

        return generatedBoard;
    }

    function changeCountingMode(newCountingMode, stopWhenReturned)
    {
        if(currentWorkingMode !== workingModes.LIT_BOARD)
        {
            return;
        }

        //flagPeriodCounting     = false;
        flagPeriodBackCounting = false;
        //flagPerio4Counting     = false;

        showSolution(false);
        showInverseSolution(false);

        currentTurnList.length = 0;
        flagRandomSolving = false;

        switch(newCountingMode)
        {
        case countingModes.COUNT_NONE:
        {
            if(currentPeriodCount !== 0 && flagStopCountingWhenFound)
            {
                spText.textContent = "Solution period so far is " + currentPeriodCount;
            }
            break;
        }
        case countingModes.COUNT_SOLUTION_PERIOD:
        {
            //flagPeriodCounting = true;
            break;
        }
        case countingModes.COUNT_SOLUTION_PERIOD_4X:
        {
            //flagPerio4Counting = true;
            break;
        }
        case countingModes.COUNT_INVERSE_SOLUTION_PERIOD:
        {
            flagPeriodBackCounting = true;
            break;
        }
        }

        flagStopCountingWhenFound = stopWhenReturned;

        if(flagPeriodBackCounting /*|| flagPeriodCounting || flagPerio4Counting*/)
        {
            currentPeriodCount = 0;
            currentCountedBoard = currentGameBoard.slice();

            flagTickLoop = true;
            window.requestAnimationFrame(nextTick);
        }
    }

    function buildTurnList(board, gameSize)
    {
        let turnList = [];

        for(let y = 0; y < gameSize; y++)
        {
            for(let x = 0; x < gameSize; x++)
            {
                let cellIndex = cellIndexFromPoint(gameSize, x, y);
                for(let i = 0; i < board[cellIndex]; i++)
                {
                    turnList.push({cellX: x, cellY: y});
                }
            }
        }

        return turnList.reverse(); //Turn lists are oriented bottom-up
    }

    function makeTurn(board, clickRule, clickRuleSize, gameSize, domainSize, cellX, cellY, isToroid)
    {
        if(isToroid)
        {
            let populatedClickRuleT = populateClickRuleToroid(clickRule, clickRuleSize, gameSize, cellX, cellY);
            return addBoard(board, populatedClickRuleT, domainSize);
        }
        else
        {
            let populatedClickRuleP = populateClickRulePlane(clickRule, clickRuleSize, gameSize, cellX, cellY);
            return addBoard(board, populatedClickRuleP, domainSize);
        }
    }

    function makeConstructTurn(board, gameSize, domainSize, cellX, cellY)
    {
        let resBoard = new Uint8Array(board);

        let cellIndex = cellIndexFromPoint(gameSize, cellX, cellY);
        resBoard[cellIndex] = (board[cellIndex] + 1) % domainSize;

        return resBoard;
    }

    function makeTurns(board, clickRule, clickRuleSize, gameSize, domainSize, turns, isToroid) //Fast in-place version without populating click rules
    {
        let newBoard = board.slice();

        let clickSizeHalf = Math.floor(clickRuleSize / 2);
        for(let t = 0; t < turns.length; t++)
        {
            let left = turns[t].cellX - clickSizeHalf;
            let top  = turns[t].cellY - clickSizeHalf;

            for(let y = 0; y < clickRuleSize; y++)
            {
                let yBig = y + top;
                if(!isToroid)
                {
                    if(yBig < 0 || yBig >= gameSize)
                    {
                        continue;
                    }
                }
                else
                {
                    yBig = wholeMod(yBig, gameSize);
                }

                for(let x = 0; x < clickRuleSize; x++)
                {
                    let xBig = x + left;
                    if(!isToroid)
                    {
                        if(xBig < 0 || xBig >= gameSize)
                        {
                            continue;
                        }
                    }
                    else
                    {
                        xBig = wholeMod(xBig, gameSize);
                    }

                    let bigClickIndex = cellIndexFromPoint(gameSize, xBig, yBig);
                    let smlClickIndex = cellIndexFromPoint(clickRuleSize, x, y);

                    newBoard[bigClickIndex] = (newBoard[bigClickIndex] + clickRule[smlClickIndex]) % domainSize;
                }
            }
        }

        return newBoard;
    }

    function makeTurnsDefault(board, gameSize, domainSize, turns, isToroid) //Fast in-place version without populating click rules. Default click rule version
    {
        let newBoard = board.slice();

        if(isToroid)
        {
            for(let t = 0; t < turns.length; t++)
            {
                let turn = turns[t];

                let leftX   = wholeMod(turn.cellX - 1, gameSize);
                let rightX  = wholeMod(turn.cellX + 1, gameSize);
                let topY    = wholeMod(turn.cellY - 1, gameSize);
                let bottomY = wholeMod(turn.cellY + 1, gameSize);

                let thisCellIndex   = cellIndexFromPoint(gameSize, turn.cellX, turn.cellY);
                let leftCellIndex   = cellIndexFromPoint(gameSize,      leftX, turn.cellY);
                let rightCellIndex  = cellIndexFromPoint(gameSize,     rightX, turn.cellY);
                let topCellIndex    = cellIndexFromPoint(gameSize, turn.cellX,       topY);
                let bottomCellIndex = cellIndexFromPoint(gameSize, turn.cellX,    bottomY);

                newBoard[thisCellIndex]   = (newBoard[thisCellIndex]   + 1) % domainSize;
                newBoard[leftCellIndex]   = (newBoard[leftCellIndex]   + 1) % domainSize;
                newBoard[rightCellIndex]  = (newBoard[rightCellIndex]  + 1) % domainSize;
                newBoard[topCellIndex]    = (newBoard[topCellIndex]    + 1) % domainSize;
                newBoard[bottomCellIndex] = (newBoard[bottomCellIndex] + 1) % domainSize;
            }
        }
        else
        {
            for(let t = 0; t < turns.length; t++)
            {
                let turn = turns[t];

                let thisCellIndex       = cellIndexFromPoint(gameSize, turn.cellX, turn.cellY);
                newBoard[thisCellIndex] = (newBoard[thisCellIndex] + 1) % domainSize;

                if(turn.cellX > 0)
                {
                    let leftCellIndex       = cellIndexFromPoint(gameSize, turn.cellX - 1, turn.cellY);
                    newBoard[leftCellIndex] = (newBoard[leftCellIndex] + 1) % domainSize;
                }

                if(turn.cellX < gameSize - 1)
                {
                    let rightCellIndex       = cellIndexFromPoint(gameSize, turn.cellX + 1, turn.cellY);
                    newBoard[rightCellIndex] = (newBoard[rightCellIndex] + 1) % domainSize;
                }

                if(turn.cellY > 0)
                {
                    let topCellIndex       = cellIndexFromPoint(gameSize, turn.cellX, turn.cellY - 1);
                    newBoard[topCellIndex] = (newBoard[topCellIndex] + 1) % domainSize;
                }

                if(turn.cellY < gameSize - 1)
                {
                    let bottomCellIndex       = cellIndexFromPoint(gameSize, turn.cellX, turn.cellY + 1);
                    newBoard[bottomCellIndex] = (newBoard[bottomCellIndex] + 1) % domainSize;
                }
            }
        }

        return newBoard;
    }

    function populateClickRulePlane(clickRule, clickRuleSize, gameSize, cellX, cellY)
    {
        let populatedClickRule = new Uint8Array(gameSize * gameSize);
        populatedClickRule.fill(0);

        let clickSizeHalf = Math.floor(clickRuleSize / 2);

        let left = cellX - clickSizeHalf;
        let top  = cellY - clickSizeHalf;
        
        for(let y = 0; y < clickRuleSize; y++)
        {
            let yBig = y + top;
            if(yBig < 0 || yBig >= gameSize)
            {
                continue;
            }

            for(let x = 0; x < clickRuleSize; x++)
            {
                let xBig = x + left;
                if(xBig < 0 || xBig >= gameSize)
                {
                    continue;
                }

                let bigClickIndex = cellIndexFromPoint(gameSize, xBig, yBig);
                let smlClickIndex = cellIndexFromPoint(clickRuleSize, x, y);

                populatedClickRule[bigClickIndex] = clickRule[smlClickIndex];
            }
        }

        return populatedClickRule;
    }

    function populateClickRuleToroid(clickRule, clickRuleSize, gameSize, cellX, cellY)
    {
        let populatedClickRule = new Uint8Array(gameSize * gameSize);
        populatedClickRule.fill(0);

        let clickSizeHalf = Math.floor(clickRuleSize / 2);

        let left = cellX - clickSizeHalf;
        let top  = cellY - clickSizeHalf;
        
        for(let y = 0; y < clickRuleSize; y++)
        {
            let yBig    = y + top;
            let yBigMod = wholeMod(yBig, gameSize);

            for(let x = 0; x < clickRuleSize; x++)
            {
                let xBig    = x + left;
                let xBigMod = wholeMod(xBig, gameSize); 

                let bigClickIndex = cellIndexFromPoint(gameSize, xBigMod, yBigMod);
                let smlClickIndex = cellIndexFromPoint(clickRuleSize, x, y);

                populatedClickRule[bigClickIndex] = clickRule[smlClickIndex];
            }
        }

        return populatedClickRule;
    }

    function moveBoardLeft(board, gameSize)
    {
        let resBoard = new Uint8Array(board.length);
        for(let y = 0; y < gameSize; y++)
        {
            for (let x = 0; x < gameSize; x++)
            {
                let leftX = wholeMod(x - 1, gameSize);

                let cellIndex     = cellIndexFromPoint(gameSize, x,     y);
                let cellIndexLeft = cellIndexFromPoint(gameSize, leftX, y);

                resBoard[cellIndexLeft] = board[cellIndex];
            }
        }
        
        return resBoard;
    }

    function moveBoardRight(board, gameSize)
    {
        let resBoard = new Uint8Array(board.length);
        for(let y = 0; y < gameSize; y++)
        {
            for (let x = 0; x < gameSize; x++)
            {
                let rightX = wholeMod(x + 1, gameSize);

                let cellIndex      = cellIndexFromPoint(gameSize, x,      y);
                let cellIndexRight = cellIndexFromPoint(gameSize, rightX, y);

                resBoard[cellIndexRight] = board[cellIndex];
            }
        }
        
        return resBoard;
    }

    function moveBoardUp(board, gameSize)
    {
        let resBoard = new Uint8Array(board.length);
        for(let y = 0; y < gameSize; y++)
        {
            for (let x = 0; x < gameSize; x++)
            {
                let upY = wholeMod(y - 1, gameSize);

                let cellIndex   = cellIndexFromPoint(gameSize, x, y  );
                let cellIndexUp = cellIndexFromPoint(gameSize, x, upY);

                resBoard[cellIndexUp] = board[cellIndex];
            }
        }
        
        return resBoard;
    }

    function moveBoardDown(board, gameSize)
    {
        let resBoard = new Uint8Array(board.length);
        for(let y = 0; y < gameSize; y++)
        {
            for (let x = 0; x < gameSize; x++)
            {
                let downY = wholeMod(y + 1, gameSize);

                let cellIndex     = cellIndexFromPoint(gameSize, x, y    );
                let cellIndexDown = cellIndexFromPoint(gameSize, x, downY);

                resBoard[cellIndexDown] = board[cellIndex];
            }
        }
        
        return resBoard;
    }

    function inverseBoard(board, domainSize)
    {
        let resBoard = new Uint8Array(board.length);
        for(let i = 0; i < board.length; i++)
        {
            resBoard[i] = (board[i] + 1) % domainSize;
        }

        return resBoard;
    }

    function domainInverseBoard(board, domainSize)
    {
        if(domainSize === 2)
        {
            return board;
        }

        let resBoard = new Uint8Array(board.length);
        for(let i = 0; i < board.length; i++)
        {
            resBoard[i] = (domainSize - board[i]) % domainSize;
        }

        return resBoard;
    }

    function domainRotateNonZeroBoard(board, domainSize)
    {
        if(domainSize === 2)
        {
            return board;
        }

        let resBoard = new Uint8Array(board.length);
        for(let i = 0; i < board.length; i++)
        {
            if(board[i] != 0)
            {
                resBoard[i] = board[i] % (domainSize - 1) + 1;
            }
        }

        return resBoard;
    }

    function addBoard(boardLeft, boardRight, domainSize)
    {
        if(boardLeft.length !== boardRight.length)
        {
            return boardLeft;
        }

        let resBoard = new Uint8Array(boardLeft.length);
        for(let i = 0; i < boardLeft.length; i++)
        {
            resBoard[i] = (boardLeft[i] + boardRight[i]) % domainSize;
        }

        return resBoard;
    }

    function mulBoard(board, mulValue, domainSize)
    {
        if(board.length !== board.length || mulValue === 0)
        {
            return board;
        }

        let resBoard = new Uint8Array(board.length);
        for(let i = 0; i < board.length; i++)
        {
            resBoard[i] = (board[i] * mulValue) % domainSize;
        }

        return resBoard;
    }

    function mulComponentWiseBoard(boardLeft, boardRight, domainSize)
    {
        if(boardLeft.length !== boardRight.length)
        {
            return boardLeft;
        }

        let resBoard = new Uint8Array(boardLeft.length);
        for(let i = 0; i < boardLeft.length; i++)
        {
            resBoard[i] = (boardLeft[i] * boardRight[i]) % domainSize;
        }

        return resBoard;
    }

    function mulSubBoard(boardLeft, boardRight, mulValue, domainSize)
    {
        if(boardLeft.length !== boardRight.length || mulValue === 0)
        {
            return boardLeft;
        }

        let resBoard = new Uint8Array(boardLeft.length);
        for(let i = 0; i < resBoard.length; i++)
        {
            resBoard[i] = wholeMod(boardLeft[i] - mulValue * boardRight[i], domainSize);
        }

        return resBoard;
    }

    function incDifBoard(board, boardCompLeft, boardCompRight, domainSize)
    {
        if(boardCompLeft.length !== boardCompRight.length || board.length !== boardCompLeft.length)
        {
            return board;
        }

        let resBoard = new Uint8Array(board.length);
        for(let i = 0; i < board.length; i++)
        {
            if(boardCompLeft[i] === boardCompRight[i])
            {
                resBoard[i] = (board[i] * (domainSize - 1)) % domainSize; //Only works in domain 2, of course
            }
            else
            {
                resBoard[i] = 0;
            }
        }

        return resBoard;
    }

    function dotProductBoard(boardLeft, boardRight, domainSize)
    {
        if(boardLeft.length !== boardRight.length)
        {
            return 0;
        }

        let sum = 0;
        for(let i = 0; i < boardLeft.length; i++)
        {
            sum += boardLeft[i] * boardRight[i];
        }

        return sum % domainSize;
    }

    function equalsBoard(boardLeft, boardRight)
    {
        if(boardLeft.length !== boardRight.length)
        {
            return false;
        }

        for(let i = 0; i < boardLeft.length; i++)
        {
            if(boardLeft[i] !== boardRight[i])
            {
                return false;
            }
        }

        return true;
    }

    function showSolution(showFlag)
    {
        if(currentWorkingMode !== workingModes.LIT_BOARD)
        {
            flagShowSolution        = false;
            flagShowInverseSolution = false;
            return;
        }

        currentTurnList.length = 0;
        flagRandomSolving = false;

        flagShowInverseSolution = false;
        if(showFlag)
        {
            flagShowSolution = true;

            currentGameSolution = calculateSolution();
            updateSolutionTexture();
        }
        else
        {
            flagShowSolution = false;
        }

        requestRedraw();
    }

    function showInverseSolution(showFlag)
    {
        if(currentWorkingMode !== workingModes.LIT_BOARD)
        {
            flagShowSolution        = false;
            flagShowInverseSolution = false;
            return;
        }

        currentTurnList.length = 0;
        flagRandomSolving = false;

        flagShowSolution = false;
        if(showFlag)
        {
            flagShowInverseSolution = true;

            currentGameSolution = calculateInverseSolution();
            updateSolutionTexture();
        }
        else
        {
            flagShowInverseSolution = false;
        }

        requestRedraw();
    }

    function showStability(showFlag)
    {
        if(currentWorkingMode !== workingModes.LIT_BOARD || currentDomainSize > 2)
        {
            flagShowStability    = false;
            flagShowLitStability = false;
            return;
        }

        currentTurnList.length = 0;
        flagRandomSolving = false;

        flagShowLitStability = false;
        if(showFlag)
        {
            flagShowStability = true;
            showSolution(false);

            updateStabilityTexture();
        }
        else
        {
            flagShowStability = false;
        }

        requestRedraw();
    }

    function showLitStability(showFlag)
    {
        if(currentWorkingMode !== workingModes.LIT_BOARD || currentDomainSize > 2)
        {
            flagShowStability    = false;
            flagShowLitStability = false;
            return;
        }

        currentTurnList.length = 0;
        flagRandomSolving = false;

        flagShowStability = false;
        if(showFlag)
        {
            flagShowLitStability = true;
            showSolution(false);

            currentGameLitStability = calculateLitStability();
            updateStabilityTexture();
        }
        else
        {
            flagShowLitStability = false;
        }

        requestRedraw();
    }

    function setRenderMode(renderMode)
    {
        switch(renderMode)
        {
        case "Squares":
        {
            currentShaderProgram = squaresShaderProgram;
            break;
        }
        case "Circles":
        {
            currentShaderProgram = circlesShaderProgram;
            break;
        }
        case "Diamonds":
        {
            currentShaderProgram = diamondsShaderProgram;
            break;
        }
        case "BEAMS":
        {
            currentShaderProgram = beamsShaderProgram;
            break;
        }
        case "Raindrops":
        {
            currentShaderProgram = raindropsShaderProgram;
            break;
        }
        case "Chains":
        {
            currentShaderProgram = chainsShaderProgram;
            break;
        }
        default:
        {
            currentShaderProgram = squaresShaderProgram;
            break;
        }
        }

        boardSizeUniformLocation  = gl.getUniformLocation(currentShaderProgram, "gBoardSize");
        cellSizeUniformLocation   = gl.getUniformLocation(currentShaderProgram, "gCellSize");
        domainSizeUniformLocation = gl.getUniformLocation(currentShaderProgram, "gDomainSize");
        flagsUniformLocation      = gl.getUniformLocation(currentShaderProgram, "gFlags");

        canvasWidthUniformLocation     = gl.getUniformLocation(currentShaderProgram, "gImageWidth");
        canvasHeightUniformLocation    = gl.getUniformLocation(currentShaderProgram, "gImageHeight");
        viewportXOffsetUniformLocation = gl.getUniformLocation(currentShaderProgram, "gViewportOffsetX");
        viewportYOffsetUniformLocation = gl.getUniformLocation(currentShaderProgram, "gViewportOffsetY");

        colorNoneUniformLocation    = gl.getUniformLocation(currentShaderProgram, "gColorNone");
        colorEnabledUniformLocation = gl.getUniformLocation(currentShaderProgram, "gColorEnabled");
        colorSolvedUniformLocation  = gl.getUniformLocation(currentShaderProgram, "gColorSolved");
        colorBetweenUniformLocation = gl.getUniformLocation(currentShaderProgram, "gColorBetween");

        boardTextureUniformLocation     = gl.getUniformLocation(currentShaderProgram, "gBoard");
        solutionTextureUniformLocation  = gl.getUniformLocation(currentShaderProgram, "gSolution");
        stabilityTextureUniformLocation = gl.getUniformLocation(currentShaderProgram, "gStability");
               
        drawVertexBufferAttribLocation = gl.getAttribLocation(currentShaderProgram, "vScreenPos");

        const posArray = new Float32Array([-1.0,  1.0, 0.0, 1.0, // eslint-disable-next-line indent
                                            1.0,  1.0, 0.0, 1.0, // eslint-disable-next-line indent
                                           -1.0, -1.0, 0.0, 1.0, // eslint-disable-next-line indent
                                            1.0, -1.0, 0.0, 1.0]);

        let posBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, posArray, gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        drawVertexBuffer = gl.createVertexArray();
        gl.bindVertexArray(drawVertexBuffer);
        gl.enableVertexAttribArray(drawVertexBufferAttribLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
        gl.vertexAttribPointer(drawVertexBufferAttribLocation, 4, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        gl.bindVertexArray(null);

        requestRedraw();
    }

    function updateViewport()
    {
        gl.viewport(0, canvas.clientHeight - standardHeight, standardWidth, standardHeight); //Very careful here. 
    }

    function nextTick()
    {
        if(currentTurnList.length !== 0)
        {
            let turn = (-1, -1);
            if(flagRandomSolving)
            {
                let randomIndex = Math.floor(Math.random() * currentTurnList.length);

                turn                                        = currentTurnList[randomIndex];
                currentTurnList[randomIndex]                = currentTurnList[currentTurnList.length - 1];
                currentTurnList[currentTurnList.length - 1] = turn;

                currentTurnList.pop();
            }
            else
            {
                turn = currentTurnList.pop();
            }

            currentGameBoard = makeTurn(currentGameBoard, currentGameClickRule, currentClickRuleSize, currentGameSize, currentDomainSize, turn.cellX, turn.cellY, flagToroidBoard);
            updateBoardTexture();

            resetStability();
            if(flagShowStability || flagShowLitStability)
            {
                updateStabilityTexture();
            }

            if(currentTurnList.length === 0)
            {
                flagTickLoop = false; //No need for the next tick
            }
        }

        if(flagPeriodBackCounting)
        {
            currentPeriodCount++;

            currentGameSolution = calculateInverseSolution();
            
            currentGameStability = calculateNewStabilityValue(currentGameSolution);
            currentGameBoard     = currentGameSolution;

            updateBoardTexture();

            if(flagShowLitStability)
            {
                currentGameLitStability = calculateLitStability();
                updateStabilityTexture();
            }
            else if(flagShowStability)
            {
                updateStabilityTexture();
            }

            if(flagStopCountingWhenFound && equalsBoard(currentGameBoard, currentCountedBoard))
            {
                flagStopCountingWhenFound = false;
                changeCountingMode(countingModes.COUNT_NONE, false);
                flagTickLoop = false;
            }

            spText.textContent = "Solution period: " + currentPeriodCount;
        }

        requestRedraw();
        
        if(flagTickLoop)
        {
            window.requestAnimationFrame(nextTick);
        }
    }

    function requestRedraw()
    {
        mainDraw();
    }

    function createTextures()
    {
        let emptyTexData = new Uint8Array(maximumBoardSize * maximumBoardSize);
        emptyTexData.fill(0);

        boardTexture     = gl.createTexture();
        solutionTexture  = gl.createTexture();
        stabilityTexture = gl.createTexture();

        gl.bindTexture(gl.TEXTURE_2D, boardTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8UI, maximumBoardSize, maximumBoardSize, 0, gl.RED_INTEGER, gl.UNSIGNED_BYTE, emptyTexData);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE);

        gl.bindTexture(gl.TEXTURE_2D, solutionTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8UI, maximumBoardSize, maximumBoardSize, 0, gl.RED_INTEGER, gl.UNSIGNED_BYTE, emptyTexData);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE);

        gl.bindTexture(gl.TEXTURE_2D, stabilityTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8UI, maximumBoardSize, maximumBoardSize, 0, gl.RED_INTEGER, gl.UNSIGNED_BYTE, emptyTexData);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S,     gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T,     gl.CLAMP_TO_EDGE);
    }

    function createShaders()
    {
        const vsSource = 
        `#version 300 es

        layout(location = 0) in mediump vec4 vScreenPos;
        void main(void)
        {
            gl_Position = vScreenPos;
        }
        `;

        const squaresFsSource = 
        `#version 300 es

        #define FLAG_SHOW_SOLUTION  0x01
        #define FLAG_SHOW_STABILITY 0x02
        #define FLAG_TOROID_RENDER  0x04

        uniform int gBoardSize;
        uniform int gCellSize;
        uniform int gDomainSize;
        uniform int gFlags;

        uniform int gImageWidth;
        uniform int gImageHeight;
        uniform int gViewportOffsetX;
        uniform int gViewportOffsetY;
 
        uniform lowp vec4 gColorNone;
        uniform lowp vec4 gColorEnabled;
        uniform lowp vec4 gColorSolved;
        uniform lowp vec4 gColorBetween;

        uniform highp usampler2D gBoard;
        uniform highp usampler2D gSolution;
        uniform highp usampler2D gStability;

        layout(location = 0) out lowp vec4 outColor;

        void main(void)
        {
            ivec2 screenPos = ivec2(int(gl_FragCoord.x) - gViewportOffsetX, gImageHeight - int(gl_FragCoord.y) - 1 + gViewportOffsetY);

            if((screenPos.x % gCellSize != 0) && (screenPos.y % gCellSize != 0)) //Inside the cell
            {
                highp ivec2 cellNumber = screenPos.xy / ivec2(gCellSize, gCellSize);

		        uint          cellValue = texelFetch(gBoard, cellNumber, 0).x;
		        mediump float cellPower = float(cellValue) / float(gDomainSize - 1);

                outColor = mix(gColorNone, gColorEnabled, cellPower);

                if((gFlags & FLAG_SHOW_SOLUTION) != 0)
                {
		            uint          solutionValue = texelFetch(gSolution, cellNumber, 0).x;
		            mediump float solutionPower = float(solutionValue) / float(gDomainSize - 1);

                    outColor = mix(outColor, gColorSolved, solutionPower);
                }
                else if((gFlags & FLAG_SHOW_STABILITY) != 0)
                {
        			uint          stableValue = texelFetch(gStability, cellNumber, 0).x;
			        mediump float stablePower = float(stableValue) / float(gDomainSize - 1);

			        lowp vec4 colorStable = vec4(1.0f, 1.0f, 1.0f, 1.0f) - gColorEnabled;
                    colorStable.a = 1.0f;

                    outColor = mix(outColor, colorStable, stablePower);
                }
            }
            else
            {
                outColor = gColorBetween;
            }
        }`;

        //https://lightstrout.com/blog/2019/05/21/circles-render-mode/
        const circlesFsSource = 
        `#version 300 es

        #define FLAG_SHOW_SOLUTION  0x01
        #define FLAG_SHOW_STABILITY 0x02
        #define FLAG_TOROID_RENDER  0x04

        uniform int gBoardSize;
        uniform int gCellSize;
        uniform int gDomainSize;
        uniform int gFlags;

        uniform int gImageWidth;
        uniform int gImageHeight;
        uniform int gViewportOffsetX;
        uniform int gViewportOffsetY;
 
        uniform lowp vec4 gColorNone;
        uniform lowp vec4 gColorEnabled;
        uniform lowp vec4 gColorSolved;
        uniform lowp vec4 gColorBetween;

        uniform highp usampler2D gBoard;
        uniform highp usampler2D gSolution;
        uniform highp usampler2D gStability;

        layout(location = 0) out lowp vec4 outColor;

        ivec2 xx(int x) //Simulating HLSL's .xx
        {
            return ivec2(x, x);
        }

        void main(void)
        {
            ivec2 screenPos = ivec2(int(gl_FragCoord.x) - gViewportOffsetX, gImageHeight - int(gl_FragCoord.y) - 1 + gViewportOffsetY);

            if((screenPos.x % gCellSize != 0) && (screenPos.y % gCellSize != 0)) //Inside the cell
            {
                highp ivec2 cellNumber = screenPos / xx(gCellSize);

                uint          cellValue = texelFetch(gBoard, cellNumber, 0).x;
                mediump float cellPower = float(cellValue) / float(gDomainSize - 1);

                mediump vec2  cellCoord    = (vec2(screenPos) - vec2(cellNumber * gCellSize) - vec2(xx(gCellSize)) / 2.0f);
                mediump float circleRadius = float(gCellSize - 1) / 2.0f;
                
                ivec2 leftCell   = cellNumber + ivec2(-1,  0);
                ivec2 rightCell  = cellNumber + ivec2( 1,  0);
                ivec2 topCell    = cellNumber + ivec2( 0, -1);
                ivec2 bottomCell = cellNumber + ivec2( 0,  1);
        
                bool insideCircle = (dot(cellCoord, cellCoord) < circleRadius * circleRadius);
        
                bool nonLeftEdge   = cellNumber.x > 0;
                bool nonRightEdge  = cellNumber.x < gBoardSize - 1;
                bool nonTopEdge    = cellNumber.y > 0;
                bool nonBottomEdge = cellNumber.y < gBoardSize - 1;

                if((gFlags & FLAG_TOROID_RENDER) != 0)
                {
                    nonLeftEdge   = true;
                    nonRightEdge  = true;
                    nonTopEdge    = true;
                    nonBottomEdge = true;
        
                    const uint maxCheckDistance = 1u; //Different for different render modes
        
                    uvec2 leftCellU   = uvec2(leftCell)   + uvec2(xx(gBoardSize)) * maxCheckDistance;
                    uvec2 rightCellU  = uvec2(rightCell)  + uvec2(xx(gBoardSize)) * maxCheckDistance;
                    uvec2 topCellU    = uvec2(topCell)    + uvec2(xx(gBoardSize)) * maxCheckDistance;
                    uvec2 bottomCellU = uvec2(bottomCell) + uvec2(xx(gBoardSize)) * maxCheckDistance;
        
                    leftCell   = ivec2(leftCellU   % uvec2(xx(gBoardSize)));
                    rightCell  = ivec2(rightCellU  % uvec2(xx(gBoardSize)));
                    topCell    = ivec2(topCellU    % uvec2(xx(gBoardSize)));
                    bottomCell = ivec2(bottomCellU % uvec2(xx(gBoardSize)));
                }

                uint leftPartValue   = uint(nonLeftEdge)   * texelFetch(gBoard, leftCell,   0).x;
                uint rightPartValue  = uint(nonRightEdge)  * texelFetch(gBoard, rightCell,  0).x;
                uint topPartValue    = uint(nonTopEdge)    * texelFetch(gBoard, topCell,    0).x;
                uint bottomPartValue = uint(nonBottomEdge) * texelFetch(gBoard, bottomCell, 0).x;

                bool circleRuleColored = insideCircle || ((leftPartValue   == cellValue && cellCoord.x <= 0.0f) 
                                                      ||  (topPartValue    == cellValue && cellCoord.y <= 0.0f) 
                                                      ||  (rightPartValue  == cellValue && cellCoord.x >= 0.0f) 
                                                      ||  (bottomPartValue == cellValue && cellCoord.y >= 0.0f));

                cellPower = cellPower * float(circleRuleColored);
                outColor  = mix(gColorNone, gColorEnabled, cellPower);

                if((gFlags & FLAG_SHOW_SOLUTION) != 0)
                {
		            uint          solutionValue = texelFetch(gSolution, cellNumber, 0).x;
		            mediump float solutionPower = float(solutionValue) / float(gDomainSize - 1);

                    uint leftPartSolvedValue   = uint(nonLeftEdge)   * texelFetch(gSolution, leftCell,   0).x;
                    uint rightPartSolvedValue  = uint(nonRightEdge)  * texelFetch(gSolution, rightCell,  0).x;
                    uint topPartSolvedValue    = uint(nonTopEdge)    * texelFetch(gSolution, topCell,    0).x;
                    uint bottomPartSolvedValue = uint(nonBottomEdge) * texelFetch(gSolution, bottomCell, 0).x;
        
                    bool circleRuleSolved = insideCircle || ((leftPartSolvedValue   == solutionValue && cellCoord.x <= 0.0f) 
                                                         ||  (topPartSolvedValue    == solutionValue && cellCoord.y <= 0.0f) 
                                                         ||  (rightPartSolvedValue  == solutionValue && cellCoord.x >= 0.0f) 
                                                         ||  (bottomPartSolvedValue == solutionValue && cellCoord.y >= 0.0f));
        
                    solutionPower = solutionPower * float(circleRuleSolved);
                    outColor      = mix(outColor, gColorSolved, solutionPower);
                }
                else if((gFlags & FLAG_SHOW_STABILITY) != 0)
                {
        			uint          stableValue = texelFetch(gStability, cellNumber, 0).x;
			        mediump float stablePower = float(stableValue) / float(gDomainSize - 1);

			        lowp vec4 colorStable = vec4(1.0f, 1.0f, 1.0f, 1.0f) - gColorEnabled;
                    colorStable.a = 1.0f;

                    uint leftPartStableValue   = uint(nonLeftEdge)   * texelFetch(gStability, leftCell,   0).x;
                    uint rightPartStableValue  = uint(nonRightEdge)  * texelFetch(gStability, rightCell,  0).x;
                    uint topPartStableValue    = uint(nonTopEdge)    * texelFetch(gStability, topCell,    0).x;
                    uint bottomPartStableValue = uint(nonBottomEdge) * texelFetch(gStability, bottomCell, 0).x;
        
                    bool circleRuleStable = insideCircle || ((leftPartStableValue  == stableValue && cellCoord.x <= 0.0f) 
                                                         || (topPartStableValue    == stableValue && cellCoord.y <= 0.0f) 
                                                         || (rightPartStableValue  == stableValue && cellCoord.x >= 0.0f) 
                                                         || (bottomPartStableValue == stableValue && cellCoord.y >= 0.0f));
        
                    stablePower = stablePower * float(circleRuleStable);
                    outColor    = mix(outColor, colorStable, stablePower);
                }
            }
            else
            {
                outColor = gColorBetween;
            }
        }`;

        //http://lightstrout.com/blog/2019/12/09/diamonds-render-mode/
        const diamondsFsSource = 
        `#version 300 es

        #define FLAG_SHOW_SOLUTION  0x01
        #define FLAG_SHOW_STABILITY 0x02
        #define FLAG_TOROID_RENDER  0x04

        uniform int gBoardSize;
        uniform int gCellSize;
        uniform int gDomainSize;
        uniform int gFlags;

        uniform int gImageWidth;
        uniform int gImageHeight;
        uniform int gViewportOffsetX;
        uniform int gViewportOffsetY;
 
        uniform lowp vec4 gColorNone;
        uniform lowp vec4 gColorEnabled;
        uniform lowp vec4 gColorSolved;
        uniform lowp vec4 gColorBetween;

        uniform highp usampler2D gBoard;
        uniform highp usampler2D gSolution;
        uniform highp usampler2D gStability;

        layout(location = 0) out lowp vec4 outColor;

        ivec2 xx(int x) //Simulating HLSL's .xx
        {
            return ivec2(x, x);
        }

        uvec4 xxxx(uint x) //Simulating HLSL's .xxxx
        {
            return uvec4(x, x, x, x);
        }

        bvec4 u4eq(uvec4 a, uvec4 b) //Another thing that doesn't require writing functions in hlsl
        {
            return bvec4(a.x == b.x, a.y == b.y, a.z == b.z, a.w == b.w);
        }

        bvec4 emptyCornerRule(uvec4 edgeValue)
        {
            return u4eq(edgeValue.xyzw, edgeValue.yzwx);
        }

        bvec4 cornerRule(uint cellValue, uvec4 cornerValue)
        {
            return u4eq(xxxx(cellValue), cornerValue.xyzw);
        }

        void main(void)
        {
            ivec2 screenPos = ivec2(int(gl_FragCoord.x) - gViewportOffsetX, gImageHeight - int(gl_FragCoord.y) - 1 + gViewportOffsetY);

            if((screenPos.x % gCellSize != 0) && (screenPos.y % gCellSize != 0)) //Inside the cell
            {
                highp ivec2 cellNumber = screenPos.xy / xx(gCellSize);
                uint        cellValue  = texelFetch(gBoard, cellNumber, 0).x;

                mediump vec2  cellCoord     = (vec2(screenPos.xy) - vec2(cellNumber * xx(gCellSize)) - vec2(xx(gCellSize)) / 2.0f);
                mediump float diamondRadius = float(gCellSize - 1) / 2.0f;
                
                mediump float domainFactor = 1.0f / float(gDomainSize - 1);

                bool insideDiamond     = (abs(cellCoord.x) + abs(cellCoord.y) <= diamondRadius);
                bool insideTopLeft     = !insideDiamond && cellCoord.x <= 0.0f && cellCoord.y <= 0.0f;
                bool insideTopRight    = !insideDiamond && cellCoord.x >= 0.0f && cellCoord.y <= 0.0f;
                bool insideBottomRight = !insideDiamond && cellCoord.x >= 0.0f && cellCoord.y >= 0.0f;
                bool insideBottomLeft  = !insideDiamond && cellCoord.x <= 0.0f && cellCoord.y >= 0.0f;

                bvec4 insideCorner = bvec4(insideTopLeft, insideTopRight, insideBottomRight, insideBottomLeft);

                ivec2 leftCell        = cellNumber + ivec2(-1,  0);
                ivec2 rightCell       = cellNumber + ivec2( 1,  0);
                ivec2 topCell         = cellNumber + ivec2( 0, -1);
                ivec2 bottomCell      = cellNumber + ivec2( 0,  1);
                ivec2 leftTopCell     = cellNumber + ivec2(-1, -1);
                ivec2 rightTopCell    = cellNumber + ivec2( 1, -1);
                ivec2 leftBottomCell  = cellNumber + ivec2(-1,  1);
                ivec2 rightBottomCell = cellNumber + ivec2( 1,  1);
        
                bool nonLeftEdge        = cellNumber.x > 0;
                bool nonRightEdge       = cellNumber.x < gBoardSize - 1;
                bool nonTopEdge         =                                  cellNumber.y > 0;
                bool nonBottomEdge      =                                  cellNumber.y < gBoardSize - 1;
                bool nonLeftTopEdge     = cellNumber.x > 0              && cellNumber.y > 0;
                bool nonRightTopEdge    = cellNumber.x < gBoardSize - 1 && cellNumber.y > 0;
                bool nonLeftBottomEdge  = cellNumber.x > 0              && cellNumber.y < gBoardSize - 1;
                bool nonRightBottomEdge = cellNumber.x < gBoardSize - 1 && cellNumber.y < gBoardSize - 1;

                if((gFlags & FLAG_TOROID_RENDER) != 0)
                {
                    ivec2 boardSizexx = xx(gBoardSize);

                    nonLeftEdge        = true;
                    nonRightEdge       = true;
                    nonTopEdge         = true;
                    nonBottomEdge      = true;
                    nonLeftTopEdge     = true;
                    nonRightTopEdge    = true;
                    nonLeftBottomEdge  = true;
                    nonRightBottomEdge = true;
        
                    const uint maxCheckDistance = 1u; //Different for different render modes

                    uvec2 leftCellU        = uvec2(leftCell)        + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 rightCellU       = uvec2(rightCell)       + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 topCellU         = uvec2(topCell)         + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 bottomCellU      = uvec2(bottomCell)      + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 leftTopCellU     = uvec2(leftTopCell)     + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 rightTopCellU    = uvec2(rightTopCell)    + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 leftBottomCellU  = uvec2(leftBottomCell)  + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 rightBottomCellU = uvec2(rightBottomCell) + uvec2(boardSizexx) * maxCheckDistance;

                    leftCell        = ivec2(leftCellU        % uvec2(boardSizexx));
                    rightCell       = ivec2(rightCellU       % uvec2(boardSizexx));
                    topCell         = ivec2(topCellU         % uvec2(boardSizexx));
                    bottomCell      = ivec2(bottomCellU      % uvec2(boardSizexx));
                    leftTopCell     = ivec2(leftTopCellU     % uvec2(boardSizexx));
                    rightTopCell    = ivec2(rightTopCellU    % uvec2(boardSizexx));
                    leftBottomCell  = ivec2(leftBottomCellU  % uvec2(boardSizexx));
                    rightBottomCell = ivec2(rightBottomCellU % uvec2(boardSizexx));
                }

                uint leftPartValue        = uint(nonLeftEdge)        * texelFetch(gBoard, leftCell,        0).x;
                uint rightPartValue       = uint(nonRightEdge)       * texelFetch(gBoard, rightCell,       0).x;
                uint topPartValue         = uint(nonTopEdge)         * texelFetch(gBoard, topCell,         0).x;
                uint bottomPartValue      = uint(nonBottomEdge)      * texelFetch(gBoard, bottomCell,      0).x;
                uint leftTopPartValue     = uint(nonLeftTopEdge)     * texelFetch(gBoard, leftTopCell,     0).x;
                uint rightTopPartValue    = uint(nonRightTopEdge)    * texelFetch(gBoard, rightTopCell,    0).x;
                uint leftBottomPartValue  = uint(nonLeftBottomEdge)  * texelFetch(gBoard, leftBottomCell,  0).x;
                uint rightBottomPartValue = uint(nonRightBottomEdge) * texelFetch(gBoard, rightBottomCell, 0).x;

                uvec4 edgeValue   = uvec4(leftPartValue,    topPartValue,      rightPartValue,       bottomPartValue);
                uvec4 cornerValue = uvec4(leftTopPartValue, rightTopPartValue, rightBottomPartValue, leftBottomPartValue);

                uvec4 emptyCornerCandidate = uvec4(emptyCornerRule(edgeValue)        ) * edgeValue;
                uvec4 cornerCandidate      = uvec4(cornerRule(cellValue, cornerValue)) * cellValue;

                uvec4 resCorner = max(emptyCornerCandidate, cornerCandidate);

                mediump float  cellPower = float(cellValue) * domainFactor;		
                mediump vec4 cornerPower =  vec4(resCorner) * domainFactor;

                mediump float enablePower = cellPower * float(insideDiamond) + dot(cornerPower, vec4(insideCorner));
                outColor                  = mix(gColorNone, gColorEnabled, enablePower);

                if((gFlags & FLAG_SHOW_SOLUTION) != 0)
                {
		            uint solutionValue = texelFetch(gSolution, cellNumber, 0).x;
        
                    uint leftPartSolved        = uint(nonLeftEdge)        * texelFetch(gSolution, leftCell,        0).x;
                    uint rightPartSolved       = uint(nonRightEdge)       * texelFetch(gSolution, rightCell,       0).x;
                    uint topPartSolved         = uint(nonTopEdge)         * texelFetch(gSolution, topCell,         0).x;
                    uint bottomPartSolved      = uint(nonBottomEdge)      * texelFetch(gSolution, bottomCell,      0).x;
                    uint leftTopPartSolved     = uint(nonLeftTopEdge)     * texelFetch(gSolution, leftTopCell,     0).x;
                    uint rightTopPartSolved    = uint(nonRightTopEdge)    * texelFetch(gSolution, rightTopCell,    0).x;
                    uint leftBottomPartSolved  = uint(nonLeftBottomEdge)  * texelFetch(gSolution, leftBottomCell,  0).x;
                    uint rightBottomPartSolved = uint(nonRightBottomEdge) * texelFetch(gSolution, rightBottomCell, 0).x;

                    uvec4 edgeSolved   = uvec4(leftPartSolved,    topPartSolved,      rightPartSolved,       bottomPartSolved);
                    uvec4 cornerSolved = uvec4(leftTopPartSolved, rightTopPartSolved, rightBottomPartSolved, leftBottomPartSolved);

                    uvec4 emptyCornerSolutionCandidate = uvec4(emptyCornerRule(edgeSolved)            ) * edgeSolved;
                    uvec4 cornerSolutionCandidate      = uvec4(cornerRule(solutionValue, cornerSolved)) * solutionValue;

                    uvec4 resCornerSolved = max(emptyCornerSolutionCandidate, cornerSolutionCandidate);
        
                    mediump float      solutionPower =  float(solutionValue) * domainFactor;		
                    mediump vec4 cornerSolutionPower = vec4(resCornerSolved) * domainFactor;

                    mediump float solvedPower = solutionPower * float(insideDiamond) + dot(cornerSolutionPower, vec4(insideCorner));
                    outColor                  = mix(outColor, gColorSolved, solvedPower);
                }
                else if((gFlags & FLAG_SHOW_STABILITY) != 0)
                {
        			uint stableValue = texelFetch(gStability, cellNumber, 0).x;

			        lowp vec4 colorStable = vec4(1.0f, 1.0f, 1.0f, 1.0f) - gColorEnabled;
                    colorStable.a = 1.0f;

                    uint leftPartStable        = uint(nonLeftEdge)        * texelFetch(gStability, leftCell,        0).x;
                    uint rightPartStable       = uint(nonRightEdge)       * texelFetch(gStability, rightCell,       0).x;
                    uint topPartStable         = uint(nonTopEdge)         * texelFetch(gStability, topCell,         0).x;
                    uint bottomPartStable      = uint(nonBottomEdge)      * texelFetch(gStability, bottomCell,      0).x;
                    uint leftTopPartStable     = uint(nonLeftTopEdge)     * texelFetch(gStability, leftTopCell,     0).x;
                    uint rightTopPartStable    = uint(nonRightTopEdge)    * texelFetch(gStability, rightTopCell,    0).x;
                    uint leftBottomPartStable  = uint(nonLeftBottomEdge)  * texelFetch(gStability, leftBottomCell,  0).x;
                    uint rightBottomPartStable = uint(nonRightBottomEdge) * texelFetch(gStability, rightBottomCell, 0).x;

                    uvec4 edgeStable   = uvec4(leftPartStable,    topPartStable,      rightPartStable,       bottomPartStable);
                    uvec4 cornerStable = uvec4(leftTopPartStable, rightTopPartStable, rightBottomPartStable, leftBottomPartStable);
        
                    uvec4 emptyCornerStabilityCandidate = uvec4(emptyCornerRule(edgeStable)          ) * edgeStable;
                    uvec4 cornerStabilityCandidate      = uvec4(cornerRule(stableValue, cornerStable)) * stableValue;
        
                    uvec4 resCornerStable = max(emptyCornerStabilityCandidate, cornerStabilityCandidate);
        
                    mediump float      stabilityPower =    float(stableValue) * domainFactor;		
                    mediump vec4 cornerStabilityPower = vec4(resCornerStable) * domainFactor;
        
                    mediump float stablePower = stabilityPower * float(insideDiamond) + dot(cornerStabilityPower, vec4(insideCorner));
                    outColor                  = mix(outColor, colorStable, stablePower);
                }
            }
            else
            {
                outColor = gColorBetween;
            }
        }`;

        //https://lightstrout.com/blog/2019/12/18/beams-render-mode/
        const beamsFsSource = 
        `#version 300 es

        #define FLAG_SHOW_SOLUTION  0x01
        #define FLAG_SHOW_STABILITY 0x02
        #define FLAG_TOROID_RENDER  0x04

        uniform int gBoardSize;
        uniform int gCellSize;
        uniform int gDomainSize;
        uniform int gFlags;

        uniform int gImageWidth;
        uniform int gImageHeight;
        uniform int gViewportOffsetX;
        uniform int gViewportOffsetY;
 
        uniform lowp vec4 gColorNone;
        uniform lowp vec4 gColorEnabled;
        uniform lowp vec4 gColorSolved;
        uniform lowp vec4 gColorBetween;

        uniform highp usampler2D gBoard;
        uniform highp usampler2D gSolution;
        uniform highp usampler2D gStability;

        layout(location = 0) out lowp vec4 outColor;

        ivec2 xx(int x) //Simulating HLSL's .xx
        {
            return ivec2(x, x);
        }

        uvec4 xxxx(uint x) //Simulating HLSL's .xxxx
        {
            return uvec4(x, x, x, x);
        }

        bvec4 xxxx(bool b) //No, seriously
        {
            return bvec4(b, b, b, b);
        }

        mediump vec4 xxxx(mediump float f) //I don't care anymore
        {
            return vec4(f, f, f, f);
        }

        bvec4 u4eq(uvec4 a, uvec4 b) //Another thing that doesn't require writing functions in hlsl
        {
            return bvec4(a.x == b.x, a.y == b.y, a.z == b.z, a.w == b.w);
        }

        bvec4 u4nq(uvec4 a, uvec4 b) //Another thing that doesn't require writing functions in hlsl
        {
            return bvec4(a.x != b.x, a.y != b.y, a.z != b.z, a.w != b.w);
        }

        bvec4 b4ne(bvec4 a)
        {
            return bvec4(!a.x, !a.y, !a.z, !a.w);
        }

        bvec4 b4nd(bvec4 a, bvec4 b)
        {
            return bvec4(a.x && b.x, a.y && b.y, a.z && b.z, a.w && b.w);
        }

        bvec4 b4nd(bvec4 a, bvec4 b, bvec4 c)
        {
            return bvec4(a.x && b.x && c.x, a.y && b.y && c.y, a.z && b.z && c.z, a.w && b.w && c.w);
        }

        bvec4 b4nd(bvec4 a, bvec4 b, bvec4 c, bvec4 d)
        {
            return bvec4(a.x && b.x && c.x && d.x, a.y && b.y && c.y && d.y, a.z && b.z && c.z && d.z, a.w && b.w && c.w && d.w);
        }

        bvec4 b4nd(bvec4 a, bvec4 b, bvec4 c, bvec4 d, bvec4 e)
        {
            return bvec4(a.x && b.x && c.x && d.x && e.x, a.y && b.y && c.y && d.y && e.y, a.z && b.z && c.z && d.z && e.z, a.w && b.w && c.w && d.w && e.w);
        }

        bvec4 b4or(bvec4 a, bvec4 b)
        {
            return bvec4(a.x || b.x, a.y || b.y, a.z || b.z, a.w || b.w);
        }

        bvec4 emptyCornerRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            bvec4 res = bvec4(true, true, true, true);

            uvec4 cellValuexxxx = xxxx(cellValue);

            res = b4nd(res, u4eq(edgeValue.xyzw, edgeValue.yzwx));
            res = b4nd(res, u4nq(edgeValue.xyzw, cornerValue.xyzw));
            res = b4nd(res, u4nq(edgeValue.xyzw, cellValuexxxx));

            return res;
        }

        bvec4 regBRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            bvec4 res = bvec4(false, false, false, false);
            
            uvec4 cellValuexxxx = xxxx(cellValue);

            res = b4or(res,      u4eq(cellValuexxxx, edgeValue.xyzw  )                                                                                                                                                         ); //B#1
            res = b4or(res,      u4eq(cellValuexxxx, edgeValue.yzwx  )                                                                                                                                                         ); //B#2
            res = b4or(res,      u4eq(cellValuexxxx, cornerValue.xyzw)                                                                                                                                                         ); //B#3
            res = b4or(res, b4nd(u4eq(cellValuexxxx, edgeValue.zwxy  ), u4eq(cellValuexxxx, edgeValue.wxyz  )                                                                                                                 )); //B#4
            res = b4or(res, b4nd(u4eq(cellValuexxxx, cornerValue.zwxy), u4nq(cellValuexxxx, cornerValue.wxyz), u4nq(cellValuexxxx, edgeValue.wxyz), u4nq(cellValuexxxx, edgeValue.zwxy), u4nq(cellValuexxxx, cornerValue.yzwx))); //B#5

            return res;
        }

        bvec4 regIRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            bvec4 res = bvec4(false, false, false, false);
            
            bool loneDiamond = cellValue != edgeValue.x   && cellValue != edgeValue.y   && cellValue != edgeValue.z   && cellValue != edgeValue.w 
                            && cellValue != cornerValue.x && cellValue != cornerValue.y && cellValue != cornerValue.z && cellValue != cornerValue.w;

            uvec4 cellValuexxxx   = xxxx(cellValue);
            bvec4 loneDiamondxxxx = xxxx(loneDiamond);

            res = b4or(res,      u4eq(cellValuexxxx,   edgeValue.xyzw  )                                                                                                                  ); //I#1
            res = b4or(res, b4nd(u4eq(cellValuexxxx,   cornerValue.xyzw), u4nq(cellValuexxxx, edgeValue.yzwx  )                                                                          )); //I#2
            res = b4or(res, b4nd(u4eq(cellValuexxxx,   cornerValue.wxyz), u4nq(cellValuexxxx, edgeValue.wxyz  )                                                                          )); //I#3
            res = b4or(res, b4nd(u4eq(cellValuexxxx,   cornerValue.zwxy), u4eq(cellValuexxxx, cornerValue.yzwx), u4nq(cellValuexxxx, edgeValue.wxyz), u4nq(cellValuexxxx, edgeValue.yzwx))); //I#4
            res = b4or(res, b4nd(u4eq(cellValuexxxx,   edgeValue.zwxy  ), u4nq(cellValuexxxx, edgeValue.wxyz  ), u4nq(cellValuexxxx, edgeValue.yzwx)                                     )); //I#5
            res = b4or(res,           loneDiamondxxxx                                                                                                                                     ); //I#6

            return res;
        }

        bvec4 regYTopRightRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            bvec4 res = bvec4(false, false, false, false);

            uvec4 cellValuexxxx = xxxx(cellValue);
            
            res = b4or(res,      u4eq(cellValuexxxx, edgeValue.yyzz  )                                      ); //Y#1
            res = b4or(res, b4nd(u4eq(cellValuexxxx, cornerValue.xyyz), u4nq(cellValuexxxx, edgeValue.xzyw))); //Y#2

            return res;
        }

        bvec4 regYBottomLeftRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            bvec4 res = bvec4(false, false, false, false);

            uvec4 cellValuexxxx = xxxx(cellValue);
            
            res = b4or(res,      u4eq(cellValuexxxx, edgeValue.wwxx  )                                      ); //Y#1
            res = b4or(res, b4nd(u4eq(cellValuexxxx, cornerValue.zwwx), u4nq(cellValuexxxx, edgeValue.zxwy))); //Y#2

            return res;
        }

        bvec4 regVRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            uvec4 cellValuexxxx = xxxx(cellValue);
            return b4nd(u4eq(cellValuexxxx, cornerValue.xyzw), u4nq(cellValuexxxx, edgeValue.xyzw), u4nq(cellValuexxxx, edgeValue.yzwx)); //V#1
        }

        void main(void)
        {
            ivec2 screenPos = ivec2(int(gl_FragCoord.x) - gViewportOffsetX, gImageHeight - int(gl_FragCoord.y) - 1 + gViewportOffsetY);

            if((screenPos.x % gCellSize != 0) && (screenPos.y % gCellSize != 0)) //Inside the cell
            {
                ivec2 cellSizexx = xx(gCellSize);

                highp ivec2 cellNumber = screenPos.xy / cellSizexx;
                uint        cellValue  = texelFetch(gBoard, cellNumber, 0).x;

                mediump vec2  cellCoord     = (vec2(screenPos.xy) - vec2(cellNumber * cellSizexx) - vec2(cellSizexx) / 2.0f);
                mediump float diamondRadius = float(gCellSize - 1) / 2.0f;
                
                mediump float domainFactor = 1.0f / float(gDomainSize - 1);

                bool insideCentralDiamond = (abs(cellCoord.x) + abs(cellCoord.y) <= diamondRadius);

                bool insideHorizontalBeamLeft  = (abs(cellCoord.y) <= 0.707f * float(gCellSize - 1) / 2.0f && cellCoord.x <= 0.0f);
                bool insideHorizontalBeamRight = (abs(cellCoord.y) <= 0.707f * float(gCellSize - 1) / 2.0f && cellCoord.x >= 0.0f);
                bool insideVerticalBeamTop     = (abs(cellCoord.x) <= 0.707f * float(gCellSize - 1) / 2.0f && cellCoord.y <= 0.0f);
                bool insideVerticalBeamBottom  = (abs(cellCoord.x) <= 0.707f * float(gCellSize - 1) / 2.0f && cellCoord.y >= 0.0f);

                bvec4 insideSide = bvec4(cellCoord.x <= 0.0f, cellCoord.y <= 0.0f, cellCoord.x >= 0.0f, cellCoord.y >= 0.0f);
                bvec4 insideBeam = bvec4(insideHorizontalBeamLeft, insideVerticalBeamTop, insideHorizontalBeamRight, insideVerticalBeamBottom);

                bool insideG = insideCentralDiamond && (insideHorizontalBeamLeft || insideHorizontalBeamRight) && (insideVerticalBeamTop || insideVerticalBeamBottom); //G

                bvec4 insideB = b4nd(insideBeam.xzzx,      insideBeam.yyww ,                        xxxx(!insideCentralDiamond)); //B-A, B-B, B-C, B-D
                bvec4 insideI = b4nd(insideBeam.xyzw, b4ne(insideBeam.yxwz), b4ne(insideBeam.wzyx), xxxx( insideCentralDiamond)); //I-A, I-B, I-C, I-D

                bvec4 insideYTopRight   = b4nd(insideBeam.yyzz, b4ne(insideBeam.xzyw), xxxx(!insideCentralDiamond), insideSide.xzyw); //Y-A, Y-B, Y-C, Y-D
                bvec4 insideYBottomLeft = b4nd(insideBeam.wwxx, b4ne(insideBeam.zxwy), xxxx(!insideCentralDiamond), insideSide.zxwy); //Y-E, Y-F, Y-G, Y-H

                bvec4 insideV = b4nd(b4ne(insideBeam.xyzw), b4ne(insideBeam.yzwx), insideSide.xyzw, insideSide.yzwx); //V-A, V-B, V-C, V-D

                ivec2 leftCell        = cellNumber + ivec2(-1,  0);
                ivec2 rightCell       = cellNumber + ivec2( 1,  0);
                ivec2 topCell         = cellNumber + ivec2( 0, -1);
                ivec2 bottomCell      = cellNumber + ivec2( 0,  1);
                ivec2 leftTopCell     = cellNumber + ivec2(-1, -1);
                ivec2 rightTopCell    = cellNumber + ivec2( 1, -1);
                ivec2 leftBottomCell  = cellNumber + ivec2(-1,  1);
                ivec2 rightBottomCell = cellNumber + ivec2( 1,  1);
        
                bool nonLeftEdge        = cellNumber.x > 0;
                bool nonRightEdge       = cellNumber.x < gBoardSize - 1;
                bool nonTopEdge         =                                  cellNumber.y > 0;
                bool nonBottomEdge      =                                  cellNumber.y < gBoardSize - 1;
                bool nonLeftTopEdge     = cellNumber.x > 0              && cellNumber.y > 0;
                bool nonRightTopEdge    = cellNumber.x < gBoardSize - 1 && cellNumber.y > 0;
                bool nonLeftBottomEdge  = cellNumber.x > 0              && cellNumber.y < gBoardSize - 1;
                bool nonRightBottomEdge = cellNumber.x < gBoardSize - 1 && cellNumber.y < gBoardSize - 1;

                if((gFlags & FLAG_TOROID_RENDER) != 0)
                {
                    ivec2 boardSizexx = xx(gBoardSize);

                    nonLeftEdge        = true;
                    nonRightEdge       = true;
                    nonTopEdge         = true;
                    nonBottomEdge      = true;
                    nonLeftTopEdge     = true;
                    nonRightTopEdge    = true;
                    nonLeftBottomEdge  = true;
                    nonRightBottomEdge = true;
        
                    const uint maxCheckDistance = 1u; //Different for different render modes

                    uvec2 leftCellU        = uvec2(leftCell)        + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 rightCellU       = uvec2(rightCell)       + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 topCellU         = uvec2(topCell)         + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 bottomCellU      = uvec2(bottomCell)      + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 leftTopCellU     = uvec2(leftTopCell)     + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 rightTopCellU    = uvec2(rightTopCell)    + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 leftBottomCellU  = uvec2(leftBottomCell)  + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 rightBottomCellU = uvec2(rightBottomCell) + uvec2(boardSizexx) * maxCheckDistance;

                    leftCell        = ivec2(leftCellU        % uvec2(boardSizexx));
                    rightCell       = ivec2(rightCellU       % uvec2(boardSizexx));
                    topCell         = ivec2(topCellU         % uvec2(boardSizexx));
                    bottomCell      = ivec2(bottomCellU      % uvec2(boardSizexx));
                    leftTopCell     = ivec2(leftTopCellU     % uvec2(boardSizexx));
                    rightTopCell    = ivec2(rightTopCellU    % uvec2(boardSizexx));
                    leftBottomCell  = ivec2(leftBottomCellU  % uvec2(boardSizexx));
                    rightBottomCell = ivec2(rightBottomCellU % uvec2(boardSizexx));
                }

                uint leftPartValue        = uint(nonLeftEdge)        * texelFetch(gBoard, leftCell,        0).x;
                uint rightPartValue       = uint(nonRightEdge)       * texelFetch(gBoard, rightCell,       0).x;
                uint topPartValue         = uint(nonTopEdge)         * texelFetch(gBoard, topCell,         0).x;
                uint bottomPartValue      = uint(nonBottomEdge)      * texelFetch(gBoard, bottomCell,      0).x;
                uint leftTopPartValue     = uint(nonLeftTopEdge)     * texelFetch(gBoard, leftTopCell,     0).x;
                uint rightTopPartValue    = uint(nonRightTopEdge)    * texelFetch(gBoard, rightTopCell,    0).x;
                uint leftBottomPartValue  = uint(nonLeftBottomEdge)  * texelFetch(gBoard, leftBottomCell,  0).x;
                uint rightBottomPartValue = uint(nonRightBottomEdge) * texelFetch(gBoard, rightBottomCell, 0).x;

                uvec4 edgeValue   = uvec4(leftPartValue,    topPartValue,      rightPartValue,       bottomPartValue);
                uvec4 cornerValue = uvec4(leftTopPartValue, rightTopPartValue, rightBottomPartValue, leftBottomPartValue);

                uvec4 emptyCornerCandidate = uvec4(emptyCornerRule(cellValue, edgeValue, cornerValue)) * edgeValue;

                uvec4 regionBCandidate = uvec4(regBRule(cellValue, edgeValue, cornerValue)) * cellValue;
                uvec4 regionICandidate = uvec4(regIRule(cellValue, edgeValue, cornerValue)) * cellValue;

                uvec4 regionYTopRightCandidate   = uvec4(regYTopRightRule(cellValue, edgeValue, cornerValue))   * cellValue;
                uvec4 regionYBottomLeftCandidate = uvec4(regYBottomLeftRule(cellValue, edgeValue, cornerValue)) * cellValue;

                uvec4 regionVCandidate = uvec4(regVRule(cellValue, edgeValue, cornerValue)) * cellValue;

                uvec4 resB           = max(regionBCandidate,           emptyCornerCandidate.xyzw);
                uvec4 resYTopRight   = max(regionYTopRightCandidate,   emptyCornerCandidate.xyyz);
                uvec4 resYBottomLeft = max(regionYBottomLeftCandidate, emptyCornerCandidate.zwwx);
                uvec4 resV           = max(regionVCandidate,           emptyCornerCandidate.xyzw);

                mediump float regGPower           = float(cellValue       ) *      domainFactor;
                mediump vec4  regIPower           = vec4( regionICandidate) * xxxx(domainFactor);
                mediump vec4  regBPower           = vec4( resB            ) * xxxx(domainFactor);
                mediump vec4  regYTopRightPower   = vec4( resYTopRight    ) * xxxx(domainFactor);
                mediump vec4  regYBottomLeftPower = vec4( resYBottomLeft  ) * xxxx(domainFactor);
                mediump vec4  regVPower           = vec4( resV            ) * xxxx(domainFactor);

                mediump float enablePower =    float(insideG)      *     regGPower;
                enablePower              += dot(vec4(insideB),           regBPower);
                enablePower              += dot(vec4(insideI),           regIPower); 
                enablePower              += dot(vec4(insideYTopRight),   regYTopRightPower);
                enablePower              += dot(vec4(insideYBottomLeft), regYBottomLeftPower); 
                enablePower              += dot(vec4(insideV),           regVPower);

                outColor = mix(gColorNone, gColorEnabled, enablePower);

                if((gFlags & FLAG_SHOW_SOLUTION) != 0)
                {
		            uint solutionValue = texelFetch(gSolution, cellNumber, 0).x;
        
                    uint leftPartSolved        = uint(nonLeftEdge)        * texelFetch(gSolution, leftCell,        0).x;
                    uint rightPartSolved       = uint(nonRightEdge)       * texelFetch(gSolution, rightCell,       0).x;
                    uint topPartSolved         = uint(nonTopEdge)         * texelFetch(gSolution, topCell,         0).x;
                    uint bottomPartSolved      = uint(nonBottomEdge)      * texelFetch(gSolution, bottomCell,      0).x;
                    uint leftTopPartSolved     = uint(nonLeftTopEdge)     * texelFetch(gSolution, leftTopCell,     0).x;
                    uint rightTopPartSolved    = uint(nonRightTopEdge)    * texelFetch(gSolution, rightTopCell,    0).x;
                    uint leftBottomPartSolved  = uint(nonLeftBottomEdge)  * texelFetch(gSolution, leftBottomCell,  0).x;
                    uint rightBottomPartSolved = uint(nonRightBottomEdge) * texelFetch(gSolution, rightBottomCell, 0).x;

                    uvec4 edgeSolved   = uvec4(leftPartSolved,    topPartSolved,      rightPartSolved,       bottomPartSolved);
                    uvec4 cornerSolved = uvec4(leftTopPartSolved, rightTopPartSolved, rightBottomPartSolved, leftBottomPartSolved);
    
                    uvec4 emptyCornerSolutionCandidate = uvec4(emptyCornerRule(solutionValue, edgeSolved, cornerSolved)) * edgeSolved;
    
                    uvec4 regionBSolutionCandidate = uvec4(regBRule(solutionValue, edgeSolved, cornerSolved)) * solutionValue;
                    uvec4 regionISolutionCandidate = uvec4(regIRule(solutionValue, edgeSolved, cornerSolved)) * solutionValue;
    
                    uvec4 regionYTopRightSolutionCandidate   = uvec4(regYTopRightRule(solutionValue, edgeSolved, cornerSolved))   * solutionValue;
                    uvec4 regionYBottomLeftSolutionCandidate = uvec4(regYBottomLeftRule(solutionValue, edgeSolved, cornerSolved)) * solutionValue;
    
                    uvec4 regionVSolutionCandidate = uvec4(regVRule(solutionValue, edgeSolved, cornerSolved)) * solutionValue;
    
                    uvec4 resBSolution           = max(regionBSolutionCandidate,           emptyCornerSolutionCandidate.xyzw);
                    uvec4 resYTopRightSolution   = max(regionYTopRightSolutionCandidate,   emptyCornerSolutionCandidate.xyyz);
                    uvec4 resYBottomLeftSolution = max(regionYBottomLeftSolutionCandidate, emptyCornerSolutionCandidate.zwwx);
                    uvec4 resVSolution           = max(regionVSolutionCandidate,           emptyCornerSolutionCandidate.xyzw);
    
                    mediump float regGSolutionPower           = float(solutionValue           ) *      domainFactor;
                    mediump vec4  regISolutionPower           = vec4( regionISolutionCandidate) * xxxx(domainFactor);
                    mediump vec4  regBSolutionPower           = vec4( resBSolution            ) * xxxx(domainFactor);
                    mediump vec4  regYTopRightSolutionPower   = vec4( resYTopRightSolution    ) * xxxx(domainFactor);
                    mediump vec4  regYBottomLeftSolutionPower = vec4( resYBottomLeftSolution  ) * xxxx(domainFactor);
                    mediump vec4  regVSolutionPower           = vec4( resVSolution            ) * xxxx(domainFactor);
    
                    mediump float solvedPower =    float(insideG)      *     regGSolutionPower;
                    solvedPower              += dot(vec4(insideB),           regBSolutionPower);
                    solvedPower              += dot(vec4(insideI),           regISolutionPower); 
                    solvedPower              += dot(vec4(insideYTopRight),   regYTopRightSolutionPower);
                    solvedPower              += dot(vec4(insideYBottomLeft), regYBottomLeftSolutionPower); 
                    solvedPower              += dot(vec4(insideV),           regVSolutionPower);
                    
                    outColor = mix(outColor, gColorSolved, solvedPower);
                }
                else if((gFlags & FLAG_SHOW_STABILITY) != 0)
                {
        			uint stabilityValue = texelFetch(gStability, cellNumber, 0).x;

			        lowp vec4 colorStable = vec4(1.0f, 1.0f, 1.0f, 1.0f) - gColorEnabled;
                    colorStable.a = 1.0f;

                    uint leftPartStable        = uint(nonLeftEdge)        * texelFetch(gStability, leftCell,        0).x;
                    uint rightPartStable       = uint(nonRightEdge)       * texelFetch(gStability, rightCell,       0).x;
                    uint topPartStable         = uint(nonTopEdge)         * texelFetch(gStability, topCell,         0).x;
                    uint bottomPartStable      = uint(nonBottomEdge)      * texelFetch(gStability, bottomCell,      0).x;
                    uint leftTopPartStable     = uint(nonLeftTopEdge)     * texelFetch(gStability, leftTopCell,     0).x;
                    uint rightTopPartStable    = uint(nonRightTopEdge)    * texelFetch(gStability, rightTopCell,    0).x;
                    uint leftBottomPartStable  = uint(nonLeftBottomEdge)  * texelFetch(gStability, leftBottomCell,  0).x;
                    uint rightBottomPartStable = uint(nonRightBottomEdge) * texelFetch(gStability, rightBottomCell, 0).x;

                    uvec4 edgeStable   = uvec4(leftPartStable,    topPartStable,      rightPartStable,       bottomPartStable);
                    uvec4 cornerStable = uvec4(leftTopPartStable, rightTopPartStable, rightBottomPartStable, leftBottomPartStable);
    
                    uvec4 emptyCornerStabilityCandidate = uvec4(emptyCornerRule(stabilityValue, edgeStable, cornerStable)) * edgeStable;
    
                    uvec4 regionBStabilityCandidate = uvec4(regBRule(stabilityValue, edgeStable, cornerStable)) * stabilityValue;
                    uvec4 regionIStabilityCandidate = uvec4(regIRule(stabilityValue, edgeStable, cornerStable)) * stabilityValue;
    
                    uvec4 regionYTopRightStabilityCandidate   = uvec4(regYTopRightRule(stabilityValue, edgeStable, cornerStable))   * stabilityValue;
                    uvec4 regionYBottomLeftStabilityCandidate = uvec4(regYBottomLeftRule(stabilityValue, edgeStable, cornerStable)) * stabilityValue;
    
                    uvec4 regionVStabilityCandidate = uvec4(regVRule(stabilityValue, edgeStable, cornerStable)) * stabilityValue;
    
                    uvec4 resBStability           = max(regionBStabilityCandidate,           emptyCornerStabilityCandidate.xyzw);
                    uvec4 resYTopRightStability   = max(regionYTopRightStabilityCandidate,   emptyCornerStabilityCandidate.xyyz);
                    uvec4 resYBottomLeftStability = max(regionYBottomLeftStabilityCandidate, emptyCornerStabilityCandidate.zwwx);
                    uvec4 resVStability           = max(regionVStabilityCandidate,           emptyCornerStabilityCandidate.xyzw);
    
                    mediump float regGStabilityPower           = float(stabilityValue           ) *      domainFactor;
                    mediump vec4  regIStabilityPower           = vec4( regionIStabilityCandidate) * xxxx(domainFactor);
                    mediump vec4  regBStabilityPower           = vec4( resBStability            ) * xxxx(domainFactor);
                    mediump vec4  regYTopRightStabilityPower   = vec4( resYTopRightStability    ) * xxxx(domainFactor);
                    mediump vec4  regYBottomLeftStabilityPower = vec4( resYBottomLeftStability  ) * xxxx(domainFactor);
                    mediump vec4  regVStabilityPower           = vec4( resVStability            ) * xxxx(domainFactor);
    
                    mediump float stablePower =    float(insideG)      *     regGStabilityPower;
                    stablePower              += dot(vec4(insideB),           regBStabilityPower);
                    stablePower              += dot(vec4(insideI),           regIStabilityPower); 
                    stablePower              += dot(vec4(insideYTopRight),   regYTopRightStabilityPower);
                    stablePower              += dot(vec4(insideYBottomLeft), regYBottomLeftStabilityPower); 
                    stablePower              += dot(vec4(insideV),           regVStabilityPower);
                    
                    outColor = mix(outColor, colorStable, stablePower);
                }
            }
            else
            {
                outColor = gColorBetween;
            }
        }`;

        //https://lightstrout.com/blog/2019/05/21/raindrops-render-mode/
        const raindropsFsSource = 
        `#version 300 es

        #define FLAG_SHOW_SOLUTION  0x01
        #define FLAG_SHOW_STABILITY 0x02
        #define FLAG_TOROID_RENDER  0x04

        uniform int gBoardSize;
        uniform int gCellSize;
        uniform int gDomainSize;
        uniform int gFlags;

        uniform int gImageWidth;
        uniform int gImageHeight;
        uniform int gViewportOffsetX;
        uniform int gViewportOffsetY;
 
        uniform lowp vec4 gColorNone;
        uniform lowp vec4 gColorEnabled;
        uniform lowp vec4 gColorSolved;
        uniform lowp vec4 gColorBetween;

        uniform highp usampler2D gBoard;
        uniform highp usampler2D gSolution;
        uniform highp usampler2D gStability;

        layout(location = 0) out lowp vec4 outColor;

        ivec2 xx(int x) //Simulating HLSL's .xx
        {
            return ivec2(x, x);
        }

        uvec4 xxxx(uint x) //Simulating HLSL's .xxxx
        {
            return uvec4(x, x, x, x);
        }
    
        bvec4 u4eq(uvec4 a, uvec4 b) //Another thing that doesn't require writing functions in hlsl
        {
            return bvec4(a.x == b.x, a.y == b.y, a.z == b.z, a.w == b.w);
        }

        bvec4 b4or(bvec4 a, bvec4 b) //Yet another thing that doesn't require writing functions in hlsl
        {
            return bvec4(a.x || b.x, a.y || b.y, a.z || b.z, a.w || b.w);
        }

        bvec4 emptyCornerRule(uvec4 edgeValue)
        {
            return u4eq(edgeValue.xyzw, edgeValue.yzwx);
        }

        bvec4 cornerRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            bvec4 res = bvec4(false, false, false, false);

            uvec4 cellValuexxxx = xxxx(cellValue);
            
            res = b4or(res, u4eq(cellValuexxxx, cornerValue.xyzw));
            res = b4or(res, u4eq(cellValuexxxx, edgeValue.xyzw));
            res = b4or(res, u4eq(cellValuexxxx, edgeValue.yzwx));

            return res;
        }

        void main(void)
        {
            ivec2 screenPos = ivec2(int(gl_FragCoord.x) - gViewportOffsetX, gImageHeight - int(gl_FragCoord.y) - 1 + gViewportOffsetY);

            if((screenPos.x % gCellSize != 0) && (screenPos.y % gCellSize != 0)) //Inside the cell
            {
                ivec2 cellSizexx = xx(gCellSize);

                highp ivec2 cellNumber = screenPos.xy / cellSizexx;
                uint        cellValue  = texelFetch(gBoard, cellNumber, 0).x;

                mediump vec2  cellCoord    = (vec2(screenPos.xy) - vec2(cellNumber * cellSizexx) - vec2(cellSizexx) / 2.0f);
                mediump float circleRadius = float(gCellSize - 1) / 2.0f;
                
                mediump float domainFactor = 1.0f / float(gDomainSize - 1);

                ivec2 leftCell        = cellNumber + ivec2(-1,  0);
                ivec2 rightCell       = cellNumber + ivec2( 1,  0);
                ivec2 topCell         = cellNumber + ivec2( 0, -1);
                ivec2 bottomCell      = cellNumber + ivec2( 0,  1);
                ivec2 leftTopCell     = cellNumber + ivec2(-1, -1);
                ivec2 rightTopCell    = cellNumber + ivec2( 1, -1);
                ivec2 leftBottomCell  = cellNumber + ivec2(-1,  1);
                ivec2 rightBottomCell = cellNumber + ivec2( 1,  1);
        
                bool insideCircle      = (dot(cellCoord, cellCoord) < circleRadius * circleRadius);
                bool insideTopLeft     = !insideCircle && cellCoord.x <= 0.0f && cellCoord.y <= 0.0f;
                bool insideTopRight    = !insideCircle && cellCoord.x >= 0.0f && cellCoord.y <= 0.0f;
                bool insideBottomRight = !insideCircle && cellCoord.x >= 0.0f && cellCoord.y >= 0.0f;
                bool insideBottomLeft  = !insideCircle && cellCoord.x <= 0.0f && cellCoord.y >= 0.0f;
        
                bvec4 insideCorner = bvec4(insideTopLeft, insideTopRight, insideBottomRight, insideBottomLeft);

                bool nonLeftEdge        = cellNumber.x > 0;
                bool nonRightEdge       = cellNumber.x < gBoardSize - 1;
                bool nonTopEdge         =                                  cellNumber.y > 0;
                bool nonBottomEdge      =                                  cellNumber.y < gBoardSize - 1;
                bool nonLeftTopEdge     = cellNumber.x > 0              && cellNumber.y > 0;
                bool nonRightTopEdge    = cellNumber.x < gBoardSize - 1 && cellNumber.y > 0;
                bool nonLeftBottomEdge  = cellNumber.x > 0              && cellNumber.y < gBoardSize - 1;
                bool nonRightBottomEdge = cellNumber.x < gBoardSize - 1 && cellNumber.y < gBoardSize - 1;

                if((gFlags & FLAG_TOROID_RENDER) != 0)
                {
                    ivec2 boardSizexx = xx(gBoardSize);

                    nonLeftEdge        = true;
                    nonRightEdge       = true;
                    nonTopEdge         = true;
                    nonBottomEdge      = true;
                    nonLeftTopEdge     = true;
                    nonRightTopEdge    = true;
                    nonLeftBottomEdge  = true;
                    nonRightBottomEdge = true;
        
                    const uint maxCheckDistance = 1u; //Different for different render modes

                    uvec2 leftCellU        = uvec2(leftCell)        + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 rightCellU       = uvec2(rightCell)       + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 topCellU         = uvec2(topCell)         + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 bottomCellU      = uvec2(bottomCell)      + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 leftTopCellU     = uvec2(leftTopCell)     + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 rightTopCellU    = uvec2(rightTopCell)    + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 leftBottomCellU  = uvec2(leftBottomCell)  + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 rightBottomCellU = uvec2(rightBottomCell) + uvec2(boardSizexx) * maxCheckDistance;

                    leftCell        = ivec2(leftCellU        % uvec2(boardSizexx));
                    rightCell       = ivec2(rightCellU       % uvec2(boardSizexx));
                    topCell         = ivec2(topCellU         % uvec2(boardSizexx));
                    bottomCell      = ivec2(bottomCellU      % uvec2(boardSizexx));
                    leftTopCell     = ivec2(leftTopCellU     % uvec2(boardSizexx));
                    rightTopCell    = ivec2(rightTopCellU    % uvec2(boardSizexx));
                    leftBottomCell  = ivec2(leftBottomCellU  % uvec2(boardSizexx));
                    rightBottomCell = ivec2(rightBottomCellU % uvec2(boardSizexx));
                }

                uint leftPartValue        = uint(nonLeftEdge)        * texelFetch(gBoard, leftCell,        0).x;
                uint rightPartValue       = uint(nonRightEdge)       * texelFetch(gBoard, rightCell,       0).x;
                uint topPartValue         = uint(nonTopEdge)         * texelFetch(gBoard, topCell,         0).x;
                uint bottomPartValue      = uint(nonBottomEdge)      * texelFetch(gBoard, bottomCell,      0).x;
                uint leftTopPartValue     = uint(nonLeftTopEdge)     * texelFetch(gBoard, leftTopCell,     0).x;
                uint rightTopPartValue    = uint(nonRightTopEdge)    * texelFetch(gBoard, rightTopCell,    0).x;
                uint leftBottomPartValue  = uint(nonLeftBottomEdge)  * texelFetch(gBoard, leftBottomCell,  0).x;
                uint rightBottomPartValue = uint(nonRightBottomEdge) * texelFetch(gBoard, rightBottomCell, 0).x;

                uvec4 edgeValue   = uvec4(leftPartValue,    topPartValue,      rightPartValue,       bottomPartValue);
                uvec4 cornerValue = uvec4(leftTopPartValue, rightTopPartValue, rightBottomPartValue, leftBottomPartValue);

                uvec4 emptyCornerCandidate = uvec4(emptyCornerRule(edgeValue))                    * edgeValue;
                uvec4 cornerCandidate      = uvec4(cornerRule(cellValue, edgeValue, cornerValue)) * cellValue;

                uvec4 resCorner = max(emptyCornerCandidate, cornerCandidate);

                mediump float  cellPower = float(cellValue) * domainFactor;		
                mediump vec4 cornerPower =  vec4(resCorner) * domainFactor;

                mediump float enablePower = cellPower * float(insideCircle) + dot(cornerPower, vec4(insideCorner));
                outColor                  = mix(gColorNone, gColorEnabled, enablePower);

                if((gFlags & FLAG_SHOW_SOLUTION) != 0)
                {
		            uint solutionValue = texelFetch(gSolution, cellNumber, 0).x;
        
                    uint leftPartSolved        = uint(nonLeftEdge)        * texelFetch(gSolution, leftCell,        0).x;
                    uint rightPartSolved       = uint(nonRightEdge)       * texelFetch(gSolution, rightCell,       0).x;
                    uint topPartSolved         = uint(nonTopEdge)         * texelFetch(gSolution, topCell,         0).x;
                    uint bottomPartSolved      = uint(nonBottomEdge)      * texelFetch(gSolution, bottomCell,      0).x;
                    uint leftTopPartSolved     = uint(nonLeftTopEdge)     * texelFetch(gSolution, leftTopCell,     0).x;
                    uint rightTopPartSolved    = uint(nonRightTopEdge)    * texelFetch(gSolution, rightTopCell,    0).x;
                    uint leftBottomPartSolved  = uint(nonLeftBottomEdge)  * texelFetch(gSolution, leftBottomCell,  0).x;
                    uint rightBottomPartSolved = uint(nonRightBottomEdge) * texelFetch(gSolution, rightBottomCell, 0).x;

                    uvec4 edgeSolved   = uvec4(leftPartSolved,    topPartSolved,      rightPartSolved,       bottomPartSolved);
                    uvec4 cornerSolved = uvec4(leftTopPartSolved, rightTopPartSolved, rightBottomPartSolved, leftBottomPartSolved);

                    uvec4 emptyCornerSolutionCandidate = uvec4(emptyCornerRule(edgeSolved))                         * edgeSolved;
                    uvec4 cornerSolutionCandidate      = uvec4(cornerRule(solutionValue, edgeSolved, cornerSolved)) * solutionValue;

                    uvec4 resCornerSolved = max(emptyCornerSolutionCandidate, cornerSolutionCandidate);
        
                    mediump float      solutionPower =  float(solutionValue) * domainFactor;		
                    mediump vec4 cornerSolutionPower = vec4(resCornerSolved) * domainFactor;

                    mediump float solvedPower = solutionPower * float(insideCircle) + dot(cornerSolutionPower, vec4(insideCorner));
                    outColor                  = mix(outColor, gColorSolved, solvedPower);
                }
                else if((gFlags & FLAG_SHOW_STABILITY) != 0)
                {
        			uint stableValue = texelFetch(gStability, cellNumber, 0).x;

			        lowp vec4 colorStable = vec4(1.0f, 1.0f, 1.0f, 1.0f) - gColorEnabled;
                    colorStable.a = 1.0f;

                    uint leftPartStable        = uint(nonLeftEdge)        * texelFetch(gStability, leftCell,        0).x;
                    uint rightPartStable       = uint(nonRightEdge)       * texelFetch(gStability, rightCell,       0).x;
                    uint topPartStable         = uint(nonTopEdge)         * texelFetch(gStability, topCell,         0).x;
                    uint bottomPartStable      = uint(nonBottomEdge)      * texelFetch(gStability, bottomCell,      0).x;
                    uint leftTopPartStable     = uint(nonLeftTopEdge)     * texelFetch(gStability, leftTopCell,     0).x;
                    uint rightTopPartStable    = uint(nonRightTopEdge)    * texelFetch(gStability, rightTopCell,    0).x;
                    uint leftBottomPartStable  = uint(nonLeftBottomEdge)  * texelFetch(gStability, leftBottomCell,  0).x;
                    uint rightBottomPartStable = uint(nonRightBottomEdge) * texelFetch(gStability, rightBottomCell, 0).x;

                    uvec4 edgeStable   = uvec4(leftPartStable,    topPartStable,      rightPartStable,       bottomPartStable);
                    uvec4 cornerStable = uvec4(leftTopPartStable, rightTopPartStable, rightBottomPartStable, leftBottomPartStable);
        
                    uvec4 emptyCornerStabilityCandidate = uvec4(emptyCornerRule(edgeStable))                       * edgeStable;
                    uvec4 cornerStabilityCandidate      = uvec4(cornerRule(stableValue, edgeStable, cornerStable)) * stableValue;
        
                    uvec4 resCornerStable = max(emptyCornerStabilityCandidate, cornerStabilityCandidate);
        
                    mediump float      stabilityPower =    float(stableValue) * domainFactor;		
                    mediump vec4 cornerStabilityPower = vec4(resCornerStable) * domainFactor;
        
                    mediump float stablePower = stabilityPower * float(insideCircle) + dot(cornerStabilityPower, vec4(insideCorner));
                    outColor                  = mix(outColor, colorStable, stablePower);
                }
            }
            else
            {
                outColor = gColorBetween;
            }
        }`;

        //https://lightstrout.com/blog/2019/05/21/chains-render-mode/
        const chainsFsSource = 
        `#version 300 es

        #define FLAG_SHOW_SOLUTION  0x01
        #define FLAG_SHOW_STABILITY 0x02
        #define FLAG_TOROID_RENDER  0x04

        uniform int gBoardSize;
        uniform int gCellSize;
        uniform int gDomainSize;
        uniform int gFlags;

        uniform int gImageWidth;
        uniform int gImageHeight;
        uniform int gViewportOffsetX;
        uniform int gViewportOffsetY;
 
        uniform lowp vec4 gColorNone;
        uniform lowp vec4 gColorEnabled;
        uniform lowp vec4 gColorSolved;
        uniform lowp vec4 gColorBetween;

        uniform highp usampler2D gBoard;
        uniform highp usampler2D gSolution;
        uniform highp usampler2D gStability;

        layout(location = 0) out lowp vec4 outColor;

        bvec2 xx(bool b) //Simulating HLSL
        {
            return bvec2(b, b);
        }

        ivec2 xx(int i) //Simulating HLSL
        {
            return ivec2(i, i);
        }

        uvec2 xx(uint u) //Simulating HLSL
        {
            return uvec2(u, u);
        }

        mediump vec2 xx(mediump float f) //Simulating HLSL
        {
            return vec2(f, f);
        }

        bvec4 xxxx(bool b) //Simulating HLSL again
        {
            return bvec4(b, b, b, b);
        }

        uvec4 xxxx(uint x) //Simulating HLSL's .xxxx yet again
        {
            return uvec4(x, x, x, x);
        }

        mediump vec4 xxxx(mediump float f)
        {
            return vec4(f, f, f, f);
        }

        bvec4 u4eq(uvec4 a, uvec4 b) //Another thing that doesn't require writing functions in hlsl
        {
            return bvec4(a.x == b.x, a.y == b.y, a.z == b.z, a.w == b.w);
        }

        bvec2 u2eq(uvec2 a, uvec2 b) //Another thing that doesn't require writing functions in hlsl
        {
            return bvec2(a.x == b.x, a.y == b.y);
        }

        bvec4 b4or(bvec4 a, bvec4 b) //Yet another thing that doesn't require writing functions in hlsl
        {
            return bvec4(a.x || b.x, a.y || b.y, a.z || b.z, a.w || b.w);
        }

        bvec4 b4nd(bvec4 a, bvec4 b) //Yet another thing that doesn't require writing functions in hlsl
        {
            return bvec4(a.x && b.x, a.y && b.y, a.z && b.z, a.w && b.w);
        }

        bvec2 b2nd(bvec2 a, bvec2 b) //Yet another thing that doesn't require writing functions in hlsl
        {
            return bvec2(a.x && b.x, a.y && b.y);
        }

        bvec4 b4nd(bvec4 a, bvec4 b, bvec4 c) //No, they are not kidding
        {
            return bvec4(a.x && b.x && c.x, a.y && b.y && c.y, a.z && b.z && c.z, a.w && b.w && c.w);
        }

        bvec2 b2nd(bvec2 a, bvec2 b, bvec2 c) //For Christ's sake
        {
            return bvec2(a.x && b.x && c.x, a.y && b.y && c.y);
        }

        bool b1nd(bool a, bool b, bool c) //And that's what happens when you want the code which is both uniform-looking and working
        {
            return a && b && c;
        }

        bvec4 emptyCornerRule(uvec4 edgeValue)
        {
            return u4eq(edgeValue.xyzw, edgeValue.yzwx);
        }

        bvec4 cornerRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            bvec4 res = bvec4(false, false, false, false);
            
            uvec4 cellValuexxxx = xxxx(cellValue);

            res = b4or(res, u4eq(cellValuexxxx, cornerValue.xyzw));
            res = b4or(res, u4eq(cellValuexxxx, edgeValue.xyzw));
            res = b4or(res, u4eq(cellValuexxxx, edgeValue.yzwx));

            return res;
        }

        bvec2 linkRule(uvec4 edgeValue)
        {
            return u2eq(edgeValue.xy, edgeValue.zw);
        }

        bvec4 slimEdgeRule(uint cellValue, uvec4 edge2Value)
        {
            uvec4 cellValuexxxx = xxxx(cellValue);
            return u4eq(cellValuexxxx, edge2Value.xyzw);
        }

        void main(void)
        {
            ivec2 screenPos = ivec2(int(gl_FragCoord.x) - gViewportOffsetX, gImageHeight - int(gl_FragCoord.y) - 1 + gViewportOffsetY);

            if((screenPos.x % gCellSize != 0) && (screenPos.y % gCellSize != 0)) //Inside the cell
            {
                ivec2 cellSizexx = xx(gCellSize);

                highp ivec2 cellNumber = screenPos.xy / cellSizexx;
                uint        cellValue  = texelFetch(gBoard, cellNumber, 0).x;

                mediump vec2  cellCoord       = (vec2(screenPos.xy) - vec2(cellNumber * cellSizexx) - vec2(cellSizexx) / 2.0f);
                mediump float circleRadius    = float(gCellSize - 1) / 2.0f;
                mediump float circleRadiusBig = float(gCellSize - 1);
                mediump float domainFactor    = 1.0f / float(gDomainSize - 1);

                mediump vec2 cellCoordLeft        = cellCoord + vec2(float( gCellSize),              0.0f);
                mediump vec2 cellCoordRight       = cellCoord + vec2(float(-gCellSize),              0.0f);
                mediump vec2 cellCoordTop         = cellCoord + vec2(             0.0f, float( gCellSize));
                mediump vec2 cellCoordBottom      = cellCoord + vec2(             0.0f, float(-gCellSize));

                bool insideCircle     = (dot(      cellCoord,       cellCoord) < circleRadius    * circleRadius);
                bool insideCircleBigL = (dot(  cellCoordLeft,   cellCoordLeft) < circleRadiusBig * circleRadiusBig);
                bool insideCircleBigR = (dot( cellCoordRight,  cellCoordRight) < circleRadiusBig * circleRadiusBig);
                bool insideCircleBigT = (dot(   cellCoordTop,    cellCoordTop) < circleRadiusBig * circleRadiusBig);
                bool insideCircleBigB = (dot(cellCoordBottom, cellCoordBottom) < circleRadiusBig * circleRadiusBig);

                bool insideTopLeft     = !insideCircle && cellCoord.x <= 0.0f && cellCoord.y <= 0.0f;
                bool insideTopRight    = !insideCircle && cellCoord.x >= 0.0f && cellCoord.y <= 0.0f;
                bool insideBottomRight = !insideCircle && cellCoord.x >= 0.0f && cellCoord.y >= 0.0f;
                bool insideBottomLeft  = !insideCircle && cellCoord.x <= 0.0f && cellCoord.y >= 0.0f;

                bvec4 insideCircleBig = bvec4(insideCircleBigL, insideCircleBigT, insideCircleBigR,  insideCircleBigB);
                bvec4 insideCorner    = bvec4(insideTopLeft,    insideTopRight,   insideBottomRight, insideBottomLeft);

                bool insideLinkH = !insideCircleBigT && !insideCircleBigB;
                bool insideLinkV = !insideCircleBigL && !insideCircleBigR;

                bvec2 insideLink      = bvec2(insideLinkH, insideLinkV);
                bool  insideBothLinks = insideLinkV && insideLinkH;

                bvec4 insideSlimEdgeTopRightPart   = b4nd(insideLink.xyyx, insideCorner.xxyy);
                bvec4 insideSlimEdgeBottomLeftPart = b4nd(insideLink.xyyx, insideCorner.zzww);

                bvec2 insideCenterLink = b2nd(insideLink,   xx(   insideCircle), xx(  !insideBothLinks));
                bool  insideFreeCircle = b1nd(insideCircle,      !insideLinkV  ,      !insideLinkH);
                bvec4 insideFreeCorner = b4nd(insideCorner, xxxx(!insideLinkH ), xxxx(!insideLinkV));

                ivec2 leftCell        = cellNumber + ivec2(-1,  0);
                ivec2 rightCell       = cellNumber + ivec2( 1,  0);
                ivec2 topCell         = cellNumber + ivec2( 0, -1);
                ivec2 bottomCell      = cellNumber + ivec2( 0,  1);
                ivec2 leftTopCell     = cellNumber + ivec2(-1, -1);
                ivec2 rightTopCell    = cellNumber + ivec2( 1, -1);
                ivec2 leftBottomCell  = cellNumber + ivec2(-1,  1);
                ivec2 rightBottomCell = cellNumber + ivec2( 1,  1);
                ivec2 left2Cell       = cellNumber + ivec2(-2,  0);
                ivec2 right2Cell      = cellNumber + ivec2( 2,  0);
                ivec2 top2Cell        = cellNumber + ivec2( 0, -2);
                ivec2 bottom2Cell     = cellNumber + ivec2( 0,  2);

                bool nonLeftEdge        = cellNumber.x > 0;
                bool nonRightEdge       = cellNumber.x < gBoardSize - 1;
                bool nonTopEdge         =                                  cellNumber.y > 0;
                bool nonBottomEdge      =                                  cellNumber.y < gBoardSize - 1;
                bool nonLeftTopEdge     = cellNumber.x > 0              && cellNumber.y > 0;
                bool nonRightTopEdge    = cellNumber.x < gBoardSize - 1 && cellNumber.y > 0;
                bool nonLeftBottomEdge  = cellNumber.x > 0              && cellNumber.y < gBoardSize - 1;
                bool nonRightBottomEdge = cellNumber.x < gBoardSize - 1 && cellNumber.y < gBoardSize - 1;
                bool nonLeft2Edge       = cellNumber.x > 1;
                bool nonRight2Edge      = cellNumber.x < gBoardSize - 2;
                bool nonTop2Edge        =                                  cellNumber.y > 1;
                bool nonBottom2Edge     =                                  cellNumber.y < gBoardSize - 2;

                if((gFlags & FLAG_TOROID_RENDER) != 0)
                {
                    ivec2 boardSizexx = xx(gBoardSize);

                    nonLeftEdge        = true;
                    nonRightEdge       = true;
                    nonTopEdge         = true;
                    nonBottomEdge      = true;
                    nonLeftTopEdge     = true;
                    nonRightTopEdge    = true;
                    nonLeftBottomEdge  = true;
                    nonRightBottomEdge = true;
                    nonLeft2Edge       = true;
                    nonRight2Edge      = true;
                    nonTop2Edge        = true;
                    nonBottom2Edge     = true;
        
                    const uint maxCheckDistance = 2u; //Different for different render modes

                    uvec2 leftCellU        = uvec2(leftCell)        + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 rightCellU       = uvec2(rightCell)       + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 topCellU         = uvec2(topCell)         + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 bottomCellU      = uvec2(bottomCell)      + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 leftTopCellU     = uvec2(leftTopCell)     + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 rightTopCellU    = uvec2(rightTopCell)    + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 leftBottomCellU  = uvec2(leftBottomCell)  + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 rightBottomCellU = uvec2(rightBottomCell) + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 left2CellU       = uvec2(left2Cell)       + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 right2CellU      = uvec2(right2Cell)      + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 top2CellU        = uvec2(top2Cell)        + uvec2(boardSizexx) * maxCheckDistance;
                    uvec2 bottom2CellU     = uvec2(bottom2Cell)     + uvec2(boardSizexx) * maxCheckDistance;

                    leftCell        = ivec2(leftCellU        % uvec2(boardSizexx));
                    rightCell       = ivec2(rightCellU       % uvec2(boardSizexx));
                    topCell         = ivec2(topCellU         % uvec2(boardSizexx));
                    bottomCell      = ivec2(bottomCellU      % uvec2(boardSizexx));
                    leftTopCell     = ivec2(leftTopCellU     % uvec2(boardSizexx));
                    rightTopCell    = ivec2(rightTopCellU    % uvec2(boardSizexx));
                    leftBottomCell  = ivec2(leftBottomCellU  % uvec2(boardSizexx));
                    rightBottomCell = ivec2(rightBottomCellU % uvec2(boardSizexx));
                    left2Cell       = ivec2(left2CellU       % uvec2(boardSizexx));
                    right2Cell      = ivec2(right2CellU      % uvec2(boardSizexx));
                    top2Cell        = ivec2(top2CellU        % uvec2(boardSizexx));
                    bottom2Cell     = ivec2(bottom2CellU     % uvec2(boardSizexx));
                }

                uint leftPartValue        = uint(nonLeftEdge)        * texelFetch(gBoard, leftCell,        0).x;
                uint rightPartValue       = uint(nonRightEdge)       * texelFetch(gBoard, rightCell,       0).x;
                uint topPartValue         = uint(nonTopEdge)         * texelFetch(gBoard, topCell,         0).x;
                uint bottomPartValue      = uint(nonBottomEdge)      * texelFetch(gBoard, bottomCell,      0).x;
                uint leftTopPartValue     = uint(nonLeftTopEdge)     * texelFetch(gBoard, leftTopCell,     0).x;
                uint rightTopPartValue    = uint(nonRightTopEdge)    * texelFetch(gBoard, rightTopCell,    0).x;
                uint leftBottomPartValue  = uint(nonLeftBottomEdge)  * texelFetch(gBoard, leftBottomCell,  0).x;
                uint rightBottomPartValue = uint(nonRightBottomEdge) * texelFetch(gBoard, rightBottomCell, 0).x;
                uint left2PartValue       = uint(nonLeft2Edge)       * texelFetch(gBoard, left2Cell,       0).x;
                uint right2PartValue      = uint(nonRight2Edge)      * texelFetch(gBoard, right2Cell,      0).x;
                uint top2PartValue        = uint(nonTop2Edge)        * texelFetch(gBoard, top2Cell,        0).x;
                uint bottom2PartValue     = uint(nonBottom2Edge)     * texelFetch(gBoard, bottom2Cell,     0).x;

                uvec4 edgeValue   = uvec4(leftPartValue,    topPartValue,      rightPartValue,       bottomPartValue);
                uvec4 cornerValue = uvec4(leftTopPartValue, rightTopPartValue, rightBottomPartValue, leftBottomPartValue);
                uvec4 edge2Value  = uvec4(left2PartValue,   top2PartValue,     right2PartValue,      bottom2PartValue);

                uint centerCandidate = cellValue;

                uvec4 emptyCornerCandidate = uvec4(emptyCornerRule(edgeValue)                   ) * edgeValue;
                uvec4 cornerCandidate      = uvec4(cornerRule(cellValue, edgeValue, cornerValue)) * cellValue;

                uvec2 linkCandidate     = uvec2(linkRule(edgeValue)                ) *      edgeValue.xy;
                uvec4 slimEdgeCandidate = uvec4(slimEdgeRule(cellValue, edge2Value)) * xxxx(cellValue);

                uvec4 resCorner                  = max(cornerCandidate, emptyCornerCandidate);
                uvec4 resSlimCornerTopRightPart  = max(resCorner.xxyy, slimEdgeCandidate.xyyz);
                uvec4 resSlimCornerBotomLeftPart = max(resCorner.zzww, slimEdgeCandidate.zwwx);

                uvec2 resLink     = max(linkCandidate, xx(centerCandidate));
                uint  resMidLinks = max(resLink.x,     resLink.y);

                mediump float cellPower           = float(cellValue                 ) *      domainFactor;
                mediump vec4  cornerPower         = vec4( resCorner                 ) * xxxx(domainFactor);
                mediump vec4  slimTopRightPower   = vec4( resSlimCornerTopRightPart ) * xxxx(domainFactor);
                mediump vec4  slimBottomLeftPower = vec4( resSlimCornerBotomLeftPart) * xxxx(domainFactor);
                mediump vec2  linkPower           = vec2( resLink                   ) *   xx(domainFactor);
                mediump float midPower            = float(resMidLinks               ) *      domainFactor;

                mediump float enablePower =    float(insideFreeCircle)      *       cellPower;
                enablePower              += dot(vec4(insideFreeCorner),             cornerPower);
                enablePower              += dot(vec4(insideSlimEdgeTopRightPart),   slimTopRightPower); 
                enablePower              += dot(vec4(insideSlimEdgeBottomLeftPart), slimBottomLeftPower);
                enablePower              += dot(vec2(insideCenterLink),             linkPower); 
                enablePower              +=    float(insideBothLinks)       *       midPower;

                outColor = mix(gColorNone, gColorEnabled, enablePower);

                if((gFlags & FLAG_SHOW_SOLUTION) != 0)
                {
		            uint solutionValue = texelFetch(gSolution, cellNumber, 0).x;
        
                    uint leftPartSolved        = uint(nonLeftEdge)        * texelFetch(gSolution, leftCell,        0).x;
                    uint rightPartSolved       = uint(nonRightEdge)       * texelFetch(gSolution, rightCell,       0).x;
                    uint topPartSolved         = uint(nonTopEdge)         * texelFetch(gSolution, topCell,         0).x;
                    uint bottomPartSolved      = uint(nonBottomEdge)      * texelFetch(gSolution, bottomCell,      0).x;
                    uint leftTopPartSolved     = uint(nonLeftTopEdge)     * texelFetch(gSolution, leftTopCell,     0).x;
                    uint rightTopPartSolved    = uint(nonRightTopEdge)    * texelFetch(gSolution, rightTopCell,    0).x;
                    uint leftBottomPartSolved  = uint(nonLeftBottomEdge)  * texelFetch(gSolution, leftBottomCell,  0).x;
                    uint rightBottomPartSolved = uint(nonRightBottomEdge) * texelFetch(gSolution, rightBottomCell, 0).x;
                    uint left2PartSolved       = uint(nonLeft2Edge)       * texelFetch(gSolution, left2Cell,       0).x;
                    uint right2PartSolved      = uint(nonRight2Edge)      * texelFetch(gSolution, right2Cell,      0).x;
                    uint top2PartSolved        = uint(nonTop2Edge)        * texelFetch(gSolution, top2Cell,        0).x;
                    uint bottom2PartSolved     = uint(nonBottom2Edge)     * texelFetch(gSolution, bottom2Cell,     0).x;

                    uvec4 edgeSolved   = uvec4(leftPartSolved,    topPartSolved,      rightPartSolved,       bottomPartSolved);
                    uvec4 cornerSolved = uvec4(leftTopPartSolved, rightTopPartSolved, rightBottomPartSolved, leftBottomPartSolved);
                    uvec4 edge2Solved  = uvec4(left2PartSolved,   top2PartSolved,     right2PartSolved,      bottom2PartSolved);

                    uint centerSolutionCandidate = solutionValue;

                    uvec4 emptyCornerSolutionCandidate = uvec4(emptyCornerRule(edgeSolved)                        ) * edgeSolved;
                    uvec4 cornerSolutionCandidate      = uvec4(cornerRule(solutionValue, edgeSolved, cornerSolved)) * solutionValue;
        
                    uvec2 linkSolutionCandidate     = uvec2(linkRule(edgeSolved)                    ) *      edgeSolved.xy;
                    uvec4 slimEdgeSolutionCandidate = uvec4(slimEdgeRule(solutionValue, edge2Solved)) * xxxx(solutionValue);
        
                    uvec4 resCornerSolution                  = max(cornerSolutionCandidate, emptyCornerSolutionCandidate);
                    uvec4 resSlimCornerTopRightPartSolution  = max(resCornerSolution.xxyy,  slimEdgeSolutionCandidate.xyyz);
                    uvec4 resSlimCornerBotomLeftPartSolution = max(resCornerSolution.zzww,  slimEdgeSolutionCandidate.zwwx);
        
                    uvec2 resLinkSolution     = max(linkSolutionCandidate, xx(centerSolutionCandidate));
                    uint  resMidLinksSolution = max(resLinkSolution.x,     resLinkSolution.y);
        
                    mediump float cellSolutionPower           = float(solutionValue                     ) *      domainFactor;
                    mediump vec4  cornerSolutionPower         = vec4( resCornerSolution                 ) * xxxx(domainFactor);
                    mediump vec4  slimTopRightSolutionPower   = vec4( resSlimCornerTopRightPartSolution ) * xxxx(domainFactor);
                    mediump vec4  slimBottomLeftSolutionPower = vec4( resSlimCornerBotomLeftPartSolution) * xxxx(domainFactor);
                    mediump vec2  linkSolutionPower           = vec2( resLinkSolution                   ) *   xx(domainFactor);
                    mediump float midSolutionPower            = float(resMidLinksSolution               ) *      domainFactor;

                    mediump float solvedPower =    float(insideFreeCircle)      *       cellSolutionPower;
                    solvedPower              += dot(vec4(insideFreeCorner),             cornerSolutionPower);
                    solvedPower              += dot(vec4(insideSlimEdgeTopRightPart),   slimTopRightSolutionPower); 
                    solvedPower              += dot(vec4(insideSlimEdgeBottomLeftPart), slimBottomLeftSolutionPower);
                    solvedPower              += dot(vec2(insideCenterLink),             linkSolutionPower); 
                    solvedPower              +=    float(insideBothLinks)       *       midSolutionPower;

                    outColor = mix(outColor, gColorSolved, solvedPower);
                }
                else if((gFlags & FLAG_SHOW_STABILITY) != 0)
                {
        			uint stabilityValue = texelFetch(gStability, cellNumber, 0).x;

			        lowp vec4 colorStable = vec4(1.0f, 1.0f, 1.0f, 1.0f) - gColorEnabled;
                    colorStable.a = 1.0f;

                    uint leftPartStable        = uint(nonLeftEdge)        * texelFetch(gStability, leftCell,        0).x;
                    uint rightPartStable       = uint(nonRightEdge)       * texelFetch(gStability, rightCell,       0).x;
                    uint topPartStable         = uint(nonTopEdge)         * texelFetch(gStability, topCell,         0).x;
                    uint bottomPartStable      = uint(nonBottomEdge)      * texelFetch(gStability, bottomCell,      0).x;
                    uint leftTopPartStable     = uint(nonLeftTopEdge)     * texelFetch(gStability, leftTopCell,     0).x;
                    uint rightTopPartStable    = uint(nonRightTopEdge)    * texelFetch(gStability, rightTopCell,    0).x;
                    uint leftBottomPartStable  = uint(nonLeftBottomEdge)  * texelFetch(gStability, leftBottomCell,  0).x;
                    uint rightBottomPartStable = uint(nonRightBottomEdge) * texelFetch(gStability, rightBottomCell, 0).x;
                    uint left2PartStable       = uint(nonLeft2Edge)       * texelFetch(gStability, left2Cell,       0).x;
                    uint right2PartStable      = uint(nonRight2Edge)      * texelFetch(gStability, right2Cell,      0).x;
                    uint top2PartStable        = uint(nonTop2Edge)        * texelFetch(gStability, top2Cell,        0).x;
                    uint bottom2PartStable     = uint(nonBottom2Edge)     * texelFetch(gStability, bottom2Cell,     0).x;

                    uvec4 edgeStable   = uvec4(leftPartStable,    topPartStable,      rightPartStable,       bottomPartStable);
                    uvec4 cornerStable = uvec4(leftTopPartStable, rightTopPartStable, rightBottomPartStable, leftBottomPartStable);
                    uvec4 edge2Stable  = uvec4(left2PartStable,   top2PartStable,     right2PartStable,      bottom2PartStable);
        
                    uint centerStabilityCandidate = stabilityValue;
        
                    uvec4 emptyCornerStabilityCandidate = uvec4(emptyCornerRule(edgeStable)                         ) * edgeStable;
                    uvec4 cornerStabilityCandidate      = uvec4(cornerRule(stabilityValue, edgeStable, cornerStable)) * stabilityValue;
        
                    uvec2 linkStabilityCandidate     = uvec2(linkRule(edgeStable)                     ) *      edgeStable.xy;
                    uvec4 slimEdgeStabilityCandidate = uvec4(slimEdgeRule(stabilityValue, edge2Stable)) * xxxx(stabilityValue);
        
                    uvec4 resCornerStability                  = max(cornerStabilityCandidate, emptyCornerStabilityCandidate);
                    uvec4 resSlimCornerTopRightPartStability  = max(resCornerStability.xxyy,  slimEdgeStabilityCandidate.xyyz);
                    uvec4 resSlimCornerBotomLeftPartStability = max(resCornerStability.zzww,  slimEdgeStabilityCandidate.zwwx);
        
                    uvec2 resLinkStability     = max(linkStabilityCandidate, xx(centerStabilityCandidate));
                    uint  resMidLinksStability = max(resLinkStability.x,     resLinkStability.y);
        
                    mediump float cellStabilityPower           = float(stabilityValue                     ) *      domainFactor;
                    mediump vec4  cornerStabilityPower         = vec4( resCornerStability                 ) * xxxx(domainFactor);
                    mediump vec4  slimTopRightStabilityPower   = vec4( resSlimCornerTopRightPartStability ) * xxxx(domainFactor);
                    mediump vec4  slimBottomLeftStabilityPower = vec4( resSlimCornerBotomLeftPartStability) * xxxx(domainFactor);
                    mediump vec2  linkStabilityPower           = vec2( resLinkStability                   ) *   xx(domainFactor);
                    mediump float midStabilityPower            = float(resMidLinksStability               ) *      domainFactor;

                    mediump float stablePower =    float(insideFreeCircle)      *       cellStabilityPower;
                    stablePower              += dot(vec4(insideFreeCorner),             cornerStabilityPower);
                    stablePower              += dot(vec4(insideSlimEdgeTopRightPart),   slimTopRightStabilityPower); 
                    stablePower              += dot(vec4(insideSlimEdgeBottomLeftPart), slimBottomLeftStabilityPower);
                    stablePower              += dot(vec2(insideCenterLink),             linkStabilityPower); 
                    stablePower              +=    float(insideBothLinks)       *       midStabilityPower;

                    outColor = mix(outColor, colorStable, stablePower);
                }
            }
            else
            {
                outColor = gColorBetween;
            }
        }`;
        
        let defaultVS = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(defaultVS, vsSource);
        gl.compileShader(defaultVS);

        if(!gl.getShaderParameter(defaultVS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(defaultVS));
        }

        let squaresFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(squaresFS, squaresFsSource);
        gl.compileShader(squaresFS);

        if(!gl.getShaderParameter(squaresFS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(squaresFS));
        }

        let circlesFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(circlesFS, circlesFsSource);
        gl.compileShader(circlesFS);

        if(!gl.getShaderParameter(circlesFS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(circlesFS));
        }

        let diamondsFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(diamondsFS, diamondsFsSource);
        gl.compileShader(diamondsFS);

        if(!gl.getShaderParameter(diamondsFS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(diamondsFS));
        }

        let beamsFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(beamsFS, beamsFsSource);
        gl.compileShader(beamsFS);

        if(!gl.getShaderParameter(beamsFS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(beamsFS));
        }

        let raindropsFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(raindropsFS, raindropsFsSource);
        gl.compileShader(raindropsFS);

        if(!gl.getShaderParameter(raindropsFS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(raindropsFS));
        }

        let chainsFS = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(chainsFS, chainsFsSource);
        gl.compileShader(chainsFS);

        if(!gl.getShaderParameter(chainsFS, gl.COMPILE_STATUS))
        {
            alert(gl.getShaderInfoLog(chainsFS));
        }

        squaresShaderProgram = gl.createProgram();
        gl.attachShader(squaresShaderProgram, defaultVS);
        gl.attachShader(squaresShaderProgram, squaresFS);
        gl.linkProgram(squaresShaderProgram);

        if(!gl.getProgramParameter(squaresShaderProgram, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(squaresShaderProgram));
        }

        circlesShaderProgram = gl.createProgram();
        gl.attachShader(circlesShaderProgram, defaultVS);
        gl.attachShader(circlesShaderProgram, circlesFS);
        gl.linkProgram(circlesShaderProgram);

        if(!gl.getProgramParameter(circlesShaderProgram, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(circlesShaderProgram));
        }

        diamondsShaderProgram = gl.createProgram();
        gl.attachShader(diamondsShaderProgram, defaultVS);
        gl.attachShader(diamondsShaderProgram, diamondsFS);
        gl.linkProgram(diamondsShaderProgram);

        if(!gl.getProgramParameter(diamondsShaderProgram, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(diamondsShaderProgram));
        }

        beamsShaderProgram = gl.createProgram();
        gl.attachShader(beamsShaderProgram, defaultVS);
        gl.attachShader(beamsShaderProgram, beamsFS);
        gl.linkProgram(beamsShaderProgram);

        if(!gl.getProgramParameter(beamsShaderProgram, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(beamsShaderProgram));
        }

        raindropsShaderProgram = gl.createProgram();
        gl.attachShader(raindropsShaderProgram, defaultVS);
        gl.attachShader(raindropsShaderProgram, raindropsFS);
        gl.linkProgram(raindropsShaderProgram);

        if(!gl.getProgramParameter(raindropsShaderProgram, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(raindropsShaderProgram));
        }

        chainsShaderProgram = gl.createProgram();
        gl.attachShader(chainsShaderProgram, defaultVS);
        gl.attachShader(chainsShaderProgram, chainsFS);
        gl.linkProgram(chainsShaderProgram);

        if(!gl.getProgramParameter(chainsShaderProgram, gl.LINK_STATUS))
        {
            alert(gl.getProgramInfoLog(chainsShaderProgram));
        }
    }

    function updateBoardTexture()
    {
        if(currentGameBoard === null)
        {
            return;
        }

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.bindTexture(gl.TEXTURE_2D, boardTexture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, currentGameSize, currentGameSize, gl.RED_INTEGER, gl.UNSIGNED_BYTE, currentGameBoard);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function updateSolutionTexture()
    {
        if(currentGameSolution === null)
        {
            return;
        }

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.bindTexture(gl.TEXTURE_2D, solutionTexture);
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, currentGameSize, currentGameSize, gl.RED_INTEGER, gl.UNSIGNED_BYTE, currentGameSolution);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function updateStabilityTexture()
    {
        if(currentGameStability === null && currentGameLitStability === null)
        {
            return;
        }

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
        gl.bindTexture(gl.TEXTURE_2D, stabilityTexture);
        if(flagShowLitStability && currentGameLitStability !== null)
        {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, currentGameSize, currentGameSize, gl.RED_INTEGER, gl.UNSIGNED_BYTE, currentGameLitStability);
        }
        else if(currentGameStability !== null)
        {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, currentGameSize, currentGameSize, gl.RED_INTEGER, gl.UNSIGNED_BYTE, currentGameStability);
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    function mainDraw()
    {
        gl.clearColor(1.0, 1.0, 1.0, 0.0);
        gl.clear(gl.COLOR_BUFFER_BIT);

        let drawFlags = 0;
        if(flagShowSolution || flagShowInverseSolution)
        {
            drawFlags = drawFlags | 1;
        }
        if(flagShowStability || flagShowLitStability)
        {
            drawFlags = drawFlags | 2;
        }
        if(flagToroidBoard)
        {
            drawFlags = drawFlags | 4;
        }

        gl.bindVertexArray(drawVertexBuffer);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(currentShaderProgram);

        gl.uniform1i(boardSizeUniformLocation,  currentGameSize);
        gl.uniform1i(cellSizeUniformLocation,   currentCellSize);
        gl.uniform1i(domainSizeUniformLocation, currentDomainSize);
        gl.uniform1i(flagsUniformLocation,      drawFlags);

        gl.uniform1i(canvasWidthUniformLocation,     standardWidth);
        gl.uniform1i(canvasHeightUniformLocation,    standardHeight);
        gl.uniform1i(viewportXOffsetUniformLocation, 0);
        gl.uniform1i(viewportYOffsetUniformLocation, canvas.clientHeight - standardHeight);

        gl.uniform4f(colorNoneUniformLocation,    currentColorUnlit[0],   currentColorUnlit[1],   currentColorUnlit[2],   currentColorUnlit[3]);
        gl.uniform4f(colorEnabledUniformLocation, currentColorLit[0],     currentColorLit[1],     currentColorLit[2],     currentColorLit[3]);
        gl.uniform4f(colorSolvedUniformLocation,  currentColorSolved[0],  currentColorSolved[1],  currentColorSolved[2],  currentColorSolved[3]);
        gl.uniform4f(colorBetweenUniformLocation, currentColorBetween[0], currentColorBetween[1], currentColorBetween[2], currentColorBetween[3]);

        gl.uniform1i(boardTextureUniformLocation,     0);
        gl.uniform1i(solutionTextureUniformLocation,  1);
        gl.uniform1i(stabilityTextureUniformLocation, 2);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, boardTexture);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, solutionTexture);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, stabilityTexture);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        gl.bindVertexArray(null);

        gl.uniform1i(boardSizeUniformLocation,  null);
        gl.uniform1i(cellSizeUniformLocation,   null);
        gl.uniform1i(domainSizeUniformLocation, null);
        gl.uniform1i(flagsUniformLocation,      null);

        gl.uniform1i(canvasWidthUniformLocation,     null);
        gl.uniform1i(canvasHeightUniformLocation,    null);
        gl.uniform1i(viewportXOffsetUniformLocation, null);
        gl.uniform1i(viewportYOffsetUniformLocation, null);

        gl.uniform4f(colorNoneUniformLocation,    0, 0, 0, 0);
        gl.uniform4f(colorEnabledUniformLocation, 0, 0, 0, 0);
        gl.uniform4f(colorSolvedUniformLocation,  0, 0, 0, 0);
        gl.uniform4f(colorBetweenUniformLocation, 0, 0, 0, 0);

        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, null);
    }

    //=================================================== Util functions ===================================================\\
    function clamp(num, min, max)
    {
        if(num < min)
        {
            return min;
        }

        if(num > max)
        {
            return max;
        }

        return num;
    }

    function cellIndexFromPoint(gameSize, x, y)
    {
        return y * gameSize + x;
    }

    function invModGcdEx(num, domainSize) //Extended Euclid algorithm for inverting (num) modulo (domainSize)
    {
        if(num === 1)
        {
            return 1;
        }
        else
        {
            if(num === 0 || domainSize % num === 0)
            {
                return 0;
            }
            else
            {
                let tCurr = 0;
                let rCurr = domainSize;
                let tNext = 1;
                let rNext = num;

                while(rNext !== 0)
                {
                    let quotR = Math.floor(rCurr / rNext);
                    let tPrev = tCurr;
                    let rPrev = rCurr;

                    tCurr = tNext;
                    rCurr = rNext;

                    tNext = Math.floor(tPrev - quotR * tCurr);
                    rNext = Math.floor(rPrev - quotR * rCurr);
                }

                tCurr = (tCurr + domainSize) % domainSize;
                return tCurr;
            }
        }
    }

    function wholeMod(num, domainSize)
    {
        return ((num % domainSize) + domainSize) % domainSize;
    }
}