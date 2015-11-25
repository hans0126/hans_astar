function astar() {
    var _self = this;

    var grids;
    // 4 vector top,right,bottom,left
    var searchVector = [
        [0, -1],
        [1, 0],
        [0, 1],
        [-1, 0]
    ];


    _self.init = init;
    _self.searchStart = searchStart;
    _self.startObj = null;
    _self.endObj = null;
    _self.closedList = null;


    function init(_map, _arrDisplayObjs, _cubeCostFn) {
        _self.closedList = [];
        grids = [];
        //init current map status
        var _objCount = 0;
        var _hasDisplayObject = false;
        var _hasCubeCostFn = false;
        if (typeof(_arrDisplayObjs) === "object") {
            _hasDisplayObject = true;
        }

        if (typeof(_cubeCostFn) === "function") {
            _hasCubeCostFn = true;
        }

        for (var _y = 0; _y < _map.length; _y++) {
            for (var _x = 0; _x < _map[_y].length; _x++) {

                if (!grids[_y]) {
                    grids[_y] = [];
                }


                grids[_y][_x] = {
                    f: 0,
                    g: 0,
                    h: 0,
                    debug: "",
                    parent: null,
                    displayCube: null,
                    x: _x,
                    y: _y,
                    cubeType: _map[_y][_x],
                    cost: null
                };

                var _currentCube = grids[_y][_x];


                if (_hasDisplayObject && _arrDisplayObjs[_objCount]) {
                    _currentCube.displayCube = _arrDisplayObjs[_objCount];
                }

                if (_hasCubeCostFn) {
                    _cubeCostFn.call(_self, _currentCube);
                }

                _objCount++;
            }
        }

    }

    function searchStart(_start, _end) {


        var openList = [];

        if (_start) {
            _self.startObj = _start;
        }
        if (_end) {
            _self.endObj = _end;
        }

        if (!_self.startObj || !_self.endObj) {
            console.log("no 'starter' or 'termination'");
            return
        }

        openList.push(_self.startObj);



        while (openList.length > 0) {

            var lowInd = 0;
            for (var i = 0; i < openList.length; i++) {
                if (openList[i].f < openList[lowInd].f) {
                    lowInd = i;
                }
            }

            var currentNode = openList[lowInd];

            if (currentNode === _self.endObj) {
                console.log("end");
                var curr = currentNode;
                var ret = [];

                while (curr.parent) {
                    ret.push(curr);
                    curr = curr.parent;
                }

                return ret.reverse();
            }

            // remove node from openList
            openList.splice(lowInd, 1);

            _self.closedList.push(currentNode);

            var neighbors = getNeighbors(currentNode);

            for (var i = 0; i < neighbors.length; i++) {
                var neighbor = neighbors[i];
                var gScore = currentNode.g + 10; // 10 is the distance from a node to it's neighbor
                var gScoreIsBest = false;

                //find neighbor on openList;
                var _nIdx = openList.indexOf(neighbor);

                if (_nIdx < 0) {
                    gScoreIsBest = true;
                    // neighbor.h = astar.heuristic(neighbor.pos, end.pos);
                    openList.push(neighbor);
                } else if (gScore < neighbor.g) {
                    // We have already seen the node, but last time it had a worse g (distance from start)
                    gScoreIsBest = true;
                    //   neighbor.cube.tint= 0xFFFFF0;                  
                }

                if (gScoreIsBest) {
                    // Found an optimal (so far) path to this node.  Store info on how we got here and
                    //  just how good it really is...
                    neighbor.parent = currentNode;
                    neighbor.g = gScore;
                    neighbor.f = neighbor.g + neighbor.h;
                    neighbor.displayCube.getChildAt(0).text = neighbor.f;
                    neighbor.displayCube.getChildAt(1).text = neighbor.g;

                    neighbor.debug = "F: " + neighbor.f + "<br />G: " + neighbor.g + "<br />H: " + neighbor.h;
                }
            }
        }

    }

    function getNeighbors(_obj) {
        var arrReturn = [];
        var _nx,
            _ny,
            _has;

        for (var i = 0; i < searchVector.length; i++) {
            _nx = searchVector[i][0] + _obj.x;
            _ny = searchVector[i][1] + _obj.y;
            _has = false;
            if (_nx >= 0 && _ny >= 0 && _nx < mapRow && _ny < mapCol) {
                for (var j = 0; j < _self.closedList.length; j++) {
                    if (_self.closedList[j].x == _nx && _self.closedList[j].y == _ny) {
                        _has = true;
                        break;
                    }
                }
                if (!_has) {
                    arrReturn.push([_nx, _ny]);
                }
            }
        }

        return getNeighborsValue(arrReturn);
    }

    function getNeighborsValue(neighbors) {
        var _re = [];

        for (var k = 0; k < neighbors.length; k++) {
            breakPoint:

                for (var i = 0; i < grids.length; i++) {

                for (var j = 0; j < grids[i].length; j++) {

                    if (neighbors[k][0] == j && neighbors[k][1] == i) {
                        var miX = Math.abs(_self.startObj.x - j);
                        var miY = Math.abs(_self.startObj.y - i);
                        var g = Math.floor(Math.sqrt(miX + miY) * 10);

                        var goalX = Math.abs(_self.endObj.x - j);
                        var goalY = Math.abs(_self.endObj.y - i);
                        var h = (goalX + goalY) * 10;

                        var _currentCube = grids[i][j];

                        if (_currentCube.cost) {
                            h += _currentCube.cost;
                        }

                        var _tcube = _currentCube.displayCube;
                        var f = g + h;
                        _tcube.getChildAt(0).text = f;
                        _tcube.getChildAt(1).text = g;
                        _tcube.getChildAt(2).text = h;
                        // _tcube.getChildAt(3).text = step;
                        if (_currentCube != _self.endObj) {
                            _tcube.tint = 0xFF00FF;
                        }

                        _currentCube.x = j;
                        _currentCube.y = i;
                        _currentCube.g = g;
                        _currentCube.h = h;
                        _currentCube.f = f;
                        _re.push(_currentCube);

                        break breakPoint;
                    }
                }
            }
        }

        return _re;
    }


}
