#!/usr/bin/env nodejs
'use strict'

const fs = require('fs');
const path = require('path');
const Log = console.log;

function main()
{
    console.log(process.argv);

    // Check for bootstrap flag
    let bootstrap = false;
    for (let k in process.argv)
        if ('__bootstrap__' == process.argv[k])
        {   bootstrap = true;
            break;
        }

    // Which library to use
    let bsReq = 'bauset';
    if (bootstrap)
    {   let bsPath = path.join(path.dirname(__dirname), 'lib', 'index.js');
        if (fs.existsSync(bsPath))
            bsReq = bsPath;
    }
    const bauset = require(bsReq);

    // Parse command line
    let _p = bauset.parseParams(process.argv,
        {
            'i':'install',
            'g': 'global',
            's': 'source',
            't': 'test'
        });
    Log("Options", _p);

    // Calculate source and destination folders
    let cwd = process.cwd();
    if (_p.source && fs.existsSync(_p.source))
        cwd = _p.source;
    let src = cwd;
    let dst = path.join(src, 'dist');

    _p.Log = Log;

    Log("Creating packate...");
    Log(src, '=>', dst);

    bauset.createPackage(src, dst, _p);
}

// Exit handling
process.on('exit', function() {});
process.on('SIGINT', function() { Log('~ keyboard ~'); process.exit(-1); });
process.on('uncaughtException', function(e) { Log('~ uncaught ~', e); process.exit(-1); });

// Run the program
main();


