#!/usr/bin/env nodejs
'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const Log = console.log;
const Err = console.error;
const Fmt = JSON.stringify;

const bauset = require('bauset');

require("util").inspect.defaultOptions.depth = null;

function test_1()
{
}

function isCmd(lst, cmd)
{
    return !lst || !lst.length ||  0 <= `,${lst.toLowerCase()},`.indexOf(`,${cmd.toLowerCase()},`);
}

function main()
{
    let run = process.argv.slice(2).join(',');

    Log(Fmt(bauset.__info__, null, 2));
    Log("--- START TESTS ---\n");

    // Run tests
    let tests = [test_1];
    for (let k in tests)
        if (isCmd(run, String(parseInt(k)+1)))
        {   Log('-----------------------------------------------------------');
            Log(` - ${tests[k].name}()`);
            Log('-----------------------------------------------------------\n');
            tests[k]();
        }

    Log('--- Done ---\n');
}

// Exit handling
process.on('exit',function() { Log('~ exit ~');});
process.on('SIGINT',function() { Log('~ keyboard ~'); process.exit(-1); });
process.on('uncaughtException',function(e) { Log('~ uncaught ~', e); process.exit(-1); });

// Run the program
main();

