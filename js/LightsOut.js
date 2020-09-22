// eslint-disable-next-line no-unused-vars
function main()
{
    const canvas = document.getElementById("LightsOutCanvas");
    
    const infoText   = document.getElementById("LightsOutPuzzleInfo");
    const matrixText = document.getElementById("SolutionMatrixCalculating");
    const qpText     = document.getElementById("QuietPatternsInfo");
    const spText     = document.getElementById("SolutionPeriodInfo");

    const renderModeSelect = document.getElementById("rendermodesel");

    const gridCheckBox = document.getElementById("gridcheckbox");

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

    document.onkeydown = function (e)
    {
        if(document.activeElement === renderModeSelect)
        {
            return;
        }

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
        case "Digit4":
        {
            resetGameBoard(resetModes.RESET_FOUR_CORNERS, currentGameSize, currentDomainSize);
            break;
        }
        case "KeyO":
        {
            if(e.shiftKey)
            {
                changeWorkingMode(workingModes.CONSTRUCT_CLICKRULE_TOROID);
            }  
            else
            {
                resetGameBoard(resetModes.RESET_BORDER, currentGameSize, currentDomainSize);
            }
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
        case "Enter":
        {
            acceptClickRule();
            break;
        }
        case "Escape":
        {
            rejectClickRule();
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
                updateSolutionMatrixIfNeeded().then(() => 
                {
                    showSolution(!flagShowSolution);
                });
            }
            break;
        }
        case "KeyM":
        {
            if(e.shiftKey)
            {
                changeWorkingMode(workingModes.CONSTRUCT_CLICKRULE);
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
                updateSolutionMatrixIfNeeded().then(() => 
                {
                    currentGameSolution = calculateSolution(currentGameBoard, currentGameSize, currentDomainSize, currentSolutionMatrix);
                    updateSolutionTexture();
    
                    currentTurnList = buildTurnList(currentGameSolution, currentGameSize);
    
                    flagRandomSolving = true;
    
                    flagTickLoop = true;
                    currentAnimationFrame = window.requestAnimationFrame(nextTick);
                });
            }
            else
            {
                currentTurnList.length = 0;
                window.cancelAnimationFrame(currentAnimationFrame);
                flagTickLoop = false;
            }

            break;
        }
        case "KeyC":
        {
            if(currentTurnList.length == 0)
            {
                updateSolutionMatrixIfNeeded().then(() =>
                {
                    currentGameSolution = calculateSolution(currentGameBoard, currentGameSize, currentDomainSize, currentSolutionMatrix);
                    updateSolutionTexture();
    
                    currentTurnList = buildTurnList(currentGameSolution, currentGameSize);
    
                    flagRandomSolving = false;
    
                    flagTickLoop = true;
                    currentAnimationFrame = window.requestAnimationFrame(nextTick);
                });
            }
            else
            {
                currentTurnList.length = 0;
                window.cancelAnimationFrame(currentAnimationFrame);
                flagTickLoop = false;
            }

            break;
        }
        case "KeyG":
        {
            if(flagPeriodBackCounting || flagPeriodCounting || flagPerio4Counting || flagEigvecCounting)
            {
                changeCountingMode(countingModes.COUNT_NONE, false);
            }
            else
            {
                changeCountingMode(countingModes.COUNT_EIGENVECTOR, e.shiftKey);
            }
            break;
        }    
        case "KeyV":
        {
            if(flagPeriodBackCounting || flagPeriodCounting || flagPerio4Counting || flagEigvecCounting)
            {
                changeCountingMode(countingModes.COUNT_NONE, false);
            }
            else
            {
                changeCountingMode(countingModes.COUNT_SOLUTION_PERIOD, e.shiftKey);
            }
            break;
        }
        case "KeyX":
        {
            if(flagPeriodBackCounting || flagPeriodCounting || flagPerio4Counting || flagEigvecCounting)
            {
                changeCountingMode(countingModes.COUNT_NONE, false);
            }
            else
            {
                changeCountingMode(countingModes.COUNT_SOLUTION_PERIOD_4X, e.shiftKey);
            }
            break;
        } 
        case "KeyZ":
        {
            if(flagPeriodBackCounting || flagPeriodCounting || flagPerio4Counting || flagEigvecCounting)
            {
                changeCountingMode(countingModes.COUNT_NONE, false);
            }
            else
            {
                changeCountingMode(countingModes.COUNT_INVERSE_SOLUTION_PERIOD, e.shiftKey);
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
        renderModeSelect.blur(); //Blur - Beetlebum
        canvas.focus();
    };

    gridCheckBox.onclick = function()
    {
        setGridVisible(gridCheckBox.checked);
    };

    let boardGenModes =
    {
        BOARDGEN_FULL_RANDOM:  1, //Generate a random board
        BOARDGEN_ZERO_ELEMENT: 2, //Generate a fully unlit board
        BOARDGEN_ONE_ELEMENT:  3, //Generate a fully lit board
        BOARDGEN_BLATNOY:      4, //Generate a chessboard pattern board
        BOARDGEN_PIETIA_STYLE: 5, //Generate a checkers pattern board
        BOARDGEN_BORDER:       6, //Generate a border board
        BOARDGEN_4_CORNERS:    7  //Generate a four corners board
    };

    let resetModes =
    {
        RESET_ONE:                    1, //Fully lit board
        RESET_ZERO:                   2, //Fully unlit board
        RESET_BORDER:                 3, //Border board
        RESET_PIETIA:                 4, //Checkers board
        RESET_BLATNOY:                5, //Chessboard board
        RESET_FOUR_CORNERS:           6, //4 lit corners
        RESET_SOLVABLE_RANDOM:        7, //Random board, always solvable
        RESET_FULL_RANDOM:            8, //Random board
        RESET_SOLUTION:               9, //Current board -> Current solution/Current stability
        RESET_INVERTO:               10, //Current board -> Inverted current board
        RESET_DOMAIN_ROTATE_NONZERO: 11, //Current board -> Nonzero domain rotated current board
        RESET_LEFT:                  12, //Current board -> Current board moved left
        RESET_RIGHT:                 13, //Current board -> Current board moved right
        RESET_UP:                    14, //Current board -> Current board moved up
        RESET_DOWN:                  15  //Current board -> Current board moved down
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
        COUNT_SOLUTION_PERIOD_4X:      4,
        COUNT_EIGENVECTOR:             5
    };

    const minimumBoardSize = 1;
    const maximumBoardSize = 256;

    const minimumDomainSize = 2;
    const maximumDomainSize = 255;

    const canvasSize = 900;

    let currentViewportWidth  = canvas.clientWidth;
    let currentViewportHeight = canvas.clientHeight;

    let currentViewportOffsetX = 0;
    let currentViewportOffsetY = 0;

    let currentAnimationFrame = 0;

    let flagRandomSolving           = false;
    let flagShowSolution            = false;
    let flagShowInverseSolution     = false;
    let flagShowStability           = false;
    let flagShowLitStability        = false;
    let flagNoGrid                  = false;
    let flagPeriodCounting          = false;
    let flagEigvecCounting          = false;
    let flagPerio4Counting          = false;
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
    let currentSavedBoard       = null;

    let currentCellSize = 20;

    let currentClickRuleSize = 3;
    let currentGameSize      = 15;
    let currentSavedGameSize = 15;
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

    //solutionMatrixScripts = 
    //[
    //    URL.createObjectURL(new Blob(["("+calculateSolutionMatrixStep1Bit.toString()+")()"], {type: 'text/javascript'})),
    //    URL.createObjectURL(new Blob(["("+calculateSolutionMatrixStep2Bit.toString()+")()"], {type: 'text/javascript'})),
    //    URL.createObjectURL(new Blob(["("+calculateSolutionMatrix.toString()        +")()"], {type: 'text/javascript'}))
    //];

    let solutionMatrixWorker = new Worker(URL.createObjectURL(new Blob(["("+solutionMatrixWorkerFunction.toString()+")()"], {type: 'text/javascript'})));
    //solutionMatrixWorker.postMessage({command: "InitScripts", params: solutionMatrixScripts});
    //solutionMatrixWorker.postMessage({command: "CalcSolutionMatrix", params: {clickRule: currentGameClickRule, gameSize: currentGameSize, domainSize: currentDomainSize, clickRuleSize: currentClickRuleSize, isToroid: flagToroidBoard}});

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
        
        currentGameSize = clamp(newSize, minimumBoardSize, maximumBoardSize);
        currentSolutionMatrixRelevant = false;

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

            currentGameBoard = makeTurn(currentGameBoard, currentGameClickRule, currentClickRuleSize, currentGameSize, currentDomainSize, Math.floor(currentGameSize / 2), Math.floor(currentGameSize / 2), false);
            infoText.textContent = "Lights Out click rule " + currentGameSize + "x" + currentGameSize + " DOMAIN " + currentDomainSize;
        }

        currentCellSize = Math.ceil(canvasSize / currentGameSize) - 1;

        let newCanvasSize     = canvasSizeFromGameSize(currentGameSize, currentCellSize, !flagNoGrid);
        currentViewportWidth  = newCanvasSize.width;
        currentViewportHeight = newCanvasSize.height;

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

        currentDomainSize = clamp(newSize, minimumDomainSize, maximumDomainSize);
        currentSolutionMatrixRelevant = false;

        resetGameBoard(resetModes.RESET_SOLVABLE_RANDOM, currentGameSize, currentDomainSize);
        enableDefaultClickRule();

        infoText.textContent = "Lights Out  " + currentGameSize + "x" + currentGameSize + " DOMAIN " + currentDomainSize;
        updateBoardTexture();
    }

    function clickAtPoint(x, y, isConstruct)
    {
        let boardPoint = boardPointFromCanvasPoint(x, y, currentGameSize, currentViewportOffsetX, currentViewportOffsetY, currentViewportWidth, currentViewportHeight, !flagNoGrid);

        let modX = boardPoint.xBoard;
        let modY = boardPoint.yBoard;

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
            currentGameSolution = calculateSolution(currentGameBoard, currentGameSize, currentDomainSize, currentSolutionMatrix);
            updateSolutionTexture();
        }
        else if(flagShowInverseSolution)
        {
            currentGameSolution = calculateInverseSolution(currentGameBoard, currentGameSize, currentDomainSize, currentGameClickRule, currentClickRuleSize, flagToroidBoard, flagDefaultClickRule);
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

        requestRedraw();
    }

    function resetStability()
    {
        currentGameStability = new Uint8Array(currentGameSize * currentGameSize);
        currentGameStability.fill(currentDomainSize - 1);
    }

    function updateSolutionMatrixIfNeeded()
    {
        if(!currentSolutionMatrixRelevant)
        {
            matrixText.textContent = "CALCULATING";

            //Calculate solution matrix in place (instead of calling calculateSolutionMatrix())
            //Calculate in small chunks to not block the UI
            //(WebWorkers suck because they require to load an external file, which requires you to deal with stupid dense CORS)

            let lightsOutMatrix = [];
            let invMatrix       = [];
            let domainInvs      = [];
            let quietPatterns   = 0;
            let matrixSize      = currentGameSize * currentGameSize;
            let promise = new Promise((resolve, reject) => 
            {
                for(let yL = 0; yL < currentGameSize; yL++)
                {
                    matrixText.textContent = "CALCULATING " + yL;
                    setTimeout(function()
                    {
                        calculateSolutionMatrixStep1Bit(lightsOutMatrix, currentGameClickRule, currentClickRuleSize, currentGameSize, yL, flagToroidBoard);
                    }, 10);
                }

                resolve();
            })
            .then(() => 
            {
                //Generate a unit matrix. This will eventually become an inverse matrix

                setTimeout(function()
                {
                    calculateSolutionMatrixStep2Bit(invMatrix, currentGameSize);
                }, 10);

                for(let d = 0; d < currentDomainSize; d++)
                {
                    domainInvs.push(invModGcdEx(d, currentDomainSize));
                }
            })
            .then(() =>
            {
                //First pass: top to bottom, eliminating numbers from below the diagonal
                for(let iD = 0; iD < matrixSize; iD++)
                {
                    //calculateSolutionMatrixStep3Bit(lightsOutMatrix, invMatrix, matrixSize, domainInvs, currentDomainSize, iD);
                }
            })
            .then(() =>
            {
                //Second pass: bottom to top, eliminating numbers from above the diagonal
                for(let iU = matrixSize - 1; iU >= 0; iU--)
                {
                    //calculateSolutionMatrixStep4Bit(lightsOutMatrix, invMatrix, domainInvs, currentDomainSize, iU);
                }
            })
            .then(() =>
            {
                for(let iD = 0; iD < matrixSize; iD++)
                {
                    //quietPatterns = calculateSolutionMatrixStep5Bit(lightsOutMatrix, iD, quietPatterns);
                }
            })
            .then(() =>
            {
                //calculateSolutionMatrixStep6Bit(invMatrix, matrixSize);
            })
            .then(() =>
            {
                matrixText.textContent = "CALCULATING FINISHED";

                currentSolutionMatrix = invMatrix;
                currentQuietPatterns  = quietPatterns;

                qpText.textContent = "Quiet patterns: " + currentQuietPatterns;

                currentSolutionMatrixRelevant = true;
            });

            return promise;
        }
        else
        {
            return new Promise((resolve, reject) =>
            {
                resolve();
            });
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
                currentGameSolution = calculateSolution(currentGameBoard, currentGameSize, currentDomainSize, currentSolutionMatrix);
                updateSolutionTexture();
            }
            else if(flagShowInverseSolution)
            {
                currentGameSolution = calculateInverseSolution(currentGameBoard, currentGameSize, currentDomainSize, currentGameClickRule, currentClickRuleSize, flagToroidBoard, flagDefaultClickRule);
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
                currentGameBoard = domainShiftBoard(currentGameBoard, currentDomainSize);
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
                currentGameSolution = calculateSolution(currentGameBoard, currentGameSize, currentDomainSize, currentSolutionMatrix);
                updateSolutionTexture();
            }
            else if(flagShowInverseSolution)
            {
                currentGameSolution = calculateInverseSolution(currentGameBoard, currentGameSize, currentDomainSize, currentGameClickRule, currentClickRuleSize, flagToroidBoard, flagDefaultClickRule);
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
            currentGameBoard = calculateInverseSolution(currentGameBoard, currentGameSize, currentDomainSize, currentGameClickRule, currentClickRuleSize, flagToroidBoard, flagDefaultClickRule);

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
            case resetModes.RESET_FOUR_CORNERS:
            {
                modeBgen = boardGenModes.BOARDGEN_4_CORNERS;
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
                case boardGenModes.BOARDGEN_4_CORNERS:
                {
                    if((y === 0 && x === 0) || (y === (gameSize - 1) && x === 0) || (y === 0 && x === (gameSize - 1)) || (y === (gameSize - 1) && x === (gameSize - 1)))
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

        flagPeriodCounting     = false;
        flagPeriodBackCounting = false;
        flagPerio4Counting     = false;
        flagEigvecCounting     = false;

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
            updateSolutionMatrixIfNeeded().then(() => 
            {
                flagPeriodCounting = true;
            });
            break;
        }
        case countingModes.COUNT_SOLUTION_PERIOD_4X:
        {
            updateSolutionMatrixIfNeeded().then(() =>
            {
                flagPerio4Counting = true;
            });
            break;
        }
        case countingModes.COUNT_INVERSE_SOLUTION_PERIOD:
        {
            flagPeriodBackCounting = true;
            break;
        }
        case countingModes.COUNT_EIGENVECTOR:
        {
            flagEigvecCounting = true;
            break;
        }
        }

        flagStopCountingWhenFound = stopWhenReturned;

        if(flagPeriodBackCounting || flagPeriodCounting || flagPerio4Counting)
        {
            currentPeriodCount = 0;
            currentCountedBoard = currentGameBoard.slice();

            flagTickLoop = true;
            currentAnimationFrame = window.requestAnimationFrame(nextTick);
        }
        else if(flagEigvecCounting)
        {
            currentPeriodCount = 0;
            currentCountedBoard = currentGameBoard.slice();
            currentGameBoard    = calculateInverseSolution(currentGameBoard, currentGameSize, currentDomainSize, currentGameClickRule, currentClickRuleSize, flagToroidBoard, flagDefaultClickRule);

            flagTickLoop = true;
            currentAnimationFrame = window.requestAnimationFrame(nextTick);
        }
        else
        {
            cancelAnimationFrame(currentAnimationFrame);
            flagTickLoop = false;
        }
    }

    function changeWorkingMode(workingMode)
    {
        //First problem: flags. There are A LOL of them
        showSolution(false);
        showInverseSolution(false);
        showStability(false);
        showLitStability(false);

        //We can change for normal mode here too!
        flagRandomSolving           = false;
        flagPeriodCounting          = false;
        flagEigvecCounting          = false;
        flagPerio4Counting          = false;
        flagPeriodBackCounting      = false;
        flagStopCountingWhenFound   = false;
        flagTickLoop                = false;

        currentWorkingMode = workingMode;
        
        if(workingMode == workingModes.CONSTRUCT_CLICKRULE || workingMode == workingModes.CONSTRUCT_CLICKRULE_TOROID)
        {
            currentSavedBoard    = currentGameBoard.slice();
            currentSavedGameSize = currentGameSize; 

            changeGameSize(currentClickRuleSize);
            currentGameBoard = currentGameClickRule;
            updateBoardTexture();

            infoText.textContent = "Lights Out click rule " + currentGameSize + "x" + currentGameSize + " DOMAIN " + currentDomainSize;
        }

        requestRedraw();
    }

    function acceptClickRule()
    {
        if(currentWorkingMode === workingModes.CONSTRUCT_CLICKRULE || currentWorkingMode === workingModes.CONSTRUCT_CLICKRULE_TOROID)
        {
            if(currentWorkingMode == workingModes.CONSTRUCT_CLICKRULE_TOROID)
            {
                flagToroidBoard = true;
            }

            currentGameClickRule = currentGameBoard.slice();
            currentClickRuleSize = currentGameSize;

            changeGameSize(currentSavedGameSize);
            currentGameBoard = currentSavedBoard.slice();

            updateBoardTexture();
            flagDefaultClickRule = false;

            requestRedraw();
            changeWorkingMode(workingModes.LIT_BOARD);

            infoText.textContent = "Lights Out " + currentGameSize + "x" + currentGameSize + " DOMAIN " + currentDomainSize;
        }
    }

    function rejectClickRule()
    {
        if(currentWorkingMode === workingModes.CONSTRUCT_CLICKRULE || currentWorkingMode === workingModes.CONSTRUCT_CLICKRULE_TOROID)
        {
            changeGameSize(currentSavedGameSize);
            currentGameBoard = currentSavedBoard.slice();

            updateBoardTexture();

            requestRedraw();
            changeWorkingMode(workingModes.LIT_BOARD);

            infoText.textContent = "Lights Out " + currentGameSize + "x" + currentGameSize + " DOMAIN " + currentDomainSize;
        }
    }


    function buildTurnList(board, gameSize)
    {
        let turnList = [];

        for(let y = 0; y < gameSize; y++)
        {
            for(let x = 0; x < gameSize; x++)
            {
                let cellIndex = flatCellIndex(gameSize, x, y);
                for(let i = 0; i < board[cellIndex]; i++)
                {
                    turnList.push({cellX: x, cellY: y});
                }
            }
        }

        return turnList.reverse(); //Turn lists are oriented bottom-up
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

            currentGameSolution = calculateSolution(currentGameBoard, currentGameSize, currentDomainSize, currentSolutionMatrix);
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

            currentGameSolution = calculateInverseSolution(currentGameBoard, currentGameSize, currentDomainSize, currentGameClickRule, currentClickRuleSize, flagToroidBoard, flagDefaultClickRule);
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

    function setGridVisible(visible)
    {
        flagNoGrid = !visible;
        let newCanvasSize = canvasSizeFromGameSize(currentGameSize, currentCellSize, visible);

        currentViewportWidth  = newCanvasSize.width;
        currentViewportHeight = newCanvasSize.height;

        updateViewport();
        requestRedraw();
    }

    function updateViewport()
    {
        currentViewportOffsetX = (canvas.width  - currentViewportWidth)  / 2;
        currentViewportOffsetY = (canvas.height - currentViewportHeight) / 2;

        gl.viewport(currentViewportOffsetX, currentViewportOffsetY, currentViewportWidth, currentViewportHeight); //Very careful here. 
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

            currentGameSolution = calculateInverseSolution(currentGameBoard, currentGameSize, currentDomainSize, currentGameClickRule, currentClickRuleSize, flagToroidBoard, flagDefaultClickRule);
            
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

            if(!flagTickLoop) //Just stopped, period is found
            {
                spText.textContent = "Solution period: " + currentPeriodCount;
            }
            else
            {
                spText.textContent = "Interchanges: " + currentPeriodCount;
            }
        }

        if(flagPeriodCounting)
        {
            currentPeriodCount++;

            currentGameSolution = calculateSolution(currentGameBoard, currentGameSize, currentDomainSize, currentSolutionMatrix);
            
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

            if(!flagTickLoop) //Just stopped, period is found
            {
                spText.textContent = "Solution period: " + currentPeriodCount;
            }
            else
            {
                spText.textContent = "Interchanges: " + currentPeriodCount;
            }
        }

        if(flagPerio4Counting)
        {
            currentGameSolution = currentGameBoard.slice();
            for(let i = 0; i < 4; i++)
            {
                currentPeriodCount++;
                currentGameSolution = calculateSolution(currentGameSolution, currentGameSize, currentDomainSize, currentSolutionMatrix);
                if(flagStopCountingWhenFound && equalsBoard(currentGameSolution, currentCountedBoard))
                {
                    flagStopCountingWhenFound = false;
                    changeCountingMode(countingModes.COUNT_NONE, false);
                    flagTickLoop = false;
                    
                    break;
                } 
            }
            
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

            if(!flagTickLoop) //Just stopped, period is found
            {
                spText.textContent = "Solution period: " + currentPeriodCount;
            }
            else
            {
                spText.textContent = "Interchanges: " + currentPeriodCount;
            }
        }

        if(flagEigvecCounting)
        {
            currentPeriodCount++;

            let citybuilderBoard = addBoard(currentGameBoard, currentCountedBoard, currentDomainSize);

            currentGameSolution = calculateInverseSolution(citybuilderBoard, currentGameSize, currentDomainSize, currentGameClickRule, currentClickRuleSize, flagToroidBoard, flagDefaultClickRule);
            if(flagStopCountingWhenFound && equalsBoard(currentGameSolution, citybuilderBoard)) //Solution is the current board => we found an eigenvector
            {
                flagStopCountingWhenFound = false;
                changeCountingMode(countingModes.COUNT_NONE, false);
                flagTickLoop = false;
            }

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

            if(!flagTickLoop) //Just stopped, period is found
            {
                spText.textContent = "Solution period: " + currentPeriodCount;
            }
            else
            {
                spText.textContent = "Interchanges: " + currentPeriodCount;
            }
        }

        requestRedraw();
        
        if(flagTickLoop)
        {
            currentAnimationFrame = window.requestAnimationFrame(nextTick);
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
        #define FLAG_NO_GRID        0x08

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

            if(((gFlags & FLAG_NO_GRID) != 0) || ((screenPos.x % gCellSize != 0) && (screenPos.y % gCellSize != 0))) //Inside the cell
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
        #define FLAG_NO_GRID        0x08

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

            if(((gFlags & FLAG_NO_GRID) != 0) || ((screenPos.x % gCellSize != 0) && (screenPos.y % gCellSize != 0))) //Inside the cell
            {
                highp ivec2 cellNumber = screenPos / ivec2(gCellSize);

                uint          cellValue = texelFetch(gBoard, cellNumber, 0).x;
                mediump float cellPower = float(cellValue) / float(gDomainSize - 1);

                mediump vec2  cellCoord    = (vec2(screenPos) - vec2(cellNumber * gCellSize) - vec2(gCellSize) / 2.0f);
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
        
                    uvec2 leftCellU   = uvec2(leftCell)   + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 rightCellU  = uvec2(rightCell)  + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 topCellU    = uvec2(topCell)    + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 bottomCellU = uvec2(bottomCell) + uvec2(gBoardSize) * maxCheckDistance;
        
                    leftCell   = ivec2(leftCellU   % uvec2(gBoardSize));
                    rightCell  = ivec2(rightCellU  % uvec2(gBoardSize));
                    topCell    = ivec2(topCellU    % uvec2(gBoardSize));
                    bottomCell = ivec2(bottomCellU % uvec2(gBoardSize));
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
        #define FLAG_NO_GRID        0x08

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

        bvec4 emptyCornerRule(uvec4 edgeValue)
        {
            return equal(edgeValue.xyzw, edgeValue.yzwx);
        }

        bvec4 cornerRule(uint cellValue, uvec4 cornerValue)
        {
            return equal(uvec4(cellValue), cornerValue.xyzw);
        }

        void main(void)
        {
            ivec2 screenPos = ivec2(int(gl_FragCoord.x) - gViewportOffsetX, gImageHeight - int(gl_FragCoord.y) - 1 + gViewportOffsetY);

            if(((gFlags & FLAG_NO_GRID) != 0) || ((screenPos.x % gCellSize != 0) && (screenPos.y % gCellSize != 0))) //Inside the cell
            {
                highp ivec2 cellNumber = screenPos.xy / ivec2(gCellSize);
                uint        cellValue  = texelFetch(gBoard, cellNumber, 0).x;

                mediump vec2  cellCoord     = (vec2(screenPos.xy) - vec2(cellNumber * ivec2(gCellSize)) - vec2(gCellSize) / 2.0f);
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
                    nonLeftEdge        = true;
                    nonRightEdge       = true;
                    nonTopEdge         = true;
                    nonBottomEdge      = true;
                    nonLeftTopEdge     = true;
                    nonRightTopEdge    = true;
                    nonLeftBottomEdge  = true;
                    nonRightBottomEdge = true;
        
                    const uint maxCheckDistance = 1u; //Different for different render modes

                    uvec2 leftCellU        = uvec2(leftCell)        + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 rightCellU       = uvec2(rightCell)       + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 topCellU         = uvec2(topCell)         + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 bottomCellU      = uvec2(bottomCell)      + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 leftTopCellU     = uvec2(leftTopCell)     + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 rightTopCellU    = uvec2(rightTopCell)    + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 leftBottomCellU  = uvec2(leftBottomCell)  + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 rightBottomCellU = uvec2(rightBottomCell) + uvec2(gBoardSize) * maxCheckDistance;

                    leftCell        = ivec2(leftCellU        % uvec2(gBoardSize));
                    rightCell       = ivec2(rightCellU       % uvec2(gBoardSize));
                    topCell         = ivec2(topCellU         % uvec2(gBoardSize));
                    bottomCell      = ivec2(bottomCellU      % uvec2(gBoardSize));
                    leftTopCell     = ivec2(leftTopCellU     % uvec2(gBoardSize));
                    rightTopCell    = ivec2(rightTopCellU    % uvec2(gBoardSize));
                    leftBottomCell  = ivec2(leftBottomCellU  % uvec2(gBoardSize));
                    rightBottomCell = ivec2(rightBottomCellU % uvec2(gBoardSize));
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
        #define FLAG_NO_GRID        0x08

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

        //GLSL operator && doesn't work on per-component basis :(
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
            bvec4 res = bvec4(true);

            res = b4nd(res,    equal(edgeValue.xyzw, edgeValue.yzwx));
            res = b4nd(res, notEqual(edgeValue.xyzw, cornerValue.xyzw));
            res = b4nd(res, notEqual(edgeValue.xyzw, uvec4(cellValue)));

            return res;
        }

        bvec4 regBRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            bvec4 res = bvec4(false);
            
            uvec4 cellValueVec = uvec4(cellValue);

            res = b4or(res,      equal(cellValueVec, edgeValue.xyzw  )                                                                                                                                                                     ); //B#1
            res = b4or(res,      equal(cellValueVec, edgeValue.yzwx  )                                                                                                                                                                     ); //B#2
            res = b4or(res,      equal(cellValueVec, cornerValue.xyzw)                                                                                                                                                                     ); //B#3
            res = b4or(res, b4nd(equal(cellValueVec, edgeValue.zwxy  ),    equal(cellValueVec, edgeValue.wxyz  )                                                                                                                          )); //B#4
            res = b4or(res, b4nd(equal(cellValueVec, cornerValue.zwxy), notEqual(cellValueVec, cornerValue.wxyz), notEqual(cellValueVec, edgeValue.wxyz), notEqual(cellValueVec, edgeValue.zwxy), notEqual(cellValueVec, cornerValue.yzwx))); //B#5

            return res;
        }

        bvec4 regIRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            bvec4 res = bvec4(false);
            
            bool loneDiamond = cellValue != edgeValue.x   && cellValue != edgeValue.y   && cellValue != edgeValue.z   && cellValue != edgeValue.w 
                            && cellValue != cornerValue.x && cellValue != cornerValue.y && cellValue != cornerValue.z && cellValue != cornerValue.w;

            uvec4 cellValueVec   = uvec4(cellValue);
            bvec4 loneDiamondVec = bvec4(loneDiamond);

            res = b4or(res,      equal(cellValueVec,   edgeValue.xyzw  )                                                                                                                           ); //I#1
            res = b4or(res, b4nd(equal(cellValueVec,   cornerValue.xyzw), notEqual(cellValueVec,   edgeValue.yzwx)                                                                                )); //I#2
            res = b4or(res, b4nd(equal(cellValueVec,   cornerValue.wxyz), notEqual(cellValueVec,   edgeValue.wxyz)                                                                                )); //I#3
            res = b4or(res, b4nd(equal(cellValueVec,   cornerValue.zwxy),    equal(cellValueVec, cornerValue.yzwx), notEqual(cellValueVec, edgeValue.wxyz), notEqual(cellValueVec, edgeValue.yzwx))); //I#4
            res = b4or(res, b4nd(equal(cellValueVec,   edgeValue.zwxy  ), notEqual(cellValueVec,   edgeValue.wxyz), notEqual(cellValueVec, edgeValue.yzwx)                                        )); //I#5
            res = b4or(res,           loneDiamondVec                                                                                                                                               ); //I#6

            return res;
        }

        bvec4 regYTopRightRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            bvec4 res = bvec4(false);

            uvec4 cellValueVec = uvec4(cellValue);
            
            res = b4or(res,      equal(cellValueVec, edgeValue.yyzz  )                                         ); //Y#1
            res = b4or(res, b4nd(equal(cellValueVec, cornerValue.xyyz), notEqual(cellValueVec, edgeValue.xzyw))); //Y#2

            return res;
        }

        bvec4 regYBottomLeftRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            bvec4 res = bvec4(false);

            uvec4 cellValueVec = uvec4(cellValue);
            
            res = b4or(res,      equal(cellValueVec, edgeValue.wwxx  )                                         ); //Y#1
            res = b4or(res, b4nd(equal(cellValueVec, cornerValue.zwwx), notEqual(cellValueVec, edgeValue.zxwy))); //Y#2

            return res;
        }

        bvec4 regVRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            uvec4 cellValueVec = uvec4(cellValue);
            return b4nd(equal(cellValueVec, cornerValue.xyzw), notEqual(cellValueVec, edgeValue.xyzw), notEqual(cellValueVec, edgeValue.yzwx)); //V#1
        }

        void main(void)
        {
            ivec2 screenPos = ivec2(int(gl_FragCoord.x) - gViewportOffsetX, gImageHeight - int(gl_FragCoord.y) - 1 + gViewportOffsetY);

            if(((gFlags & FLAG_NO_GRID) != 0) || ((screenPos.x % gCellSize != 0) && (screenPos.y % gCellSize != 0))) //Inside the cell
            {
                highp ivec2 cellNumber = screenPos.xy / ivec2(gCellSize);
                uint        cellValue  = texelFetch(gBoard, cellNumber, 0).x;

                mediump vec2  cellCoord     = (vec2(screenPos.xy) - vec2(cellNumber * ivec2(gCellSize)) - vec2(gCellSize) / 2.0f);
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

                bvec4 insideB = b4nd(insideBeam.xzzx,     insideBeam.yyww ,                       bvec4(!insideCentralDiamond)); //B-A, B-B, B-C, B-D
                bvec4 insideI = b4nd(insideBeam.xyzw, not(insideBeam.yxwz), not(insideBeam.wzyx), bvec4( insideCentralDiamond)); //I-A, I-B, I-C, I-D

                bvec4 insideYTopRight   = b4nd(insideBeam.yyzz, not(insideBeam.xzyw), bvec4(!insideCentralDiamond), insideSide.xzyw); //Y-A, Y-B, Y-C, Y-D
                bvec4 insideYBottomLeft = b4nd(insideBeam.wwxx, not(insideBeam.zxwy), bvec4(!insideCentralDiamond), insideSide.zxwy); //Y-E, Y-F, Y-G, Y-H

                bvec4 insideV = b4nd(not(insideBeam.xyzw), not(insideBeam.yzwx), insideSide.xyzw, insideSide.yzwx); //V-A, V-B, V-C, V-D

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
                    nonLeftEdge        = true;
                    nonRightEdge       = true;
                    nonTopEdge         = true;
                    nonBottomEdge      = true;
                    nonLeftTopEdge     = true;
                    nonRightTopEdge    = true;
                    nonLeftBottomEdge  = true;
                    nonRightBottomEdge = true;
        
                    const uint maxCheckDistance = 1u; //Different for different render modes

                    uvec2 leftCellU        = uvec2(leftCell)        + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 rightCellU       = uvec2(rightCell)       + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 topCellU         = uvec2(topCell)         + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 bottomCellU      = uvec2(bottomCell)      + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 leftTopCellU     = uvec2(leftTopCell)     + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 rightTopCellU    = uvec2(rightTopCell)    + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 leftBottomCellU  = uvec2(leftBottomCell)  + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 rightBottomCellU = uvec2(rightBottomCell) + uvec2(gBoardSize) * maxCheckDistance;

                    leftCell        = ivec2(leftCellU        % uvec2(gBoardSize));
                    rightCell       = ivec2(rightCellU       % uvec2(gBoardSize));
                    topCell         = ivec2(topCellU         % uvec2(gBoardSize));
                    bottomCell      = ivec2(bottomCellU      % uvec2(gBoardSize));
                    leftTopCell     = ivec2(leftTopCellU     % uvec2(gBoardSize));
                    rightTopCell    = ivec2(rightTopCellU    % uvec2(gBoardSize));
                    leftBottomCell  = ivec2(leftBottomCellU  % uvec2(gBoardSize));
                    rightBottomCell = ivec2(rightBottomCellU % uvec2(gBoardSize));
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
                mediump vec4  regIPower           = vec4( regionICandidate) * vec4(domainFactor);
                mediump vec4  regBPower           = vec4( resB            ) * vec4(domainFactor);
                mediump vec4  regYTopRightPower   = vec4( resYTopRight    ) * vec4(domainFactor);
                mediump vec4  regYBottomLeftPower = vec4( resYBottomLeft  ) * vec4(domainFactor);
                mediump vec4  regVPower           = vec4( resV            ) * vec4(domainFactor);

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
                    mediump vec4  regISolutionPower           = vec4( regionISolutionCandidate) * vec4(domainFactor);
                    mediump vec4  regBSolutionPower           = vec4( resBSolution            ) * vec4(domainFactor);
                    mediump vec4  regYTopRightSolutionPower   = vec4( resYTopRightSolution    ) * vec4(domainFactor);
                    mediump vec4  regYBottomLeftSolutionPower = vec4( resYBottomLeftSolution  ) * vec4(domainFactor);
                    mediump vec4  regVSolutionPower           = vec4( resVSolution            ) * vec4(domainFactor);
    
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
                    mediump vec4  regIStabilityPower           = vec4( regionIStabilityCandidate) * vec4(domainFactor);
                    mediump vec4  regBStabilityPower           = vec4( resBStability            ) * vec4(domainFactor);
                    mediump vec4  regYTopRightStabilityPower   = vec4( resYTopRightStability    ) * vec4(domainFactor);
                    mediump vec4  regYBottomLeftStabilityPower = vec4( resYBottomLeftStability  ) * vec4(domainFactor);
                    mediump vec4  regVStabilityPower           = vec4( resVStability            ) * vec4(domainFactor);
    
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
        #define FLAG_NO_GRID        0x08

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

        bvec4 b4or(bvec4 a, bvec4 b) //Yet another thing that doesn't require writing functions in hlsl
        {
            return bvec4(a.x || b.x, a.y || b.y, a.z || b.z, a.w || b.w);
        }

        bvec4 emptyCornerRule(uvec4 edgeValue)
        {
            return equal(edgeValue.xyzw, edgeValue.yzwx);
        }

        bvec4 cornerRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            bvec4 res = bvec4(false);

            uvec4 cellValueVec = uvec4(cellValue);
            
            res = b4or(res, equal(cellValueVec, cornerValue.xyzw));
            res = b4or(res, equal(cellValueVec,   edgeValue.xyzw));
            res = b4or(res, equal(cellValueVec,   edgeValue.yzwx));

            return res;
        }

        void main(void)
        {
            ivec2 screenPos = ivec2(int(gl_FragCoord.x) - gViewportOffsetX, gImageHeight - int(gl_FragCoord.y) - 1 + gViewportOffsetY);

            if(((gFlags & FLAG_NO_GRID) != 0) || ((screenPos.x % gCellSize != 0) && (screenPos.y % gCellSize != 0))) //Inside the cell
            {
                highp ivec2 cellNumber = screenPos.xy / ivec2(gCellSize);
                uint        cellValue  = texelFetch(gBoard, cellNumber, 0).x;

                mediump vec2  cellCoord    = (vec2(screenPos.xy) - vec2(cellNumber * ivec2(gCellSize)) - vec2(gCellSize) / 2.0f);
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
                    nonLeftEdge        = true;
                    nonRightEdge       = true;
                    nonTopEdge         = true;
                    nonBottomEdge      = true;
                    nonLeftTopEdge     = true;
                    nonRightTopEdge    = true;
                    nonLeftBottomEdge  = true;
                    nonRightBottomEdge = true;
        
                    const uint maxCheckDistance = 1u; //Different for different render modes

                    uvec2 leftCellU        = uvec2(leftCell)        + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 rightCellU       = uvec2(rightCell)       + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 topCellU         = uvec2(topCell)         + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 bottomCellU      = uvec2(bottomCell)      + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 leftTopCellU     = uvec2(leftTopCell)     + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 rightTopCellU    = uvec2(rightTopCell)    + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 leftBottomCellU  = uvec2(leftBottomCell)  + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 rightBottomCellU = uvec2(rightBottomCell) + uvec2(gBoardSize) * maxCheckDistance;

                    leftCell        = ivec2(leftCellU        % uvec2(gBoardSize));
                    rightCell       = ivec2(rightCellU       % uvec2(gBoardSize));
                    topCell         = ivec2(topCellU         % uvec2(gBoardSize));
                    bottomCell      = ivec2(bottomCellU      % uvec2(gBoardSize));
                    leftTopCell     = ivec2(leftTopCellU     % uvec2(gBoardSize));
                    rightTopCell    = ivec2(rightTopCellU    % uvec2(gBoardSize));
                    leftBottomCell  = ivec2(leftBottomCellU  % uvec2(gBoardSize));
                    rightBottomCell = ivec2(rightBottomCellU % uvec2(gBoardSize));
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
        #define FLAG_NO_GRID        0x08

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
            return equal(edgeValue.xyzw, edgeValue.yzwx);
        }

        bvec4 cornerRule(uint cellValue, uvec4 edgeValue, uvec4 cornerValue)
        {
            bvec4 res = bvec4(false);
            
            uvec4 cellValueVec = uvec4(cellValue);

            res = b4or(res, equal(cellValueVec, cornerValue.xyzw));
            res = b4or(res, equal(cellValueVec,   edgeValue.xyzw));
            res = b4or(res, equal(cellValueVec,   edgeValue.yzwx));

            return res;
        }

        bvec2 linkRule(uvec4 edgeValue)
        {
            return equal(edgeValue.xy, edgeValue.zw);
        }

        bvec4 slimEdgeRule(uint cellValue, uvec4 edge2Value)
        {
            uvec4 cellValueVec = uvec4(cellValue);
            return equal(cellValueVec, edge2Value.xyzw);
        }

        void main(void)
        {
            ivec2 screenPos = ivec2(int(gl_FragCoord.x) - gViewportOffsetX, gImageHeight - int(gl_FragCoord.y) - 1 + gViewportOffsetY);

            if(((gFlags & FLAG_NO_GRID) != 0) || ((screenPos.x % gCellSize != 0) && (screenPos.y % gCellSize != 0))) //Inside the cell
            {
                highp ivec2 cellNumber = screenPos.xy / ivec2(gCellSize);
                uint        cellValue  = texelFetch(gBoard, cellNumber, 0).x;

                mediump vec2  cellCoord       = (vec2(screenPos.xy) - vec2(cellNumber * ivec2(gCellSize)) - vec2(gCellSize) / 2.0f);
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

                bvec2 insideCenterLink = b2nd(insideLink,   bvec2( insideCircle), bvec2(!insideBothLinks));
                bool  insideFreeCircle = b1nd(insideCircle,       !insideLinkV  ,       !insideLinkH);
                bvec4 insideFreeCorner = b4nd(insideCorner, bvec4(!insideLinkH ), bvec4(!insideLinkV));

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

                    uvec2 leftCellU        = uvec2(leftCell)        + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 rightCellU       = uvec2(rightCell)       + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 topCellU         = uvec2(topCell)         + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 bottomCellU      = uvec2(bottomCell)      + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 leftTopCellU     = uvec2(leftTopCell)     + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 rightTopCellU    = uvec2(rightTopCell)    + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 leftBottomCellU  = uvec2(leftBottomCell)  + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 rightBottomCellU = uvec2(rightBottomCell) + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 left2CellU       = uvec2(left2Cell)       + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 right2CellU      = uvec2(right2Cell)      + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 top2CellU        = uvec2(top2Cell)        + uvec2(gBoardSize) * maxCheckDistance;
                    uvec2 bottom2CellU     = uvec2(bottom2Cell)     + uvec2(gBoardSize) * maxCheckDistance;

                    leftCell        = ivec2(leftCellU        % uvec2(gBoardSize));
                    rightCell       = ivec2(rightCellU       % uvec2(gBoardSize));
                    topCell         = ivec2(topCellU         % uvec2(gBoardSize));
                    bottomCell      = ivec2(bottomCellU      % uvec2(gBoardSize));
                    leftTopCell     = ivec2(leftTopCellU     % uvec2(gBoardSize));
                    rightTopCell    = ivec2(rightTopCellU    % uvec2(gBoardSize));
                    leftBottomCell  = ivec2(leftBottomCellU  % uvec2(gBoardSize));
                    rightBottomCell = ivec2(rightBottomCellU % uvec2(gBoardSize));
                    left2Cell       = ivec2(left2CellU       % uvec2(gBoardSize));
                    right2Cell      = ivec2(right2CellU      % uvec2(gBoardSize));
                    top2Cell        = ivec2(top2CellU        % uvec2(gBoardSize));
                    bottom2Cell     = ivec2(bottom2CellU     % uvec2(gBoardSize));
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

                uvec2 linkCandidate     = uvec2(linkRule(edgeValue)                ) *       edgeValue.xy;
                uvec4 slimEdgeCandidate = uvec4(slimEdgeRule(cellValue, edge2Value)) * uvec4(cellValue);

                uvec4 resCorner                  = max(cornerCandidate, emptyCornerCandidate);
                uvec4 resSlimCornerTopRightPart  = max(resCorner.xxyy, slimEdgeCandidate.xyyz);
                uvec4 resSlimCornerBotomLeftPart = max(resCorner.zzww, slimEdgeCandidate.zwwx);

                uvec2 resLink     = max(linkCandidate, uvec2(centerCandidate));
                uint  resMidLinks = max(resLink.x,     resLink.y);

                mediump float cellPower           = float(cellValue                 ) *      domainFactor;
                mediump vec4  cornerPower         = vec4( resCorner                 ) * vec4(domainFactor);
                mediump vec4  slimTopRightPower   = vec4( resSlimCornerTopRightPart ) * vec4(domainFactor);
                mediump vec4  slimBottomLeftPower = vec4( resSlimCornerBotomLeftPart) * vec4(domainFactor);
                mediump vec2  linkPower           = vec2( resLink                   ) * vec2(domainFactor);
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
        
                    uvec2 linkSolutionCandidate     = uvec2(linkRule(edgeSolved)                    ) *       edgeSolved.xy;
                    uvec4 slimEdgeSolutionCandidate = uvec4(slimEdgeRule(solutionValue, edge2Solved)) * uvec4(solutionValue);
        
                    uvec4 resCornerSolution                  = max(cornerSolutionCandidate, emptyCornerSolutionCandidate);
                    uvec4 resSlimCornerTopRightPartSolution  = max(resCornerSolution.xxyy,  slimEdgeSolutionCandidate.xyyz);
                    uvec4 resSlimCornerBotomLeftPartSolution = max(resCornerSolution.zzww,  slimEdgeSolutionCandidate.zwwx);
        
                    uvec2 resLinkSolution     = max(linkSolutionCandidate, uvec2(centerSolutionCandidate));
                    uint  resMidLinksSolution = max(resLinkSolution.x,     resLinkSolution.y);
        
                    mediump float cellSolutionPower           = float(solutionValue                     ) *      domainFactor;
                    mediump vec4  cornerSolutionPower         = vec4( resCornerSolution                 ) * vec4(domainFactor);
                    mediump vec4  slimTopRightSolutionPower   = vec4( resSlimCornerTopRightPartSolution ) * vec4(domainFactor);
                    mediump vec4  slimBottomLeftSolutionPower = vec4( resSlimCornerBotomLeftPartSolution) * vec4(domainFactor);
                    mediump vec2  linkSolutionPower           = vec2( resLinkSolution                   ) * vec2(domainFactor);
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
        
                    uvec2 linkStabilityCandidate     = uvec2(linkRule(edgeStable)                     ) *       edgeStable.xy;
                    uvec4 slimEdgeStabilityCandidate = uvec4(slimEdgeRule(stabilityValue, edge2Stable)) * uvec4(stabilityValue);
        
                    uvec4 resCornerStability                  = max(cornerStabilityCandidate, emptyCornerStabilityCandidate);
                    uvec4 resSlimCornerTopRightPartStability  = max(resCornerStability.xxyy,  slimEdgeStabilityCandidate.xyyz);
                    uvec4 resSlimCornerBotomLeftPartStability = max(resCornerStability.zzww,  slimEdgeStabilityCandidate.zwwx);
        
                    uvec2 resLinkStability     = max(linkStabilityCandidate, uvec2(centerStabilityCandidate));
                    uint  resMidLinksStability = max(resLinkStability.x,     resLinkStability.y);
        
                    mediump float cellStabilityPower           = float(stabilityValue                     ) *      domainFactor;
                    mediump vec4  cornerStabilityPower         = vec4( resCornerStability                 ) * vec4(domainFactor);
                    mediump vec4  slimTopRightStabilityPower   = vec4( resSlimCornerTopRightPartStability ) * vec4(domainFactor);
                    mediump vec4  slimBottomLeftStabilityPower = vec4( resSlimCornerBotomLeftPartStability) * vec4(domainFactor);
                    mediump vec2  linkStabilityPower           = vec2( resLinkStability                   ) * vec2(domainFactor);
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
        gl.clearColor(0.0, 0.0, 0.0, 0.0);
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
        if(flagNoGrid)
        {
            drawFlags = drawFlags | 8;
        }

        gl.bindVertexArray(drawVertexBuffer);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(currentShaderProgram);

        gl.uniform1i(boardSizeUniformLocation,  currentGameSize);
        gl.uniform1i(cellSizeUniformLocation,   currentCellSize);
        gl.uniform1i(domainSizeUniformLocation, currentDomainSize);
        gl.uniform1i(flagsUniformLocation,      drawFlags);

        gl.uniform1i(canvasWidthUniformLocation,     currentViewportWidth);
        gl.uniform1i(canvasHeightUniformLocation,    currentViewportHeight);
        gl.uniform1i(viewportXOffsetUniformLocation, currentViewportOffsetX);
        gl.uniform1i(viewportYOffsetUniformLocation, currentViewportOffsetY);

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
}