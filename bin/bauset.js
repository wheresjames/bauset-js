#!/usr/bin/env node
'use strict'

const fs = require('fs');
const path = require('path');
var Log = console.log;

function main()
{
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
    let _p = bauset.__config__.parseParams('bauset [options] [commands ...]', process.argv,
        [   ['i', 'install',            'Specify if package should be installed'],
            ['g', 'global',             'Specify if package should be installed globally'],
            ['s', 'source',             'Location of source files / defaults to current directory'],
            ['r', 'recursive',          'Recurse into sub directories'],
            ['v', 'version',            'Show version'],
            ['V', 'verbose',            'Verbose logging']
        ]);

    // Verbose mode?
    if (_p.verbose)
    {   try { const sparen = require('sparen'); Log = sparen.log;
        } catch(e) { Log = console.log; }
        Log('Program Info: ', JSON.stringify(bauset.__info__, null, 2));
        Log('Program Arguments: ', JSON.stringify(_p, null, 2));
    }

    if (_p.version)
        return Log(bauset.__info__.version);

    if (_p.help)
        return Log(_p.help);

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


